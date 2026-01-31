/**
 * @fileoverview Tipos TypeScript para YouTube Upload Service
 * @prompt Prompt 18 - YouTube Upload Service
 */

import { VideoMetadata, UploadResult, UploadProgress } from '../config/youtube.config';

// Re-exportar tipos de config
export type { VideoMetadata, UploadResult, UploadProgress };

// ============================================================================
// TIPOS ADICIONALES
// ============================================================================

/**
 * Estado de autenticación OAuth2
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  expiresAt?: Date;
  scopes?: string[];
  error?: string;
}

/**
 * Información del canal de YouTube
 */
export interface ChannelInfo {
  id: string;
  title: string;
  subscriberCount?: number;
  videoCount?: number;
  thumbnailUrl?: string;
}

/**
 * Opciones para el servicio de upload
 */
export interface YouTubeServiceOptions {
  /** Habilitar modo debug con logs detallados */
  debug?: boolean;
  /** Callback para progreso de upload */
  onProgress?: (progress: UploadProgress) => void;
  /** Timeout para upload en ms */
  uploadTimeoutMs?: number;
  /** Usar resumable upload (recomendado para archivos grandes) */
  resumable?: boolean;
}

/**
 * Estado de quota del día
 */
export interface QuotaStatus {
  used: number;
  remaining: number;
  limit: number;
  canUpload: boolean;
  nearLimit: boolean;
  resetsAt: Date;
}

/**
 * Video subido (respuesta de YouTube API)
 */
export interface UploadedVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    tags: string[];
    categoryId: string;
    publishedAt: string;
    channelId: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
  };
  status: {
    uploadStatus: 'deleted' | 'failed' | 'processed' | 'rejected' | 'uploaded';
    privacyStatus: 'private' | 'public' | 'unlisted';
    publishAt?: string;
    madeForKids: boolean;
  };
}

/**
 * Error específico de YouTube API
 */
export interface YouTubeApiError {
  code: number;
  message: string;
  errors?: Array<{
    domain: string;
    reason: string;
    message: string;
  }>;
  quotaExceeded?: boolean;
  retryable?: boolean;
}
