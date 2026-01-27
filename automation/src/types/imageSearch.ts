// ===================================
// TIPOS PARA SISTEMA DE BÚSQUEDA DE IMÁGENES
// ===================================

import { ImageSource } from '../imageConfig';

/**
 * Resultado de una búsqueda de imagen
 */
export interface ImageResult {
  url: string;
  source: ImageSource | 'cache' | 'fallback';
  entityName: string;
  domain?: string;
  verified: boolean;
  timestamp: number;
}

/**
 * Opciones para búsqueda de imagen
 */
export interface ImageSearchOptions {
  entityName: string;
  entityType?: 'company' | 'product' | 'technology' | 'person' | 'organization';
  preferredSource?: ImageSource;
  skipCache?: boolean;
  verifyExists?: boolean;
}

/**
 * Imagen almacenada en cache
 */
export interface CachedImage {
  url: string;
  source: ImageSource;
  timestamp: number;
  hits: number;
}

/**
 * Códigos de error de búsqueda de imagen
 */
export type ImageSearchErrorCode =
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'INVALID_URL'
  | 'NETWORK_ERROR'
  | 'ALL_SOURCES_FAILED';

/**
 * Error estructurado de búsqueda de imagen
 */
export interface ImageSearchError {
  code: ImageSearchErrorCode;
  message: string;
  entityName: string;
  attemptedSources: ImageSource[];
}

/**
 * Estadísticas del cache de imágenes
 */
export interface ImageCacheStats {
  size: number;
  maxSize: number;
  hitRate?: number;
  entries: Array<{
    key: string;
    hits: number;
    age: number;
  }>;
}

/**
 * Resultado de búsqueda batch
 */
export interface BatchImageResult {
  successful: number;
  failed: number;
  results: ImageResult[];
}
