/**
 * @fileoverview LightSweep - Barrido de luz periódico dual
 *
 * Micro-evento visual: barridos diagonales de luz que aparecen
 * periódicamente para agregar dinamismo al fondo sin distraer.
 *
 * Prompt 31: Segundo sweep offset a 50% del intervalo con ángulo
 * invertido y 70% de opacidad para mayor frecuencia visual.
 *
 * Solo renderiza los divs durante los frames del barrido activo
 * para optimizar performance.
 *
 * @author Sintaxis IA
 * @version 3.0.0
 * @since Prompt 20
 * @updated Prompt 20.1 - Fix double alpha, color temático, blend mode
 * @updated Prompt 31 - Dual sweep con ángulo invertido para más dinamismo
 */

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { lightSweep as lightSweepConfig, colors } from '../../styles/themes';

/**
 * LightSweep - Barrido de luz diagonal periódico dual
 *
 * Sweep primario cada intervalFrames + sweep secundario offset 50%.
 * Cada uno usa una curva bell (0 -> max -> 0) para opacidad.
 *
 * @example
 * <LightSweep />
 */
export const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();

  // Color del barrido: accent del tema o blanco
  const sweepColor = lightSweepConfig.colorSource === 'accent'
    ? colors.accent
    : '#FFFFFF';

  // Calcular fase del sweep primario
  const sweepPhase1 = frame % lightSweepConfig.intervalFrames;
  const sweep1Active = sweepPhase1 < lightSweepConfig.durationFrames;

  // Prompt 31: Segundo sweep offset a 50% del intervalo
  const sweepPhase2 = (frame + Math.floor(lightSweepConfig.intervalFrames / 2)) % lightSweepConfig.intervalFrames;
  const sweep2Active = sweepPhase2 < lightSweepConfig.durationFrames;

  // Si ningún sweep está activo, no renderizar nada
  if (!sweep1Active && !sweep2Active) {
    return null;
  }

  // Opacidad y posición del sweep primario
  const opacity1 = sweep1Active ? interpolate(
    sweepPhase1,
    [0, lightSweepConfig.durationFrames / 2, lightSweepConfig.durationFrames],
    [0, lightSweepConfig.maxOpacity, 0],
    { extrapolateRight: 'clamp' }
  ) : 0;

  const translateX1 = sweep1Active ? interpolate(
    sweepPhase1,
    [0, lightSweepConfig.durationFrames],
    [-100, 200],
    { extrapolateRight: 'clamp' }
  ) : 0;

  // Prompt 31: Opacidad y posición del sweep secundario (70% opacidad, ángulo invertido)
  const opacity2 = sweep2Active ? interpolate(
    sweepPhase2,
    [0, lightSweepConfig.durationFrames / 2, lightSweepConfig.durationFrames],
    [0, lightSweepConfig.maxOpacity * 0.7, 0],
    { extrapolateRight: 'clamp' }
  ) : 0;

  const translateX2 = sweep2Active ? interpolate(
    sweepPhase2,
    [0, lightSweepConfig.durationFrames],
    [-100, 200],
    { extrapolateRight: 'clamp' }
  ) : 0;

  // Ángulo invertido para el sweep secundario (Prompt 31)
  const invertedAngle = 180 - lightSweepConfig.angle;

  return (
    <AbsoluteFill style={{
      pointerEvents: 'none',
      overflow: 'hidden',
      mixBlendMode: lightSweepConfig.blendMode,
    }}>
      {/* Sweep primario (original) */}
      {sweep1Active && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translateX(${translateX1}%)`,
            background: `linear-gradient(${lightSweepConfig.angle}deg, transparent 35%, ${sweepColor} 50%, transparent 65%)`,
            opacity: opacity1,
          }}
        />
      )}

      {/* Prompt 31: Sweep secundario (ángulo invertido, 70% opacidad) */}
      {sweep2Active && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translateX(${translateX2}%)`,
            background: `linear-gradient(${invertedAngle}deg, transparent 35%, ${sweepColor} 50%, transparent 65%)`,
            opacity: opacity2,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default LightSweep;
