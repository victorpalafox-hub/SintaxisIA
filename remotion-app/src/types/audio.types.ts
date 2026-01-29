// ===================================
// AUDIO TYPES - Tipos para sistema de audio
// ===================================

/**
 * Configuración de una fuente de audio individual
 * Representa ya sea la voz TTS o la música de fondo
 */
export interface AudioSource {
  /** Ruta al archivo de audio (relativa a public/) */
  src: string;
  /** Volumen base (0-1). Default: 1 para voz, 0.15 para música */
  volume?: number;
  /** Frame de inicio del audio. Default: 0 */
  startFrom?: number;
}

/**
 * Configuración de la música de fondo
 * Extiende AudioSource con opciones específicas de música
 */
export interface MusicConfig extends AudioSource {
  /** Habilitar ducking automático cuando hay voz. Default: true */
  ducking?: boolean;
  /** Duración del fade in en frames. Default: 30 (1 segundo) */
  fadeIn?: number;
  /** Duración del fade out en frames. Default: 60 (2 segundos) */
  fadeOut?: number;
  /** Repetir música si es más corta que el video. Default: true */
  loop?: boolean;
}

/**
 * Props para el componente AudioMixer
 * Permite configurar voz y música con ducking automático
 */
export interface AudioMixerProps {
  /** Configuración del audio de voz TTS (protagonista) */
  voice: AudioSource;
  /** Configuración opcional de música de fondo */
  music?: MusicConfig;
}

/**
 * Configuración del ducking de audio
 * El ducking reduce el volumen de la música cuando hay voz
 */
export interface DuckingConfig {
  /** Si el ducking está habilitado */
  enabled: boolean;
  /** Factor de reducción (0-1). Ej: 0.4 = música al 40% de su volumen base */
  reduction: number;
  /** Tiempo de fade en frames para suavizar transiciones */
  fadeTime: number;
}

/**
 * Configuración completa de audio para el theme
 * Centraliza todos los valores de audio
 */
export interface AudioThemeConfig {
  /** Volumen de la voz TTS (0-1). Default: 1.0 */
  voiceVolume: number;
  /** Volumen base de música de fondo (0-1). Default: 0.15 */
  musicVolume: number;
  /** Factor de reducción durante ducking (0-1). Default: 0.4 */
  duckingReduction: number;
  /** Duración del fade in en segundos. Default: 1 */
  fadeInSeconds: number;
  /** Duración del fade out en segundos. Default: 2 */
  fadeOutSeconds: number;
}

/**
 * Props para el componente ProgressBar
 * Muestra el progreso del video
 */
export interface ProgressBarProps {
  /** Color de la barra de progreso. Default: theme.colors.primary */
  color?: string;
  /** Altura de la barra en pixels. Default: 4 */
  height?: number;
  /** Mostrar porcentaje como texto. Default: false */
  showPercentage?: boolean;
}

export default {
  AudioSource: {} as AudioSource,
  MusicConfig: {} as MusicConfig,
  AudioMixerProps: {} as AudioMixerProps,
  DuckingConfig: {} as DuckingConfig,
  AudioThemeConfig: {} as AudioThemeConfig,
  ProgressBarProps: {} as ProgressBarProps,
};
