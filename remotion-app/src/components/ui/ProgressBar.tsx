// ===================================
// PROGRESS BAR - Barra de progreso del video
// ===================================

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate
} from 'remotion';
import { theme } from '../../theme';
import type { ProgressBarProps } from '../../types/audio.types';

/**
 * ProgressBar - Barra de progreso visual para el video
 *
 * Muestra el progreso del video como una barra horizontal
 * en la parte inferior de la pantalla. Usa el estilo cyberpunk
 * del proyecto con efectos de neón.
 *
 * La barra progresa de 0% a 100% basándose en el frame actual
 * relativo a la duración total del video.
 *
 * @example
 * // Uso básico
 * <ProgressBar />
 *
 * @example
 * // Con color personalizado y porcentaje
 * <ProgressBar
 *   color="#ff0099"
 *   height={6}
 *   showPercentage={true}
 * />
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  color = theme.colors.primary,
  height = 4,
  showPercentage = false
}) => {
  // Obtener frame actual y configuración del video
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calcular progreso (0 a 100)
  const progress = interpolate(
    frame,
    [0, durationInFrames],
    [0, 100],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  // Estilos del contenedor principal
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height + 20, // Extra espacio para el glow
    display: 'flex',
    alignItems: 'flex-end',
    padding: '0 0 10px 0',
    // Gradiente de fondo para suavizar la transición
    background: `linear-gradient(
      to top,
      rgba(0, 0, 0, 0.6) 0%,
      transparent 100%
    )`,
    pointerEvents: 'none',
  };

  // Estilos de la barra de fondo (track)
  const trackStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: height,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: height / 2,
    overflow: 'hidden',
  };

  // Estilos de la barra de progreso (fill)
  const fillStyle: React.CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    backgroundColor: color,
    borderRadius: height / 2,
    // Efecto neón/glow característico del estilo cyberpunk
    boxShadow: `
      0 0 10px ${color},
      0 0 20px ${color},
      0 0 30px ${color}
    `,
    // Animación suave
    transition: 'width 0.1s ease-out',
  };

  // Estilos del indicador de porcentaje
  const percentageStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: height + 20,
    left: `calc(${progress}% + 10px)`,
    transform: 'translateX(-50%)',
    color: color,
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.main,
    fontWeight: 'bold',
    textShadow: theme.shadows.neon(color),
    opacity: progress > 5 ? 1 : 0, // Ocultar al inicio
    transition: 'opacity 0.3s ease',
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={containerStyle}>
        {/* Track (fondo de la barra) */}
        <div style={trackStyle}>
          {/* Fill (progreso actual) */}
          <div style={fillStyle} />
        </div>

        {/* Indicador de porcentaje (opcional) */}
        {showPercentage && (
          <div style={percentageStyle}>
            {Math.round(progress)}%
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default ProgressBar;
