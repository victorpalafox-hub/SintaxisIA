/**
 * @fileoverview Phrase Timing - Prompt 19.2
 *
 * Calcula qué frase mostrar según el frame actual del video.
 * Maneja transiciones suaves con fade in/out entre frases.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.2
 */

import { interpolate } from 'remotion';

// =============================================================================
// TIPOS
// =============================================================================

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
 */
export interface TimingConfig {
  /** Frames para fade in (default: 15 = 0.5s @ 30fps) */
  fadeInFrames?: number;
  /** Frames para fade out (default: 15 = 0.5s @ 30fps) */
  fadeOutFrames?: number;
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
 * Distribuye los frames equitativamente entre las frases
 * y calcula transiciones suaves con fade in/out.
 *
 * @param currentFrame - Frame actual de la escena (relativo al inicio)
 * @param totalFrames - Duración total de la escena en frames
 * @param phraseCount - Número de frases a mostrar
 * @param config - Configuración de transiciones
 * @returns Timing calculado con índice y opacity
 *
 * @example
 * ```typescript
 * // ContentScene de 37s (1110 frames) con 3 frases
 * const timing = getPhraseTiming(500, 1110, 3, { fadeInFrames: 15 });
 * // timing.currentPhraseIndex = 1 (segunda frase)
 * // timing.opacity = 1 (en medio de la frase, sin transición)
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

  // Distribuir frames equitativamente entre frases
  const framesPerPhrase = totalFrames / phraseCount;

  // Calcular índice de frase actual
  const rawIndex = currentFrame / framesPerPhrase;
  const currentPhraseIndex = Math.min(
    Math.max(0, Math.floor(rawIndex)),
    phraseCount - 1
  );

  // Calcular frames de inicio y fin de la frase actual
  const phraseStartFrame = Math.round(currentPhraseIndex * framesPerPhrase);
  const phraseEndFrame = Math.round((currentPhraseIndex + 1) * framesPerPhrase);

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
