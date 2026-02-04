/**
 * @fileoverview Configuración de Video Rendering - Prompt 17
 *
 * Configuración centralizada para el renderizado de videos con Remotion.
 * Define resolución, codecs, paths y opciones de rendering.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 17
 */

import * as path from 'path';
import { TIMEOUTS } from './timeouts.config';

// =============================================================================
// CONFIGURACIÓN DE VIDEO
// =============================================================================

/**
 * Configuración de especificaciones del video
 *
 * Optimizado para YouTube Shorts (vertical 9:16)
 */
export const VIDEO_SPECS = {
  /** Ancho en píxeles */
  width: 1080,
  /** Alto en píxeles */
  height: 1920,
  /** Frames por segundo */
  fps: 30,
  /** Aspect ratio */
  aspectRatio: '9:16',
  /** Codec de video */
  codec: 'h264' as const,
  /** Codec de audio */
  audioCodec: 'aac' as const,
  /** CRF (Constant Rate Factor) - menor = mejor calidad, mayor tamaño */
  crf: 18,
  /** Pixel format */
  pixelFormat: 'yuv420p' as const,
  /** Duración objetivo en segundos (YouTube Shorts < 60s) */
  targetDuration: 50,
  /** Duración mínima permitida */
  minDuration: 30,
  /** Duración máxima permitida (YouTube Shorts LIMITE ABSOLUTO) */
  maxDuration: 58,
  /** Máximo de palabras en script (~2 palabras/segundo con voz Josh slow) */
  maxScriptWords: 115,
};

/**
 * Detecta el directorio raíz del proyecto
 *
 * Funciona tanto cuando se ejecuta desde:
 * - Raíz del proyecto (tests con Playwright)
 * - Directorio automation/ (CLI, scripts)
 */
function getProjectRoot(): string {
  const cwd = process.cwd();
  // Si estamos en automation/, subir un nivel
  if (cwd.endsWith('automation') || cwd.includes('automation' + path.sep)) {
    return path.resolve(cwd, '..');
  }
  // Si estamos en la raíz del proyecto
  return cwd;
}

const PROJECT_ROOT = getProjectRoot();

/**
 * Configuración de paths para Remotion
 */
export const VIDEO_PATHS = {
  /** Directorio raíz del proyecto Remotion */
  remotionApp: path.join(PROJECT_ROOT, 'remotion-app'),
  /** Directorio de salida para videos renderizados */
  outputDir: path.join(PROJECT_ROOT, 'output', 'videos'),
  /** Directorio temporal para assets */
  tempDir: path.join(PROJECT_ROOT, 'automation', 'temp', 'video-assets'),
  /** Directorio de assets públicos de Remotion */
  publicAssets: path.join(PROJECT_ROOT, 'remotion-app', 'public'),
  /** Archivo de datos para Remotion */
  dataJson: path.join(PROJECT_ROOT, 'remotion-app', 'public', 'data.json'),
};

/**
 * Configuración de Remotion rendering
 */
export const REMOTION_CONFIG = {
  /** ID de la composición a renderizar */
  compositionId: 'AINewsShort',
  /** ID de la composición de preview */
  previewCompositionId: 'AINewsShort-Preview',
  /** Usar GPU para encoding (mejora velocidad) */
  enableGpu: true,
  /** Número de workers concurrentes (null = auto) */
  concurrency: null as number | null,
  /**
   * Timeout para rendering (configurable vía env vars)
   * Usa TIMEOUTS.videoRender que se adapta automáticamente a CI/CD
   * Videos de 60-90s a 1080p pueden tomar 5-10 minutos
   */
  get timeout() {
    // Multiplicamos por factor de seguridad para rendering largo (5-10 min)
    return TIMEOUTS.videoRender.value * 10; // ~5-20 minutos según entorno
  },
  /** Número de reintentos en caso de fallo */
  retries: 2,
  /** Delay entre reintentos en ms */
  retryDelay: 5000,
  /** Log level para Remotion CLI */
  logLevel: 'info' as const,
  /** Mostrar progreso en consola */
  showProgress: true,
};

/**
 * Configuración de secciones del video
 *
 * Define los frames de inicio y fin para cada sección
 * basado en 30 FPS y 55 segundos totales (1650 frames)
 */
export const VIDEO_SECTIONS = {
  /** Hook inicial (0-8s = 0-240 frames) */
  hook: {
    name: 'hook',
    startFrame: 0,
    endFrame: 240,
    durationSeconds: 8,
  },
  /** Headline/título (8-12s = 240-360 frames) */
  headline: {
    name: 'headline',
    startFrame: 240,
    endFrame: 360,
    durationSeconds: 4,
  },
  /** Contenido principal (12-42s = 360-1260 frames) */
  main: {
    name: 'main',
    startFrame: 360,
    endFrame: 1260,
    durationSeconds: 30,
  },
  /** Impacto/estadística (42-47s = 1260-1410 frames) */
  impact: {
    name: 'impact',
    startFrame: 1260,
    endFrame: 1410,
    durationSeconds: 5,
  },
  /** Outro con CTA (45-50s = 1350-1500 frames) - Actualizado Prompt 19.4 */
  outro: {
    name: 'outro',
    startFrame: 1350,   // Corregido: Hero(8s)+Content(37s) = 45s = 1350 frames
    endFrame: 1500,     // Corregido: 45s + 5s = 50s = 1500 frames
    durationSeconds: 5, // Reducido de 8s en Prompt 19.4
  },
};

/**
 * Configuración de subtítulos
 */
export const SUBTITLE_CONFIG = {
  /** Palabras por segundo promedio para narración */
  wordsPerSecond: 2.5,
  /** Frames de padding entre palabras */
  wordPadding: 2,
  /** Frames mínimos por palabra */
  minFramesPerWord: 6,
  /** Frames máximos por palabra */
  maxFramesPerWord: 45,
  /** Tamaño de fuente en píxeles */
  fontSize: 48,
  /** Color del texto */
  color: '#FFFFFF',
  /** Color del fondo (con transparencia) */
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Configuración completa exportada
 */
export const VIDEO_CONFIG = {
  specs: VIDEO_SPECS,
  paths: VIDEO_PATHS,
  remotion: REMOTION_CONFIG,
  sections: VIDEO_SECTIONS,
  subtitles: SUBTITLE_CONFIG,
};

export default VIDEO_CONFIG;
