/**
 * @fileoverview Video Types - Tipos para Video Optimizado
 *
 * Estructura de datos para video de 45-60 segundos dedicado a UNA noticia.
 * Optimizado para Prompt 13: Video con efectos dinámicos.
 *
 * Timing:
 * - Hero: 8s (hook fuerte + imagen específica)
 * - Content: 37s (explicación completa + imagen contextual)
 * - Outro: 10s (branding + logo claro)
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 13
 */

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
   * Imágenes específicas (3 totales)
   * - hero: Logo empresa (0-8s)
   * - context: Screenshot/demo (8-45s)
   * - outro: Logo "Sintaxis IA" hardcoded en componente
   */
  images: {
    /** URL imagen hero - Logo empresa/producto (requerido) */
    hero: string;
    /** URL imagen context - Screenshot/demo (opcional) */
    context?: string;
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
    /** Duración total en segundos @default 55 */
    duration?: number;
    /** Frames por segundo @default 30 */
    fps?: number;
    /** Activar efectos dinámicos (zoom, parallax, blur) @default true */
    enhancedEffects?: boolean;
  };
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
 * - Texto descriptivo completo
 * - Bullet points opcionales
 * - Barra de progreso
 */
export interface ContentSceneProps {
  /** Descripción/explicación de la noticia */
  description: string;
  /** Bullet points opcionales */
  details?: string[];
  /** Imágenes disponibles */
  images?: {
    /** Logo pequeño opcional */
    hero?: string;
    /** Screenshot/demo principal */
    context?: string;
  };
  /** Duración total del video en frames */
  totalDuration: number;
  /** FPS del video */
  fps: number;
  /** Activar efectos dinámicos (parallax, zoom) @default true */
  dynamicEffects?: boolean;
}

/**
 * Props para OutroScene
 *
 * Escena de branding (45-55s)
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
// EXPORTS
// =============================================================================

export default {
  // Re-export types for convenience
} as const;
