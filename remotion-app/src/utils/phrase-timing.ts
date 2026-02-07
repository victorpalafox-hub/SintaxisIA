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
 * @updated Prompt 33 - getBlockTiming() para bloques editoriales
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
  /** Offset en segundos del inicio de la escena respecto al audio (Prompt 25)
   *  ContentScene empieza en ~7s del video pero useCurrentFrame() retorna frame 0.
   *  Sin este offset, el texto va ~7s adelantado respecto al audio.
   */
  sceneOffsetSeconds?: number;
  /** Milisegundos que el texto aparece ANTES del audio (default: 200ms) */
  captionLeadMs?: number;
  /** Milisegundos que el texto permanece DESPUÉS del audio (default: 150ms) */
  captionLagMs?: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const DEFAULT_FADE_IN_FRAMES = 15;   // 0.5s @ 30fps
const DEFAULT_FADE_OUT_FRAMES = 15;  // 0.5s @ 30fps
const DEFAULT_CAPTION_LEAD_MS = 200; // Texto aparece 200ms antes del audio
const DEFAULT_CAPTION_LAG_MS = 150;  // Texto permanece 150ms después del audio

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
    // Prompt 25: Convertir frame actual a segundos CON offset de escena
    // ContentScene empieza en segundo ~7 del video, pero su frame 0 = segundo 0 local.
    // El audio empieza en segundo 0 absoluto, así que necesitamos sumar el offset.
    const sceneOffset = config.sceneOffsetSeconds ?? 0;
    const currentSecond = (currentFrame / fps) + sceneOffset;

    // Prompt 25.3: Lead/lag perceptual para sincronización broadcast-grade
    const leadSeconds = (config.captionLeadMs ?? DEFAULT_CAPTION_LEAD_MS) / 1000;
    const lagSeconds = (config.captionLagMs ?? DEFAULT_CAPTION_LAG_MS) / 1000;

    // Encontrar qué frase corresponde al tiempo actual (con lead: texto aparece antes)
    currentPhraseIndex = findPhraseIndexByTime(phraseTimestamps, currentSecond, leadSeconds);

    // Obtener timestamps de la frase actual
    // Convertir a frames locales de escena restando el offset
    // Sin esto, phraseStartFrame sería absoluto (e.g. 102) pero currentFrame es local (0),
    // causando relativeFrame negativo → opacity 0 → texto invisible
    const timestamp = phraseTimestamps[currentPhraseIndex];
    const sceneOffsetFrames = Math.round(sceneOffset * fps);

    phraseStartFrame = Math.max(0, Math.round((timestamp.startSeconds - leadSeconds) * fps) - sceneOffsetFrames);
    // Prompt 25.2: fadeOut buffer + Prompt 25.3: lag perceptual
    const fadeOut = config.fadeOutFrames ?? 15;
    phraseEndFrame = Math.max(phraseStartFrame + 1, Math.min(totalFrames, Math.round((timestamp.endSeconds + lagSeconds) * fps) - sceneOffsetFrames + fadeOut));

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
  currentSecond: number,
  leadSeconds: number = 0
): number {
  // Buscar la frase cuyo rango contiene el tiempo actual
  // Lead: el texto aparece leadSeconds antes del audio real
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const effectiveStart = ts.startSeconds - leadSeconds;

    // Si estamos dentro del rango de esta frase (con lead aplicado al inicio)
    if (currentSecond >= effectiveStart && currentSecond < ts.endSeconds) {
      return i;
    }

    // Si es la última frase y estamos después de su inicio
    if (i === timestamps.length - 1 && currentSecond >= effectiveStart) {
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
// BLOCK TIMING - Prompt 33
// =============================================================================

/**
 * Resultado del cálculo de timing para bloques editoriales
 * @since Prompt 33
 */
export interface BlockTiming {
  /** Índice del bloque actual (0-based) */
  currentBlockIndex: number;
  /** Opacidad calculada para transición (0-1) */
  opacity: number;
  /** Frame de inicio del bloque actual */
  blockStartFrame: number;
  /** Frame de fin del bloque actual */
  blockEndFrame: number;
  /** Indica si estamos en medio de una transición */
  isTransitioning: boolean;
}

/** Interfaz mínima de bloque editorial para evitar import circular */
interface EditorialBlock {
  startSeconds: number;
  endSeconds: number;
  weight: string;
}

/**
 * Calcula timing y opacity para bloques editoriales
 *
 * Misma lógica que getPhraseTiming modo Whisper, pero opera sobre
 * bloques que pueden contener 1-2 frases agrupadas.
 * Agrega pausa visual antes de bloques "punch".
 *
 * @param currentFrame - Frame actual de la escena (relativo al inicio)
 * @param blocks - Bloques editoriales con startSeconds/endSeconds
 * @param totalFrames - Duración total de la escena en frames
 * @param config - Configuración de timing (lead/lag, fade, offset)
 * @returns Timing del bloque actual
 *
 * @since Prompt 33
 */
export function getBlockTiming(
  currentFrame: number,
  blocks: EditorialBlock[],
  totalFrames: number,
  config: TimingConfig = {}
): BlockTiming {
  const {
    fadeInFrames = DEFAULT_FADE_IN_FRAMES,
    fadeOutFrames = DEFAULT_FADE_OUT_FRAMES,
    fps = 30,
  } = config;

  // Sin bloques → default
  if (!blocks || blocks.length === 0) {
    return {
      currentBlockIndex: 0,
      opacity: 1,
      isTransitioning: false,
      blockStartFrame: 0,
      blockEndFrame: totalFrames,
    };
  }

  // Convertir frame actual a segundos con offset de escena
  const sceneOffset = config.sceneOffsetSeconds ?? 0;
  const currentSecond = (currentFrame / fps) + sceneOffset;

  // Lead/lag perceptual (Prompt 25.3)
  const leadSeconds = (config.captionLeadMs ?? DEFAULT_CAPTION_LEAD_MS) / 1000;
  const lagSeconds = (config.captionLagMs ?? DEFAULT_CAPTION_LAG_MS) / 1000;

  // Encontrar bloque actual por tiempo
  let currentBlockIndex = 0;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const effectiveStart = block.startSeconds - leadSeconds;
    if (currentSecond >= effectiveStart && currentSecond < block.endSeconds) {
      currentBlockIndex = i;
      break;
    }
    if (i === blocks.length - 1 && currentSecond >= effectiveStart) {
      currentBlockIndex = i;
    }
  }
  // Fallback: antes de todo → primer bloque
  if (currentSecond < blocks[0].startSeconds) {
    currentBlockIndex = 0;
  }

  // Convertir timestamps a frames locales
  const block = blocks[currentBlockIndex];
  const sceneOffsetFrames = Math.round(sceneOffset * fps);

  let blockStartFrame = Math.max(0,
    Math.round((block.startSeconds - leadSeconds) * fps) - sceneOffsetFrames
  );
  const blockEndFrame = Math.max(blockStartFrame + 1,
    Math.min(totalFrames,
      Math.round((block.endSeconds + lagSeconds) * fps) - sceneOffsetFrames + fadeOutFrames
    )
  );

  // Pausa visual antes de bloques "punch" (Prompt 33: puntuación visual)
  // Importar pauseFramesBeforePunch desde themes se haría vía config,
  // pero para evitar import circular usamos el valor directamente
  const PAUSE_BEFORE_PUNCH = 6;
  if (block.weight === 'punch' && currentBlockIndex > 0) {
    blockStartFrame = Math.min(blockStartFrame + PAUSE_BEFORE_PUNCH, blockEndFrame - 1);
  }

  // Frame relativo y opacity
  const relativeFrame = currentFrame - blockStartFrame;
  const blockDuration = blockEndFrame - blockStartFrame;

  const opacity = calculateOpacity(relativeFrame, blockDuration, fadeInFrames, fadeOutFrames);

  const isTransitioning =
    relativeFrame < fadeInFrames ||
    relativeFrame > blockDuration - fadeOutFrames;

  return {
    currentBlockIndex,
    opacity,
    blockStartFrame,
    blockEndFrame,
    isTransitioning,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default getPhraseTiming;
