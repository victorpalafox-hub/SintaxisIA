/**
 * @fileoverview Image Searcher v2 - Búsqueda Inteligente de Imágenes
 *
 * Sistema de cascada con múltiples proveedores y fallback robusto.
 *
 * Búsqueda por video (3 imágenes):
 * 1. HERO (0-8s): Logo empresa/producto
 * 2. CONTEXT (8-45s): Screenshot/demo
 * 3. OUTRO (45-55s): Logo "Sintaxis IA" (hardcoded en componente)
 *
 * Estrategia HERO:
 * Clearbit → Logo.dev → Google → Unsplash → UI Avatars (fallback garantizado)
 *
 * Estrategia CONTEXT:
 * OpenGraph → Google → Unsplash → Hero duplicate (fallback)
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 12
 */

import {
  searchClearbit,
  searchLogodev,
  searchGoogle,
  searchUnsplash,
  searchOpenGraph,
} from './image-providers';
import { isCached, cacheImage } from './utils/image-cache';
import {
  ImageSearchParams,
  ImageSearchResult,
  HeroImageResult,
  ContextImageResult,
} from './types/image.types';

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Busca imágenes específicas para la noticia
 *
 * Implementa sistema de cascada con múltiples proveedores
 * y fallback garantizado para imagen HERO.
 *
 * @param params - Parámetros de búsqueda (topics, company, productName, etc.)
 * @returns Resultado con URLs de imágenes (hero + context)
 *
 * @example
 * const result = await searchImagesV2({
 *   topics: ['Google', 'AI', 'Genie'],
 *   company: 'Google',
 *   productName: 'Project Genie',
 * });
 * console.log(result.hero.url); // URL del logo
 * console.log(result.context?.url); // URL del screenshot (opcional)
 */
export async function searchImagesV2(
  params: ImageSearchParams
): Promise<ImageSearchResult> {
  const { topics, company, productName, officialUrl } = params;

  console.log('🔍 Buscando imágenes...');
  console.log(`   Topics: ${topics.join(', ')}`);
  console.log(`   Company: ${company || 'N/A'}`);
  console.log(`   Product: ${productName || 'N/A'}`);

  // Buscar imagen HERO (logo empresa/producto)
  const hero = await searchHeroImage(company, topics);
  console.log(`✅ Hero image: ${hero.source}`);

  // Buscar imagen CONTEXT (screenshot, demo)
  const context = await searchContextImage(
    productName,
    officialUrl,
    topics,
    hero.url
  );
  console.log(
    `✅ Context image: ${context?.source || 'usando hero duplicate'}`
  );

  return { hero, context };
}

// =============================================================================
// BÚSQUEDA DE IMAGEN HERO
// =============================================================================

/**
 * Busca imagen HERO (logo empresa/producto)
 *
 * Cascada: Clearbit → Logo.dev → Google → Unsplash → UI Avatars
 * Fallback garantizado: UI Avatars siempre funciona
 *
 * @param company - Nombre de la empresa
 * @param topics - Topics de la noticia
 * @returns Resultado con URL, source y estado de caché
 */
async function searchHeroImage(
  company?: string,
  topics: string[] = []
): Promise<HeroImageResult> {
  // INTENTO 1: Clearbit (logos empresas - gratis)
  if (company) {
    console.log(`   Intento 1/5: Clearbit (${company})...`);
    const url = await searchClearbit(company);
    if (url) {
      const cached = isCached(url);
      return { url, source: 'clearbit', cached };
    }
  }

  // INTENTO 2: Logo.dev (logos alternativos - requiere API key)
  if (company) {
    console.log(`   Intento 2/5: Logo.dev (${company})...`);
    const url = await searchLogodev(company);
    if (url) {
      const cached = isCached(url);
      return { url, source: 'logodev', cached };
    }
  }

  // INTENTO 3: Google Custom Search (logos de alta calidad)
  const logoQuery = company
    ? `${company} logo high quality transparent`
    : `${topics[0]} logo`;

  console.log(`   Intento 3/5: Google ("${logoQuery}")...`);
  const googleUrl = await searchGoogle(logoQuery, 'logo');
  if (googleUrl) {
    const cached = isCached(googleUrl);
    return { url: googleUrl, source: 'google', cached };
  }

  // INTENTO 4: Unsplash (imágenes genéricas pero de calidad)
  const unsplashQuery = company || topics[0] || 'artificial intelligence';
  console.log(`   Intento 4/5: Unsplash ("${unsplashQuery}")...`);
  const unsplashUrl = await searchUnsplash(unsplashQuery);
  if (unsplashUrl) {
    const cached = isCached(unsplashUrl);
    return { url: unsplashUrl, source: 'unsplash', cached };
  }

  // FALLBACK GARANTIZADO: UI Avatars (siempre funciona)
  console.log(`   Intento 5/5: UI Avatars (fallback)...`);
  const initial =
    company?.[0]?.toUpperCase() || topics[0]?.[0]?.toUpperCase() || 'AI';
  const fallbackUrl =
    `https://ui-avatars.com/api/?` +
    `name=${encodeURIComponent(initial)}` +
    `&size=400` +
    `&background=00F0FF` + // Cyan cyberpunk
    `&color=000000` + // Negro
    `&bold=true` +
    `&format=png`;

  return { url: fallbackUrl, source: 'ui-avatars', cached: false };
}

