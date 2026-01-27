// ===================================
// TOPIC DETECTION TYPES - Interfaces y tipos
// ===================================

import { EntityType } from '../topicConfig';

/**
 * Resultado de detección de tópico
 */
export interface TopicDetection {
  /** Entidad principal detectada (empresa, producto, etc.) */
  mainEntity: string;

  /** Tipo de entidad */
  entityType: EntityType;

  /** Términos relacionados extraídos */
  relatedTerms: string[];

  /** Query optimizada para buscar imagen */
  imageSearchQuery: string;

  /** Nivel de confianza (0-1) */
  confidence: number;
}

/**
 * Opciones para personalizar la detección
 */
export interface TopicDetectionOptions {
  /** Máximo de términos relacionados a extraer */
  maxTerms?: number;

  /** Temperatura del modelo (0-1) */
  temperature?: number;

  /** Timeout en milisegundos */
  timeout?: number;

  /** Número máximo de reintentos */
  maxRetries?: number;
}

/**
 * Códigos de error posibles
 */
export type TopicDetectionErrorCode =
  | 'GEMINI_ERROR'      // Error de la API de Gemini
  | 'PARSE_ERROR'       // Error parseando JSON
  | 'VALIDATION_ERROR'  // Respuesta no válida
  | 'TIMEOUT'           // Timeout alcanzado
  | 'NETWORK_ERROR'     // Error de red
  | 'UNKNOWN';          // Error desconocido

/**
 * Error estructurado de detección
 */
export interface TopicDetectionError {
  /** Código de error */
  code: TopicDetectionErrorCode;

  /** Mensaje descriptivo */
  message: string;

  /** Error original si existe */
  originalError?: Error;

  /** Timestamp del error */
  timestamp: Date;
}

/**
 * Resultado de detección con posible error
 */
export interface TopicDetectionResult {
  /** Indica si la detección fue exitosa */
  success: boolean;

  /** Datos de detección (si success = true) */
  data?: TopicDetection;

  /** Error (si success = false) */
  error?: TopicDetectionError;

  /** Indica si se usó fallback */
  usedFallback: boolean;

  /** Tiempo de procesamiento en ms */
  processingTime: number;
}

/**
 * Respuesta raw de Gemini (antes de validar)
 */
export interface GeminiTopicResponse {
  mainEntity: string;
  entityType: string;
  relatedTerms: string[];
  imageSearchQuery: string;
  confidence?: number;
}

/**
 * Estadísticas de detección (para analytics)
 */
export interface TopicDetectionStats {
  totalRequests: number;
  successfulRequests: number;
  fallbackUsed: number;
  averageConfidence: number;
  averageProcessingTime: number;
}
