/**
 * @fileoverview Types para Sistema de Scoring de Noticias ("Carnita Score")
 *
 * Define interfaces para evaluar importancia de noticias IA.
 * El sistema asigna puntos basados en múltiples criterios:
 * - Relevancia de empresa (0-10 pts)
 * - Tipo de noticia (0-9 pts)
 * - Engagement/views (0-8 pts)
 * - Frescura/antigüedad (-5 a +3 pts)
 * - Impacto potencial (0-7 pts)
 * - Profundidad analítica (0-25 pts) - NUEVO Prompt 17-A
 * - Potencial de controversia (0-20 pts) - NUEVO Prompt 17-A
 * - Contenido sustantivo vs clickbait (0-15 pts) - NUEVO Prompt 17-A
 *
 * Umbral mínimo para publicar: 75 pts (antes 60)
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 11
 * @updated Prompt 17-A - Refactorización "Carnita Score"
 */

/**
 * Resultado del scoring de una noticia
 *
 * Contiene el score total y el desglose por categoría
 * para entender por qué una noticia tiene cierta puntuación.
 */
export interface NewsScore {
  /** ID único de la noticia evaluada */
  newsId: string;

  /** Título de la noticia (para referencia rápida) */
  title: string;

  /** Score total calculado (suma de todas las categorías) */
  totalScore: number;

  /** Desglose de puntuación por categoría */
  breakdown: {
    /** Puntos por empresa/fuente (0-10) */
    companyRelevance: number;

    /** Puntos por tipo de noticia (0-9) */
    newsType: number;

    /** Puntos por engagement/views (0-8) */
    engagement: number;

    /** Puntos por frescura (-5 a +3) */
    freshness: number;

    /** Puntos por impacto potencial (0-7) */
    impact: number;

    // === Nuevos criterios "Carnita Score" (Prompt 17-A) ===

    /**
     * Profundidad analítica potencial (0-25 pts)
     * Evalúa si la noticia tiene sustancia para análisis humano profundo
     */
    analyticalDepth: number;

    /**
     * Potencial de controversia/debate (0-20 pts)
     * Evalúa si genera discusión interesante
     */
    controversyPotential: number;

    /**
     * Contenido sustantivo vs clickbait (0-15 pts)
     * Penaliza títulos sensacionalistas sin sustancia
     */
    substantiveContent: number;
  };

  /**
   * Si la noticia supera el umbral mínimo para publicar (75 pts)
   * @since Prompt 17-A
   */
  isPublishable: boolean;

  /**
   * Ángulos de análisis sugeridos para el video
   * @since Prompt 17-A
   */
  suggestedAngles?: string[];

  /**
   * Razones detalladas de la puntuación
   * @since Prompt 17-A
   */
  reasons?: string[];

  /** Timestamp de cuándo se calculó el ranking */
  rankedAt: Date;
}

/**
 * Tipos de noticia reconocidos por el sistema
 *
 * Cada tipo tiene un valor de puntuación asociado:
 * - product-launch: +9 pts - Lanzamiento de producto nuevo
 * - model-release: +9 pts - Nuevo modelo de IA
 * - breakthrough: +8 pts - Avance técnico importante
 * - controversy: +7 pts - Controversia o debate
 * - funding: +6 pts - Ronda de inversión
 * - acquisition: +6 pts - Adquisición de empresa
 * - research-paper: +5 pts - Paper científico publicado
 * - partnership: +4 pts - Alianza o partnership
 * - other: +2 pts - Otro tipo de noticia
 */
export type NewsType =
  | 'product-launch'
  | 'model-release'
  | 'funding'
  | 'acquisition'
  | 'controversy'
  | 'research-paper'
  | 'breakthrough'
  | 'partnership'
  | 'other';

/**
 * Métricas de engagement genéricas
 *
 * Se usa para calcular el score de engagement.
 * Campos genéricos que pueden venir de cualquier fuente (API, scraping, etc.)
 *
 * @updated Prompt 17-A - Eliminadas métricas específicas de Twitter/X
 */
export interface NewsMetrics {
  /** Views/visualizaciones totales */
  views?: number;

  /** Likes/favoritos totales */
  likes?: number;

  /** Shares/redistribuciones totales */
  shares?: number;

  /** Comentarios totales */
  comments?: number;

  /** Upvotes en Reddit (si aplica) */
  redditUpvotes?: number;
}

/**
 * Configuración para el cálculo de scoring
 *
 * Permite personalizar los pesos y umbrales del sistema.
 */
export interface ScoringConfig {
  /** Multiplicador para company score (default: 1) */
  companyWeight?: number;

  /** Multiplicador para type score (default: 1) */
  typeWeight?: number;

  /** Multiplicador para engagement score (default: 1) */
  engagementWeight?: number;

  /** Multiplicador para freshness score (default: 1) */
  freshnessWeight?: number;

  /** Multiplicador para impact score (default: 1) */
  impactWeight?: number;

  /** Multiplicador para analytical depth score (default: 1) */
  analyticalDepthWeight?: number;

  /** Multiplicador para controversy potential score (default: 1) */
  controversyWeight?: number;

  /** Multiplicador para substantive content score (default: 1) */
  substantiveWeight?: number;
}

// =============================================================================
// CONSTANTES DE SCORING
// =============================================================================

/**
 * Umbral mínimo de puntuación para publicar una noticia
 * Noticias con score menor no se consideran con suficiente "carnita"
 *
 * @since Prompt 17-A
 */
export const PUBLISH_THRESHOLD = 75;

/**
 * Score máximo teórico posible
 * 10 + 9 + 8 + 3 + 7 + 25 + 20 + 15 = 97 pts
 */
export const MAX_POSSIBLE_SCORE = 97;
