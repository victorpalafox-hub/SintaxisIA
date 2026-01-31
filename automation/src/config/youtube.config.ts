/**
 * @fileoverview Configuración centralizada para YouTube Data API v3
 * @description Anti-hardcode: Todos los valores configurables via env vars
 * @prompt Prompt 18 - YouTube Upload Service
 */

import { isTestOrCI } from '../config';

// ============================================================================
// INTERFACES
// ============================================================================

export interface YouTubeConfig {
  /** Credenciales OAuth2 */
  auth: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken: string;
  };
  /** Configuración de upload */
  upload: {
    /** Categoría: 28 = Science & Technology */
    categoryId: string;
    /** Idioma por defecto */
    defaultLanguage: string;
    /** Privacidad por defecto: 'private' | 'unlisted' | 'public' */
    defaultPrivacy: 'private' | 'unlisted' | 'public';
    /** Tags por defecto para todos los videos */
    defaultTags: string[];
    /** Máximo de tags permitidos por YouTube */
    maxTags: number;
    /** Máximo caracteres en título */
    maxTitleLength: number;
    /** Máximo caracteres en descripción */
    maxDescriptionLength: number;
  };
  /** Configuración de retry */
  retry: {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
  };
  /** Configuración de quota */
  quota: {
    /** Costo de upload en unidades de quota */
    uploadCost: number;
    /** Quota diaria (10,000 para proyectos nuevos) */
    dailyLimit: number;
    /** Umbral de advertencia (80%) */
    warningThreshold: number;
  };
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId?: string;
  privacyStatus?: 'private' | 'unlisted' | 'public';
  publishAt?: Date; // Para scheduled uploads
  madeForKids?: boolean;
  language?: string;
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  videoUrl?: string;
  error?: string;
  quotaUsed?: number;
  uploadDurationMs?: number;
}

export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  estimatedTimeRemainingMs?: number;
}

// ============================================================================
// CONFIGURACIÓN POR DEFECTO
// ============================================================================

const CI_MOCK_VALUE = 'ci-mock-value';

export const YOUTUBE_CONFIG: YouTubeConfig = {
  auth: {
    clientId: process.env.YOUTUBE_CLIENT_ID || (isTestOrCI() ? CI_MOCK_VALUE : ''),
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || (isTestOrCI() ? CI_MOCK_VALUE : ''),
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || (isTestOrCI() ? CI_MOCK_VALUE : ''),
  },
  upload: {
    categoryId: process.env.YOUTUBE_CATEGORY_ID || '28', // Science & Technology
    defaultLanguage: process.env.YOUTUBE_DEFAULT_LANGUAGE || 'es',
    defaultPrivacy: (process.env.YOUTUBE_DEFAULT_PRIVACY as 'private' | 'unlisted' | 'public') || 'private',
    defaultTags: [
      'inteligencia artificial',
      'IA',
      'AI',
      'noticias tech',
      'tecnología',
      'machine learning',
      'deep learning',
      'OpenAI',
      'Anthropic',
      'Google AI',
    ],
    maxTags: 500, // Límite de YouTube
    maxTitleLength: 100, // Límite de YouTube
    maxDescriptionLength: 5000, // Límite de YouTube
  },
  retry: {
    maxAttempts: Number(process.env.YOUTUBE_RETRY_MAX_ATTEMPTS) || 3,
    initialDelayMs: Number(process.env.YOUTUBE_RETRY_INITIAL_DELAY) || 1000,
    maxDelayMs: Number(process.env.YOUTUBE_RETRY_MAX_DELAY) || 30000,
    backoffMultiplier: Number(process.env.YOUTUBE_RETRY_BACKOFF) || 2,
  },
  quota: {
    uploadCost: 1600, // Costo real de upload en YouTube API
    dailyLimit: Number(process.env.YOUTUBE_DAILY_QUOTA) || 10000,
    warningThreshold: 0.8,
  },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Valida que el título cumpla con límites de YouTube
 */
export function validateTitle(title: string): { valid: boolean; error?: string; sanitized: string } {
  const sanitized = title.trim().substring(0, YOUTUBE_CONFIG.upload.maxTitleLength);

  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'El título no puede estar vacío', sanitized: '' };
  }

  if (title.length > YOUTUBE_CONFIG.upload.maxTitleLength) {
    return {
      valid: true,
      error: `Título truncado de ${title.length} a ${YOUTUBE_CONFIG.upload.maxTitleLength} caracteres`,
      sanitized
    };
  }

  return { valid: true, sanitized };
}

/**
 * Valida que la descripción cumpla con límites de YouTube
 */
export function validateDescription(description: string): { valid: boolean; error?: string; sanitized: string } {
  const sanitized = description.trim().substring(0, YOUTUBE_CONFIG.upload.maxDescriptionLength);

  if (description.length > YOUTUBE_CONFIG.upload.maxDescriptionLength) {
    return {
      valid: true,
      error: `Descripción truncada de ${description.length} a ${YOUTUBE_CONFIG.upload.maxDescriptionLength} caracteres`,
      sanitized
    };
  }

  return { valid: true, sanitized };
}

/**
 * Valida y sanitiza tags
 */
export function validateTags(tags: string[]): { valid: boolean; error?: string; sanitized: string[] } {
  // Remover duplicados y vacíos
  const uniqueTags = [...new Set(tags.filter(t => t && t.trim().length > 0))];

  // Limitar cantidad
  const sanitized = uniqueTags.slice(0, YOUTUBE_CONFIG.upload.maxTags);

  if (uniqueTags.length > YOUTUBE_CONFIG.upload.maxTags) {
    return {
      valid: true,
      error: `Tags reducidos de ${uniqueTags.length} a ${YOUTUBE_CONFIG.upload.maxTags}`,
      sanitized
    };
  }

  return { valid: true, sanitized };
}

/**
 * Genera URL del video a partir del ID
 */
export function getVideoUrl(videoId: string): string {
  return `https://youtube.com/shorts/${videoId}`;
}

/**
 * Verifica si hay quota suficiente para upload
 */
export function hasQuotaForUpload(currentUsage: number): boolean {
  return (currentUsage + YOUTUBE_CONFIG.quota.uploadCost) <= YOUTUBE_CONFIG.quota.dailyLimit;
}

/**
 * Verifica si estamos cerca del límite de quota
 */
export function isNearQuotaLimit(currentUsage: number): boolean {
  const threshold = YOUTUBE_CONFIG.quota.dailyLimit * YOUTUBE_CONFIG.quota.warningThreshold;
  return currentUsage >= threshold;
}

export default YOUTUBE_CONFIG;
