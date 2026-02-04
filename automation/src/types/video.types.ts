/**
 * @fileoverview Tipos para Video Rendering - Prompt 17
 *
 * Define interfaces y tipos para el servicio de renderizado de video.
 * Incluye contratos de datos para Remotion y estructuras de respuesta.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 17
 * @updated Prompt 19.1.7 - Agregado dynamicScenes para imágenes dinámicas
 */

import type { SceneImage } from './image.types';

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Solicitud de renderizado de video
 */
export interface VideoRenderRequest {
  /** ID único del video */
  videoId: string;
  /** Título del video para YouTube */
  title: string;
  /** Script completo para narración */
  script: string;
  /** Ruta al archivo de audio generado */
  audioPath: string;
  /** URL o ruta de la imagen principal */
  imagePath: string;
  /** Tópico/tema principal */
  topic: string;
  /** Fuente de la noticia */
  newsSource: string;
  /** Duración del audio en segundos */
  audioDuration: number;
  /** Hook inicial (opcional, extraído del script) */
  hook?: string;
  /** Contenido principal (opcional) */
  body?: string;
  /** CTA final (opcional) */
  cta?: string;
  /** Empresa/compañía mencionada */
  company?: string;
  /** Tipo de noticia */
  newsType?: string;
  /** Imágenes dinámicas por segmento (Prompt 19.1) */
  dynamicScenes?: SceneImage[];
}

/**
 * Respuesta del renderizado de video
 */
export interface VideoRenderResponse {
  /** Si el renderizado fue exitoso */
  success: boolean;
  /** Ruta al video renderizado */
  videoPath: string;
  /** Duración del video en segundos */
  durationSeconds: number;
  /** Tamaño del archivo en bytes */
  fileSizeBytes: number;
  /** Tamaño formateado (ej: "15.2 MB") */
  fileSizeFormatted: string;
  /** Tiempo de renderizado en segundos */
  renderTimeSeconds: number;
  /** Metadata adicional */
  metadata: VideoRenderMetadata;
  /** Mensaje de error si falló */
  error?: string;
}

/**
 * Metadata del video renderizado
 */
export interface VideoRenderMetadata {
  /** ID de la composición usada */
  compositionId: string;
  /** Resolución del video */
  resolution: string;
  /** FPS del video */
  fps: number;
  /** Codec de video usado */
  codec: string;
  /** CRF usado */
  crf: number;
  /** Número total de frames */
  totalFrames: number;
  /** Timestamp de inicio */
  startedAt: Date;
  /** Timestamp de fin */
  completedAt: Date;
  /** Intentos realizados */
  attempts: number;
}

// =============================================================================
// REMOTION DATA CONTRACT
// =============================================================================

/**
 * Contrato de datos para Remotion (data.json)
 *
 * Esta estructura es leída por las composiciones de Remotion
 * para renderizar el video con el contenido dinámico.
 */
export interface RemotionDataContract {
  /** Metadata general */
  meta: RemotionMeta;
  /** Contenido del script */
  content: RemotionContent;
  /** Assets (imágenes, audio) */
  assets: RemotionAssets;
  /** Subtítulos sincronizados */
  subtitles: SubtitleWord[];
  /** Secciones del video */
  sections: VideoSection[];
  /** Configuración de estilo */
  style: RemotionStyle;
}

/**
 * Metadata para Remotion
 */
export interface RemotionMeta {
  /** ID del video */
  videoId: string;
  /** Título para YouTube */
  title: string;
  /** Tópico principal */
  topic: string;
  /** Fuente de la noticia */
  source: string;
  /** Empresa/compañía */
  company?: string;
  /** Tipo de noticia */
  newsType?: string;
  /** Duración en frames */
  durationInFrames: number;
  /** FPS */
  fps: number;
  /** Timestamp de generación */
  generatedAt: string;
}

/**
 * Contenido textual para Remotion
 */
export interface RemotionContent {
  /** Hook inicial */
  hook: string;
  /** Headline/título */
  headline: string;
  /** Contenido principal */
  body: string;
  /** Mensaje de impacto */
  impact: string;
  /** Call to Action */
  cta: string;
  /** Script completo para narración */
  fullScript: string;
}

/**
 * Assets para Remotion
 */
export interface RemotionAssets {
  /** Ruta al archivo de audio */
  audioPath: string;
  /** Duración del audio en segundos */
  audioDuration: number;
  /** URL/ruta de imagen hero */
  heroImage: string;
  /** URL/ruta de imagen de contexto */
  contextImage?: string;
  /** URL/ruta de imagen de outro */
  outroImage: string;
  /** Logo de la empresa (si existe) */
  companyLogo?: string;
}

/**
 * Configuración de estilo para Remotion
 */
