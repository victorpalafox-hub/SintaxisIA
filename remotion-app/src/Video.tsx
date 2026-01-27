// ===================================
// VIDEO - Composición principal de Sintaxis IA
// ===================================

import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile
} from 'remotion';

// Theme
import { theme } from './theme';

// Backgrounds
import { CyberpunkBG } from './components/backgrounds/CyberpunkBG';
import { ParticleField } from './components/backgrounds/ParticleField';

// Sequences
import { GanchoExplosivo } from './components/sequences/GanchoExplosivo';
import { HeadlineImpacto } from './components/sequences/HeadlineImpacto';
import { ContenidoPrincipal } from './components/sequences/ContenidoPrincipal';
import { SeccionImpacto } from './components/sequences/SeccionImpacto';
import { OutroBranding } from './components/sequences/OutroBranding';

// UI Components
import { Watermark } from './components/ui/Watermark';

// Importar datos
import videoData from './data.json';

// Interfaces
interface WordTiming {
  word: string;
  startFrame: number;
  endFrame: number;
}

interface NewsItem {
  id: string;
  headline: string;
  gancho: string;
  contenido: string[];
  impacto: string;
  cta: string;
  tags: string[];
  imageUrl: string | null;
  audioPath: string;
  durationInFrames: number;
  subtitles: WordTiming[];
  source: {
    name: string;
    url: string;
    publishedAt: string;
  };
}

// Configuración de tiempos (en frames a 30fps)
const TIMING = {
  gancho: { start: 0, duration: 90 },        // 0-3s
  headline: { start: 90, duration: 150 },     // 3-8s
  contenido: { start: 240, duration: 1260 },  // 8-50s
  impacto: { start: 1500, duration: 150 },    // 50-55s
  outro: { start: 1650, duration: 150 }       // 55-60s
};

/**
 * Composición principal del video short de Sintaxis IA
 * Duración total: 1800 frames (60 segundos a 30fps)
 */
export const Video: React.FC = () => {
  // Obtener primer item de noticias (por ahora solo uno)
  const newsItem: NewsItem = videoData.newsItems[0];
  const themeColor = videoData.videoConfig.themeColor || theme.colors.primary;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.darkBg }}>
      {/* Capa de fondo - siempre visible */}
      <AbsoluteFill>
        <CyberpunkBG
          primaryColor={themeColor}
          secondaryColor={theme.colors.secondary}
          intensity={0.8}
        />
        <ParticleField
          particleCount={40}
          color={themeColor}
          maxSize={3}
          speed={0.8}
        />
      </AbsoluteFill>

      {/* Audio de narración */}
      {newsItem.audioPath && (
        <Audio
          src={staticFile(newsItem.audioPath.replace('./public/', ''))}
          volume={1}
        />
      )}

      {/* SECUENCIA 1: Gancho Explosivo (0-3s) */}
      <Sequence
        from={TIMING.gancho.start}
        durationInFrames={TIMING.gancho.duration}
        name="Gancho"
      >
        <GanchoExplosivo texto={newsItem.gancho} />
      </Sequence>

      {/* SECUENCIA 2: Headline Impacto (3-8s) */}
      <Sequence
        from={TIMING.headline.start}
        durationInFrames={TIMING.headline.duration}
        name="Headline"
      >
        <HeadlineImpacto
          headline={newsItem.headline}
          source={newsItem.source.name}
          themeColor={themeColor}
        />
      </Sequence>

      {/* SECUENCIA 3: Contenido Principal (8-50s) */}
      <Sequence
        from={TIMING.contenido.start}
        durationInFrames={TIMING.contenido.duration}
        name="Contenido"
      >
        <ContenidoPrincipal
          contenido={newsItem.contenido}
          subtitles={newsItem.subtitles}
          tags={newsItem.tags}
          imageUrl={newsItem.imageUrl}
          themeColor={themeColor}
        />
      </Sequence>

      {/* SECUENCIA 4: Sección Impacto (50-55s) */}
      <Sequence
        from={TIMING.impacto.start}
        durationInFrames={TIMING.impacto.duration}
        name="Impacto"
      >
        <SeccionImpacto
          texto={newsItem.impacto}
          themeColor={theme.colors.gold}
        />
      </Sequence>

      {/* SECUENCIA 5: Outro Branding (55-60s) */}
      <Sequence
        from={TIMING.outro.start}
        durationInFrames={TIMING.outro.duration}
        name="Outro"
      >
        <OutroBranding
          cta={newsItem.cta}
          channelName="SINTAXIS IA"
          themeColor={themeColor}
        />
      </Sequence>

      {/* Marca de agua - siempre visible */}
      <Watermark />
    </AbsoluteFill>
  );
};

export default Video;
