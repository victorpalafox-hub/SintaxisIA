// ===================================
// NEON BORDER - Bordes con efecto neón animado
// ===================================

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface NeonBorderProps {
  children: React.ReactNode;
  color?: string;
  secondaryColor?: string;
  thickness?: number;
  glowIntensity?: number;
  animated?: boolean;
  borderRadius?: number;
  style?: React.CSSProperties;
}

/**
 * Contenedor con bordes neón brillantes y animados
 * Efecto de luz que recorre el borde
 */
export const NeonBorder: React.FC<NeonBorderProps> = ({
  children,
  color = '#00f0ff',
  secondaryColor = '#ff0099',
  thickness = 2,
  glowIntensity = 1,
  animated = true,
  borderRadius = 12,
  style = {}
}) => {
  const frame = useCurrentFrame();

  // Ángulo de rotación del degradado (efecto de luz viajando)
  const gradientAngle = animated
    ? interpolate(frame, [0, 120], [0, 360], {
        extrapolateRight: 'extend'
      }) % 360
    : 45;

  // Pulso de intensidad del glow
  const glowPulse = animated
    ? interpolate(
        Math.sin(frame * 0.1),
        [-1, 1],
        [0.7 * glowIntensity, 1 * glowIntensity]
      )
    : glowIntensity;

  // Tamaño del glow
  const glowSize = 10 * glowPulse;

  return (
    <div
      style={{
        position: 'relative',
        padding: thickness,
        borderRadius: borderRadius + thickness,
        background: `linear-gradient(${gradientAngle}deg, ${color}, ${secondaryColor}, ${color})`,
        boxShadow: `
          0 0 ${glowSize}px ${color}${Math.floor(glowPulse * 80).toString(16).padStart(2, '0')},
          0 0 ${glowSize * 2}px ${secondaryColor}${Math.floor(glowPulse * 40).toString(16).padStart(2, '0')},
          inset 0 0 ${glowSize / 2}px ${color}${Math.floor(glowPulse * 30).toString(16).padStart(2, '0')}
        `,
        ...style
      }}
    >
      {/* Contenedor interno con fondo oscuro */}
      <div
        style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #15151f 100%)',
          borderRadius,
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>

      {/* Reflejo superior */}
      <div
        style={{
          position: 'absolute',
          top: thickness,
          left: thickness + borderRadius,
          right: thickness + borderRadius,
          height: '1px',
          background: `linear-gradient(90deg,
            transparent,
            ${color}${Math.floor(glowPulse * 60).toString(16).padStart(2, '0')} 50%,
            transparent)`,
          filter: `blur(1px)`
        }}
      />
    </div>
  );
};

/**
 * Línea horizontal con efecto neón
 */
export const NeonLine: React.FC<{
  color?: string;
  width?: string;
  animated?: boolean;
}> = ({
  color = '#00f0ff',
  width = '100%',
  animated = true
}) => {
  const frame = useCurrentFrame();

  const opacity = animated
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.5, 1])
    : 1;

  return (
    <div
      style={{
        width,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}50`,
        opacity
      }}
    />
  );
};

export default NeonBorder;