export interface RemotionStyle {
  /** Tema de colores */
  theme: 'cyberpunk' | 'minimal' | 'corporate';
  /** Color primario */
  primaryColor: string;
  /** Color de acento */
  accentColor: string;
  /** Mostrar subtítulos */
  showSubtitles: boolean;
  /** Mostrar progress bar */
  showProgressBar: boolean;
  /** Efectos habilitados */
  effects: {
    zoom: boolean;
    blur: boolean;
    parallax: boolean;
    glow: boolean;
  };
}

// =============================================================================
// SUBTITLE TYPES
// =============================================================================

/**
 * Palabra individual de subtítulo con timing
 */
export interface SubtitleWord {
  /** La palabra */
  word: string;
  /** Frame de inicio */
  startFrame: number;
  /** Frame de fin */
  endFrame: number;
  /** Índice en el script completo */
  index: number;
  /** Si es inicio de oración */
  isStartOfSentence: boolean;
  /** Si es fin de oración */
  isEndOfSentence: boolean;
}

/**
 * Grupo de subtítulos (para mostrar varias palabras juntas)
 */
export interface SubtitleGroup {
  /** Palabras en el grupo */
  words: SubtitleWord[];
  /** Texto combinado */
  text: string;
  /** Frame de inicio del grupo */
  startFrame: number;
  /** Frame de fin del grupo */
  endFrame: number;
}

// =============================================================================
// VIDEO SECTION TYPES
// =============================================================================

/**
 * Sección del video con timing y contenido
 */
export interface VideoSection {
  /** Nombre de la sección */
  name: 'hook' | 'headline' | 'main' | 'impact' | 'outro';
  /** Frame de inicio */
  startFrame: number;
  /** Frame de fin */
  endFrame: number;
  /** Duración en segundos */
  durationSeconds: number;
  /** Contenido textual de la sección */
  content: string;
  /** Imagen asociada (si aplica) */
  image?: string;
  /** Efectos especiales para esta sección */
  effects?: SectionEffects;
}

/**
 * Efectos específicos de una sección
 */
export interface SectionEffects {
  /** Factor de zoom (1 = normal) */
  zoomFactor?: number;
  /** Intensidad de blur (0-1) */
  blurIntensity?: number;
  /** Desplazamiento parallax en px */
  parallaxOffset?: number;
  /** Intensidad de glow (0-1) */
  glowIntensity?: number;
  /** Transición de entrada */
  transitionIn?: 'fade' | 'slide' | 'zoom' | 'none';
  /** Transición de salida */
  transitionOut?: 'fade' | 'slide' | 'zoom' | 'none';
}

// =============================================================================
// SERVICE CONFIGURATION TYPES
// =============================================================================

/**
 * Opciones de configuración del servicio de rendering
 */
export interface VideoRenderOptions {
  /** Usar composición de preview (10s) en lugar de full (55s) */
  usePreview?: boolean;
  /** Forzar re-renderizado aunque exista cache */
  forceRender?: boolean;
  /** Directorio de salida personalizado */
  outputDir?: string;
  /** Nombre del archivo de salida (sin extensión) */
  outputFileName?: string;
  /** Calidad (afecta CRF) */
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  /** Timeout personalizado en ms */
  timeout?: number;
  /** Número de reintentos */
  retries?: number;
}

/**
 * Estado del servicio de rendering
 */
export interface VideoRenderStatus {
  /** Si está ocupado renderizando */
  isRendering: boolean;
  /** ID del video actual (si está renderizando) */
  currentVideoId?: string;
  /** Progreso actual (0-100) */
  progress: number;
  /** Fase actual del rendering */
  phase: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'finalizing';
  /** Mensaje de estado */
  message: string;
  /** Tiempo transcurrido en ms */
  elapsedTime: number;
}

/**
 * Resultado de verificación de setup
 */
export interface SetupVerificationResult {
  /** Si el setup es válido */
  isValid: boolean;
  /** Remotion instalado */
  remotionInstalled: boolean;
  /** FFmpeg disponible */
  ffmpegAvailable: boolean;
  /** Directorio de Remotion existe */
  remotionDirExists: boolean;
  /** Composición existe */
  compositionExists: boolean;
  /** Errores encontrados */
  errors: string[];
  /** Warnings */
  warnings: string[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Calidad de video presets
 */
export const VIDEO_QUALITY_PRESETS = {
  low: { crf: 28, description: 'Baja calidad, archivo pequeño' },
  medium: { crf: 23, description: 'Calidad media, balance' },
  high: { crf: 18, description: 'Alta calidad, archivo grande' },
  ultra: { crf: 15, description: 'Máxima calidad, archivo muy grande' },
} as const;

export type VideoQuality = keyof typeof VIDEO_QUALITY_PRESETS;

/**
 * Formatea bytes a string legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calcula frames desde segundos
 */
export function secondsToFrames(seconds: number, fps: number = 30): number {
  return Math.round(seconds * fps);
}

/**
 * Calcula segundos desde frames
 */
export function framesToSeconds(frames: number, fps: number = 30): number {
  return frames / fps;
}