// =============================================================================
// BÚSQUEDA DE IMAGEN CONTEXT
// =============================================================================

/**
 * Busca imagen CONTEXT (screenshot, demo, visual)
 *
 * Cascada: OpenGraph → Google → Unsplash → Hero duplicate
 * Fallback: Usa hero image duplicada si no encuentra nada
 *
 * @param productName - Nombre del producto
 * @param officialUrl - URL oficial del anuncio
 * @param topics - Topics de la noticia
 * @param heroUrl - URL de la imagen hero (para fallback)
 * @returns Resultado con URL, source y estado de caché, o undefined
 */
async function searchContextImage(
  productName?: string,
  officialUrl?: string,
  topics: string[] = [],
  heroUrl?: string
): Promise<ContextImageResult | undefined> {
  // INTENTO 1: OpenGraph scraping del URL oficial
  if (officialUrl) {
    console.log(`   Intento 1/4: OpenGraph (${officialUrl})...`);
    const ogImage = await searchOpenGraph(officialUrl);
    if (ogImage) {
      const cached = isCached(ogImage);
      return { url: ogImage, source: 'opengraph', cached };
    }
  }

  // INTENTO 2: Google Custom Search (screenshots, demos)
  const screenshotQuery = productName
    ? `${productName} demo screenshot interface`
    : `${topics.join(' ')} demo screenshot`;

  console.log(`   Intento 2/4: Google ("${screenshotQuery}")...`);
  const googleUrl = await searchGoogle(screenshotQuery, 'screenshot');
  if (googleUrl) {
    const cached = isCached(googleUrl);
    return { url: googleUrl, source: 'google', cached };
  }

  // INTENTO 3: Unsplash (imágenes contextuales de calidad)
  const unsplashQuery = topics.join(' ');
  console.log(`   Intento 3/4: Unsplash ("${unsplashQuery}")...`);
  const unsplashUrl = await searchUnsplash(unsplashQuery);
  if (unsplashUrl) {
    const cached = isCached(unsplashUrl);
    return { url: unsplashUrl, source: 'unsplash', cached };
  }

  // FALLBACK: Usar hero image duplicada
  console.log(`   Intento 4/4: Hero duplicate (fallback)...`);
  if (heroUrl) {
    return { url: heroUrl, source: 'hero-duplicate', cached: isCached(heroUrl) };
  }

  // Último recurso: undefined (video usará solo hero)
  return undefined;
}

// =============================================================================
// DESCARGA Y CACHÉ
// =============================================================================

/**
 * Descarga y cachea las imágenes encontradas
 *
 * @param result - Resultado de búsqueda
 * @returns Resultado actualizado con estado de caché
 */
export async function downloadAndCacheImages(
  result: ImageSearchResult
): Promise<ImageSearchResult> {
  console.log('💾 Descargando y cacheando imágenes...');

  // Cachear hero image
  if (!result.hero.cached) {
    try {
      await cacheImage(result.hero.url);
      result.hero.cached = true;
      console.log('✅ Hero image cacheada');
    } catch (error) {
      console.warn('⚠️ No se pudo cachear hero image');
    }
  }

  // Cachear context image
  if (result.context && !result.context.cached) {
    try {
      await cacheImage(result.context.url);
      result.context.cached = true;
      console.log('✅ Context image cacheada');
    } catch (error) {
      console.warn('⚠️ No se pudo cachear context image');
    }
  }

  return result;
}

// Export por defecto
export default {
  searchImagesV2,
  downloadAndCacheImages,
};
