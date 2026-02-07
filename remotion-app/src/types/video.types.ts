/**
 * @fileoverview Video Types - Tipos para Video Optimizado
 *
 * Estructura de datos para video de 45-60 segundos dedicado a UNA noticia.
 * Optimizado para Prompt 13: Video con efectos dinámicos.
 *
 * Timing:
 * - Hero: 8s (hook fuerte + imagen específica)
 * - Content: 37s (explicación completa + imagen contextual)
 * - Outro: 5s (branding + logo claro) - Reducido en Prompt 19.4
 *
 * @author Sintaxis IA
 * @version 2.1.0
 * @since Prompt 13
 * @updated Prompt 19.4 - Duración OutroScene reducida de 10s a 5s
 */

// =============================================================================
// TIPOS PARA IMÁGENES DINÁMICAS (Prompt 19.1)
// =============================================================================

/**
 * Imagen de escena dinámica
 *
 * Cada segmento del video (~15s) tiene su propia imagen basada en el contenido.
 */
export interface SceneImage {
  /** Índice del segmento (0, 1, 2, 3...) */
  sceneIndex: number;
  /** Segundo de inicio del segmento */
  startSecond: number;
  /** Segundo de fin del segmento */
  endSecond: number;
  /** URL de la imagen (null si no se encontró imagen relevante - Prompt 35) */
  imageUrl: string | null;
  /** Query usada para buscar la imagen */
  query: string;
  /** Proveedor de la imagen ('none' si no se encontró - Prompt 35) */
  source: 'pexels' | 'unsplash' | 'google' | 'fallback' | 'none';
  /** Si la imagen está cacheada */
  cached: boolean;
}

/**
 * Resultado de imágenes dinámicas
 *
 * Array de imágenes, una por cada segmento del video.
 */
export interface DynamicImages {
  /** Array de imágenes por segmento */
  scenes: SceneImage[];
  /** Número total de segmentos */
  totalSegments: number;
  /** Fecha de generación */
  generatedAt: string;
}

// =============================================================================
// TIPOS DE AUDIO SYNC (Prompt 19.7)
// =============================================================================

/**
 * Timestamp de una frase de audio
 * Generado por Whisper speech-to-text para sincronización precisa
 *
 * @since Prompt 19.7
 */
export interface PhraseTimestamp {
  /** Texto de la frase */
  text: string;
  /** Segundo de inicio en el audio */
  startSeconds: number;
  /** Segundo de fin en el audio */
  endSeconds: number;
}

/**
 * Datos de sincronización de audio
 * Permite mostrar texto sincronizado con el audio de narración
 *
 * @since Prompt 19.7
 */
export interface AudioSync {
  /** Timestamps de frases (de Whisper) */
  phraseTimestamps: PhraseTimestamp[];
  /** Duración total del audio en segundos */
  audioDuration: number;
}

// =============================================================================
// TIPOS DE NOTICIAS
// =============================================================================

/**
 * Tipos de noticias para estilos visuales específicos
 *
 * Cada tipo puede tener tratamiento visual diferente:
 * - product-launch: Colores vibrantes, energéticos
 * - model-release: Enfoque técnico, azules
 * - funding: Tonos dorados, corporativo
 * - controversy: Rojos, urgente
 * - research-paper: Académico, neutro
 * - breakthrough: Impactante, neón
 * - partnership: Colaborativo, mixto
 */
export type NewsType =
  | 'product-launch'
  | 'model-release'
  | 'funding'
  | 'controversy'
  | 'research-paper'
  | 'breakthrough'
  | 'partnership'
  | 'other';

// =============================================================================
// INTERFACE PRINCIPAL
// =============================================================================

/**
 * Props del Video - Optimizado para 1 Noticia
 *
 * Estructura para video de 45-60 segundos dedicado a UNA noticia importante.
 *
 * @example
 * const videoProps: VideoProps = {
 *   news: {
 *     title: "Google Genie: IA que Crea Mundos Virtuales",
 *     description: "Google DeepMind presenta Project Genie...",
 *     source: "Google DeepMind Blog",
 *     publishedAt: "2026-01-29"
 *   },
 *   images: {
 *     hero: "https://logo.clearbit.com/google.com",
 *     context: "https://example.com/screenshot.png"
 *   },
 *   topics: ["Google", "Genie", "AI Gaming"],
 *   hashtags: ["#IA", "#AI", "#Google", "#Genie"],
 *   audio: {
 *     voice: { src: "audio/narration.mp3", volume: 1.0 }
 *   }
 * };
 */
export interface VideoProps {
  /**
   * Contenido de la noticia (1 sola)
   */
  news: {
    /** Título principal (ej: "Google Genie: IA que Crea Mundos Virtuales") */
    title: string;
    /** Explicación completa (3-5 líneas) */
    description: string;
    /** Bullet points opcionales para detalles */
    details?: string[];
    /** Fuente de la noticia (ej: "Google DeepMind Blog") */
    source: string;
    /** Fecha de publicación (ej: "2026-01-29") */
    publishedAt: string;
  };

