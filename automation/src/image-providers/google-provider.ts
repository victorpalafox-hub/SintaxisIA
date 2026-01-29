/**
 * @fileoverview Google Custom Search Provider
 *
 * Busca imágenes usando Google Custom Search API.
 * Requiere API key + Search Engine ID.
 *
 * Free tier: 100 búsquedas/día
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

import axios from 'axios';
import { IMAGE_API_CONFIG } from '../config/image-sources';

/**
 * Busca imágenes en Google Custom Search
 *
 * @param query - Término de búsqueda
 * @param type - Tipo de imagen ('logo' o 'screenshot')
 * @returns URL de la primera imagen o null
 *
 * @example
 * const logoUrl = await searchGoogle('OpenAI logo', 'logo');
 * const screenshotUrl = await searchGoogle('GPT-5 demo', 'screenshot');
 */
export async function searchGoogle(
  query: string,
  type: 'logo' | 'screenshot'
): Promise<string | null> {
  try {
    const { apiKey, searchEngineId, baseUrl } = IMAGE_API_CONFIG.google;

    // Validar configuración
    if (!apiKey || !searchEngineId) {
      // No logueamos warning - es opcional
      return null;
    }

    const response = await axios.get(baseUrl, {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: query,
        searchType: 'image',
        num: 5,
        imgSize: type === 'logo' ? 'medium' : 'large',
        imgType: type === 'logo' ? 'clipart' : 'photo',
        safe: 'active',
        fileType: 'jpg,png',
      },
      timeout: IMAGE_API_CONFIG.google.timeout,
    });

    if (response.data.items && response.data.items.length > 0) {
      // Retornar primera imagen
      return response.data.items[0].link;
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number } };
    if (axiosError.response?.status === 429) {
      console.warn('Google Custom Search: Límite de rate excedido');
    }
    // Otros errores no se loguean para evitar ruido
  }

  return null;
}

export default searchGoogle;
