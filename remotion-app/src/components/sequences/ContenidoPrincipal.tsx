// ===================================
// CONTENIDO PRINCIPAL - Cuerpo del video 8-50s
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
import { KaraokeSubtitles } from '../ui/KaraokeSubtitles';
// HASHTAGS REMOVIDOS DEL VIDEO (Prompt 10.1)
// Los hashtags solo deben aparecer en el título de YouTube, NO visibles en el video
// import { FloatingTags } from '../ui/FloatingTags';

interface WordTiming {
  word: string;
  startFrame: number;
  endFrame: number;
}

interface ContenidoPrincipalProps {
  contenido: string[];
  subtitles: WordTiming[];
  tags: string[];
  imageUrl?: string | null;
  themeColor?: string;
}

/**
 * Secuencia principal con el contenido del video
 * Duración: 1260 frames (42 segundos a 30fps)
 * - Puntos del contenido aparecen secuencialmente
 * - Subtítulos karaoke sincronizados
 * - Tags flotantes de empresas/temas
 */
export const ContenidoPrincipal: React.FC<ContenidoPrincipalProps> = ({
  contenido,
  subtitles,
  tags,
  imageUrl,
  themeColor = '#00f0ff'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calcular qué punto de contenido mostrar
  const framesPerPoint = Math.floor(1260 / contenido.length);
  const currentPointIndex = Math.min(
    Math.floor(frame / framesPerPoint),
    contenido.length - 1
  );

  // Frame relativo dentro del punto actual
  const pointStartFrame = currentPointIndex * framesPerPoint;
  const relativeFrame = frame - pointStartFrame;

  // Animación de entrada del punto actual
  const pointScale = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 15, stiffness: 100 }
  });

  const pointOpacity = interpolate(
    relativeFrame,
    [0, 15, framesPerPoint - 30, framesPerPoint],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Número del punto (indicador de progreso)
  const progressWidth = interpolate(
    frame,
    [0, 1260],
    [0, 100],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f' }}>
      {/* Imagen de fondo (si existe) */}
      {imageUrl && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '50%',
            top: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            filter: 'blur(2px)',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
          }}
        />
      )}

      {/* Indicador de progreso */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 40,
          right: 40,
          height: 4,
          backgroundColor: '#1a1a2e',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${progressWidth}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${themeColor}, #ff0099)`,
            boxShadow: `0 0 10px ${themeColor}`,
            borderRadius: 2
          }}
        />
      </div>

      {/* Número del punto actual */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          left: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 15
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${themeColor}, #ff0099)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 28,
            fontWeight: 'bold',
            color: '#0a0a0f',
            fontFamily: 'Arial Black, sans-serif',
            boxShadow: `0 0 20px ${themeColor}80`
          }}
        >
          {currentPointIndex + 1}
        </div>
        <span
          style={{
            fontSize: 20,
            color: '#666',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          de {contenido.length}
        </span>
      </div>

      {/* Contenido del punto actual */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: 40,
          right: 40,
          transform: `scale(${pointScale})`,
          opacity: pointOpacity
        }}
      >
        <NeonBorder
          color={themeColor}
          secondaryColor="#cc00ff"
          thickness={2}
          borderRadius={20}
          glowIntensity={0.8}
        >
          <div style={{ padding: '40px 30px' }}>
            <p
              style={{
                fontSize: 38,
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                lineHeight: 1.5,
                margin: 0,
                textAlign: 'center'
              }}
            >
              {contenido[currentPointIndex]}
            </p>
          </div>
        </NeonBorder>
      </div>

      {/*
        HASHTAGS REMOVIDOS DEL VIDEO (Prompt 10.1)
        Los hashtags solo deben aparecer en el título de YouTube,
        NO dentro del video visible para el espectador.

        <Sequence from={30}>
          <FloatingTags tags={tags} color={themeColor} />
        </Sequence>
      */}

      {/* Subtítulos karaoke */}
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: 20,
          right: 20
        }}
      >
        <KaraokeSubtitles
          subtitles={subtitles}
          activeColor={themeColor}
          inactiveColor="#666666"
        />
      </div>
    </AbsoluteFill>
  );
};

export default ContenidoPrincipal;
