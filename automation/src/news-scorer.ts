/**
 * @fileoverview News Scorer - Sistema de Puntuación "Carnita Score"
 *
 * Evalúa y rankea noticias de IA por importancia usando múltiples criterios.
 * Solo las noticias con mayor score se publican (1 cada 2 días).
 *
 * Sistema de puntuación original (Prompt 11):
 * - Empresa (0-10 pts): OpenAI/Google = 10, Startups desconocidas = 3
 * - Tipo (0-9 pts): Lanzamientos = 9, Partnerships = 4
 * - Engagement (0-8 pts): Viral >500K = 8, Bajo <1K = 0
 * - Frescura (-5 a +3 pts): <6h = +3, >3días = -5
 * - Impacto (0-7 pts): Keywords "revolutionary", "AGI", etc.
 *
 * Criterios "Carnita" agregados (Prompt 17-A):
 * - Profundidad Analítica (0-25 pts): Potencial para análisis humano
 * - Controversia (0-20 pts): Potencial de debate
 * - Contenido Sustantivo (0-15 pts): Penaliza clickbait
 *
 * Umbral mínimo para publicar: 75 pts (antes 60)
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
 * @version 2.0.0
 * @since Prompt 11
 * @updated Prompt 17-A - Refactorización "Carnita Score"
 */

import { NewsItem } from './types/news.types';
import { NewsScore, NewsType, PUBLISH_THRESHOLD } from './types/scoring.types';
import {
  COMPANY_SCORES,
  NEWS_TYPE_SCORES,
  ENGAGEMENT_THRESHOLDS,
  HIGH_IMPACT_KEYWORDS,
  FRESHNESS_THRESHOLDS,
  FRESHNESS_SCORES,
  // Nuevos imports Prompt 17-A
  ANALYTICAL_KEYWORDS,
  CONTROVERSY_KEYWORDS,
  CLICKBAIT_INDICATORS,
  HIGH_IMPACT_ENTITIES,
} from './config/scoring-rules';

// =============================================================================
// FUNCIÓN PRINCIPAL DE SCORING
// =============================================================================

/**
 * Calcula el score total de una noticia ("Carnita Score")
 *
 * Evalúa la noticia en 8 categorías y devuelve el score total
 * junto con el desglose por categoría.
 *
 * @param news - Noticia a evaluar
 * @returns Score total, desglose, isPublishable, ángulos sugeridos
 *
 * @example
 * ```typescript
 * const score = scoreNews({
 *   id: '1',
 *   title: 'OpenAI launches GPT-5 with implications for the future',
 *   company: 'OpenAI',
 *   type: 'product-launch',
 *   publishedAt: new Date(),
 *   ...
 * });
 * console.log(score.totalScore); // 85
 * console.log(score.isPublishable); // true (>= 75)
 * ```
 */
export function scoreNews(news: NewsItem): NewsScore {
  // Arrays para acumular razones y ángulos
  const reasons: string[] = [];
  const suggestedAngles: string[] = [];

  // Combinar texto para análisis
  const fullText = `${news.title} ${news.description || ''}`.toLowerCase();

  // Calcular score de cada categoría (original Prompt 11)
  const companyRelevance = calculateCompanyScore(news.company);
  const newsType = calculateTypeScore(news.type);
  const engagement = calculateEngagementScore(news.metrics);
  const freshness = calculateFreshnessScore(news.publishedAt);
  const impact = estimateImpact(news);

  // Calcular nuevos criterios "Carnita" (Prompt 17-A)
  const analyticalDepth = calculateAnalyticalDepth(fullText, news, reasons, suggestedAngles);
  const controversyPotential = calculateControversyPotential(fullText, reasons, suggestedAngles);
  const substantiveContent = calculateSubstantiveContent(fullText, news, reasons);

  // Agregar razones de los criterios originales
  if (companyRelevance >= 10) reasons.push(`Empresa Tier 1: ${news.company}`);
  else if (companyRelevance >= 8) reasons.push(`Empresa Tier 2: ${news.company}`);
  if (newsType >= 8) reasons.push(`Tipo de noticia alto valor: ${news.type}`);
  if (engagement >= 5) reasons.push(`Alto engagement: ${news.metrics?.views || 0} views`);
  if (freshness >= 2) reasons.push('Noticia reciente');
  if (impact >= 4) reasons.push('Keywords de alto impacto detectadas');

  const breakdown = {
    companyRelevance,
    newsType,
    engagement,
    freshness,
    impact,
    analyticalDepth,
    controversyPotential,
    substantiveContent,
  };

  // Sumar todos los scores
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  const isPublishable = totalScore >= PUBLISH_THRESHOLD;

  return {
    newsId: news.id,
    title: news.title,
    totalScore,
    breakdown,
    rankedAt: new Date(),
    isPublishable,
    suggestedAngles: [...new Set(suggestedAngles)], // Eliminar duplicados
    reasons,
  };
}

