/**
 * @fileoverview AINewsShort - Composicion Principal Optimizada
 *
 * Composición de video optimizada para 1 NOTICIA COMPLETA.
 * Duración: 50 segundos default (configurable) - Reducido en Prompt 19.4
 *
 * Timing (con crossfade de 30 frames - Prompt 19.11):
 * - Hero: 0-8s (hook fuerte)
 * - Content: 7-45s (crossfade de 1s con Hero, explicación completa)
 * - Outro: 44-50s (crossfade de 1s con Content, branding claro)
 *
 * Imágenes: 3 totales
 * 1. Hero (0-8s): Logo empresa específico
 * 2. Context (8-45s): Screenshot/demo con parallax
 * 3. Outro (45-50s): Logo "Sintaxis IA" hardcoded
 *
 * @author Sintaxis IA
 * @version 3.0.0
 * @since Prompt 13
 * @updated Prompt 19.4 - Duración OutroScene reducida de 10s a 5s
 * @updated Prompt 19.11 - Crossfade entre escenas (30 frames overlap)
 * @updated Prompt 20 - BackgroundDirector como fondo persistente, escenas transparentes
 * @updated Prompt 27 - Audio bed desde frame 0, music separado de AudioMixer
 * @updated Prompt 30 - Breathing room (1s) entre narración y outro, duración dinámica via calculateMetadata
 * @updated Prompt 32 - Title Card overlay (0.5s) como thumbnail topic-aware
 */

import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';

// Escenas optimizadas
import { HeroScene } from '../components/scenes/HeroScene';
import { ContentScene } from '../components/scenes/ContentScene';
import { OutroScene } from '../components/scenes/OutroScene';

// Fondo animado persistente (Prompt 20)
import { BackgroundDirector } from '../components/backgrounds/BackgroundDirector';

// Componentes de audio
import { AudioMixer } from '../components/audio/AudioMixer';

// Tipos
import type { VideoProps } from '../types/video.types';

// Title Card (Prompt 32)
import { TitleCardScene } from '../components/scenes/TitleCardScene';
import { deriveTitleCardText, deriveBadge } from '../utils/title-derivation';

