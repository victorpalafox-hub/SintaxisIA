/**
 * @fileoverview News Scorer - Sistema de Puntuación de Noticias
 *
 * Evalúa y rankea noticias de IA por importancia usando múltiples criterios.
 * Solo las noticias con mayor score se publican (1 cada 2 días).
 *
 * Sistema de puntuación:
 * - Empresa (0-10 pts): OpenAI/Google = 10, Startups desconocidas = 3
 * - Tipo (0-9 pts): Lanzamientos = 9, Partnerships = 4
 * - Engagement (0-8 pts): Viral >500K = 8, Bajo <1K = 0
 * - Frescura (-5 a +3 pts): <6h = +3, >3días = -5
 * - Impacto (0-7 pts): Keywords "revolutionary", "AGI", etc.
 *
 * @example
 * ```typescript
 * import { scoreNews, rankNews, selectTopNews } from './news-scorer';
 *
 * const news = [{ id: '1', title: 'OpenAI launches GPT-5', ... }];
 * const ranked = rankNews(news);
 * const best = selectTopNews(news);
 * ```
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 11
 */

import { NewsItem } from './types/news.types';
import { NewsScore, NewsType } from './types/scoring.types';
import {
  COMPANY_SCORES,
  NEWS_TYPE_SCORES,
  ENGAGEMENT_THRESHOLDS,
  HIGH_IMPACT_KEYWORDS,
  FRESHNESS_THRESHOLDS,
  FRESHNESS_SCORES,
} from './config/scoring-rules';

// =============================================================================
// FUNCIÓN PRINCIPAL DE SCORING
// =============================================================================

/**
 * Calcula el score total de una noticia
 *
 * Evalúa la noticia en 5 categorías y devuelve el score total
 * junto con el desglose por categoría.
 *
 * @param news - Noticia a evaluar
 * @returns Score total y desglose por categoría
 *
 * @example
 * ```typescript
 * const score = scoreNews({
 *   id: '1',
 *   title: 'OpenAI launches GPT-5',
 *   company: 'OpenAI',
 *   type: 'product-launch',
 *   publishedAt: new Date(),
 *   ...
 * });
 * console.log(score.totalScore); // 22 (10+9+0+3+0)
 * ```
 */
export function scoreNews(news: NewsItem): NewsScore {
  // Calcular score de cada categoría
  const breakdown = {
    companyRelevance: calculateCompanyScore(news.company),
    newsType: calculateTypeScore(news.type),
    engagement: calculateEngagementScore(news.metrics),
    freshness: calculateFreshnessScore(news.publishedAt),
    impact: estimateImpact(news),
  };

  // Sumar todos los scores
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    newsId: news.id,
    title: news.title,
    totalScore,
    breakdown,
    rankedAt: new Date(),
  };
}

// =============================================================================
// FUNCIONES DE CÁLCULO POR CATEGORÍA
// =============================================================================

/**
 * Calcula score por relevancia de empresa/fuente
 *
 * OpenAI, Google, Anthropic = 10 pts (Tier 1)
 * Mistral, xAI = 8 pts (Tier 2)
 * Perplexity, Hugging Face = 6 pts (Tier 3)
 * Empresas desconocidas = 3 pts (default)
 *
 * @param company - Nombre de la empresa
 * @returns Score de 0-10
 */
function calculateCompanyScore(company?: string): number {
  // Sin empresa = 0 puntos
  if (!company) return 0;

  // Buscar coincidencia exacta primero
  if (COMPANY_SCORES[company] !== undefined) {
    return COMPANY_SCORES[company];
  }

  // Buscar coincidencia parcial (ej: "Google AI" contiene "Google")
  const companyLower = company.toLowerCase();
  for (const [key, score] of Object.entries(COMPANY_SCORES)) {
    if (key !== 'default' && companyLower.includes(key.toLowerCase())) {
      return score;
    }
  }

  // Default para empresas no reconocidas
  return COMPANY_SCORES['default'];
}

/**
 * Calcula score por tipo de noticia
 *
 * Lanzamiento producto = 9 pts
 * Nuevo modelo = 9 pts
 * Breakthrough = 8 pts
 * Controversia = 7 pts
 * Funding/Adquisición = 6 pts
 * Paper = 5 pts
 * Partnership = 4 pts
 * Otro = 2 pts
 *
 * @param type - Tipo de noticia
 * @returns Score de 0-9
 */
function calculateTypeScore(type?: NewsType): number {
  // Sin tipo = score mínimo
  if (!type) return NEWS_TYPE_SCORES['other'];

  return NEWS_TYPE_SCORES[type] || NEWS_TYPE_SCORES['other'];
}

/**
 * Calcula score por engagement en redes sociales
 *
 * >500K views = 8 pts (viral)
 * >100K views = 7 pts (alto)
 * >50K views = 5 pts (medio-alto)
 * >10K views = 3 pts (medio)
 * >1K views = 1 pt (bajo)
 * <1K views = 0 pts
 *
 * @param metrics - Métricas de engagement
 * @returns Score de 0-8
 */
