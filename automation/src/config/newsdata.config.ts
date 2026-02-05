/**
 * @fileoverview Configuración de NewsData.io y Enriquecimiento de Noticias
 *
 * Centraliza la configuración para:
 * - Query de búsqueda de noticias (antes hardcodeada en newsAPI.ts)
 * - Límites de consulta
 * - Patrones para detectar tipo de noticia (NEWS_TYPE_PATTERNS)
 * - Aliases de empresas para detección (COMPANY_ALIASES)
 * - Patrones para extraer nombres de producto (PRODUCT_NAME_PATTERNS)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 24
 */

import { NewsType } from '../types/scoring.types';

// =============================================================================
// CONFIGURACIÓN DE API
// =============================================================================

/**
 * Query de búsqueda para NewsData.io
 *
 * Cubre los principales términos de IA/ML para capturar
 * noticias relevantes del sector.
 */
export const NEWSDATA_QUERY =
  'artificial intelligence OR AI OR machine learning OR GPT OR OpenAI OR deep learning OR neural network';

/**
 * Límite de noticias a solicitar por defecto
 *
 * 10 es un buen balance entre cobertura y consumo de API quota.
 * NewsData.io free tier: 200 créditos/día.
 */
export const DEFAULT_NEWS_LIMIT = 10;

/**
 * Máximo de noticias a solicitar (safety check)
 *
 * Evita consumir toda la quota en una sola request.
 * Coincide con maxNewsToFetch del OrchestratorConfig.
 */
export const MAX_NEWS_LIMIT = 50;

// =============================================================================
// PATRONES DE TIPO DE NOTICIA
// =============================================================================

/**
 * Patrones para detectar tipo de noticia desde título/descripción
 *
 * Ordenados por prioridad: el primero que matchee gana.
 * Cubre los 8 tipos principales de NewsType (excluye 'other' que es default).
 *
 * Se evalúan contra el texto combinado de título + descripción.
 */
export const NEWS_TYPE_PATTERNS: Array<{ type: NewsType; patterns: RegExp[] }> = [
  {
    type: 'product-launch',
    patterns: [
      /\b(launch(?:es|ed)?|lanza|presenta|release[sd]?|unveil[sd]?|introduces?|anuncia|debut[sd]?|rolls?\s+out)\b/i,
      /\b(new|nuevo|nueva)\s+(product|tool|feature|platform|app|service|servicio|herramienta)\b/i,
    ],
  },
  {
    type: 'model-release',
    patterns: [
      /\b(GPT-?\d|Claude\s*\d|Gemini\s*\d?|Llama\s*\d|Mistral|Phi-?\d)\b.*\b(release|launch|available|open.?source)\b/i,
      /\b(release|lanza|libera)\b.*\b(model[eo]?|LLM|foundation|language\s+model)\b/i,
      /\bnew\s+(AI\s+)?model\b/i,
    ],
  },
  {
    type: 'breakthrough',
    patterns: [
      /\b(breakthrough|avance|discovers?|achieves?|revolucion[ao]?|record|first[\s-]+ever|world[\s-]+first)\b/i,
      /\b(milestone|hito|unprecedented|sin\s+precedentes)\b/i,
    ],
  },
  {
    type: 'controversy',
    patterns: [
      /\b(controversy|scandal|lawsuit|sued|ban|prohib|regulat|concern|risk|danger)\b/i,
      /\b(controversia|demanda|prohib|regulaci|riesgo|peligro|polémica)\b/i,
    ],
  },
  {
    type: 'funding',
    patterns: [
      /\b(funding|raised?|investment|valu|billion|million|\$\d+[MB])\b/i,
      /\b(financiamiento|inversión|valuaci|ronda|recaud)\b/i,
    ],
  },
  {
    type: 'acquisition',
    patterns: [
      /\b(acqui|merger|bought|purchase|deal|takeover)\b/i,
      /\b(adquisici|fusión|compra|absorbe)\b/i,
    ],
  },
  {
    type: 'research-paper',
    patterns: [
      /\b(paper|research|study|published|arxiv|journal|findings|peer[\s-]review)\b/i,
      /\b(investigación|estudio|publicado|hallazgos|artículo\s+científico)\b/i,
    ],
  },
  {
    type: 'partnership',
    patterns: [
      /\b(partner|collaborat|alliance|joint\s+venture|teams?\s+up)\b/i,
      /\b(alianza|colaboraci|socio|asociaci)\b/i,
    ],
  },
];

// =============================================================================
// ALIASES DE EMPRESAS
// =============================================================================

