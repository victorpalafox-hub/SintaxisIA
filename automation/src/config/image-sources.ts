/**
 * @fileoverview Configuración de APIs de Imágenes
 *
 * Define endpoints, keys y timeouts para cada proveedor de imágenes.
 * Sistema de cascada con múltiples proveedores y fallback robusto.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

// =============================================================================
// CONFIGURACIÓN DE APIs
// =============================================================================

/**
 * Configuración de APIs de imágenes
 *
 * Cada proveedor tiene su configuración específica.
 * Priority: menor número = mayor prioridad
 */
export const IMAGE_API_CONFIG = {
  /**
   * Clearbit Logo API
   * - Gratis, sin API key
   * - Logos de alta calidad
   * - Solo empresas con dominio web
   */
  clearbit: {
    baseUrl: 'https://logo.clearbit.com',
    timeout: 3000,
    priority: 1,
  },

  /**
   * Logo.dev API
   * - Requiere API key (free tier disponible)
   * - Más opciones de personalización
   */
  logodev: {
    baseUrl: 'https://img.logo.dev',
    apiKey: process.env.LOGODEV_API_KEY,
    timeout: 3000,
    priority: 2,
  },

  /**
   * Google Custom Search API
   * - Requiere API key + Search Engine ID
   * - Free tier: 100 búsquedas/día
   */
  google: {
    apiKey: process.env.GOOGLE_CUSTOM_SEARCH_KEY,
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
    baseUrl: 'https://www.googleapis.com/customsearch/v1',
    timeout: 5000,
    priority: 3,
  },

  /**
   * Unsplash API
   * - Requiere Access Key (free tier)
   * - Free tier: 50 requests/hora
   * - Fotos de alta calidad
   */
  unsplash: {
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    baseUrl: 'https://api.unsplash.com',
    timeout: 5000,
    priority: 4,
  },

  /**
   * Configuración de caché local
   */
  cache: {
    directory: 'automation/cache/images',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  },
};

// =============================================================================
// MAPEO DE EMPRESAS A DOMINIOS
// =============================================================================

/**
 * Mapeo de empresas conocidas a sus dominios web
 *
 * Se usa para búsqueda de logos en Clearbit y Logo.dev
 * que requieren el dominio de la empresa.
 */
export const COMPANY_DOMAIN_MAP: Record<string, string> = {
  // Tier 1: Gigantes IA (10 pts en scoring)
  'OpenAI': 'openai.com',
  'Google': 'google.com',
  'Google DeepMind': 'deepmind.com',
  'DeepMind': 'deepmind.com',
  'Anthropic': 'anthropic.com',
  'Microsoft': 'microsoft.com',
  'Meta': 'meta.com',
  'Facebook': 'meta.com',
  'Apple': 'apple.com',
  'NVIDIA': 'nvidia.com',
  'Amazon': 'amazon.com',
  'AWS': 'aws.amazon.com',

  // Tier 2: Players importantes (8 pts)
  'xAI': 'x.ai',
  'Mistral AI': 'mistral.ai',
  'Mistral': 'mistral.ai',
  'Cohere': 'cohere.com',
  'Stability AI': 'stability.ai',
  'Midjourney': 'midjourney.com',
  'Runway': 'runwayml.com',
  'Scale AI': 'scale.com',
  'Databricks': 'databricks.com',

  // Tier 3: Startups prometedoras (6 pts)
  'Perplexity': 'perplexity.ai',
  'Perplexity AI': 'perplexity.ai',
  'Character AI': 'character.ai',
  'Character.AI': 'character.ai',
  'Hugging Face': 'huggingface.co',
  'Inflection AI': 'inflection.ai',
  'Adept': 'adept.ai',
  'Adept AI': 'adept.ai',
  'Replicate': 'replicate.com',
  'Together AI': 'together.ai',
  'Anyscale': 'anyscale.com',
  'Groq': 'groq.com',
  'Cerebras': 'cerebras.net',
};

// =============================================================================
// FUNCIONES UTILITARIAS
// =============================================================================

/**
 * Convierte nombre de empresa a dominio web
 *
 * Busca primero en el mapeo conocido, si no encuentra
 * genera un dominio basado en el nombre.
 *
 * @param company - Nombre de la empresa
 * @returns Dominio web (ej: "google.com")
 *
 * @example
 * companyToDomain('Google') // → 'google.com'
 * companyToDomain('OpenAI') // → 'openai.com'
 * companyToDomain('Unknown Company') // → 'unknowncompany.com'
 */
export function companyToDomain(company: string): string {
  // Buscar en mapeo conocido
  if (COMPANY_DOMAIN_MAP[company]) {
    return COMPANY_DOMAIN_MAP[company];
  }

  // Fallback: convertir nombre a dominio
  const normalized = company
    .toLowerCase()
    .replace(/\s+/g, '')           // Quitar espacios
    .replace(/[^a-z0-9]/g, '');    // Quitar caracteres especiales

  return `${normalized}.com`;
}

/**
 * Verifica si una empresa está en el mapeo conocido
 *
 * @param company - Nombre de la empresa
 * @returns true si está mapeada
 */
export function isKnownCompany(company: string): boolean {
  return company in COMPANY_DOMAIN_MAP;
}

/**
 * Obtiene el dominio de una empresa conocida o undefined
 *
 * @param company - Nombre de la empresa
 * @returns Dominio si es conocida, undefined si no
 */
export function getKnownDomain(company: string): string | undefined {
  return COMPANY_DOMAIN_MAP[company];
}