function calculateEngagementScore(metrics?: {
  twitterViews?: number;
  twitterLikes?: number;
  redditUpvotes?: number;
}): number {
  // Sin métricas = 0 puntos
  if (!metrics) return 0;

  // Usar views como métrica principal
  const views = metrics.twitterViews || 0;

  // Asignar score según umbrales
  if (views >= ENGAGEMENT_THRESHOLDS.viral) return 8;
  if (views >= ENGAGEMENT_THRESHOLDS.high) return 7;
  if (views >= ENGAGEMENT_THRESHOLDS.mediumHigh) return 5;
  if (views >= ENGAGEMENT_THRESHOLDS.medium) return 3;
  if (views >= ENGAGEMENT_THRESHOLDS.low) return 1;

  return 0;
}

/**
 * Calcula score por frescura (antigüedad de la noticia)
 *
 * <6 horas = +3 pts (muy reciente)
 * <24 horas = +2 pts (reciente)
 * <48 horas = 0 pts (aceptable)
 * <72 horas = -2 pts (vieja)
 * >72 horas = -5 pts (muy vieja)
 *
 * @param publishedAt - Fecha de publicación
 * @returns Score de -5 a +3
 */
function calculateFreshnessScore(publishedAt: Date): number {
  const now = new Date();
  const ageInHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

  // Asignar score según antigüedad
  if (ageInHours <= FRESHNESS_THRESHOLDS.veryFresh) {
    return FRESHNESS_SCORES.veryFresh;  // +3
  }
  if (ageInHours <= FRESHNESS_THRESHOLDS.fresh) {
    return FRESHNESS_SCORES.fresh;      // +2
  }
  if (ageInHours <= FRESHNESS_THRESHOLDS.acceptable) {
    return FRESHNESS_SCORES.acceptable; // 0
  }
  if (ageInHours <= FRESHNESS_THRESHOLDS.old) {
    return FRESHNESS_SCORES.old;        // -2
  }

  return FRESHNESS_SCORES.veryOld;      // -5
}

/**
 * Estima impacto potencial basado en palabras clave
 *
 * Busca palabras como "revolutionary", "breakthrough", "AGI"
 * en título y descripción.
 *
 * +2 pts por cada keyword encontrada (máximo 7 pts)
 *
 * @param news - Noticia a evaluar
 * @returns Score de 0-7
 */
function estimateImpact(news: NewsItem): number {
  // Combinar título y descripción para búsqueda
  const text = `${news.title} ${news.description}`.toLowerCase();

  let impact = 0;

  // Buscar cada keyword de alto impacto
  for (const keyword of HIGH_IMPACT_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      impact += 2;
    }
  }

  // Limitar a máximo 7 puntos
  return Math.min(impact, 7);
}

// =============================================================================
// FUNCIONES DE RANKING Y SELECCIÓN
// =============================================================================

/**
 * Rankea múltiples noticias por score (mayor a menor)
 *
 * @param newsItems - Array de noticias a rankear
 * @returns Array de scores ordenado (mejor primero)
 *
 * @example
 * ```typescript
 * const ranked = rankNews(newsItems);
 * console.log(ranked[0].title); // La mejor noticia
 * console.log(ranked[0].totalScore); // Su score
 * ```
 */
export function rankNews(newsItems: NewsItem[]): NewsScore[] {
  // Calcular score de cada noticia
  const scores = newsItems.map(scoreNews);

  // Ordenar por score descendente
  return scores.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Selecciona la mejor noticia del ranking
 *
 * @param newsItems - Array de noticias
 * @returns Noticia con mayor score + su score, o null si no hay noticias
 *
 * @example
 * ```typescript
 * const result = selectTopNews(newsItems);
 * if (result) {
 *   console.log(`Publicar: ${result.news.title}`);
 *   console.log(`Score: ${result.score.totalScore}`);
 * }
 * ```
 */
export function selectTopNews(
  newsItems: NewsItem[]
): { news: NewsItem; score: NewsScore } | null {
  // Array vacío = null
  if (newsItems.length === 0) return null;

  // Obtener ranking
  const ranked = rankNews(newsItems);
  const topScore = ranked[0];

  // Buscar la noticia original por ID
  const topNews = newsItems.find(n => n.id === topScore.newsId);

  if (!topNews) return null;

  return { news: topNews, score: topScore };
}

/**
 * Filtra noticias que superen un umbral de score
 *
 * @param newsItems - Array de noticias
 * @param minScore - Score mínimo requerido
 * @returns Noticias que superan el umbral, ordenadas por score
 */
export function filterByScore(
  newsItems: NewsItem[],
  minScore: number
): { news: NewsItem; score: NewsScore }[] {
  const ranked = rankNews(newsItems);

  return ranked
    .filter(score => score.totalScore >= minScore)
    .map(score => ({
      news: newsItems.find(n => n.id === score.newsId)!,
      score,
    }))
    .filter(item => item.news !== undefined);
}

// Exports por defecto para facilitar imports
export default {
  scoreNews,
  rankNews,
  selectTopNews,
  filterByScore,
};
