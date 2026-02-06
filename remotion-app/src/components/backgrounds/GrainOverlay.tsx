/**
 * @fileoverview GrainOverlay - Textura de ruido sutil
 *
 * Agrega textura de grain al fondo para efecto "film grain"
 * profesional que rompe la monotonía del gradiente plano.
 *
 * Usa SVG feTurbulence por ser más performante que canvas.
 * La opacidad varía sutilmente con el frame para dar vida.
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 20
 * @updated Prompt 31 - Frecuencia variable para textura más rica
 */

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { backgroundAnimation } from '../../styles/themes';

/**
 * GrainOverlay - Film grain sutil
 *
 * Renderiza una capa de ruido SVG que se actualiza cada frame
 * variando el baseFrequency para simular movimiento.
 *
 * @example
 * <GrainOverlay />
 */
export const GrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // Opacidad que varía sutilmente entre grainOpacity[0] y grainOpacity[1]
  const opacity = interpolate(
    frame % 90,
    [0, 45, 90],
    [backgroundAnimation.grainOpacity[0], backgroundAnimation.grainOpacity[1], backgroundAnimation.grainOpacity[0]],
    { extrapolateRight: 'clamp' }
  );

  // Variar seed del noise por frame para simular movimiento
  // Usamos Math.floor(frame / 2) para cambiar cada 2 frames (15fps de grain = más natural)
  const seed = Math.floor(frame / 2) % 100;

  // Prompt 31: Variación de frecuencia para textura más rica (0.60-0.70)
  const baseFreq = 0.65 + Math.sin(frame * 0.01) * 0.05;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity, mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFreq}
            numOctaves={4}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#grain-${seed})`}
        />
      </svg>
    </AbsoluteFill>
  );
};

export default GrainOverlay;