/**
 * Aliases de nombres de empresa para detección
 *
 * Key: variante en lowercase (como aparece en noticias)
 * Value: nombre canónico tal como está en COMPANY_SCORES de scoring-rules.ts
 *
 * Permite detectar empresas mencionadas de formas variadas en títulos y
 * descripciones de noticias.
 */
export const COMPANY_ALIASES: Record<string, string> = {
  // OpenAI y productos
  'openai': 'OpenAI',
  'open ai': 'OpenAI',
  'chatgpt': 'OpenAI',
  'chat gpt': 'OpenAI',
  'gpt-4': 'OpenAI',
  'gpt-4o': 'OpenAI',
  'gpt-5': 'OpenAI',
  'dall-e': 'OpenAI',
  'dall·e': 'OpenAI',
  'sora': 'OpenAI',
  'sam altman': 'OpenAI',

  // Google / DeepMind
  'google': 'Google',
  'google ai': 'Google',
  'google cloud': 'Google',
  'deepmind': 'DeepMind',
  'google deepmind': 'Google DeepMind',
  'gemini': 'Google',
  'bard': 'Google',
  'sundar pichai': 'Google',
  'demis hassabis': 'DeepMind',

  // Anthropic
  'anthropic': 'Anthropic',
  'claude': 'Anthropic',
  'dario amodei': 'Anthropic',

  // Microsoft
  'microsoft': 'Microsoft',
  'copilot': 'Microsoft',
  'azure ai': 'Microsoft',
  'satya nadella': 'Microsoft',

  // Meta
  'meta': 'Meta',
  'meta ai': 'Meta',
  'llama': 'Meta',
  'llama 3': 'Meta',
  'yann lecun': 'Meta',

  // Apple
  'apple': 'Apple',
  'apple intelligence': 'Apple',

  // NVIDIA
  'nvidia': 'NVIDIA',
  'jensen huang': 'NVIDIA',

  // Amazon
  'amazon': 'Amazon',
  'aws': 'Amazon',
  'bedrock': 'Amazon',
  'amazon web services': 'Amazon',

  // xAI
  'xai': 'xAI',
  'x.ai': 'xAI',
  'grok': 'xAI',
  'elon musk': 'xAI',

  // Tier 2
  'mistral': 'Mistral AI',
  'mistral ai': 'Mistral AI',
  'stability ai': 'Stability AI',
  'stable diffusion': 'Stability AI',
  'midjourney': 'Midjourney',
  'runway': 'Runway',
  'runway ml': 'Runway',
  'scale ai': 'Scale AI',
  'databricks': 'Databricks',
  'cohere': 'Cohere',

  // Tier 3
  'perplexity': 'Perplexity',
  'perplexity ai': 'Perplexity AI',
  'hugging face': 'Hugging Face',
  'huggingface': 'Hugging Face',
  'groq': 'Groq',
  'cerebras': 'Cerebras',
  'inflection': 'Inflection AI',
  'inflection ai': 'Inflection AI',
  'character ai': 'Character AI',
  'character.ai': 'Character.AI',
  'together ai': 'Together AI',
  'replicate': 'Replicate',
  'adept': 'Adept',
  'adept ai': 'Adept AI',
  'anyscale': 'Anyscale',

  // Otros tech relevantes
  'tesla': 'Tesla',
  'samsung': 'Samsung',
  'intel': 'Intel',
  'ibm': 'IBM',
  'watson': 'IBM',
  'adobe': 'Adobe',
  'firefly': 'Adobe',
  'baidu': 'Baidu',
  'bytedance': 'ByteDance',
  'tiktok': 'ByteDance',
  'elevenlabs': 'ElevenLabs',
  'eleven labs': 'ElevenLabs',
};

// =============================================================================
// PATRONES DE NOMBRE DE PRODUCTO
// =============================================================================

/**
 * Regex para extraer nombres de producto del título
 *
 * Patrones comunes:
 * - "presenta X", "lanza X", "anuncia X" (español)
 * - "launches X", "unveils X", "announces X" (inglés)
 * - Nombres entre comillas
 * - Nombres con versión (Producto 2.0, Producto Pro)
 */
export const PRODUCT_NAME_PATTERNS: RegExp[] = [
  // Español: "presenta/lanza/anuncia X"
  /(?:presenta|lanza|anuncia|introduce|revela)\s+([A-Z][a-zA-Z0-9][\w\s.-]{1,30})/i,
  // Inglés: "launches/unveils/announces X"
  /(?:launches?|unveils?|announces?|introduces?|releases?)\s+([A-Z][a-zA-Z0-9][\w\s.-]{1,30})/i,
  // Nombres entre comillas
  /["']([^"']{3,30})["']/,
];
