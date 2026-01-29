/**
 * @fileoverview Clearbit Logo Provider
 *
 * Busca logos de empresas usando Clearbit Logo API.
 * Gratis, sin API key necesaria.
 *
 * Ventajas:
 * - Gratis e ilimitado
 * - Logos de alta calidad
 * - Rápido (CDN global)
 *
 * Limitaciones:
 * - Solo empresas con dominio web
 * - No funciona para productos específicos
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

import axios from 'axios';
import { IMAGE_API_CONFIG, companyToDomain } from '../config/image-sources';

/**
 * Busca logo de empresa en Clearbit
 *
 * @param company - Nombre de la empresa (ej: "Google")
 * @returns URL del logo o null si no encontrado
 *
 * @example
 * const url = await searchClearbit('Google');
 * // → 'https://logo.clearbit.com/google.com'
 */
export async function searchClearbit(company: string): Promise<string | null> {
  try {
    const domain = companyToDomain(company);
    const url = `${IMAGE_API_CONFIG.clearbit.baseUrl}/${domain}`;

    // Verificar que la imagen existe con HEAD request
    // Más eficiente que descargar toda la imagen
    const response = await axios.head(url, {
      timeout: IMAGE_API_CONFIG.clearbit.timeout,
      validateStatus: (status) => status === 200,
    });

    if (response.status === 200) {
      return url;
    }
  } catch (error) {
    // Logo no encontrado, timeout, u otro error
    // No logueamos para evitar ruido - es esperado que falle para empresas desconocidas
  }

  return null;
}

export default searchClearbit;
