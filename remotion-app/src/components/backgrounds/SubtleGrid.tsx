/**
 * @fileoverview SubtleGrid - Grid tech sutil con drift
 *
 * Agrega una cuadrícula fina de líneas que se desplaza lentamente,
 * dando sensación de profundidad estilo HUD tecnológico.
 *
 * Usa repeating-linear-gradient para performance óptima
 * (no canvas ni SVG necesarios).
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 20.1
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { subtleGrid as gridConfig, colors } from '../../styles/themes';

/**
 * SubtleGrid - Cuadrícula sutil con drift senoidal
 *
 * Grid de líneas finas que se desplaza lentamente para dar
 * textura al fondo. Blend mode overlay y opacidad baja (0.06)
 * aseguran que no compita con el contenido.
 *
 * @example
 * <SubtleGrid />
 */
export const SubtleGrid: React.FC = () => {
  const frame = useCurrentFrame();

  // Drift senoidal lento en ambos ejes
  const driftX = Math.sin(frame * gridConfig.driftSpeed) * gridConfig.driftAmplitude;
  const driftY = Math.cos(frame * gridConfig.driftSpeed * 0.7) * gridConfig.driftAmplitude;

  // Color de línea derivado del texto muted del tema
  const lineColor = colors.text.muted;

  const { cellSize, lineWidth } = gridConfig;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: gridConfig.opacity,
        mixBlendMode: gridConfig.blendMode,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            ${lineColor} 0px,
            ${lineColor} ${lineWidth}px,
            transparent ${lineWidth}px,
            transparent ${cellSize}px
          ),
          repeating-linear-gradient(
            90deg,
            ${lineColor} 0px,
            ${lineColor} ${lineWidth}px,
            transparent ${lineWidth}px,
            transparent ${cellSize}px
          )
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        backgroundPosition: `${driftX}px ${driftY}px`,
      }}
    />
  );
};

export default SubtleGrid;
