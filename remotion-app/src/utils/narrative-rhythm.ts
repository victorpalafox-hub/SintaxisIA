/**
 * @fileoverview Ritmo Narrativo - Curva de intensidad global
 *
 * Modula la amplitud de micro-dinámicas (Prompt 48) a lo largo del video
 * para crear una curva de energía con tensión, picos y pausas.
 *
 * 3 capas compuestas:
 * 1. Curva base por fase (opening 100% → build 75% → climax 115%)
 * 2. Micro-pausas rítmicas cada ~5.5s (breve reducción a 40%)
 * 3. Desaceleración pre-final (últimos 2s → 30%)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 49
 */

import { narrativeRhythm } from '../styles/themes';

/** Tipo de la config narrativeRhythm (inferido de themes.ts) */
type NarrativeRhythmConfig = typeof narrativeRhythm;

/**
 * Calcula el multiplicador de intensidad para un frame dado
 *
 * Función pura O(1) por frame, sin side-effects.
 * El resultado multiplica las amplitudes de micro-dinámicas
 * (breathing, X-drift, text drift) en ContentScene.
 *
 * @param frame - Frame actual del Sequence (relativo a ContentScene)
 * @param fps - Frames por segundo (normalmente 30)
 * @param totalFrames - Duración total del Sequence en frames
 * @param config - Config de narrativeRhythm desde themes.ts
 * @returns Multiplicador de intensidad (0.12 a 1.15 típicamente)
 *
 * @example
 * const intensity = getIntensityMultiplier(frame, 30, 1110, narrativeRhythm);
 * const breathingAmplitude = microDynamics.imageBreathing.amplitude * intensity;
 */
export function getIntensityMultiplier(
  frame: number,
  fps: number,
  totalFrames: number,
  config: NarrativeRhythmConfig,
): number {
  const seconds = frame / fps;

  // ==========================================
  // CAPA 1: Curva base por fase del video
  // ==========================================
  // Transiciones suaves entre fases (interpolación lineal)

  let base: number;
  if (seconds < config.intensityCurve.openingEnd) {
    // Fase 1: Apertura enérgica
    base = config.intensityCurve.openingIntensity;
  } else if (seconds < config.intensityCurve.buildEnd) {
    // Fase 2: Transición suave opening → build
    const progress = (seconds - config.intensityCurve.openingEnd)
      / (config.intensityCurve.buildEnd - config.intensityCurve.openingEnd);
    base = config.intensityCurve.openingIntensity
      + (config.intensityCurve.buildIntensity - config.intensityCurve.openingIntensity)
      * progress;
  } else {
    // Fase 3: Transición suave build → climax (5s ramp)
    const climaxRampSeconds = 5;
    const progress = Math.min(1, (seconds - config.intensityCurve.buildEnd) / climaxRampSeconds);
    base = config.intensityCurve.buildIntensity
      + (config.intensityCurve.climaxIntensity - config.intensityCurve.buildIntensity)
      * progress;
  }

  // ==========================================
  // CAPA 2: Micro-pausa rítmica periódica
  // ==========================================
  // Reduce intensidad brevemente cada intervalFrames
  // Usa sine para suavizar entrada/salida (no corte abrupto)

  const cyclePos = frame % config.rhythmPause.intervalFrames;
  let pauseFactor = 1;
  if (cyclePos < config.rhythmPause.durationFrames) {
    const pauseProgress = cyclePos / config.rhythmPause.durationFrames;
    // Sine crea curva suave: 0→pico→0 dentro de la pausa
    pauseFactor = config.rhythmPause.dampingFactor
      + (1 - config.rhythmPause.dampingFactor)
      * Math.abs(Math.sin(pauseProgress * Math.PI));
  }

  // ==========================================
  // CAPA 3: Desaceleración pre-final
  // ==========================================
  // Reduce gradualmente en los últimos leadFrames

  const framesRemaining = totalFrames - frame;
  let decelFactor = 1;
  if (framesRemaining < config.preFinalDecel.leadFrames) {
    // Proporción lineal: 1.0 → minIntensity
    const decelProgress = framesRemaining / config.preFinalDecel.leadFrames;
    decelFactor = config.preFinalDecel.minIntensity
      + (1 - config.preFinalDecel.minIntensity) * decelProgress;
  }

  // Componer las 3 capas multiplicativamente
  return base * pauseFactor * decelFactor;
}
