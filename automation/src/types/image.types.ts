/**
 * @fileoverview Types para Sistema de Búsqueda de Imágenes
 *
 * Define interfaces para búsqueda inteligente de imágenes
 * relacionadas a noticias de IA.
 *
 * Sistema de 3 imágenes por video:
 * - HERO (0-8s): Logo empresa/producto
 * - CONTEXT (8-45s): Screenshot/demo del producto
 * - OUTRO (45-55s): Logo "Sintaxis IA" (hardcoded en componente)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

/**
 * Parámetros para búsqueda de imágenes
 */
export interface ImageSearchParams {
  /** Topics principales de la noticia ["Google", "Genie", "AI Gaming"] */
  topics: string[];

  /** Empresa principal mencionada (ej: "Google") */
  company?: string;

  /** Nombre del producto si aplica (ej: "Project Genie") */
  productName?: string;

  /** URL oficial del anuncio (para scraping OpenGraph) */
  officialUrl?: string;
}

/**
 * Fuentes de imágenes disponibles para HERO
 */
export type HeroImageSource =
  | 'clearbit'
  | 'logodev'
  | 'google'
  | 'unsplash'
  | 'ui-avatars';

/**
 * Fuentes de imágenes disponibles para CONTEXT
 */
export type ContextImageSource =
  | 'google'
  | 'unsplash'
  | 'opengraph'
  | 'hero-duplicate';

/**
 * Resultado de búsqueda de imagen HERO
 */
export interface HeroImageResult {
  /** URL de la imagen */
  url: string;

  /** Proveedor que encontró la imagen */
  source: HeroImageSource;

  /** Si la imagen está cacheada localmente */
  cached: boolean;
}

/**
 * Resultado de búsqueda de imagen CONTEXT
 */
export interface ContextImageResult {
  /** URL de la imagen */
  url: string;

  /** Proveedor que encontró la imagen */
  source: ContextImageSource;

  /** Si la imagen está cacheada localmente */
  cached: boolean;
}

/**
 * Resultado completo de búsqueda de imágenes
 *
 * Incluye HERO y CONTEXT.
 * OUTRO no se incluye porque está hardcoded en el componente.
 */
export interface ImageSearchResult {
  /**
   * Imagen HERO (0-8s): Logo empresa/producto
   * SIEMPRE presente (fallback garantizado con UI Avatars)
   */
  hero: HeroImageResult;

  /**
   * Imagen CONTEXT (8-45s): Screenshot/demo del producto
   * OPCIONAL - puede ser undefined si no se encuentra
   */
  context?: ContextImageResult;
}

/**
 * Interfaz para proveedores de imágenes
 */
export interface ImageProvider {
  /** Nombre del proveedor */
  name: string;

  /** Prioridad (menor = más prioritario) */
  priority: number;

  /**
   * Busca imagen
   * @param query - Término de búsqueda
   * @param type - Tipo de imagen a buscar
   * @returns URL de imagen o null si no encontrada
   */
  search(query: string, type: 'logo' | 'screenshot'): Promise<string | null>;
}

/**
 * Entrada de caché de imagen
 */
export interface ImageCacheEntry {
  /** URL original de la imagen */
  url: string;

  /** Path local donde está cacheada */
  localPath: string;

  /** Timestamp de cuando se cacheó */
  cachedAt: Date;

  /** Timestamp de expiración */
  expiresAt: Date;
}

/**
 * Estadísticas de caché
 */
export interface CacheStats {
  /** Número de archivos en caché */
  fileCount: number;

  /** Tamaño total en MB */
  sizeInMB: number;

  /** Archivos más antiguos que maxAge */
  expiredCount: number;
}

// =============================================================================
// PROMPT 19.1 - IMÁGENES DINÁMICAS POR SEGMENTO
// =============================================================================

/**
 * Fuentes de imágenes disponibles para búsqueda por segmento
 * @since Prompt 19.1
 * @updated Prompt 19.1.6 - Agregados 'clearbit' y 'logodev' para logos
 */
export type SceneImageSource =
  | 'pexels'
  | 'unsplash'
  | 'google'
  | 'clearbit'
  | 'logodev'
  | 'fallback';

/**
 * Segmento de script con keywords extraídas
 * Representa un fragmento de ~15 segundos del video
 *
 * @since Prompt 19.1
 */
export interface SceneSegment {
  /** Índice del segmento (0, 1, 2, 3) */
  index: number;

  /** Segundo de inicio del segmento */
  startSecond: number;

  /** Segundo de fin del segmento */
  endSecond: number;

  /** Texto del segmento (hook, body, opinion, cta) */
  text: string;

  /** Keywords extraídas del texto */
  keywords: string[];

  /** Query optimizada para búsqueda de imágenes */
  searchQuery: string;
}

/**
 * Imagen encontrada para un segmento específico
 *
 * @since Prompt 19.1
 */
export interface SceneImage {
  /** Índice del segmento al que pertenece */
  sceneIndex: number;

  /** Segundo de inicio donde mostrar la imagen */
  startSecond: number;

  /** Segundo de fin donde mostrar la imagen */
  endSecond: number;

  /** URL de la imagen */
  imageUrl: string;

  /** Query usada para encontrar la imagen */
  query: string;

  /** Proveedor que encontró la imagen */
  source: SceneImageSource;

  /** Si la imagen está cacheada localmente */
  cached: boolean;
}

/**
 * Resultado de búsqueda de imágenes dinámicas por segmento
 * Reemplaza ImageSearchResult para el nuevo sistema
 *
 * @since Prompt 19.1
 */
export interface DynamicImagesResult {
  /** Array de imágenes, una por segmento */
  scenes: SceneImage[];

  /** Número total de segmentos */
  totalSegments: number;

  /** Timestamp de generación */
  generatedAt: string;
}

// =============================================================================
// PROMPT 23 - SMART IMAGE SELECTOR
// =============================================================================

/**
 * Resultado de generación de queries inteligentes
 *
 * SmartQueryGenerator traduce keywords del español al inglés
 * y genera queries alternativas para retry.
 *
 * @since Prompt 23
 */
export interface SmartQueryResult {
  /** Query principal optimizada en inglés */
  primary: string;

  /** Queries alternativas para retry (máximo 2) */
  alternatives: string[];

  /** Idioma de las queries generadas */
  language: 'en';

  /** Keywords originales (español) que generaron las queries */
  originalKeywords: string[];

  /** Keywords traducidas al inglés */
  translatedKeywords: string[];
}

/**
 * Candidato de imagen de Pexels con metadata para scoring
 *
 * Retornado por searchPexelsMultiple() para evaluar
 * cuál imagen es la más relevante.
 *
 * @since Prompt 23
 */
export interface PexelsCandidate {
  /** URL de la imagen (portrait o large2x según orientación) */
  url: string;

  /** Texto alternativo / descripción de la imagen */
  alt: string;

  /** Ancho original de la imagen en píxeles */
  width: number;

  /** Alto original de la imagen en píxeles */
  height: number;
}
