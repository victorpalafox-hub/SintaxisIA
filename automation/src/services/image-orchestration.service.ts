/**
 * @fileoverview Image Orchestration Service - Prompt 19.1
 *
 * Busca 1 imagen por cada segmento del script usando cascade de proveedores.
 * Implementa rate limiting y fallbacks robustos.
 *
 * Cascade de proveedores:
 * 1. Para logos (__LOGO__): Clearbit → Logo.dev → Google → Pexels → null
 * 2. Para contenido: Pexels(scoring+gate) → Unsplash → Google → Alt1 → Alt2 → Simplified → null
 *
 * @author Sintaxis IA
 * @version 1.3.0
 * @since Prompt 19.1
 * @updated Prompt 19.1.6 - Integración Clearbit/Logo.dev, eliminado sufijo 'technology'
 * @updated Prompt 23 - Scoring inteligente + retry con queries alternativas
 * @updated Prompt 35 - Gate textRelevance, penalty generico, null en vez de UI Avatars
 * @updated Prompt 45 - Gate editorial más estricto para primera imagen (firstImageMinScore: 45)
 */

import { logger } from '../../utils/logger';
import { searchPexels, isPexelsConfigured } from '../image-providers/pexels-provider';
import { searchPexelsMultiple } from '../image-providers/pexels-provider';
import { searchUnsplash } from '../image-providers/unsplash-provider';
import { searchGoogle } from '../image-providers/google-provider';
import { searchClearbit, searchLogodev } from '../image-providers';
import { SmartQueryGenerator } from './smart-query-generator';
import { IMAGE_SCORING_CONFIG, GENERIC_PENALTY_PATTERNS } from '../config/smart-image.config';
import type { SceneSegment, SceneImage, SceneImageSource, DynamicImagesResult, PexelsCandidate } from '../types/image.types';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/**
 * Delay entre búsquedas (ms) para rate limiting
 * 350ms = ~3 requests/segundo (seguro para free tiers)
 */
const RATE_LIMIT_DELAY_MS = 350;

// =============================================================================
// SERVICIO PRINCIPAL
// =============================================================================

/**
 * Servicio de orquestación de búsqueda de imágenes
 *
 * Busca 1 imagen por cada segmento del video usando cascade de proveedores.
 *
 * @example
 * ```typescript
 * const orchestrator = new ImageOrchestrationService();
 * const images = await orchestrator.searchBySegments(segments);
 * // images = [{ sceneIndex: 0, imageUrl: '...', ... }, ...]
 * ```
 */
export class ImageOrchestrationService {
  /** Generador de queries inteligentes para alternativas (Prompt 23) */
  private queryGenerator = new SmartQueryGenerator();

  /**
   * Busca 1 imagen para cada segmento
   *
   * @param segments - Array de segmentos con keywords
   * @returns Array de imágenes, una por segmento
   */
  async searchBySegments(segments: SceneSegment[]): Promise<SceneImage[]> {
    logger.info(`[ImageOrchestration] Buscando imágenes para ${segments.length} segmentos`);

    const results: SceneImage[] = [];

    for (const segment of segments) {
      // Rate limiting: esperar entre búsquedas
      if (results.length > 0) {
        await this.delay(RATE_LIMIT_DELAY_MS);
      }

      logger.info(`[ImageOrchestration] Segmento ${segment.index}: "${segment.searchQuery}"`);

      // Buscar con cascade de fallbacks
      const image = await this.searchWithFallback(segment);
      results.push(image);

      logger.info(`[ImageOrchestration] Segmento ${segment.index}: ${image.source} ✓`);
    }

    logger.info(`[ImageOrchestration] ${results.length} imágenes encontradas`);

    return results;
  }

