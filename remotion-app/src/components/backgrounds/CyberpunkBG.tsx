// ===================================
// CYBERPUNK BACKGROUND - Fondo degradado animado
// ===================================

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface CyberpunkBGProps {
  primaryColor?: string;
  secondaryColor?: string;
  intensity?: number;
}

/**
 * Fondo con degradado animado estilo cyberpunk
 * Colores por defecto: cyan y magenta de Sintaxis IA
 */
export const CyberpunkBG: React.FC<CyberpunkBGProps> = ({
  primaryColor = '#00f0ff',
  secondaryColor = '#ff0099',
  intensity = 1
}) => {
  const frame = useCurrentFrame();

  // Animación del ángulo del degradado
  const gradientAngle = interpolate(
    frame,
    [0, 300, 600, 900, 1200, 1500, 1800],
    [0, 45, 90, 135, 180, 225, 270],
    { extrapolateRight: 'clamp' }
  );

  // Pulso de opacidad para efecto de respiración
  const pulseOpacity = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.3 * intensity, 0.6 * intensity]
  );

  // Posición del punto de luz
  const lightX = interpolate(
    Math.sin(frame * 0.02),
    [-1, 1],
    [20, 80]
  );
  const lightY = interpolate(
    Math.cos(frame * 0.015),
    [-1, 1],
    [30, 70]
  );

  return (
    <AbsoluteFill>
      {/* Capa base oscura */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0f'
        }}
      />

      {/* Degradado principal animado */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `linear-gradient(${gradientAngle}deg,
            ${primaryColor}20,
            transparent 50%,
            ${secondaryColor}20)`,
          opacity: pulseOpacity
        }}
      />

      {/* Punto de luz flotante */}
      <div
        style={{
          position: 'absolute',
          width: '60%',
          height: '40%',
          left: `${lightX}%`,
          top: `${lightY}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse, ${primaryColor}15 0%, transparent 70%)`,
          filter: 'blur(60px)'
        }}
      />

      {/* Segundo punto de luz */}
      <div
        style={{
          position: 'absolute',
          width: '50%',
          height: '35%',
          left: `${100 - lightX}%`,
          top: `${100 - lightY}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse, ${secondaryColor}15 0%, transparent 70%)`,
          filter: 'blur(50px)'
        }}
      />

      {/* Grid de líneas (efecto cyberpunk) */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(${primaryColor}08 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor}08 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.5
        }}
      />

      {/* Viñeta oscura en bordes */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center,
            transparent 40%,
            rgba(10, 10, 15, 0.8) 100%)`
        }}
      />
    </AbsoluteFill>
  );
};

export default CyberpunkBG;
