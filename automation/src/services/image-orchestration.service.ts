/**
 * @fileoverview Image Orchestration Service - Prompt 19.1
 *
 * Busca 1 imagen por cada segmento del script usando cascade de proveedores.
 * Implementa rate limiting y fallbacks robustos.
 *
 * Cascade de proveedores:
 * 1. Para logos (__LOGO__): Clearbit → Logo.dev → Google → Pexels → UI Avatars
 * 2. Para contenido: Pexels → Unsplash → Google → UI Avatars
 *
 * @author Sintaxis IA
 * @version 1.1.0
 * @since Prompt 19.1
 * @updated Prompt 19.1.6 - Integración Clearbit/Logo.dev, eliminado sufijo 'technology'
 */

import { logger } from '../../utils/logger';
import { searchPexels, isPexelsConfigured } from '../image-providers/pexels-provider';
import { searchUnsplash } from '../image-providers/unsplash-provider';
import { searchGoogle } from '../image-providers/google-provider';
import { searchClearbit, searchLogodev } from '../image-providers';
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
 * Colores editoriales para fallback (Prompt 20)
 */
const FALLBACK_COLORS = [
  { bg: '4A9EFF', fg: '000000' }, // Azul primario
  { bg: '38BDF8', fg: '000000' }, // Sky blue
  { bg: '64748B', fg: 'FFFFFF' }, // Slate
  { bg: '0EA5E9', fg: 'FFFFFF' }, // Azul profundo
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
   * Detecta señal __LOGO__ para usar cascade especial de logos.
   *
   * @param segment - Segmento a buscar
   * @returns Imagen encontrada (nunca falla, tiene fallback garantizado)
   *
   * @updated Prompt 19.1.6 - Detecta __LOGO__ para Clearbit/Logo.dev
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

    // 1. Intentar Pexels (principal para contenido)
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

    // 4. Intentar con query simplificada (SIN sufijo genérico - Prompt 19.1.6)
    const simplifiedQuery = keywords.slice(0, 2).join(' ');
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

    // 5. UI Avatars (fallback garantizado)
    logger.info(`[ImageOrchestration] Usando fallback UI Avatars para: ${company}`);
    const fallbackUrl = this.generateFallbackImage([company, ...keywords], index);
    return this.createSceneImage(index, startSecond, endSecond, fallbackUrl, logoQuery, 'fallback');
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
