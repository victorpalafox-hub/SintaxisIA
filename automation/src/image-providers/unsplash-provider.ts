/**
 * @fileoverview Unsplash Provider
 *
 * Busca imágenes de alta calidad en Unsplash.
 * Requiere Access Key (free tier disponible).
 *
 * Free tier: 50 requests/hora
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

import axios from 'axios';
import { IMAGE_API_CONFIG } from '../config/image-sources';

/**
 * Busca imágenes en Unsplash
 *
 * @param query - Término de búsqueda
 * @returns URL de la primera imagen (regular quality) o null
 *
 * @example
 * const url = await searchUnsplash('artificial intelligence');
 */
export async function searchUnsplash(query: string): Promise<string | null> {
  try {
    const accessKey = IMAGE_API_CONFIG.unsplash.accessKey;

    if (!accessKey) {
      // No configurado - no es error, es opcional
      return null;
    }

    const response = await axios.get(
      `${IMAGE_API_CONFIG.unsplash.baseUrl}/search/photos`,
      {
        params: {
          query,
          per_page: 5,
          orientation: 'landscape',
          content_filter: 'high', // Solo contenido apropiado
        },
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        timeout: IMAGE_API_CONFIG.unsplash.timeout,
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      // Retornar primera imagen (regular quality - buen balance tamaño/calidad)
      return response.data.results[0].urls.regular;
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number } };
    if (axiosError.response?.status === 403) {
      console.warn('Unsplash: Rate limit excedido');
    }
  }

  return null;
}

export default searchUnsplash;
