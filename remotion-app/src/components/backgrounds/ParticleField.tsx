// ===================================
// PARTICLE FIELD - Partículas flotantes
// ===================================

import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, random } from 'remotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

interface ParticleFieldProps {
  particleCount?: number;
  color?: string;
  maxSize?: number;
  speed?: number;
}

/**
 * Campo de partículas flotantes que suben lentamente
 * Crea efecto de atmósfera tecnológica
 */
export const ParticleField: React.FC<ParticleFieldProps> = ({
  particleCount = 50,
  color = '#00f0ff',
  maxSize = 4,
  speed = 1
}) => {
  const frame = useCurrentFrame();

  // Generar partículas con posiciones aleatorias pero determinísticas
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: random(`particle-x-${i}`) * 100,
      y: random(`particle-y-${i}`) * 100,
      size: random(`particle-size-${i}`) * maxSize + 1,
      speed: (random(`particle-speed-${i}`) * 0.5 + 0.5) * speed,
      opacity: random(`particle-opacity-${i}`) * 0.6 + 0.2,
      delay: random(`particle-delay-${i}`) * 200
    }));
  }, [particleCount, maxSize, speed]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {particles.map((particle) => {
        // Calcular posición Y (las partículas suben)
        const yOffset = ((frame + particle.delay) * particle.speed * 0.5) % 120;
        const currentY = particle.y + 10 - yOffset;

        // Fade in/out en los bordes
        const fadeOpacity = interpolate(
          currentY,
          [-10, 10, 90, 110],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        // Parpadeo sutil
        const twinkle = interpolate(
          Math.sin((frame + particle.delay) * 0.1),
          [-1, 1],
          [0.5, 1]
        );

        // Movimiento horizontal sutil
        const xOffset = Math.sin((frame + particle.delay) * 0.02) * 2;

        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x + xOffset}%`,
              top: `${currentY}%`,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: particle.opacity * fadeOpacity * twinkle,
              boxShadow: `0 0 ${particle.size * 2}px ${color}`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export default ParticleField;