  /**
   * Imágenes específicas
   *
   * Soporta dos formatos:
   * - Legacy: hero + context (Prompt 13)
   * - Dinámico: scenes[] con N imágenes por segmento (Prompt 19.1)
   */
  images: {
    /** URL imagen hero - Logo empresa/producto (requerido para legacy) */
    hero: string;
    /** URL imagen context - Screenshot/demo (opcional, legacy) */
    context?: string;
    /**
     * Imágenes dinámicas por segmento (Prompt 19.1)
     * Si existe, ContentScene cambiará imagen cada ~15s
     */
    dynamicScenes?: SceneImage[];
    // Nota: outro logo está hardcoded en OutroScene
  };

  /**
   * Topics para categorización
   * @example ["Google", "Genie", "AI Gaming"]
   */
  topics: string[];

  /**
   * Hashtags para YouTube (NO SE RENDERIZAN EN VIDEO)
   * Solo van en el título de YouTube como metadata
   * @example ["#IA", "#AI", "#Google", "#Genie"]
   */
  hashtags: string[];

  /**
   * Tipo de noticia para estilos visuales
   * @default 'other'
   */
  newsType?: NewsType;

  /**
   * Configuración de audio
   */
  audio: {
    /** Voz TTS (narración principal) */
    voice: {
      /** URL del archivo de audio TTS */
      src: string;
      /** Volumen de la voz (0.0 - 1.0) @default 1.0 */
      volume?: number;
    };
    /** Música de fondo (opcional) */
    music?: {
      /** URL del archivo de música */
      src: string;
      /** Volumen base (0.0 - 1.0) @default 0.15 */
      volume?: number;
      /** Activar ducking automático @default true */
      ducking?: boolean;
      /** Duración fade in en segundos @default 1 */
      fadeIn?: number;
      /** Duración fade out en segundos @default 2 */
      fadeOut?: number;
    };
  };

  /**
   * Configuración del video
   */
  config?: {
    /** Duración total en segundos @default 50 */
    duration?: number;
    /** Frames por segundo @default 30 */
    fps?: number;
    /** Activar efectos dinámicos (zoom, parallax, blur) @default true */
    enhancedEffects?: boolean;
  };

  /**
   * Datos de sincronización de audio (Prompt 19.7/25)
   * Contiene timestamps de frases de Whisper para sync preciso con texto on-screen
   * Si no existe, ContentScene usa distribución uniforme de frases
   * @since Prompt 25
   */
  audioSync?: AudioSync;
}

// =============================================================================
// INTERFACES DE ESCENAS
// =============================================================================

/**
 * Props para HeroScene
 *
 * Escena de hook inicial (0-8s)
 * - Imagen hero (logo empresa) con zoom dramático
 * - Título grande con slide up + glow
 * - Efecto blur to focus en entrada
 */
export interface HeroSceneProps {
  /** Título principal de la noticia */
  title: string;
  /** URL de imagen hero (logo empresa) */
  image: string;
  /** FPS del video para cálculos de animación */
  fps: number;
  /** Activar efectos mejorados (zoom, blur, glow) @default true */
  enhanced?: boolean;
}

/**
 * Props para ContentScene
 *
 * Escena de explicación (8-45s)
 * - Imagen context (screenshot/demo) con parallax
 * - O imágenes dinámicas que cambian cada ~15s (Prompt 19.1)
 * - Texto descriptivo completo
 * - Bullet points opcionales
 * - Barra de progreso
 */
export interface ContentSceneProps {
  /** Descripción/explicación de la noticia */
  description: string;
  /** Bullet points opcionales */
  details?: string[];
  /** Imágenes disponibles (legacy) */
  images?: {
    /** Logo pequeño opcional */
    hero?: string;
    /** Screenshot/demo principal */
    context?: string;
  };
  /**
   * Imágenes dinámicas por segmento (Prompt 19.1)
   * Si existe, la imagen cambia cada ~15 segundos según el contenido
   */
  dynamicScenes?: SceneImage[];
  /** Segundo de inicio de ContentScene (para calcular imagen actual) */
  sceneStartSecond?: number;
  /** Duración total del video en frames */
  totalDuration: number;
  /** FPS del video */
  fps: number;
  /** Activar efectos dinámicos (parallax, zoom) @default true */
  dynamicEffects?: boolean;
  /**
   * Datos de sincronización de audio (Prompt 19.7)
   * Si existe, el texto se sincroniza con timestamps reales de Whisper
   * Si no existe, el texto se distribuye uniformemente
   */
  audioSync?: AudioSync;
}

/**
 * Props para OutroScene
 *
 * Escena de branding (45-50s) - Actualizado Prompt 19.4
 * - Logo "Sintaxis IA" grande y centrado
 * - CTA claro ("Síguenos para más noticias IA")
 * - SIN hashtags visibles
 */
export interface OutroSceneProps {
  /** Hashtags (NO SE RENDERIZAN, solo metadata) */
  hashtags: string[];
  /** FPS del video */
  fps: number;
}

// =============================================================================
// TITLE CARD SCENE (Prompt 32)
// =============================================================================

/**
 * Props para TitleCardScene
 *
 * Overlay de 0.5s que aparece encima de HeroScene.
 * Diseñado como frame capturable para thumbnail de YouTube.
 *
 * @since Prompt 32
 */
export interface TitleCardProps {
  /** Texto del título (derivado de news.title, max 7 palabras) */
  titleText: string;
  /** Badge de 1 palabra (NUEVO, MODELO, etc.) */
  badge: string;
  /** URL de imagen de fondo (hero image con overlay) */
  backgroundImage: string;
  /** FPS del video para cálculos de animación */
  fps: number;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Re-export types for convenience
} as const;
