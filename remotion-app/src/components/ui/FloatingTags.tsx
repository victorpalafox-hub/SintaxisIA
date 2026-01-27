// ===================================
// FLOATING TAGS - Tags flotantes animados
// ===================================

import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate, random, spring, useVideoConfig } from 'remotion';

interface FloatingTagsProps {
  tags: string[];
  color?: string;
  maxVisible?: number;
}

interface TagPosition {
  x: number;
  y: number;
  scale: number;
  delay: number;
}

/**
 * Tags flotantes que aparecen y se mueven sutilmente
 * Muestran empresas, tecnologías o temas mencionados
 */
export const FloatingTags: React.FC<FloatingTagsProps> = ({
  tags,
  color = '#00f0ff',
  maxVisible = 5
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Limitar tags visibles
  const visibleTags = tags.slice(0, maxVisible);

  // Generar posiciones aleatorias pero determinísticas para cada tag
  const positions: TagPosition[] = useMemo(() => {
    return visibleTags.map((tag, i) => ({
      x: random(`tag-x-${i}`) * 60 + 20, // 20-80%
      y: random(`tag-y-${i}`) * 30 + 60, // 60-90%
      scale: random(`tag-scale-${i}`) * 0.3 + 0.8, // 0.8-1.1
      delay: i * 15 // Escalonado
    }));
  }, [visibleTags]);

  return (
    <>
      {visibleTags.map((tag, index) => {
        const pos = positions[index];

        // Animación de entrada con spring
        const entryProgress = spring({
          frame: frame - pos.delay,
          fps,
          config: { damping: 12, stiffness: 80 }
        });

        // Movimiento flotante sutil
        const floatX = Math.sin((frame + pos.delay) * 0.03) * 10;
        const floatY = Math.cos((frame + pos.delay) * 0.025) * 8;

        // Opacidad pulsante sutil
        const pulseOpacity = interpolate(
          Math.sin((frame + pos.delay * 2) * 0.05),
          [-1, 1],
          [0.7, 1]
        );

        // Escala de entrada
        const scale = interpolate(entryProgress, [0, 1], [0, pos.scale]);

        return (
          <div
            key={`${tag}-${index}`}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) translate(${floatX}px, ${floatY}px) scale(${scale})`,
              opacity: entryProgress * pulseOpacity,
              zIndex: 10
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(10, 10, 15, 0.8)',
                border: `1px solid ${color}60`,
                borderRadius: 20,
                backdropFilter: 'blur(5px)',
                boxShadow: `0 0 15px ${color}30`
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color,
                  fontFamily: 'Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  whiteSpace: 'nowrap'
                }}
              >
                #{tag}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};

/**
 * Tag individual estático con animación
 */
export const Tag: React.FC<{
  text: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}> = ({ text, color = '#00f0ff', size = 'medium' }) => {
  const frame = useCurrentFrame();

  const sizes = {
    small: { fontSize: 14, padding: '4px 10px' },
    medium: { fontSize: 18, padding: '8px 16px' },
    large: { fontSize: 24, padding: '12px 24px' }
  };

  const { fontSize, padding } = sizes[size];

  // Pulso sutil
  const pulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.95, 1]
  );

  return (
    <div
      style={{
        display: 'inline-block',
        padding,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}`,
        borderRadius: 8,
        transform: `scale(${pulse})`
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 600,
          color,
          fontFamily: 'Arial, sans-serif',
          textTransform: 'uppercase'
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default FloatingTags;
