/**
 * @fileoverview LightSweep - Barrido de luz periódico
 *
 * Micro-evento visual: un barrido diagonal de luz que aparece
 * cada ~8 segundos para agregar dinamismo al fondo sin distraer.
 *
 * Solo renderiza el div durante los frames del barrido activo
 * para optimizar performance.
 *
 * Prompt 20.1: Usa color accent del tema con blend mode screen.
 * Gradiente concentrado (35%/50%/65%) para efecto más premium.
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 20
 * @updated Prompt 20.1 - Fix double alpha, color temático, blend mode
 */

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { lightSweep as lightSweepConfig, colors } from '../../styles/themes';

/**
 * LightSweep - Barrido de luz diagonal periódico
 *
 * Aparece cada intervalFrames con una duración de durationFrames.
 * Usa una curva bell (0 -> max -> 0) para opacidad.
 *
 * @example
 * <LightSweep />
 */
export const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();

  // Calcular fase dentro del ciclo de intervalo
  const sweepPhase = frame % lightSweepConfig.intervalFrames;

  // Solo renderizar durante los frames activos del barrido
  if (sweepPhase >= lightSweepConfig.durationFrames) {
    return null;
  }

  // Opacidad con curva bell: 0 -> maxOpacity -> 0
  const opacity = interpolate(
    sweepPhase,
    [0, lightSweepConfig.durationFrames / 2, lightSweepConfig.durationFrames],
    [0, lightSweepConfig.maxOpacity, 0],
    { extrapolateRight: 'clamp' }
  );

  // Posición del barrido: se desplaza de -100% a +200%
  const translateX = interpolate(
    sweepPhase,
    [0, lightSweepConfig.durationFrames],
    [-100, 200],
    { extrapolateRight: 'clamp' }
  );

  // Color del barrido: accent del tema o blanco (Prompt 20.1)
  const sweepColor = lightSweepConfig.colorSource === 'accent'
    ? colors.accent
    : '#FFFFFF';

  return (
    <AbsoluteFill style={{
      pointerEvents: 'none',
      overflow: 'hidden',
      mixBlendMode: lightSweepConfig.blendMode,
    }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: `translateX(${translateX}%)`,
          background: `linear-gradient(${lightSweepConfig.angle}deg, transparent 35%, ${sweepColor} 50%, transparent 65%)`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

export default LightSweep;
