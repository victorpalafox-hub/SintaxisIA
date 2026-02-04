/**
 * @fileoverview AINewsShort - Composicion Principal Optimizada
 *
 * Composición de video optimizada para 1 NOTICIA COMPLETA.
 * Duración: 50 segundos default (configurable) - Reducido en Prompt 19.4
 *
 * Timing:
 * - Hero: 0-8s (hook fuerte)
 * - Content: 8-45s (explicación completa)
 * - Outro: 45-50s (branding claro) - Reducido de 10s a 5s en Prompt 19.4
 *
 * Imágenes: 3 totales
 * 1. Hero (0-8s): Logo empresa específico
 * 2. Context (8-45s): Screenshot/demo con parallax
 * 3. Outro (45-50s): Logo "Sintaxis IA" hardcoded
 *
 * @author Sintaxis IA
 * @version 2.1.0
 * @since Prompt 13
 * @updated Prompt 19.4 - Duración OutroScene reducida de 10s a 5s
 */

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';

// Escenas optimizadas
import { HeroScene } from '../components/scenes/HeroScene';
import { ContentScene } from '../components/scenes/ContentScene';
import { OutroScene } from '../components/scenes/OutroScene';

// Componentes de audio
import { AudioMixer } from '../components/audio/AudioMixer';

// Tipos
import type { VideoProps } from '../types/video.types';

// Estilos
import { colors } from '../styles/themes';

// =============================================================================
// PROPS PARCIALES (para compatibilidad con Remotion Composition)
// =============================================================================

/**
 * Props parciales para AINewsShort
 * Todas las props son opcionales para compatibilidad con Remotion.
 * Los valores por defecto se aplican internamente.
 */
type AINewsShortProps = Partial<VideoProps>;

// =============================================================================
// VALORES POR DEFECTO
// =============================================================================

const DEFAULT_NEWS: VideoProps['news'] = {
  title: 'Titulo de la Noticia',
  description: 'Descripcion de la noticia de inteligencia artificial.',
  source: 'Sintaxis IA',
  publishedAt: new Date().toISOString().split('T')[0],
};

const DEFAULT_IMAGES: VideoProps['images'] = {
  hero: 'https://ui-avatars.com/api/?name=AI&size=400&background=00F0FF&color=000000',
};

const DEFAULT_AUDIO: VideoProps['audio'] = {
  voice: {
    src: 'audio/sample-voice.mp3',
    volume: 1.0,
  },
};

/**
 * AI NEWS SHORT - Composición Principal Optimizada
 *
 * Video short de noticias de IA optimizado para UNA noticia completa.
 * Usa timing de 8s + 37s + 5s = 50s (default). Reducido en Prompt 19.4.
 *
 * @example
 * <AINewsShort
 *   news={{
 *     title: "Google Genie: IA que Crea Mundos Virtuales",
 *     description: "Google DeepMind presenta...",
 *     source: "Google DeepMind Blog",
 *     publishedAt: "2026-01-29"
 *   }}
 *   images={{
 *     hero: "https://logo.clearbit.com/google.com",
 *     context: "https://example.com/screenshot.png"
 *   }}
 *   topics={["Google", "Genie", "AI"]}
 *   hashtags={["#IA", "#AI", "#Google"]}
 *   audio={{
 *     voice: { src: "audio/narration.mp3" }
 *   }}
 * />
 */
export const AINewsShort: React.FC<AINewsShortProps> = (props) => {
  // Aplicar valores por defecto
  const news = props.news ?? DEFAULT_NEWS;
  const images = props.images ?? DEFAULT_IMAGES;
  const hashtags = props.hashtags ?? ['#IA', '#AI'];
  const audio = props.audio ?? DEFAULT_AUDIO;
  const config = props.config;

  // ==========================================
  // CONFIGURACION
  // ==========================================

  // FPS del video (default: 30)
  const fps = config?.fps ?? 30;

  // Duración total en segundos (default: 50s) - Reducido en Prompt 19.4
  const duration = config?.duration ?? 50;

  // Activar efectos mejorados (default: true)
  const enhancedEffects = config?.enhancedEffects ?? true;

  // Duración total en frames
  const durationInFrames = duration * fps;

  // ==========================================
  // TIMING DE ESCENAS
  // ==========================================

  // Hero: 8 segundos (hook visual)
  const heroSceneDuration = 8 * fps;        // 240 frames

  // Content: 37 segundos (explicación completa)
  const contentSceneDuration = 37 * fps;    // 1110 frames

  // Outro: 5 segundos (branding claro) - Reducido de 10s en Prompt 19.4
  const outroSceneDuration = 5 * fps;       // 150 frames

  // Puntos de inicio de cada escena
  const heroStart = 0;
  const contentStart = heroSceneDuration;
  const outroStart = heroSceneDuration + contentSceneDuration;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background.darker,
      }}
    >
      {/* ==========================================
          HERO SCENE - Hook Visual (0-8s)
          ==========================================
          Captura atención con:
          - Logo empresa con zoom dramático
          - Título con slide up + glow
          - Efecto blur to focus
      */}
      <Sequence
        from={heroStart}
        durationInFrames={heroSceneDuration}
        name="Hero"
      >
        <HeroScene
          title={news.title}
          image={images.hero}
          fps={fps}
          enhanced={enhancedEffects}
        />
      </Sequence>

      {/* ==========================================
          CONTENT SCENE - Explicación Completa (8-45s)
          ==========================================
          Muestra contenido con:
          - Imagen context con parallax (legacy)
          - O imágenes dinámicas que cambian cada ~15s (Prompt 19.1)
          - Descripción completa
          - Bullet points escalonados
          - Barra de progreso
      */}
      <Sequence
        from={contentStart}
        durationInFrames={contentSceneDuration}
        name="Content"
      >
        <ContentScene
          description={news.description}
          details={news.details}
          images={{
            hero: images.hero,
            context: images.context,
          }}
          dynamicScenes={images.dynamicScenes}
          sceneStartSecond={heroSceneDuration / fps}
          totalDuration={durationInFrames}
          fps={fps}
          dynamicEffects={enhancedEffects}
        />
      </Sequence>

      {/* ==========================================
          OUTRO SCENE - Branding (45-50s) - Prompt 19.4
          ==========================================
          Cierre memorable con:
          - Logo "Sintaxis IA" con glow
          - CTA claro
          - SIN hashtags visibles
          - Duración reducida de 10s a 5s para eliminar silencio
      */}
      <Sequence
        from={outroStart}
        durationInFrames={outroSceneDuration}
        name="Outro"
      >
        <OutroScene
          hashtags={hashtags} // NO se renderizan, solo metadata
          fps={fps}
        />
      </Sequence>

      {/* ==========================================
          AUDIO MIXER - Voz + Música con Ducking
          ==========================================
          Mezcla inteligente:
          - Voz TTS: 100% volumen (protagonista)
          - Música: 15% base, ducking automático
      */}
      <AudioMixer
        voice={audio.voice}
        music={audio.music}
      />
    </AbsoluteFill>
  );
};

export default AINewsShort;
