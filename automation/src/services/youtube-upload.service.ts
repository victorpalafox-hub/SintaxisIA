/**
 * @fileoverview Servicio de upload a YouTube usando YouTube Data API v3
 * @description Maneja autenticación OAuth2, upload resumible, y tracking de quota
 * @prompt Prompt 18 - YouTube Upload Service
 */

import { google, youtube_v3 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import {
  YOUTUBE_CONFIG,
  VideoMetadata,
  UploadResult,
  validateTitle,
  validateDescription,
  validateTags,
  getVideoUrl,
  hasQuotaForUpload,
  isNearQuotaLimit,
} from '../config/youtube.config';
import {
  YouTubeServiceOptions,
  AuthStatus,
  ChannelInfo,
  QuotaStatus,
  UploadedVideo,
  YouTubeApiError,
  UploadProgress,
} from '../types/youtube.types';
import { isTestOrCI } from '../config';

// ============================================================================
// CLASE PRINCIPAL
// ============================================================================

/**
 * Servicio para subir videos a YouTube
 *
 * @example
 * ```typescript
 * const youtubeService = new YouTubeUploadService();
 *
 * const result = await youtubeService.uploadVideo(
 *   '/path/to/video.mp4',
 *   {
 *     title: 'OpenAI anuncia GPT-5',
 *     description: 'Las últimas noticias sobre inteligencia artificial...',
 *     tags: ['AI', 'OpenAI', 'GPT-5'],
 *   }
 * );
 *
 * if (result.success) {
 *   console.log(`Video subido: ${result.videoUrl}`);
 * }
 * ```
 */
export class YouTubeUploadService {
  private youtube: youtube_v3.Youtube | null = null;
  private oauth2Client: ReturnType<typeof google.auth.OAuth2.prototype.constructor> | null = null;
  private options: YouTubeServiceOptions;
  private quotaUsedToday: number = 0;
  private quotaResetDate: Date;

  constructor(options: YouTubeServiceOptions = {}) {
    this.options = {
      debug: false,
      resumable: true,
      uploadTimeoutMs: 300000, // 5 minutos
      ...options,
    };

    // Inicializar fecha de reset de quota (medianoche PT)
    this.quotaResetDate = this.getNextQuotaReset();

    // Inicializar cliente OAuth2 (solo si no estamos en CI)
    if (!isTestOrCI()) {
      this.initializeOAuth2Client();
    }
  }

  // ==========================================================================
  // AUTENTICACIÓN
  // ==========================================================================

  /**
   * Inicializa el cliente OAuth2 con las credenciales
   */
  private initializeOAuth2Client(): void {
    this.oauth2Client = new google.auth.OAuth2(
      YOUTUBE_CONFIG.auth.clientId,
      YOUTUBE_CONFIG.auth.clientSecret,
      YOUTUBE_CONFIG.auth.redirectUri
    );

    // Configurar refresh token
    this.oauth2Client.setCredentials({
      refresh_token: YOUTUBE_CONFIG.auth.refreshToken,
    });

    // Inicializar cliente de YouTube
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    });

    this.log('Cliente OAuth2 inicializado');
  }

  /**
   * Verifica el estado de autenticación
   */
  async checkAuth(): Promise<AuthStatus> {
    if (isTestOrCI()) {
      return {
        isAuthenticated: true,
        scopes: ['https://www.googleapis.com/auth/youtube.upload'],
      };
    }

    try {
      if (!this.oauth2Client) {
        return {
          isAuthenticated: false,
          error: 'Cliente OAuth2 no inicializado',
        };
      }

      // Intentar obtener token de acceso
      const { token } = await this.oauth2Client.getAccessToken();

      if (!token) {
        return {
          isAuthenticated: false,
          error: 'No se pudo obtener access token',
        };
      }

      return {
        isAuthenticated: true,
        scopes: ['https://www.googleapis.com/auth/youtube.upload'],
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Error de autenticación',
      };
    }
  }

  /**
   * Genera URL para autorización OAuth2 (primera vez)
   */
  getAuthUrl(): string {
    if (!this.oauth2Client) {
      this.initializeOAuth2Client();
    }

    if (!this.oauth2Client) {
      throw new Error('No se pudo inicializar el cliente OAuth2');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
      ],
      prompt: 'consent', // Forzar pantalla de consentimiento para obtener refresh token
    });
  }

  /**
   * Intercambia código de autorización por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{ refreshToken: string; accessToken: string }> {
    if (!this.oauth2Client) {
      throw new Error('Cliente OAuth2 no inicializado');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    return {
      refreshToken: tokens.refresh_token || '',
      accessToken: tokens.access_token || '',
    };
  }

  // ==========================================================================
  // UPLOAD
  // ==========================================================================

  /**
   * Sube un video a YouTube
   */
  async uploadVideo(
    videoPath: string,
    metadata: VideoMetadata
  ): Promise<UploadResult> {
    const startTime = Date.now();

    // Validar en CI/test
    if (isTestOrCI()) {
      return this.mockUpload(videoPath, metadata);
    }

    try {
      // 1. Validar archivo existe
      if (!fs.existsSync(videoPath)) {
        return {
          success: false,
          error: `Archivo no encontrado: ${videoPath}`,
        };
      }

      // 2. Validar quota
      if (!hasQuotaForUpload(this.quotaUsedToday)) {
        return {
          success: false,
          error: 'Quota diaria de YouTube API excedida',
          quotaUsed: this.quotaUsedToday,
        };
      }

      // 3. Validar y sanitizar metadata
      const titleValidation = validateTitle(metadata.title);
      if (!titleValidation.valid) {
        return { success: false, error: titleValidation.error };
      }

      const descValidation = validateDescription(metadata.description);
      const tagsValidation = validateTags([
        ...metadata.tags,
        ...YOUTUBE_CONFIG.upload.defaultTags,
      ]);

      // 4. Preparar request body
      const requestBody: youtube_v3.Schema$Video = {
        snippet: {
          title: titleValidation.sanitized,
          description: descValidation.sanitized,
          tags: tagsValidation.sanitized,
          categoryId: metadata.categoryId || YOUTUBE_CONFIG.upload.categoryId,
          defaultLanguage: metadata.language || YOUTUBE_CONFIG.upload.defaultLanguage,
          defaultAudioLanguage: metadata.language || YOUTUBE_CONFIG.upload.defaultLanguage,
        },
        status: {
          privacyStatus: metadata.privacyStatus || YOUTUBE_CONFIG.upload.defaultPrivacy,
          madeForKids: metadata.madeForKids ?? false,
          selfDeclaredMadeForKids: metadata.madeForKids ?? false,
        },
      };

      // Agregar publishAt si está programado
      if (metadata.publishAt && requestBody.status) {
        requestBody.status.publishAt = metadata.publishAt.toISOString();
        requestBody.status.privacyStatus = 'private'; // Requerido para scheduled
      }

      // 5. Crear stream del archivo
      const fileSize = fs.statSync(videoPath).size;
      const fileStream = fs.createReadStream(videoPath);

      // 6. Ejecutar upload con progreso
      this.log(`Iniciando upload: ${path.basename(videoPath)} (${this.formatBytes(fileSize)})`);

      if (!this.youtube) {
        return {
          success: false,
          error: 'Cliente de YouTube no inicializado',
        };
      }

      const response = await this.youtube.videos.insert(
        {
          part: ['snippet', 'status'],
          requestBody,
          media: {
            body: fileStream,
          },
        },
        {
          // Configuración para upload resumible
          onUploadProgress: (evt: { bytesRead: number }) => {
            const progress: UploadProgress = {
              bytesUploaded: evt.bytesRead,
              totalBytes: fileSize,
              percentage: Math.round((evt.bytesRead / fileSize) * 100),
            };

            this.log(`Progreso: ${progress.percentage}%`);

            if (this.options.onProgress) {
              this.options.onProgress(progress);
            }
          },
        }
      );

      // 7. Procesar respuesta
      const uploadedVideo = response.data as UploadedVideo;
      const videoId = uploadedVideo.id;

      if (!videoId) {
        return {
          success: false,
          error: 'YouTube no retornó ID de video',
        };
      }

      // 8. Actualizar quota
      this.quotaUsedToday += YOUTUBE_CONFIG.quota.uploadCost;

      const uploadDurationMs = Date.now() - startTime;

      this.log(`Video subido exitosamente: ${videoId}`);

      return {
        success: true,
        videoId,
        videoUrl: getVideoUrl(videoId),
        quotaUsed: this.quotaUsedToday,
        uploadDurationMs,
      };

    } catch (error) {
      return this.handleUploadError(error, startTime);
    }
  }

  /**
   * Mock de upload para CI/tests
   */
  private mockUpload(videoPath: string, metadata: VideoMetadata): UploadResult {
    this.log('[MOCK] Simulando upload para CI/test');

    // Validar metadata
    const titleValidation = validateTitle(metadata.title);
    if (!titleValidation.valid) {
      return { success: false, error: titleValidation.error };
    }

    // Generar ID mock
    const mockVideoId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      success: true,
      videoId: mockVideoId,
      videoUrl: getVideoUrl(mockVideoId),
      quotaUsed: YOUTUBE_CONFIG.quota.uploadCost,
      uploadDurationMs: 100, // Mock instantáneo
    };
  }

  /**
   * Maneja errores de upload
   */
  private handleUploadError(error: unknown, startTime: number): UploadResult {
    const uploadDurationMs = Date.now() - startTime;

    // Parsear error de YouTube API
    const apiError = error as { response?: { data?: { error?: YouTubeApiError } } };
    if (apiError.response?.data?.error) {
      const youtubeError = apiError.response.data.error;

      // Verificar si es error de quota
      if (youtubeError.errors?.some(e => e.reason === 'quotaExceeded')) {
        return {
          success: false,
          error: 'Quota de YouTube API excedida. Intenta mañana.',
          quotaUsed: this.quotaUsedToday,
          uploadDurationMs,
        };
      }

      return {
        success: false,
        error: `YouTube API Error: ${youtubeError.message}`,
        uploadDurationMs,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido en upload',
      uploadDurationMs,
    };
  }

  // ==========================================================================
  // QUOTA
  // ==========================================================================

  /**
   * Obtiene el estado actual de la quota
   */
  getQuotaStatus(): QuotaStatus {
    // Verificar si hay que resetear quota (pasó medianoche PT)
    if (new Date() >= this.quotaResetDate) {
      this.quotaUsedToday = 0;
      this.quotaResetDate = this.getNextQuotaReset();
    }

    return {
      used: this.quotaUsedToday,
      remaining: YOUTUBE_CONFIG.quota.dailyLimit - this.quotaUsedToday,
      limit: YOUTUBE_CONFIG.quota.dailyLimit,
      canUpload: hasQuotaForUpload(this.quotaUsedToday),
      nearLimit: isNearQuotaLimit(this.quotaUsedToday),
      resetsAt: this.quotaResetDate,
    };
  }

  /**
   * Calcula la próxima medianoche en horario del Pacífico (YouTube usa PT)
   */
  private getNextQuotaReset(): Date {
    const now = new Date();
    // YouTube resetea a medianoche PT (UTC-8 o UTC-7 en DST)
    const reset = new Date(now);
    reset.setUTCHours(8, 0, 0, 0); // Medianoche PT = 8:00 UTC

    if (reset <= now) {
      reset.setDate(reset.getDate() + 1);
    }

    return reset;
  }

  // ==========================================================================
  // CHANNEL INFO
  // ==========================================================================

  /**
   * Obtiene información del canal autenticado
   */
  async getChannelInfo(): Promise<ChannelInfo | null> {
    if (isTestOrCI()) {
      return {
        id: 'mock_channel_id',
        title: 'SintaxisIA Test Channel',
        subscriberCount: 1000,
        videoCount: 50,
      };
    }

    try {
      if (!this.youtube) {
        return null;
      }

      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics'],
        mine: true,
      });

      const channel = response.data.items?.[0];
      if (!channel) {
        return null;
      }

      return {
        id: channel.id || '',
        title: channel.snippet?.title || '',
        subscriberCount: Number(channel.statistics?.subscriberCount) || 0,
        videoCount: Number(channel.statistics?.videoCount) || 0,
        thumbnailUrl: channel.snippet?.thumbnails?.default?.url,
      };
    } catch (error) {
      this.log(`Error obteniendo info del canal: ${error}`);
      return null;
    }
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================

  /**
   * Log condicional basado en modo debug
   */
  private log(message: string): void {
    if (this.options.debug || process.env.DEBUG === 'true') {
      console.log(`[YouTubeUploadService] ${message}`);
    }
  }

  /**
   * Formatea bytes a string legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// ============================================================================
// SINGLETON & EXPORTS
// ============================================================================

/** Instancia singleton del servicio */
export const youtubeService = new YouTubeUploadService();

/** Helper function para upload rápido */
export async function uploadToYouTube(
  videoPath: string,
  metadata: VideoMetadata
): Promise<UploadResult> {
  return youtubeService.uploadVideo(videoPath, metadata);
}

export default YouTubeUploadService;