  /**
   * Genera resultado completo con metadata
   *
   * @param segments - Segmentos del script
   * @returns Resultado completo con scenes array
   */
  async orchestrate(segments: SceneSegment[]): Promise<DynamicImagesResult> {
    const scenes = await this.searchBySegments(segments);

    return {
      scenes,
      totalSegments: segments.length,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Busca imagen con cascade de proveedores + retry con queries alternativas
   *
   * Detecta señal __LOGO__ para usar cascade especial de logos.
   * Para contenido, usa scoring inteligente y queries alternativas.
   *
   * Cascade contenido (Prompt 23, actualizado Prompt 35):
   * 1. Pexels con scoring + gate (query principal)
   * 2. Unsplash (query principal)
   * 3. Google (query principal)
   * 4. Pexels con scoring + gate (alternativa 1)
   * 5. Pexels con scoring + gate (alternativa 2)
   * 6. Pexels con scoring + gate (query simplificada)
   * 7. null (sin imagen — Prompt 35: mejor sin imagen que imagen genérica)
   *
   * @param segment - Segmento a buscar
   * @returns Imagen encontrada o SceneImage con imageUrl=null si no hay imagen relevante
   *
   * @updated Prompt 19.1.6 - Detecta __LOGO__ para Clearbit/Logo.dev
   * @updated Prompt 23 - Scoring + queries alternativas
   * @updated Prompt 35 - Retorna null en vez de UI Avatars
   */
  private async searchWithFallback(segment: SceneSegment): Promise<SceneImage> {
    const { index, startSecond, endSecond, searchQuery, keywords } = segment;

    // PROMPT 19.1.6: Detectar señal de logo para segmento 0
    // scene-segmenter genera "__LOGO__:company" para usar cascade de logos
    if (searchQuery.startsWith('__LOGO__:')) {
      const company = searchQuery.replace('__LOGO__:', '');
      logger.info(`[ImageOrchestration] Detectada señal __LOGO__ para: ${company}`);
      return this.searchLogoWithCascade(index, startSecond, endSecond, company, keywords);
    }

    // 1. Intentar Pexels con scoring inteligente (Prompt 23)
    if (isPexelsConfigured()) {
      const scoredUrl = await this.searchPexelsWithScoring(searchQuery, searchQuery.split(' '), index);
      if (scoredUrl) {
        return this.createSceneImage(index, startSecond, endSecond, scoredUrl, searchQuery, 'pexels');
      }
    }

    // 2. Intentar Unsplash (fallback 1)
    const unsplashUrl = await searchUnsplash(searchQuery);
    if (unsplashUrl) {
      return this.createSceneImage(index, startSecond, endSecond, unsplashUrl, searchQuery, 'unsplash');
    }

    // 3. Intentar Google (fallback 2)
    const googleUrl = await searchGoogle(searchQuery, 'screenshot');
    if (googleUrl) {
      return this.createSceneImage(index, startSecond, endSecond, googleUrl, searchQuery, 'google');
    }

    // 4-5. Retry con queries alternativas (Prompt 23)
    const smartQueries = this.queryGenerator.generateQueries(keywords, segment.text);
    for (const altQuery of smartQueries.alternatives) {
      if (isPexelsConfigured()) {
        logger.info(`[ImageOrchestration] Retry con alternativa: "${altQuery}"`);
        const altUrl = await this.searchPexelsWithScoring(altQuery, altQuery.split(' '), index);
        if (altUrl) {
          return this.createSceneImage(index, startSecond, endSecond, altUrl, altQuery, 'pexels');
        }
      }
    }

    // 6. Intentar con query simplificada (SIN sufijo genérico - Prompt 19.1.6)
    const translatedKeywords = this.queryGenerator.translateKeywords(keywords);
    const simplifiedQuery = translatedKeywords.slice(0, 2).join(' ');
    if (isPexelsConfigured() && simplifiedQuery !== searchQuery) {
      logger.info(`[ImageOrchestration] Retry simplificada: "${simplifiedQuery}"`);
      const pexelsSimple = await this.searchPexelsWithScoring(simplifiedQuery, simplifiedQuery.split(' '), index);
      if (pexelsSimple) {
        return this.createSceneImage(index, startSecond, endSecond, pexelsSimple, simplifiedQuery, 'pexels');
      }
    }

    // 7. Prompt 35: No forzar imagen genérica — retornar null
    logger.info(`[ImageOrchestration] Sin imagen relevante para segmento ${index}, retornando null`);
    return this.createSceneImage(index, startSecond, endSecond, null, searchQuery, 'none');
  }

  /**
   * Busca en Pexels con scoring inteligente (Prompt 23)
   *
   * En vez de tomar ciegamente el primer resultado, obtiene 5 candidatos
   * y selecciona el mejor según relevancia textual, orientación y resolución.
   *
   * @param query - Query de búsqueda
   * @param queryKeywords - Keywords individuales para scoring de relevancia
   * @returns URL de la mejor imagen o null si ninguna pasa el umbral
   */
  private async searchPexelsWithScoring(
    query: string,
    queryKeywords: string[],
    segmentIndex: number = 99
  ): Promise<string | null> {
    const candidates = await searchPexelsMultiple(
      query,
      IMAGE_SCORING_CONFIG.candidateCount,
      'portrait'
    );

    if (candidates.length === 0) {
      return null;
    }

    // Calcular score para cada candidato
    let bestCandidate: PexelsCandidate | null = null;
    let bestScore = -1;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const score = this.scoreCandidate(candidate, queryKeywords, i);

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    // Prompt 45: Primer imagen requiere score más alto (45 vs 35)
    const minScore = segmentIndex <= 1
      ? IMAGE_SCORING_CONFIG.firstImageMinScore
      : IMAGE_SCORING_CONFIG.minimumScore;
    if (bestCandidate && bestScore >= minScore) {
      logger.info(`[ImageOrchestration] Pexels scoring: mejor=${bestScore.toFixed(0)}/66 (${bestCandidate.alt.substring(0, 40)})`);
      return bestCandidate.url;
    }

    logger.info(`[ImageOrchestration] Pexels scoring: ningún candidato supera umbral (mejor=${bestScore.toFixed(0)})`);
    return null;
  }

  /**
   * Calcula score de un candidato de Pexels (0-66)
   *
   * Prompt 35: textRelevance es GATE obligatorio. Si el score de relevancia
   * textual es menor a minTextRelevance, retorna 0 inmediatamente.
   * Esto hace IMPOSIBLE que una imagen sin keywords relevantes pase el filtro.
   *
   * Criterios:
   * - textRelevance (50pts): cuántas keywords aparecen en alt text (GATE)
   * - orientationBonus (6pts): portrait preferido para YouTube Shorts
   * - resolution (6pts): resolución por ancho
   * - positionBonus (4pts): posición en resultados de Pexels
   * - genericPenalty (-20pts): penalización por alt text genérico
   *
   * @param candidate - Candidato a evaluar
   * @param queryKeywords - Keywords para matching
   * @param position - Posición en resultados (0 = primero)
   * @returns Score 0-66 (0 si no pasa el gate de textRelevance)
   *
   * @updated Prompt 35 - Gate + penalty + pesos rebalanceados
   */
  private scoreCandidate(
    candidate: PexelsCandidate,
    queryKeywords: string[],
    position: number
  ): number {
    const weights = IMAGE_SCORING_CONFIG.weights;

    // 1. Relevancia textual (50pts): keywords en alt text
    let textScore = 0;
    if (candidate.alt && queryKeywords.length > 0) {
      const altLower = candidate.alt.toLowerCase();
      const matchCount = queryKeywords.filter(kw =>
        altLower.includes(kw.toLowerCase())
      ).length;
      const matchRatio = matchCount / queryKeywords.length;
      textScore = matchRatio * weights.textRelevance;
    }

    // GATE (Prompt 35): Si textRelevance < minimo, rechazar inmediatamente
    if (textScore < IMAGE_SCORING_CONFIG.minTextRelevance) {
      return 0;
    }

    let score = textScore;

    // 2. Orientación (6pts): portrait preferido
    if (candidate.height > candidate.width) {
      score += weights.orientationBonus;
    } else if (candidate.height === candidate.width) {
      score += weights.orientationBonus * 0.5;
    } else {
      score += weights.orientationBonus * 0.4;
    }

    // 3. Resolución (6pts): escala lineal por ancho
    const minW = IMAGE_SCORING_CONFIG.minimumWidth;
    const idealW = IMAGE_SCORING_CONFIG.idealWidth;
    if (candidate.width >= idealW) {
      score += weights.resolution;
    } else if (candidate.width >= minW) {
      const ratio = (candidate.width - minW) / (idealW - minW);
      score += ratio * weights.resolution;
    }

    // 4. Posición en resultados (4pts): primeros = más relevantes
    const positionScore = Math.max(0, 1 - (position * 0.2));
    score += positionScore * weights.positionBonus;

    // 5. PENALTY (Prompt 35): Imágenes genéricas (-20pts)
    if (candidate.alt) {
      const altText = candidate.alt.toLowerCase();
      const isGeneric = GENERIC_PENALTY_PATTERNS.some(pattern => pattern.test(altText));
      if (isGeneric) {
        score -= weights.genericPenalty;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Cascade especial para logos de empresas
   *
   * Integrado de image-searcher-v2.ts para aprovechar Clearbit y Logo.dev
   * que son mejores para logos que Pexels (fotos de stock).
   *
   * Cascade: Clearbit → Logo.dev → Google → Pexels → UI Avatars
   *
   * @param index - Índice del segmento
   * @param startSecond - Segundo de inicio
   * @param endSecond - Segundo de fin
   * @param company - Nombre de la empresa
   * @param keywords - Keywords para fallback
   * @returns Imagen de logo
   *
   * @since Prompt 19.1.6
   */
  private async searchLogoWithCascade(
    index: number,
    startSecond: number,
    endSecond: number,
    company: string,
    keywords: string[]
  ): Promise<SceneImage> {
    const logoQuery = `${company} logo`;

    // 1. Clearbit (mejor para logos de empresas conocidas)
    logger.info(`[ImageOrchestration] Intentando Clearbit para: ${company}`);
    const clearbitUrl = await searchClearbit(company);
    if (clearbitUrl) {
      return this.createSceneImage(index, startSecond, endSecond, clearbitUrl, logoQuery, 'clearbit');
    }

    // 2. Logo.dev (alternativa para logos)
    logger.info(`[ImageOrchestration] Intentando Logo.dev para: ${company}`);
    const logodevUrl = await searchLogodev(company);
    if (logodevUrl) {
      return this.createSceneImage(index, startSecond, endSecond, logodevUrl, logoQuery, 'logodev');
    }

    // 3. Google con query de logo
    logger.info(`[ImageOrchestration] Intentando Google para: ${logoQuery}`);
    const googleUrl = await searchGoogle(`${company} logo high quality`, 'logo');
    if (googleUrl) {
      return this.createSceneImage(index, startSecond, endSecond, googleUrl, logoQuery, 'google');
    }

    // 4. Pexels como alternativa (busca por nombre de empresa)
    if (isPexelsConfigured()) {
      logger.info(`[ImageOrchestration] Intentando Pexels para: ${company}`);
      const pexelsUrl = await searchPexels(company, 'portrait');
      if (pexelsUrl) {
        return this.createSceneImage(index, startSecond, endSecond, pexelsUrl, company, 'pexels');
      }
    }

    // 5. Prompt 35: No forzar imagen genérica — retornar null
    logger.info(`[ImageOrchestration] Sin logo relevante para: ${company}, retornando null`);
    return this.createSceneImage(index, startSecond, endSecond, null, logoQuery, 'none');
  }

  /**
   * Crea objeto SceneImage
   *
   * @updated Prompt 35 - imageUrl puede ser null (sin imagen relevante)
   */
  private createSceneImage(
    sceneIndex: number,
    startSecond: number,
    endSecond: number,
    imageUrl: string | null,
    query: string,
    source: SceneImageSource
  ): SceneImage {
    return {
      sceneIndex,
      startSecond,
      endSecond,
      imageUrl,
      query,
      source,
      cached: false,
    };
  }

  /**
   * Delay para rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ImageOrchestrationService;
