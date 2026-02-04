/**
 * @fileoverview Phrase Timing - Prompt 19.2
 *
 * Calcula qué frase mostrar según el frame actual del video.
 * Maneja transiciones suaves con fade in/out entre frases.
 *
 * @author Sintaxis IA
 * @version 1.1.0
 * @since Prompt 19.2
 * @updated Prompt 19.7 - Soporte para timestamps reales de Whisper
 */

import { interpolate } from 'remotion';

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Timestamp de una frase (de Whisper speech-to-text)
 * Replicado aquí para evitar imports cross-package
 *
 * @since Prompt 19.7
 */
export interface PhraseTimestamp {
  /** Texto de la frase */
  text: string;
  /** Segundo de inicio */
  startSeconds: number;
  /** Segundo de fin */
  endSeconds: number;
}

/**
 * Resultado del cálculo de timing
 */
export interface PhraseTiming {
  /** Índice de la frase actual (0-based) */
  currentPhraseIndex: number;
  /** Opacidad calculada para transición (0-1) */
  opacity: number;
  /** Indica si estamos en medio de una transición */
  isTransitioning: boolean;
  /** Frame de inicio de la frase actual */
  phraseStartFrame: number;
  /** Frame de fin de la frase actual */
  phraseEndFrame: number;
}

/**
 * Configuración de timing
 * @updated Prompt 19.7 - Agregado phraseTimestamps y fps
 */
export interface TimingConfig {
  /** Frames para fade in (default: 15 = 0.5s @ 30fps) */
  fadeInFrames?: number;
  /** Frames para fade out (default: 15 = 0.5s @ 30fps) */
  fadeOutFrames?: number;
  /** Timestamps de frases de Whisper (Prompt 19.7) */
  phraseTimestamps?: PhraseTimestamp[];
  /** FPS del video para conversión segundos→frames (default: 30) */
  fps?: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const DEFAULT_FADE_IN_FRAMES = 15;   // 0.5s @ 30fps
const DEFAULT_FADE_OUT_FRAMES = 15;  // 0.5s @ 30fps

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Calcula el timing y opacity de la frase actual
 *
 * Si hay phraseTimestamps (de Whisper), usa timing real del audio.
 * Si no, distribuye los frames equitativamente entre las frases (fallback).
 *
 * @param currentFrame - Frame actual de la escena (relativo al inicio)
 * @param totalFrames - Duración total de la escena en frames
 * @param phraseCount - Número de frases a mostrar
 * @param config - Configuración de transiciones
 * @returns Timing calculado con índice y opacity
 *
 * @updated Prompt 19.7 - Soporte para timestamps reales de Whisper
 *
 * @example
 * ```typescript
 * // Con timestamps de Whisper (sincronización precisa)
 * const timing = getPhraseTiming(500, 1110, 3, {
 *   fadeInFrames: 15,
 *   phraseTimestamps: [
 *     { text: 'Primera frase', startSeconds: 0, endSeconds: 3.5 },
 *     { text: 'Segunda frase', startSeconds: 3.5, endSeconds: 8.0 },
 *   ],
 *   fps: 30,
 * });
 *
 * // Sin timestamps (distribución uniforme - fallback)
 * const timing = getPhraseTiming(500, 1110, 3, { fadeInFrames: 15 });
 * ```
 */
export function getPhraseTiming(
  currentFrame: number,
  totalFrames: number,
  phraseCount: number,
  config: TimingConfig = {}
): PhraseTiming {
  const {
    fadeInFrames = DEFAULT_FADE_IN_FRAMES,
    fadeOutFrames = DEFAULT_FADE_OUT_FRAMES,
    phraseTimestamps,
    fps = 30,
  } = config;

  // Validaciones
  if (phraseCount <= 0) {
    return {
      currentPhraseIndex: 0,
      opacity: 1,
      isTransitioning: false,
      phraseStartFrame: 0,
      phraseEndFrame: totalFrames,
    };
  }

  if (totalFrames <= 0) {
    return {
      currentPhraseIndex: 0,
      opacity: 1,
      isTransitioning: false,
      phraseStartFrame: 0,
      phraseEndFrame: 0,
    };
  }

  let currentPhraseIndex: number;
  let phraseStartFrame: number;
  let phraseEndFrame: number;

  // Prompt 19.7: Usar timestamps reales de Whisper si están disponibles
  if (phraseTimestamps && phraseTimestamps.length > 0) {
    // Convertir frame actual a segundos
    const currentSecond = currentFrame / fps;

    // Encontrar qué frase corresponde al tiempo actual
    currentPhraseIndex = findPhraseIndexByTime(phraseTimestamps, currentSecond);

    // Obtener timestamps de la frase actual
    const timestamp = phraseTimestamps[currentPhraseIndex];
    phraseStartFrame = Math.round(timestamp.startSeconds * fps);
    phraseEndFrame = Math.round(timestamp.endSeconds * fps);

  } else {
    // Fallback: Distribución uniforme (comportamiento original)
    const framesPerPhrase = totalFrames / phraseCount;

    // Calcular índice de frase actual
    const rawIndex = currentFrame / framesPerPhrase;
    currentPhraseIndex = Math.min(
      Math.max(0, Math.floor(rawIndex)),
      phraseCount - 1
    );

    // Calcular frames de inicio y fin de la frase actual
    phraseStartFrame = Math.round(currentPhraseIndex * framesPerPhrase);
    phraseEndFrame = Math.round((currentPhraseIndex + 1) * framesPerPhrase);
  }

  // Frame relativo dentro de la frase actual
  const relativeFrame = currentFrame - phraseStartFrame;
  const phraseDuration = phraseEndFrame - phraseStartFrame;

  // Calcular opacity con fade in/out
  const opacity = calculateOpacity(
    relativeFrame,
    phraseDuration,
    fadeInFrames,
    fadeOutFrames
  );

  // Determinar si estamos en transición
  const isTransitioning =
    relativeFrame < fadeInFrames ||
    relativeFrame > phraseDuration - fadeOutFrames;

  return {
    currentPhraseIndex,
    opacity,
    isTransitioning,
    phraseStartFrame,
    phraseEndFrame,
  };
}

/**
 * Encuentra el índice de la frase que corresponde a un tiempo dado
 *
 * @param timestamps - Array de timestamps de frases
 * @param currentSecond - Tiempo actual en segundos
 * @returns Índice de la frase (0-based)
 *
 * @since Prompt 19.7
 */
function findPhraseIndexByTime(
  timestamps: PhraseTimestamp[],
  currentSecond: number
): number {
  // Buscar la frase cuyo rango contiene el tiempo actual
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];

