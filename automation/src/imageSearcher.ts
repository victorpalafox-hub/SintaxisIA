// ===================================
// IMAGE SEARCHER - Búsqueda automática de imágenes/logos
// ===================================

import { imageConfig, ImageSource } from './imageConfig';
import { imageCache } from './imageCache';
import {
  ImageResult,
  ImageSearchOptions,
  BatchImageResult,
} from './types/imageSearch';
import { logger } from '../utils/logger';

/**
 * BÚSQUEDA AUTOMÁTICA DE IMÁGENES
 * Sistema multi-fuente con fallback inteligente
 */

// ===================================
// FUNCIÓN PRINCIPAL
// ===================================

/**
 * Busca imagen/logo para una entidad
 * @param options - Opciones de búsqueda
 * @returns ImageResult con URL de imagen
 */
export async function searchEntityImage(
  options: ImageSearchOptions
): Promise<ImageResult> {

  const { entityName, skipCache, verifyExists } = options;

  logger.info(`🖼️  Buscando imagen para: ${entityName}`);

  // 1. Intentar obtener del cache
  if (!skipCache) {
    const cachedUrl = imageCache.get(entityName);
    if (cachedUrl) {
      return {
        url: cachedUrl,
        source: 'cache',
        entityName,
        verified: true,
        timestamp: Date.now(),
      };
    }
  }

  // 2. Obtener dominio de la entidad
  const domain = getDomainForEntity(entityName);

  if (!domain) {
    logger.warn(`   ⚠️  No se encontró dominio para: ${entityName}`);
    return generateFallbackImage(entityName);
  }

  logger.info(`   Dominio: ${domain}`);

  // 3. Intentar cada fuente en orden de prioridad
  const sources = options.preferredSource
    ? [options.preferredSource, ...imageConfig.sources.filter(s => s !== options.preferredSource)]
    : [...imageConfig.sources];

  for (const source of sources) {
    try {
      logger.info(`   Intentando: ${source}...`);

      const url = await fetchImageFromSource(source, entityName, domain);

      if (url) {
        // Verificar que la URL funciona (opcional)
        if (verifyExists ?? imageConfig.validation.verifyImage) {
          const exists = await verifyImageExists(url);
          if (!exists) {
            logger.warn(`   ⚠️  URL no válida: ${url}`);
            continue;
          }
        }

        logger.success(`   ✅ Imagen encontrada: ${source}`);

        // Cachear resultado
        imageCache.set(entityName, url, source);

        return {
          url,
          source,
          entityName,
          domain,
          verified: true,
          timestamp: Date.now(),
        };
      }

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`   ⚠️  ${source} falló: ${msg}`);
      continue;
    }
  }

  // 4. Si ninguna fuente funcionó, generar fallback
  logger.warn(`   ⚠️  Ninguna fuente funcionó, usando fallback`);
  return generateFallbackImage(entityName);
}

// ===================================
// RESOLUCIÓN DE DOMINIOS
// ===================================

/**
 * Obtiene dominio para una entidad
 */
function getDomainForEntity(entityName: string): string | null {
  const normalized = entityName.toLowerCase().trim();

  // Buscar coincidencia exacta en mapa de dominios
  if (imageConfig.domainMap[normalized]) {
    return imageConfig.domainMap[normalized];
  }

  // Buscar coincidencia parcial
  for (const [key, domain] of Object.entries(imageConfig.domainMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return domain;
    }
  }

  // Generar dominio automáticamente (entidad.com)
  const autoDomain = `${normalized.replace(/\s+/g, '')}.com`;
  logger.info(`   Dominio auto-generado: ${autoDomain}`);

  return autoDomain;
}

// ===================================
// FUENTES DE IMÁGENES
// ===================================

/**
 * Obtiene imagen de una fuente específica
 */
async function fetchImageFromSource(
  source: ImageSource,
  entityName: string,
  domain: string
): Promise<string | null> {

  switch (source) {
    case 'clearbit':
      return fetchFromClearbit(domain);

    case 'logo-dev':
      return fetchFromLogoDev(domain);

    case 'ui-avatars':
      return generateFromUIAvatars(entityName);

    default:
      return null;
  }
}

