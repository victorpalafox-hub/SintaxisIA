// ===================================
// GLITCH EFFECT - Efecto de distorsión glitch
// ===================================

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, random } from 'remotion';

interface GlitchEffectProps {
  children: React.ReactNode;
  intensity?: number;
  frequency?: number;
  colorShift?: boolean;
}

/**
 * Envuelve contenido y aplica efecto glitch intermitente
 * Útil para transiciones y momentos de impacto
 */
export const GlitchEffect: React.FC<GlitchEffectProps> = ({
  children,
  intensity = 1,
  frequency = 0.1,
  colorShift = true
}) => {
  const frame = useCurrentFrame();

  // Determinar si hay glitch en este frame (aleatorio pero determinístico)
  const shouldGlitch = random(`glitch-${Math.floor(frame / 3)}`) < frequency;

  // Valores de glitch
  const glitchX = shouldGlitch
    ? (random(`glitch-x-${frame}`) - 0.5) * 20 * intensity
    : 0;
  const glitchY = shouldGlitch
    ? (random(`glitch-y-${frame}`) - 0.5) * 10 * intensity
    : 0;

  // Separación de canales de color (chromatic aberration)
  const rgbShift = shouldGlitch && colorShift
    ? random(`rgb-${frame}`) * 5 * intensity
    : 0;

  // Líneas de escaneo
  const scanlineOpacity = interpolate(
    Math.sin(frame * 0.5),
    [-1, 1],
    [0.02, 0.05]
  );

  return (
    <AbsoluteFill>
      {/* Capa con shift de color rojo */}
      {colorShift && rgbShift > 0 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: `translate(${rgbShift}px, 0)`,
            opacity: 0.5,
            mixBlendMode: 'screen'
          }}
        >
          <div style={{ filter: 'url(#redChannel)' }}>
            {children}
          </div>
        </div>
      )}

      {/* Capa con shift de color cyan */}
      {colorShift && rgbShift > 0 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: `translate(${-rgbShift}px, 0)`,
            opacity: 0.5,
            mixBlendMode: 'screen'
          }}
        >
          <div style={{ filter: 'url(#cyanChannel)' }}>
            {children}
          </div>
        </div>
      )}

      {/* Contenido principal con desplazamiento glitch */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translate(${glitchX}px, ${glitchY}px)`
        }}
      >
        {children}
      </div>

      {/* Líneas de escaneo */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, ${scanlineOpacity}) 2px,
            rgba(0, 0, 0, ${scanlineOpacity}) 4px
          )`,
          pointerEvents: 'none'
        }}
      />

      {/* Slice horizontal aleatorio durante glitch */}
      {shouldGlitch && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: `${random(`slice-h-${frame}`) * 10 + 5}%`,
            top: `${random(`slice-y-${frame}`) * 80}%`,
            transform: `translateX(${(random(`slice-x-${frame}`) - 0.5) * 30 * intensity}px)`,
            overflow: 'hidden'
          }}
        >
          {children}
        </div>
      )}

      {/* SVG filters para separación de canales (hidden) */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="redChannel">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="cyanChannel">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};

export default GlitchEffect;