// Estilos
import { colors, sceneTransition, musicBed, titleCard } from '../styles/themes';

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
  hero: 'https://ui-avatars.com/api/?name=AI&size=400&background=4A9EFF&color=000000',
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
  const audioSync = props.audioSync; // Prompt 25: sync audio-texto

  // ==========================================
  // CONFIGURACION
  // ==========================================

  // FPS del video (default: 30)
  const fps = config?.fps ?? 30;

  // Duración total en segundos (default: 50s) - Reducido en Prompt 19.4
  const duration = config?.duration ?? 50;

  // Activar efectos mejorados (default: true)
  const enhancedEffects = config?.enhancedEffects ?? true;

  // Prompt 30: Duración total en frames (ahora dinámica via calculateMetadata en Root.tsx)
  const durationInFrames = duration * fps;

  // ==========================================
  // TIMING DE ESCENAS (Prompt 19.11: crossfade)
  // ==========================================

  // Crossfade entre escenas (Prompt 19.11)
  const crossfadeFrames = sceneTransition.crossfadeFrames; // 30 frames = 1s

  // Duraciones base de cada escena
  const heroSceneDuration = 8 * fps;        // 240 frames
  const outroSceneDuration = 5 * fps;       // 150 frames - Reducido de 10s en Prompt 19.4

  // Prompt 26: ContentScene dura al menos 37s, o más si el audio es largo
  const audioDurationFrames = audioSync?.audioDuration
    ? Math.ceil(audioSync.audioDuration * fps) + 30  // +1s fade-out
    : 0;
  const contentSceneDuration = Math.max(37 * fps, audioDurationFrames);

  // Prompt 30: Buffer de respiración entre narración y outro
  // Pausa natural de 1s para que el CTA no atropelle la voz
  const BREATHING_ROOM_FRAMES = 30; // 1s @ 30fps

  // Puntos de inicio con overlap de crossfade (Prompt 19.11)
  // Cada escena downstream empieza crossfadeFrames antes que la anterior termine
  const heroStart = 0;
  const contentStart = heroSceneDuration - crossfadeFrames;        // 210
  // Prompt 30: Outro empieza después de Content + breathing room
  const outroStart = contentStart + contentSceneDuration + BREATHING_ROOM_FRAMES;

  // Duraciones de Sequence extendidas para crossfade (Prompt 19.11)
  // Hero mantiene su duración original (no necesita extensión)
  const heroDuration = heroSceneDuration;                          // 240
  const contentDuration = contentSceneDuration + crossfadeFrames;  // 1140
  const outroDuration = outroSceneDuration + crossfadeFrames;      // 180

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
          BACKGROUND DIRECTOR - Fondo animado persistente (Prompt 20)
          ==========================================
          Capa base que permanece visible durante todo el video.
          Las escenas son transparentes y solo el contenido se
          desvanece durante crossfades, creando transiciones suaves.
      */}
      <BackgroundDirector />

      {/* ==========================================
          HERO SCENE - Hook Visual (0-8s, fade-out crossfade)
          ==========================================
          Captura atención con:
          - Logo empresa con zoom dramático
          - Título con slide up + sombra
          - Efecto blur to focus
      */}
      <Sequence
        from={heroStart}
        durationInFrames={heroDuration}
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
          CONTENT SCENE - Explicación Completa (7-45s, crossfade)
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
        durationInFrames={contentDuration}
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
          sceneStartSecond={contentStart / fps}
          totalDuration={durationInFrames}
          fps={fps}
          dynamicEffects={enhancedEffects}
          audioSync={audioSync}
        />
      </Sequence>

      {/* ==========================================
          OUTRO SCENE - Branding (44-50s, crossfade) - Prompt 19.4/19.11
          ==========================================
          Cierre memorable con:
          - Logo "Sintaxis IA" con sombra editorial
          - CTA claro
          - SIN hashtags visibles
          - Duración reducida de 10s a 5s para eliminar silencio
      */}
      <Sequence
        from={outroStart}
        durationInFrames={outroDuration}
        name="Outro"
      >
        <OutroScene
          hashtags={hashtags} // NO se renderizan, solo metadata
          fps={fps}
        />
      </Sequence>

      {/* ==========================================
          BACKGROUND MUSIC BED - Audio de fondo (Prompt 27)
          ==========================================
          Elimina el silencio de HeroScene (0-8s) con un
          loop de música ambient/breaking news.
          - Hero: 22% (sin competencia de voz)
          - Content/Outro: 8% (ducked por narración)
          - Fade-out de 2s al final
          Solo se renderiza si hay audio.music configurado.
      */}
      {audio.music?.src && (
        <Sequence from={0} durationInFrames={durationInFrames} name="BackgroundMusic">
          <Audio
            src={staticFile(audio.music.src)}
            volume={(f: number) => {
              // Prompt 37-Fix1: voz desde frame 0, music siempre ducked
              const fadeOutStart = durationInFrames - musicBed.fadeOutFrames;
              if (f > fadeOutStart) {
                return interpolate(
                  f,
                  [fadeOutStart, durationInFrames],
                  [musicBed.contentVolume, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
              }
              return musicBed.contentVolume;
            }}
            loop
          />
        </Sequence>
      )}

      {/* ==========================================
          VOICE NARRATION - Voz TTS (Prompt 37-Fix1)
          ==========================================
          Voz desde frame 0 para hook inmediato (anti-silencio).
          El espectador oye el narrador desde el primer segundo.
          ContentScene usa sceneStartSecond para sincronizar texto.
      */}
      <Sequence from={0} durationInFrames={durationInFrames} name="Narration">
        <AudioMixer
          voice={audio.voice}
        />
      </Sequence>

      {/* ==========================================
          TITLE CARD OVERLAY - YouTube Thumbnail (Prompt 32)
          ==========================================
          Overlay de 0.5s que aparece encima de HeroScene.
          Último en JSX = mayor z-index = se renderiza encima de todo.
          NO cambia timing de Hero/Content/Outro ni audio.
      */}
      <Sequence
        from={0}
        durationInFrames={titleCard.durationFrames}
        name="TitleCard"
      >
        <TitleCardScene
          titleText={deriveTitleCardText(news.title)}
          badge={deriveBadge(props.newsType)}
          backgroundImage={images.hero}
          fps={fps}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export default AINewsShort;
