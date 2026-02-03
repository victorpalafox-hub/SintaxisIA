/**
 * @fileoverview Image Orchestration Service - Prompt 19.1
 *
 * Busca 1 imagen por cada segmento del script usando cascade de proveedores.
 * Implementa rate limiting y fallbacks robustos.
 *
 * Cascade de proveedores:
 * 1. Pexels (portrait, alta calidad tech)
 * 2. Unsplash (fallback de calidad)
 * 3. Google Custom Search (si configurado)
 * 4. UI Avatars (fallback garantizado)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.1
 */

import { logger } from '../../utils/logger';
import { searchPexels, isPexelsConfigured } from '../image-providers/pexels-provider';
import { searchUnsplash } from '../image-providers/unsplash-provider';
import { searchGoogle } from '../image-providers/google-provider';
import type { SceneSegment, SceneImage, SceneImageSource, DynamicImagesResult } from '../types/image.types';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/**
 * Delay entre búsquedas (ms) para rate limiting
 * 350ms = ~3 requests/segundo (seguro para free tiers)
 */
const RATE_LIMIT_DELAY_MS = 350;

/**
 * URL base para fallback de UI Avatars
 */
const UI_AVATARS_BASE = 'https://ui-avatars.com/api';

/**
 * Colores cyberpunk para fallback
 */
const FALLBACK_COLORS = [
  { bg: '00F0FF', fg: '000000' }, // Cyan
  { bg: 'FF00FF', fg: 'FFFFFF' }, // Magenta
  { bg: '00FF00', fg: '000000' }, // Green
  { bg: 'FF6600', fg: 'FFFFFF' }, // Orange
];

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
   * Busca imagen con cascade de proveedores
   *
   * @param segment - Segmento a buscar
   * @returns Imagen encontrada (nunca falla, tiene fallback garantizado)
   */
  private async searchWithFallback(segment: SceneSegment): Promise<SceneImage> {
    const { index, startSecond, endSecond, searchQuery, keywords } = segment;

    // 1. Intentar Pexels (principal)
    if (isPexelsConfigured()) {
      const pexelsUrl = await searchPexels(searchQuery, 'portrait');
      if (pexelsUrl) {
        return this.createSceneImage(index, startSecond, endSecond, pexelsUrl, searchQuery, 'pexels');
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

    // 4. Intentar con query simplificada
    const simplifiedQuery = keywords.slice(0, 2).join(' ') + ' technology';
    if (isPexelsConfigured()) {
      const pexelsSimple = await searchPexels(simplifiedQuery, 'portrait');
      if (pexelsSimple) {
        return this.createSceneImage(index, startSecond, endSecond, pexelsSimple, simplifiedQuery, 'pexels');
      }
    }

    // 5. Fallback garantizado: UI Avatars
    const fallbackUrl = this.generateFallbackImage(keywords, index);
    return this.createSceneImage(index, startSecond, endSecond, fallbackUrl, searchQuery, 'fallback');
  }

  /**
   * Crea objeto SceneImage
   */
  private createSceneImage(
    sceneIndex: number,
    startSecond: number,
    endSecond: number,
    imageUrl: string,
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
   * Genera imagen fallback con UI Avatars
   *
   * @param keywords - Keywords para generar iniciales
   * @param index - Índice para seleccionar color
   * @returns URL de imagen fallback
   */
  private generateFallbackImage(keywords: string[], index: number): string {
    // Obtener inicial de primera keyword
    const initial = keywords.length > 0
      ? keywords[0].charAt(0).toUpperCase()
      : 'AI';

    // Seleccionar color según índice
    const color = FALLBACK_COLORS[index % FALLBACK_COLORS.length];

    // Generar URL
    return `${UI_AVATARS_BASE}/?name=${encodeURIComponent(initial)}&size=800&background=${color.bg}&color=${color.fg}&bold=true&format=png`;
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
