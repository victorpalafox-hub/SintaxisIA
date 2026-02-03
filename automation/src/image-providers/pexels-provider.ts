/**
 * @fileoverview Pexels Provider - Prompt 19.1
 *
 * Busca imágenes de alta calidad en Pexels.
 * Optimizado para YouTube Shorts (orientación portrait).
 *
 * Free tier: 200 requests/hora
 * Docs: https://www.pexels.com/api/documentation/
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.1
 */

import axios from 'axios';
import { IMAGE_API_CONFIG } from '../config/image-sources';
import { logger } from '../../utils/logger';

/**
 * Resultado de búsqueda de Pexels
 */
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

/**
 * Busca imágenes en Pexels
 *
 * @param query - Término de búsqueda
 * @param orientation - Orientación de imagen ('portrait' para Shorts, 'landscape' para otro)
 * @returns URL de la primera imagen o null
 *
 * @example
 * const url = await searchPexels('artificial intelligence technology');
 * // → 'https://images.pexels.com/photos/...'
 */
export async function searchPexels(
  query: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<string | null> {
  try {
    const apiKey = IMAGE_API_CONFIG.pexels.apiKey;

    if (!apiKey) {
      logger.warn('[Pexels] API key no configurada (PEXELS_API_KEY)');
      return null;
    }

    logger.info(`[Pexels] Buscando: "${query}" (${orientation})`);

    const response = await axios.get<PexelsSearchResponse>(
      `${IMAGE_API_CONFIG.pexels.baseUrl}/search`,
      {
        params: {
          query,
          per_page: 5,
          orientation,
          size: 'large',
        },
        headers: {
          Authorization: apiKey,
        },
        timeout: IMAGE_API_CONFIG.pexels.timeout,
      }
    );

    if (response.data.photos && response.data.photos.length > 0) {
      const photo = response.data.photos[0];

      // Seleccionar la mejor resolución según orientación
      const imageUrl = orientation === 'portrait'
        ? photo.src.portrait || photo.src.large2x
        : photo.src.landscape || photo.src.large2x;

      logger.info(`[Pexels] Encontrada: ${photo.alt || 'imagen'} (${photo.width}x${photo.height})`);

      return imageUrl;
    }

    logger.info(`[Pexels] Sin resultados para: "${query}"`);
    return null;
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number; data?: { error?: string } } };

    if (axiosError.response?.status === 429) {
      logger.warn('[Pexels] Rate limit excedido (200 req/hora)');
    } else if (axiosError.response?.status === 401) {
      logger.error('[Pexels] API key inválida');
    } else {
      logger.error(`[Pexels] Error: ${axiosError.response?.status || 'desconocido'}`);
    }

    return null;
  }
}

/**
 * Busca múltiples imágenes en Pexels (para variedad)
 *
 * @param query - Término de búsqueda
 * @param count - Número de imágenes a retornar
 * @param orientation - Orientación de imagen
 * @returns Array de URLs de imágenes
 */
export async function searchPexelsMultiple(
  query: string,
  count: number = 3,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<string[]> {
  try {
    const apiKey = IMAGE_API_CONFIG.pexels.apiKey;

    if (!apiKey) {
      return [];
    }

    const response = await axios.get<PexelsSearchResponse>(
      `${IMAGE_API_CONFIG.pexels.baseUrl}/search`,
      {
        params: {
          query,
          per_page: count,
          orientation,
          size: 'large',
        },
        headers: {
          Authorization: apiKey,
        },
        timeout: IMAGE_API_CONFIG.pexels.timeout,
      }
    );

    if (response.data.photos && response.data.photos.length > 0) {
      return response.data.photos.map(photo =>
        orientation === 'portrait'
          ? photo.src.portrait || photo.src.large2x
          : photo.src.landscape || photo.src.large2x
      );
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Verifica si Pexels está configurado y disponible
 *
 * @returns true si Pexels está disponible
 */
export function isPexelsConfigured(): boolean {
  return !!IMAGE_API_CONFIG.pexels.apiKey;
}

export default searchPexels;
