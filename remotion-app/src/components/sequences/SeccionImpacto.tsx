// ===================================
// SECCION IMPACTO - Dato impactante 50-55s
// ===================================

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig
} from 'remotion';
import { GlitchEffect } from '../effects/GlitchEffect';
import { NeonBorder } from '../effects/NeonBorder';

interface SeccionImpactoProps {
  texto: string;
  themeColor?: string;
}

/**
 * Secuencia del dato impactante
 * Duración: 150 frames (5 segundos a 30fps)
 * - Entrada dramática con glitch
 * - Texto grande y centrado
 * - Efectos de énfasis
 */
export const SeccionImpacto: React.FC<SeccionImpactoProps> = ({
  texto,
  themeColor = '#ffd700' // Dorado para impacto
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Escala con bounce dramático
  const scale = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 8,
      stiffness: 150,
      mass: 0.8
    }
  });

  // Opacidad de entrada
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Rotación sutil para dinamismo
  const rotation = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [-1, 1]
  );

  // Pulso del glow
  const glowPulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.8, 1.2]
  );

  // Intensidad del glitch (más al inicio)
  const glitchIntensity = interpolate(
    frame,
    [0, 30, 50],
    [2, 0.5, 0],
    { extrapolateRight: 'clamp' }
  );

  // Zoom lento durante la sección
  const zoomScale = interpolate(
    frame,
    [0, 150],
    [1, 1.05],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f' }}>
      {/* Fondo con pulso de color */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center,
            ${themeColor}15 0%,
            transparent 60%)`,
          opacity: glowPulse,
          transform: `scale(${zoomScale})`
        }}
      />

      {/* Contenido con glitch */}
      <GlitchEffect
        intensity={glitchIntensity}
        frequency={frame < 30 ? 0.3 : 0.05}
        colorShift={frame < 40}
      >
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40
          }}
        >
          {/* Icono de impacto */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              fontSize: 80,
              transform: `scale(${scale * glowPulse})`,
              opacity,
              textShadow: `0 0 30px ${themeColor}`
            }}
          >
            ⚡
          </div>

          {/* Texto principal */}
          <div
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              opacity
            }}
          >
            <NeonBorder
              color={themeColor}
              secondaryColor="#ff3366"
              thickness={4}
              borderRadius={24}
              glowIntensity={glowPulse}
            >
              <div
                style={{
                  padding: '50px 40px',
                  textAlign: 'center'
                }}
              >
                {/* Label */}
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: themeColor,
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: 6,
                    marginBottom: 20,
                    textTransform: 'uppercase'
                  }}
                >
                  DATO CLAVE
                </div>

                {/* Texto del impacto */}
                <p
                  style={{
                    fontSize: 44,
                    fontWeight: 800,
                    color: '#ffffff',
                    fontFamily: 'Arial Black, sans-serif',
                    lineHeight: 1.4,
                    margin: 0,
                    textShadow: `
                      0 0 10px ${themeColor},
                      0 0 20px ${themeColor}50
                    `
                  }}
                >
                  {texto}
                </p>
              </div>
            </NeonBorder>
          </div>

          {/* Partículas de énfasis */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 250 + Math.sin(frame * 0.1 + i) * 30;
            const x = Math.cos(angle + frame * 0.01) * distance;
            const y = Math.sin(angle + frame * 0.01) * distance;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: themeColor,
                  boxShadow: `0 0 10px ${themeColor}`,
                  transform: `translate(${x}px, ${y}px)`,
                  opacity: opacity * 0.6
                }}
              />
            );
          })}
        </AbsoluteFill>
      </GlitchEffect>
    </AbsoluteFill>
  );
};

export default SeccionImpacto;
