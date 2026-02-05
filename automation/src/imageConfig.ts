// ===================================
// IMAGE CONFIG - Configuración de búsqueda de imágenes
// ===================================

/**
 * CONFIGURACIÓN DE BÚSQUEDA DE IMÁGENES
 *
 * Sistema de múltiples fuentes con fallback automático
 * Todas las URLs y configuraciones centralizadas aquí
 */

// ===================================
// HELPERS
// ===================================

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// ===================================
// CONFIGURACIÓN PRINCIPAL
// ===================================

export const imageConfig = {
  // ─────────────────────────────────────────────────────────
  // PRIORIDAD DE FUENTES (orden de intento)
  // ─────────────────────────────────────────────────────────

  sources: [
    'clearbit',      // Prioridad 1: Logos oficiales de empresas
    'logo-dev',      // Prioridad 2: Logo.dev API
    'ui-avatars',    // Prioridad 3: Placeholder generado
  ] as const,

  // ─────────────────────────────────────────────────────────
  // APIs GRATUITAS (sin API keys necesarias)
  // ─────────────────────────────────────────────────────────

  apis: {
    // Clearbit Logo API (100% gratis, sin rate limit público)
    clearbit: {
      baseUrl: 'https://logo.clearbit.com',
      format: '{domain}',           // Ejemplo: openai.com
      size: null,                   // No soporta size parameter
      timeout: 3000,                // ms
    },

    // Logo.dev API (gratis, sin API key)
    logoDev: {
      baseUrl: 'https://img.logo.dev',
      format: '{domain}',           // Ejemplo: openai.com
      size: '?size=400',            // Query param para tamaño
      timeout: 3000,
    },

    // UI Avatars (fallback siempre funciona)
    uiAvatars: {
      baseUrl: 'https://ui-avatars.com/api',
      format: '?name={name}&size={size}&background={bg}&color={color}&bold=true',
      defaultSize: 512,
      defaultBg: '4A9EFF',          // Azul editorial (tema Sintaxis IA)
      defaultColor: 'ffffff',        // Blanco
      timeout: 2000,
    },
  },

  // ─────────────────────────────────────────────────────────
  // MAPEO DE ENTIDADES A DOMINIOS
  // ─────────────────────────────────────────────────────────

  domainMap: {
    // Empresas de IA
    'openai': 'openai.com',
    'anthropic': 'anthropic.com',
    'google': 'google.com',
    'microsoft': 'microsoft.com',
    'meta': 'meta.com',
    'apple': 'apple.com',
    'nvidia': 'nvidia.com',
    'amazon': 'amazon.com',
    'deepmind': 'deepmind.com',
    'hugging face': 'huggingface.co',
    'huggingface': 'huggingface.co',
    'stability ai': 'stability.ai',
    'cohere': 'cohere.com',
    'ai21': 'ai21.com',
    'mistral': 'mistral.ai',
    'xai': 'x.ai',
    'inflection': 'inflection.ai',

    // Productos / Herramientas
    'cursor': 'cursor.sh',
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'vercel': 'vercel.com',
    'netlify': 'netlify.com',
    'replit': 'replit.com',
    'windsurf': 'codeium.com',
    'codeium': 'codeium.com',
    'copilot': 'github.com',
    'chatgpt': 'openai.com',
    'claude': 'anthropic.com',
    'gemini': 'google.com',
    'perplexity': 'perplexity.ai',
    'midjourney': 'midjourney.com',
    'runway': 'runwayml.com',
    'replicate': 'replicate.com',
    'jasper': 'jasper.ai',
    'notion': 'notion.so',
    'linear': 'linear.app',
    'figma': 'figma.com',
    'framer': 'framer.com',

    // Cloud & Infrastructure
    'aws': 'aws.amazon.com',
    'azure': 'azure.microsoft.com',
    'gcp': 'cloud.google.com',
    'cloudflare': 'cloudflare.com',
    'digitalocean': 'digitalocean.com',
    'supabase': 'supabase.com',
    'firebase': 'firebase.google.com',
    'mongodb': 'mongodb.com',
    'redis': 'redis.io',
    'docker': 'docker.com',
    'kubernetes': 'kubernetes.io',
  } as Record<string, string>,

  // ─────────────────────────────────────────────────────────
  // CONFIGURACIÓN DE CACHE
  // ─────────────────────────────────────────────────────────

  cache: {
    enabled: process.env.DISABLE_IMAGE_CACHE !== 'true',
    maxSize: getEnvNumber('IMAGE_CACHE_SIZE', 100),
    ttl: getEnvNumber('IMAGE_CACHE_TTL', 86400000), // 24 horas en ms
  },

  // ─────────────────────────────────────────────────────────
  // VALIDACIÓN Y REINTENTOS
  // ─────────────────────────────────────────────────────────

  validation: {
    maxRetries: getEnvNumber('IMAGE_MAX_RETRIES', 2),
    timeout: getEnvNumber('IMAGE_FETCH_TIMEOUT', 5000),
    verifyImage: process.env.VERIFY_IMAGE_EXISTS !== 'false', // true por defecto
  },

  // ─────────────────────────────────────────────────────────
  // FALLBACK / PLACEHOLDER
  // ─────────────────────────────────────────────────────────

  fallback: {
    useGenericPlaceholder: true,
    genericImageUrl: process.env.GENERIC_IMAGE_URL || null,
    placeholderStyle: {
      size: 512,
      background: '4A9EFF',  // Azul editorial Sintaxis IA
      textColor: 'ffffff',
      fontSize: 0.5,          // Proporción del tamaño
    },
  },
};

export type ImageSource = typeof imageConfig.sources[number];

/**
 * Agregar dominio personalizado (útil para extensión futura)
 */
export function addDomainMapping(entity: string, domain: string): void {
  imageConfig.domainMap[entity.toLowerCase()] = domain;
}

/**
 * Obtener todos los dominios mapeados
 */
export function getAllMappedDomains(): Record<string, string> {
  return { ...imageConfig.domainMap };
}

export default imageConfig;
