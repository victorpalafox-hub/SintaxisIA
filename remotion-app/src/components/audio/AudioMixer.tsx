// ===================================
// AUDIO MIXER - Componente de mezcla de audio con ducking
// ===================================

import React from 'react';
import {
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing
} from 'remotion';
import { theme } from '../../theme';
import type { AudioMixerProps } from '../../types/audio.types';

/**
 * AudioMixer - Componente inteligente de mezcla de audio
 *
 * Características:
 * - Voz TTS como audio protagonista (100% volumen)
 * - Música de fondo con volumen bajo (15% base)
 * - Ducking automático: la música se reduce cuando hay voz
 * - Fade in/out suaves para transiciones naturales
 *
 * El ducking es una técnica de audio profesional donde el volumen
 * de la música de fondo se reduce automáticamente cuando hay voz,
 * asegurando que el narrador siempre se escuche claramente.
 *
 * @example
 * // Uso básico solo con voz
 * <AudioMixer voice={{ src: 'audio/narration.mp3' }} />
 *
 * @example
 * // Con música de fondo y ducking
 * <AudioMixer
 *   voice={{ src: 'audio/narration.mp3', volume: 1 }}
 *   music={{
 *     src: 'audio/background.mp3',
 *     volume: 0.15,
 *     ducking: true,
 *     fadeIn: 30,
 *     fadeOut: 60
 *   }}
 * />
 */
export const AudioMixer: React.FC<AudioMixerProps> = ({
  voice,
  music
}) => {
  // Obtener frame actual y configuración del video
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Obtener configuración de audio del theme
  const audioConfig = theme.audio;

  // Volumen base de voz (protagonista)
  const voiceVolume = voice.volume ?? audioConfig.voiceVolume;

  // Prompt 41: 30→45 frames (1.5s) para decay natural de la voz
  // La Narration Sequence ahora termina en outroStart, así que este fade
  // ocurre durante los últimos 1.5s de contenido (antes del branding)
  const VOICE_FADEOUT_FRAMES = 45;

  /**
   * Calcula el volumen de la música con ducking y fades
   *
   * La música tiene 3 modificadores de volumen:
   * 1. Volumen base (15%)
   * 2. Reducción por ducking cuando hay voz (60% del base = ~9%)
   * 3. Fade in al inicio y fade out al final
   */
  const calculateMusicVolume = (): number => {
    if (!music) return 0;

    // Volumen base de la música
    const baseVolume = music.volume ?? audioConfig.musicVolume;

    // Frames para fade in/out
    const fadeInFrames = music.fadeIn ?? audioConfig.fadeInSeconds * fps;
    const fadeOutFrames = music.fadeOut ?? audioConfig.fadeOutSeconds * fps;

    // Calcular factor de fade in (0 -> 1)
    const fadeInFactor = interpolate(
      frame,
      [0, fadeInFrames],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.ease
      }
    );

    // Calcular factor de fade out (1 -> 0)
    const fadeOutStart = durationInFrames - fadeOutFrames;
    const fadeOutFactor = interpolate(
      frame,
      [fadeOutStart, durationInFrames],
      [1, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.ease
      }
    );

    // Aplicar ducking si está habilitado
    // El ducking reduce el volumen cuando hay voz activa
    // Música se reduce a 60% de su volumen base (de 15% → 9%)
    const duckingEnabled = music.ducking ?? true;
    const duckingFactor = duckingEnabled
      ? audioConfig.duckingReduction  // 60% del volumen base
      : 1;

    // Volumen final = base * ducking * fade in * fade out
    return baseVolume * duckingFactor * fadeInFactor * fadeOutFactor;
  };

  // Normalizar rutas de audio (quitar ./public/ si existe)
  const normalizeAudioPath = (path: string): string => {
    return path.replace('./public/', '').replace('public/', '');
  };

  // Obtener configuración de loop (default: true)
  const loopMusic = music?.loop ?? true;

  // Obtener startFrom de la voz (default: 0)
  const voiceStartFrom = voice.startFrom ?? 0;

  return (
    <>
      {/* Audio de voz TTS - Protagonista con fade-out (Prompt 32.1) */}
      {voice.src && (
        <Audio
          src={staticFile(normalizeAudioPath(voice.src))}
          volume={(f: number) => {
            // Prompt 32.1: Fade-out suave en últimos 30 frames (1s)
            const fadeOut = interpolate(
              f,
              [durationInFrames - VOICE_FADEOUT_FRAMES, durationInFrames],
              [1, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            return voiceVolume * fadeOut;
          }}
          startFrom={voiceStartFrom}
        />
      )}

      {/* Audio de música de fondo - Con ducking */}
      {music?.src && (
        <Audio
          src={staticFile(normalizeAudioPath(music.src))}
          volume={calculateMusicVolume()}
          loop={loopMusic}
          // La música tiene volumen dinámico:
          // - Se reduce cuando hay voz (ducking)
          // - Fade in al inicio del video
          // - Fade out al final del video
          // - Loop si es más corta que el video
        />
      )}
    </>
  );
};

export default AudioMixer;
