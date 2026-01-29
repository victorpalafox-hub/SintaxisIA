/**
 * @fileoverview OpenGraph Provider
 *
 * Extrae imagen og:image de una URL (scraping).
 * Útil para obtener screenshots de anuncios oficiales.
 *
 * No requiere API key - usa scraping directo.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

import axios from 'axios';

/**
 * Extrae imagen OpenGraph de una URL
 *
 * Busca meta tags og:image y twitter:image en el HTML.
 *
 * @param url - URL de la página a scrapear
 * @returns URL de la imagen og:image o null
 *
 * @example
 * const ogImage = await searchOpenGraph('https://openai.com/blog/gpt-5');
 */
export async function searchOpenGraph(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SintaxisIA/1.0)',
      },
      // Solo necesitamos el HTML, no seguir redirects indefinidamente
      maxRedirects: 3,
    });

    const html = response.data;

    // Buscar meta tag og:image (formato más común)
    // <meta property="og:image" content="https://..." />
    const ogImageMatch = html.match(
      /<meta\s+(?:property=["']og:image["']\s+content=["']([^"']+)["']|content=["']([^"']+)["']\s+property=["']og:image["'])/i
    );

    if (ogImageMatch && (ogImageMatch[1] || ogImageMatch[2])) {
      return ogImageMatch[1] || ogImageMatch[2];
    }

    // Alternativa: twitter:image
    // <meta name="twitter:image" content="https://..." />
    const twitterImageMatch = html.match(
      /<meta\s+(?:name=["']twitter:image["']\s+content=["']([^"']+)["']|content=["']([^"']+)["']\s+name=["']twitter:image["'])/i
    );

    if (twitterImageMatch && (twitterImageMatch[1] || twitterImageMatch[2])) {
      return twitterImageMatch[1] || twitterImageMatch[2];
    }
  } catch (error) {
    // URL inaccesible, timeout, o sin og:image
    // No logueamos - es esperado que falle para algunas URLs
  }

  return null;
}

export default searchOpenGraph;