    // Si estamos dentro del rango de esta frase
    if (currentSecond >= ts.startSeconds && currentSecond < ts.endSeconds) {
      return i;
    }

    // Si es la última frase y estamos después de su inicio
    if (i === timestamps.length - 1 && currentSecond >= ts.startSeconds) {
      return i;
    }
  }

  // Fallback: si estamos antes de todo, mostrar primera frase
  if (currentSecond < timestamps[0].startSeconds) {
    return 0;
  }

  // Fallback: si estamos después de todo, mostrar última frase
  return timestamps.length - 1;
}

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Calcula la opacidad con fade in/out suave
 *
 * Timeline:
 * ```
 * 0 -------- fadeIn -------- (middle) -------- fadeOut -------- end
 * opacity:   0 -> 1          1                 1 -> 0
 * ```
 */
function calculateOpacity(
  relativeFrame: number,
  phraseDuration: number,
  fadeInFrames: number,
  fadeOutFrames: number
): number {
  // Asegurar que fade no exceda duración
  const safeFadeIn = Math.min(fadeInFrames, phraseDuration / 3);
  const safeFadeOut = Math.min(fadeOutFrames, phraseDuration / 3);

  return interpolate(
    relativeFrame,
    [
      0,
      safeFadeIn,
      phraseDuration - safeFadeOut,
      phraseDuration,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
}

/**
 * Calcula información detallada para debugging
 */
export function getPhraseTimingDebug(
  currentFrame: number,
  totalFrames: number,
  phraseCount: number,
  fps: number = 30,
  config: TimingConfig = {}
): PhraseTiming & {
  currentSecond: number;
  phraseStartSecond: number;
  phraseEndSecond: number;
  percentComplete: number;
} {
  const timing = getPhraseTiming(currentFrame, totalFrames, phraseCount, config);

  return {
    ...timing,
    currentSecond: currentFrame / fps,
    phraseStartSecond: timing.phraseStartFrame / fps,
    phraseEndSecond: timing.phraseEndFrame / fps,
    percentComplete: (currentFrame / totalFrames) * 100,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default getPhraseTiming;
