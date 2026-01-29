/**
 * @fileoverview Logo.dev Provider
 *
 * Alternativa a Clearbit con más opciones de personalización.
 * Requiere API key (free tier disponible).
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

import axios from 'axios';
import { IMAGE_API_CONFIG, companyToDomain } from '../config/image-sources';

/**
 * Busca logo de empresa en Logo.dev
 *
 * @param company - Nombre de la empresa
 * @returns URL del logo o null si no encontrado/no configurado
 *
 * @example
 * const url = await searchLogodev('Google');
 * // → 'https://img.logo.dev/google.com?token=xxx&size=400&format=png'
 */
export async function searchLogodev(company: string): Promise<string | null> {
  try {
    const apiKey = IMAGE_API_CONFIG.logodev.apiKey;

    // Si no hay API key, skip este proveedor
    if (!apiKey) {
      return null;
    }

    const domain = companyToDomain(company);
    const url = `${IMAGE_API_CONFIG.logodev.baseUrl}/${domain}?token=${apiKey}&size=400&format=png`;

    // Verificar que la imagen existe
    const response = await axios.head(url, {
      timeout: IMAGE_API_CONFIG.logodev.timeout,
      validateStatus: (status) => status === 200,
    });

    if (response.status === 200) {
      return url;
    }
  } catch (error) {
    // Logo no encontrado o API key inválida
  }

  return null;
}

export default searchLogodev;
