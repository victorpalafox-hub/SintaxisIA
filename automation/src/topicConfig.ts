// ===================================
// TOPIC CONFIG - Configuración para detección de tópicos
// ===================================

/**
 * Configuración centralizada para detección de tópicos
 * Todos los valores son configurables vía variables de entorno
 *
 * SISTEMA DE MODELOS INTELIGENTE:
 * - Valida automáticamente el mejor modelo disponible
 * - Fallback automático si un modelo falla
 * - Prioriza Gemini 2.5 Flash (menos alucinaciones)
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

function getEnvFloat(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ===================================
// JERARQUÍA DE MODELOS GEMINI
// ===================================

/**
 * Orden de prioridad basado en:
 * 1. Precisión (menos alucinaciones)
 * 2. Velocidad de respuesta
 * 3. Disponibilidad
 *
 * Gemini 2.5 Flash: Mejor balance precisión/velocidad actualmente disponible
 */
export const MODEL_PRIORITY = [
  'gemini-2.5-flash',         // Prioridad 1: MEJOR DISPONIBLE ACTUALMENTE ✓
  'gemini-2.5-pro',           // Prioridad 2: Más potente pero más lento
  'gemini-2.0-flash',         // Prioridad 3: Fallback estable
  'gemini-2.0-flash-exp',     // Prioridad 4: Experimental
  'gemini-1.5-flash',         // Prioridad 5: Legacy estable
  'gemini-1.5-pro',           // Prioridad 6: Legacy potente
] as const;

export type GeminiModel = typeof MODEL_PRIORITY[number];

export const MODEL_INFO: Record<GeminiModel, { description: string; priority: number }> = {
  'gemini-2.5-flash': {
    description: 'Mejor precisión actual - MENOS ALUCINACIONES',
    priority: 1,
  },
  'gemini-2.5-pro': {
    description: 'Más potente, ideal para tareas complejas',
    priority: 2,
  },
  'gemini-2.0-flash': {
    description: 'Rápido y estable',
    priority: 3,
  },
  'gemini-2.0-flash-exp': {
    description: 'Experimental con features nuevos',
    priority: 4,
  },
  'gemini-1.5-flash': {
    description: 'Legacy estable',
    priority: 5,
  },
  'gemini-1.5-pro': {
    description: 'Legacy potente',
    priority: 6,
  },
};

// ===================================
// TIPOS DE ENTIDADES
// ===================================

export const VALID_ENTITY_TYPES = [
  'company',
  'product',
  'technology',
  'person',
  'organization',
] as const;

export type EntityType = typeof VALID_ENTITY_TYPES[number];

// ===================================
// CONFIGURACIÓN PRINCIPAL
// ===================================

export const topicConfig = {
  // ===================================
  // MODELO DE IA
  // ===================================

  // Modelo por defecto (se validará automáticamente)
  defaultModel: (process.env.GEMINI_MODEL as GeminiModel) || MODEL_PRIORITY[0],

  // Sistema de fallback inteligente
  enableAutoFallback: process.env.DISABLE_MODEL_FALLBACK !== 'true',

  // Re-validar si hay error en runtime
  retryWithFallback: process.env.RETRY_WITH_FALLBACK !== 'false',

  // Temperatura optimizada para 2.5 Flash (menos alucinaciones)
  temperature: getEnvFloat('TOPIC_DETECTION_TEMPERATURE', 0.2),

  // Top-P para sampling
  topP: getEnvFloat('TOPIC_DETECTION_TOP_P', 0.95),

  // Máximo tokens de salida
  maxOutputTokens: getEnvNumber('TOPIC_MAX_TOKENS', 512),

  // ===================================
  // LÍMITES Y TIMEOUTS
  // ===================================

  // Máximo de términos relacionados a extraer
  maxRelatedTerms: getEnvNumber('MAX_RELATED_TERMS', 5),

  // Timeout para requests (ms)
  requestTimeout: getEnvNumber('TOPIC_DETECTION_TIMEOUT', 8000),

  // Timeout para validación de modelo (ms)
  validationTimeout: getEnvNumber('MODEL_VALIDATION_TIMEOUT', 5000),

  // Reintentos en caso de fallo
  maxRetries: getEnvNumber('TOPIC_DETECTION_RETRIES', 2),

  // Delay entre reintentos (ms)
  retryDelay: getEnvNumber('TOPIC_DETECTION_RETRY_DELAY', 1000),

  // ===================================
  // VALIDACIÓN
  // ===================================

  // Tipos de entidad válidos
  validEntityTypes: VALID_ENTITY_TYPES,

  // Confianza mínima para aceptar resultado
  minConfidence: getEnvFloat('TOPIC_MIN_CONFIDENCE', 0.5),

  // ===================================
  // FALLBACK KEYWORDS
  // ===================================

  fallbackKeywords: {
    companies: [
      'OpenAI',
      'Anthropic',
      'Google',
      'Microsoft',
      'Meta',
      'Apple',
      'Amazon',
      'NVIDIA',
      'DeepMind',
      'Mistral',
      'Cohere',
      'Stability AI',
    ],
    products: [
      'ChatGPT',
      'Claude',
      'Gemini',
      'Copilot',
      'Cursor',
      'GitHub',
      'Midjourney',
      'DALL-E',
      'Sora',
      'Llama',
      'GPT-4',
      'GPT-5',
      'Whisper',
    ],
    technologies: [
      'GPT',
      'LLM',
      'Transformer',
      'Neural Network',
      'AI',
      'Machine Learning',
      'Deep Learning',
      'NLP',
      'Computer Vision',
      'Generative AI',
      'AGI',
    ],
  },

  // ===================================
  // PROMPT TEMPLATES
  // ===================================

  promptTemplate: process.env.TOPIC_PROMPT_TEMPLATE || 'default',
};

// Exportar configuración como default
export default topicConfig;
