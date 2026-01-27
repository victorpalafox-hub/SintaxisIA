// ===================================
// GANCHO EXPLOSIVO - Intro 0-3s
// ===================================

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  Sequence
} from 'remotion';
import { NeonBorder } from '../effects/NeonBorder';

interface GanchoExplosivoProps {
  texto: string;
  logoUrl?: string;
}

/**
 * Secuencia de intro con efecto explosivo
 * Duración: 90 frames (3 segundos a 30fps)
 * - Flash inicial
 * - Logo aparece con bounce
 * - Texto del gancho con efecto de impacto
 */
export const GanchoExplosivo: React.FC<GanchoExplosivoProps> = ({
  texto,
  logoUrl
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Flash inicial (frames 0-15)
  const flashOpacity = interpolate(frame, [0, 5, 15], [0, 1, 0], {
    extrapolateRight: 'clamp'
  });

  // Escala del logo con spring bounce
  const logoScale = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5
    }
  });

  // Opacidad del logo
  const logoOpacity = interpolate(frame, [10, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  // Animación del texto (aparece después del logo)
  const textProgress = spring({
    frame: frame - 30,
    fps,
    config: {
      damping: 12,
      stiffness: 80
    }
  });

  const textY = interpolate(textProgress, [0, 1], [100, 0]);
  const textOpacity = interpolate(textProgress, [0, 0.5], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Efecto de shake en el impacto
  const shakeX = frame > 25 && frame < 35
    ? Math.sin(frame * 2) * (35 - frame) * 0.5
    : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0f',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Flash blanco inicial */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#00f0ff',
          opacity: flashOpacity,
          mixBlendMode: 'screen'
        }}
      />

      {/* Logo centrado */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          transform: `scale(${logoScale}) translateX(${shakeX}px)`,
          opacity: logoOpacity
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Sintaxis IA"
            style={{ width: 200, height: 200 }}
          />
        ) : (
          // Placeholder del logo
          <NeonBorder
            color="#00f0ff"
            secondaryColor="#ff0099"
            thickness={3}
            borderRadius={20}
          >
            <div
              style={{
                padding: '20px 40px',
                fontSize: 48,
                fontWeight: 'bold',
                color: '#00f0ff',
                fontFamily: 'Arial Black, sans-serif',
                textShadow: '0 0 20px #00f0ff'
              }}
            >
              SINTAXIS IA
            </div>
          </NeonBorder>
        )}
      </div>

      {/* Texto del gancho */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          width: '90%',
          textAlign: 'center',
          transform: `translateY(${textY}px) translateX(${shakeX}px)`,
          opacity: textOpacity
        }}
      >
        <h1
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: 'Arial Black, sans-serif',
            textTransform: 'uppercase',
            textShadow: `
              0 0 10px #00f0ff,
              0 0 20px #00f0ff,
              0 0 40px #ff0099
            `,
            lineHeight: 1.2,
            margin: 0
          }}
        >
          {texto}
        </h1>
      </div>

      {/* Líneas decorativas */}
      <Sequence from={20}>
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            width: '60%',
            height: 3,
            background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
            opacity: interpolate(frame - 20, [0, 10], [0, 1], {
              extrapolateRight: 'clamp'
            })
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export default GanchoExplosivo;
