/**
 * @fileoverview Types para Sistema de Scoring de Noticias
 *
 * Define interfaces para evaluar importancia de noticias IA.
 * El sistema asigna puntos basados en múltiples criterios:
 * - Relevancia de empresa (0-10 pts)
 * - Tipo de noticia (0-9 pts)
 * - Engagement en redes (0-8 pts)
 * - Frescura/antigüedad (-5 a +3 pts)
 * - Impacto potencial (0-7 pts)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 11
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

    /** Puntos por engagement en redes (0-8) */
    engagement: number;

    /** Puntos por frescura (-5 a +3) */
    freshness: number;

    /** Puntos por impacto potencial (0-7) */
    impact: number;
  };

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
 * Métricas de engagement en redes sociales
 *
 * Se usa para calcular el score de engagement.
 * Principalmente Twitter/X views, pero soporta otras métricas.
 */
export interface NewsMetrics {
  /** Views en Twitter/X */
  twitterViews?: number;

  /** Likes en Twitter/X */
  twitterLikes?: number;

  /** Retweets en Twitter/X */
  twitterRetweets?: number;

  /** Upvotes en Reddit */
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
}