/**
 * Clearbit Logo API
 * API gratuita para logos de empresas
 */
async function fetchFromClearbit(domain: string): Promise<string | null> {
  const { baseUrl, timeout } = imageConfig.apis.clearbit;
  const url = `${baseUrl}/${domain}`;

  try {
    // HEAD request para verificar sin descargar
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return url;
    }
  } catch (error) {
    // 404 o timeout - ignorar
  }

  return null;
}

/**
 * Logo.dev API
 * API gratuita alternativa para logos
 */
async function fetchFromLogoDev(domain: string): Promise<string | null> {
  const { baseUrl, size, timeout } = imageConfig.apis.logoDev;
  const url = `${baseUrl}/${domain}${size || ''}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return url;
    }
  } catch (error) {
    // Error - ignorar
  }

  return null;
}

/**
 * UI Avatars (siempre funciona)
 * Genera placeholder con iniciales
 */
function generateFromUIAvatars(entityName: string): string {
  const { baseUrl, format, defaultSize, defaultBg, defaultColor } = imageConfig.apis.uiAvatars;

  const name = encodeURIComponent(entityName);
  const url = `${baseUrl}${format}`
    .replace('{name}', name)
    .replace('{size}', defaultSize.toString())
    .replace('{bg}', defaultBg)
    .replace('{color}', defaultColor);

  return url;
}

// ===================================
// VERIFICACIÓN Y FALLBACK
// ===================================

/**
 * Verifica que una URL de imagen existe
 */
async function verifyImageExists(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), imageConfig.validation.timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response.ok;

  } catch (error) {
    return false;
  }
}

/**
 * Genera imagen de fallback
 */
function generateFallbackImage(entityName: string): ImageResult {
  const url = imageConfig.fallback.genericImageUrl || generateFromUIAvatars(entityName);

  // Cachear el fallback también
  imageCache.set(entityName, url, 'ui-avatars');

  return {
    url,
    source: 'fallback',
    entityName,
    verified: false,
    timestamp: Date.now(),
  };
}

// ===================================
// FUNCIONES DE BATCH Y PRELOAD
// ===================================

/**
 * Búsqueda batch (múltiples entidades)
 */
export async function searchMultipleImages(
  entities: string[]
): Promise<BatchImageResult> {

  logger.info(`🖼️  Búsqueda batch: ${entities.length} entidades`);

  const results = await Promise.all(
    entities.map(entity =>
      searchEntityImage({ entityName: entity })
    )
  );

  const successful = results.filter(r => r.source !== 'fallback').length;
  const failed = results.length - successful;

  logger.success(`✅ ${successful}/${entities.length} imágenes encontradas`);

  return {
    successful,
    failed,
    results,
  };
}

/**
 * Pre-cargar imágenes comunes al inicio
 */
export async function preloadCommonLogos(): Promise<void> {
  const commonEntities = [
    'OpenAI', 'Anthropic', 'Google', 'Microsoft',
    'Cursor', 'GitHub', 'Claude', 'ChatGPT',
    'Meta', 'NVIDIA', 'Amazon', 'Apple',
  ];

  logger.info('🔄 Pre-cargando logos comunes...');

  await searchMultipleImages(commonEntities);

  logger.success('✅ Logos comunes cargados en cache');
}

/**
 * Obtiene URL directa para una entidad (función simplificada)
 */
export async function getImageUrl(entityName: string): Promise<string> {
  const result = await searchEntityImage({ entityName });
  return result.url;
}

/**
 * Verifica si una entidad tiene dominio conocido
 */
export function hasKnownDomain(entityName: string): boolean {
  const normalized = entityName.toLowerCase().trim();
  return normalized in imageConfig.domainMap;
}

// ===================================
// EXPORTS
// ===================================

export {
  ImageResult,
  ImageSearchOptions,
  BatchImageResult,
};

export default searchEntityImage;
