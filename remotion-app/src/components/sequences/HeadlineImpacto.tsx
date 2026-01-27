// ===================================
// HEADLINE IMPACTO - Título principal 3-8s
// ===================================

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig
} from 'remotion';
import { NeonBorder, NeonLine } from '../effects/NeonBorder';

interface HeadlineImpactoProps {
  headline: string;
  source?: string;
  themeColor?: string;
}

/**
 * Secuencia del headline principal
 * Duración: 150 frames (5 segundos a 30fps)
 * - Título aparece con efecto de typing/reveal
 * - Fuente de la noticia
 * - Elementos decorativos animados
 */
export const HeadlineImpacto: React.FC<HeadlineImpactoProps> = ({
  headline,
  source,
  themeColor = '#00f0ff'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animación de entrada del contenedor
  const containerScale = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 100
    }
  });

  const containerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Efecto de reveal del texto (palabra por palabra)
  const words = headline.split(' ');
  const wordsToShow = Math.floor(
    interpolate(frame, [15, 60], [0, words.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    })
  );

  // Animación del indicador "BREAKING"
  const breakingPulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.8, 1]
  );

  // Animación de la fuente
  const sourceOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0f',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
      }}
    >
      {/* Badge "BREAKING NEWS" */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          transform: `scale(${breakingPulse})`,
          opacity: containerOpacity
        }}
      >
        <NeonBorder
          color="#ff3366"
          secondaryColor="#ff0099"
          thickness={2}
          borderRadius={8}
        >
          <div
            style={{
              padding: '8px 24px',
              fontSize: 24,
              fontWeight: 'bold',
              color: '#ff3366',
              fontFamily: 'Arial, sans-serif',
              letterSpacing: 4,
              textTransform: 'uppercase'
            }}
          >
            BREAKING NEWS
          </div>
        </NeonBorder>
      </div>

      {/* Contenedor principal del headline */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          width: '90%',
          transform: `scale(${containerScale})`,
          opacity: containerOpacity
        }}
      >
        <NeonBorder
          color={themeColor}
          secondaryColor="#ff0099"
          thickness={3}
          borderRadius={16}
          glowIntensity={1.2}
        >
          <div style={{ padding: '30px 40px' }}>
            {/* Headline con efecto de reveal */}
            <h1
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'Arial Black, sans-serif',
                textAlign: 'center',
                lineHeight: 1.3,
                margin: 0,
                textShadow: `0 0 20px ${themeColor}50`
              }}
            >
              {words.map((word, index) => (
                <span
                  key={index}
                  style={{
                    opacity: index < wordsToShow ? 1 : 0,
                    display: 'inline-block',
                    marginRight: '0.3em',
                    transform: index < wordsToShow ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.1s ease-out'
                  }}
                >
                  {word}
                </span>
              ))}
            </h1>
          </div>
        </NeonBorder>
      </div>

      {/* Línea decorativa */}
      <div
        style={{
          position: 'absolute',
          top: '70%',
          width: '50%',
          opacity: sourceOpacity
        }}
      >
        <NeonLine color={themeColor} />
      </div>

      {/* Fuente de la noticia */}
      {source && (
        <div
          style={{
            position: 'absolute',
            top: '75%',
            opacity: sourceOpacity
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: '#888888',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            Fuente:{' '}
          </span>
          <span
            style={{
              fontSize: 24,
              color: themeColor,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {source}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default HeadlineImpacto;