// =============================================================================
// FUNCIONES DE CÁLCULO - CRITERIOS ORIGINALES (Prompt 11)
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
 * Calcula score por engagement (views genéricos)
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
 *
 * @updated Prompt 17-A - Usa metrics.views en lugar de twitterViews
 */
function calculateEngagementScore(metrics?: {
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  redditUpvotes?: number;
}): number {
  // Sin métricas = 0 puntos
  if (!metrics) return 0;

  // Usar views como métrica principal (genérico, no específico de Twitter)
  const views = metrics.views || 0;

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
// FUNCIONES DE CÁLCULO - CRITERIOS "CARNITA" (Prompt 17-A)
// =============================================================================

/**
 * Calcula profundidad analítica potencial (0-25 pts)
 *
 * Evalúa si la noticia tiene sustancia para análisis humano profundo.
 * - +3 pts por keyword analítica (máx 15)
 * - +5 pts bonus por comparaciones/competencia
 * - +5 pts bonus por implicaciones futuras
 *
 * @param text - Texto combinado de la noticia (lowercase)
 * @param news - Noticia original
 * @param reasons - Array para agregar razones
 * @param angles - Array para agregar ángulos sugeridos
 * @returns Score de 0-25
 *
 * @since Prompt 17-A
 */
function calculateAnalyticalDepth(
  text: string,
  news: NewsItem,
  reasons: string[],
  angles: string[]
): number {
  let score = 0;

  // Contar keywords analíticas
  const matches = ANALYTICAL_KEYWORDS.filter(kw => text.includes(kw.toLowerCase()));
  score += Math.min(matches.length * 3, 15);

  if (matches.length > 0) {
    reasons.push(`${matches.length} términos de profundidad analítica`);
  }

  // Bonus si menciona comparaciones o competencia
  if (text.includes('vs') || text.includes('versus') || text.includes('comparado') || text.includes('compared')) {
    score += 5;
    angles.push('Análisis comparativo con competidores');
  }

  // Bonus si tiene implicaciones futuras
  if (text.includes('futuro') || text.includes('future') || text.includes('próximo') || text.includes('implications')) {
    score += 5;
    angles.push('Implicaciones para el futuro de la industria');
  }

  // Bonus por entidades de alto impacto mencionadas
  const entityMatches = HIGH_IMPACT_ENTITIES.filter(entity =>
    text.includes(entity.toLowerCase())
  );
  if (entityMatches.length >= 2) {
    score += 3;
    reasons.push(`Múltiples entidades de impacto: ${entityMatches.slice(0, 3).join(', ')}`);
  }

  return Math.min(score, 25);
}

/**
 * Calcula potencial de controversia/debate (0-20 pts)
 *
 * Evalúa si la noticia genera discusión interesante.
 * - +4 pts por keyword de controversia (máx 15)
 * - +5 pts bonus por críticas/problemas
 *
 * @param text - Texto combinado de la noticia (lowercase)
 * @param reasons - Array para agregar razones
 * @param angles - Array para agregar ángulos sugeridos
 * @returns Score de 0-20
 *
 * @since Prompt 17-A
 */
function calculateControversyPotential(
  text: string,
  reasons: string[],
  angles: string[]
): number {
  let score = 0;

  const matches = CONTROVERSY_KEYWORDS.filter(kw => text.includes(kw.toLowerCase()));
  score += Math.min(matches.length * 4, 15);

  if (matches.length > 0) {
    reasons.push(`Potencial de debate: ${matches.slice(0, 3).join(', ')}`);
    angles.push('Perspectivas encontradas sobre el tema');
  }

  // Bonus si menciona críticas o problemas
  if (text.includes('crítica') || text.includes('criticism') || text.includes('problema') || text.includes('problem')) {
    score += 5;
    angles.push('Análisis crítico de las limitaciones');
  }

  return Math.min(score, 20);
}

/**
 * Calcula contenido sustantivo vs clickbait (0-15 pts)
 *
 * Empieza con 15 pts y resta por indicadores de clickbait.
 * Bonus por contenido largo y sustancial.
 *
 * @param text - Texto combinado de la noticia (lowercase)
 * @param news - Noticia original
 * @param reasons - Array para agregar razones
 * @returns Score de 0-15
 *
 * @since Prompt 17-A
 */
function calculateSubstantiveContent(
  text: string,
  news: NewsItem,
  reasons: string[]
): number {
  let score = 15; // Empezar con máximo y restar por clickbait

  // Penalizar indicadores de clickbait
  const clickbaitMatches = CLICKBAIT_INDICATORS.filter(ind =>
    text.includes(ind.toLowerCase())
  );
  score -= clickbaitMatches.length * 3;

  if (clickbaitMatches.length > 0) {
    reasons.push(`Clickbait detectado: -${clickbaitMatches.length * 3} pts`);
  }

  // Bonus por contenido largo (más sustancia)
  const contentLength = (news.description || '').length;
  if (contentLength > 500) {
    score += 3;
    reasons.push('Contenido sustancial (> 500 caracteres)');
  } else if (contentLength < 100) {
    score -= 3;
    reasons.push('Contenido muy corto (< 100 caracteres)');
  }

  return Math.max(0, Math.min(score, 15));
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
 * @param minScore - Score mínimo requerido (default: PUBLISH_THRESHOLD)
 * @returns Noticias que superan el umbral, ordenadas por score
 */
export function filterByScore(
  newsItems: NewsItem[],
  minScore: number = PUBLISH_THRESHOLD
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

/**
 * Selecciona la mejor noticia que sea publicable (score >= 75)
 *
 * @param newsItems - Array de noticias
 * @returns Noticia publicable con mayor score, o null
 *
 * @since Prompt 17-A
 */
export function selectPublishableNews(
  newsItems: NewsItem[]
): { news: NewsItem; score: NewsScore } | null {
  const publishable = filterByScore(newsItems, PUBLISH_THRESHOLD);

  if (publishable.length === 0) return null;

  return publishable[0];
}

/**
 * Selecciona la mejor noticia excluyendo noticias previamente publicadas
 *
 * Filtra noticias duplicadas ANTES de rankear usando un filtro
 * proporcionado por PublishedNewsTracker. Las funciones existentes
 * (selectTopNews, selectPublishableNews) permanecen sin cambios.
 *
 * @param newsItems - Array de noticias
 * @param excludeFilter - Funcion que retorna true si la noticia debe excluirse
 * @returns Noticia con mayor score que no sea duplicada, o null
 *
 * @since Prompt 21
 */
export function selectTopNewsExcluding(
  newsItems: NewsItem[],
  excludeFilter: (newsId: string, title: string, company?: string, productName?: string) => boolean,
): { news: NewsItem; score: NewsScore } | null {
  if (newsItems.length === 0) return null;

  // Filtrar noticias ya publicadas antes de rankear
  const filteredItems = newsItems.filter(
    item => !excludeFilter(item.id, item.title, item.company, item.productName),
  );

  if (filteredItems.length === 0) return null;

  // Rankear solo las noticias no duplicadas
  const ranked = rankNews(filteredItems);
  const topScore = ranked[0];
  const topNews = filteredItems.find(n => n.id === topScore.newsId);

  if (!topNews) return null;

  return { news: topNews, score: topScore };
}

// Exports por defecto para facilitar imports
export default {
  scoreNews,
  rankNews,
  selectTopNews,
  selectTopNewsExcluding,
  filterByScore,
  selectPublishableNews,
  PUBLISH_THRESHOLD,
};
