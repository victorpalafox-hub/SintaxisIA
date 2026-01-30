/**
 * @fileoverview Tipos TypeScript para el servicio TTS
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 16 - ElevenLabs TTS Integration
 */

// =============================================================================
// INTERFACES DE REQUEST/RESPONSE
// =============================================================================

/**
 * Solicitud para generar audio TTS
 */
export interface TTSRequest {
  /** Texto a convertir en audio */
  text: string;

  /** ID unico para cache (hash del texto) */
  cacheKey?: string;

  /** Forzar regeneracion ignorando cache */
  forceRegenerate?: boolean;

  /** Nombre del archivo de salida (opcional) */
  outputFileName?: string;
}

/**
 * Respuesta del servicio TTS
 */
export interface TTSResponse {
  /** Ruta al archivo de audio generado */
  audioPath: string;

  /** Duracion del audio en segundos */
  durationSeconds: number;

  /** Proveedor usado (elevenlabs | edge-tts) */
  provider: 'elevenlabs' | 'edge-tts';

  /** Si se uso cache */
  fromCache: boolean;

  /** Caracteres consumidos de la cuota */
  charactersUsed: number;

  /** Metadata adicional */
  metadata: TTSMetadata;
}

/**
 * Metadata del audio generado
 */
export interface TTSMetadata {
  /** ID de la voz usada */
  voiceId: string;

  /** ID del modelo usado */
  modelId: string;

  /** Timestamp de generacion */
  generatedAt: string;

  /** Hash del texto original */
  textHash?: string;
}

// =============================================================================
// INTERFACES DE CUOTA
// =============================================================================

/**
 * Estado de la cuota mensual de ElevenLabs
 */
export interface TTSQuotaStatus {
  /** Caracteres usados este mes */
  used: number;

  /** Limite mensual */
  limit: number;

  /** Caracteres restantes */
  remaining: number;

  /** Porcentaje usado */
  percentageUsed: number;

  /** Si esta cerca del limite (>80%) */
  nearLimit: boolean;

  /** Si excedio el limite */
  exceeded: boolean;

  /** Fecha del ultimo reset */
  lastReset: string;
}

/**
 * Datos de cuota almacenados en disco
 */
export interface TTSQuotaData {
  /** Caracteres usados */
  used: number;

  /** Fecha del ultimo reset */
  lastReset: string;
}

// =============================================================================
// INTERFACES DE CACHE
// =============================================================================

/**
 * Entrada en el cache de audio
 */
export interface AudioCacheEntry {
  /** Hash del texto original */
  textHash: string;

  /** Ruta al archivo de audio */
  audioPath: string;

  /** Fecha de creacion */
  createdAt: string;

  /** Duracion en segundos */
  durationSeconds: number;

  /** Proveedor usado */
  provider: string;

  /** Longitud del texto original */
  textLength: number;
}

/**
 * Indice completo del cache
 */
export interface AudioCacheIndex {
  [textHash: string]: AudioCacheEntry;
}

// =============================================================================
// INTERFACES DE CONFIGURACION
// =============================================================================

/**
 * Opciones del servicio TTS
 */
export interface TTSServiceOptions {
  /** Directorio base para cache */
  cacheDirectory?: string;

  /** Habilitar cache */
  enableCache?: boolean;

  /** Habilitar fallback */
  enableFallback?: boolean;

  /** Forzar uso de fallback (para testing) */
  forceFallback?: boolean;
}

// =============================================================================
// INTERFACES DE RESULTADO LEGACY
// =============================================================================

/**
 * Resultado de audio (compatibilidad con audioGen.ts)
 */
export interface AudioResult {
  /** Ruta al archivo de audio */
  audioPath: string;

  /** Duracion en segundos */
  durationInSeconds: number;

  /** Duracion en frames (30fps) */
  durationInFrames: number;

  /** Subtitulos palabra por palabra */
  subtitles: WordTiming[];
}

/**
 * Timing de una palabra para subtitulos
 */
export interface WordTiming {
  /** La palabra */
  word: string;

  /** Frame de inicio */
  startFrame: number;

  /** Frame de fin */
  endFrame: number;
}
