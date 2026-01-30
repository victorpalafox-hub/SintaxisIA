/**
 * @fileoverview Reglas de Scoring para Noticias de IA
 *
 * Define los puntos asignados por empresa, tipo de noticia,
 * engagement, y palabras clave de impacto.
 *
 * Estas reglas determinan qué noticias son más importantes
 * y merecen ser publicadas.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 11
 */

import { NewsType } from '../types/scoring.types';

// =============================================================================
// PUNTUACIÓN POR EMPRESA/FUENTE (0-10 pts)
// =============================================================================

/**
 * Puntuación por Empresa/Fuente
 *
 * - Tier 1 (10 pts): Gigantes de IA con mayor impacto global
 * - Tier 2 (8 pts): Players importantes y bien establecidos
 * - Tier 3 (6 pts): Startups prometedoras y emergentes
 * - Default (3 pts): Empresas no listadas
 */
export const COMPANY_SCORES: Record<string, number> = {
  // Tier 1: Gigantes IA (10 pts) - Máximo impacto
  'OpenAI': 10,
  'Google': 10,
  'Google DeepMind': 10,
  'DeepMind': 10,
  'Anthropic': 10,
  'Microsoft': 10,
  'Meta': 10,
  'Apple': 10,
  'NVIDIA': 10,
  'Amazon': 10,

  // Tier 2: Players importantes (8 pts)
  'xAI': 8,
  'Mistral AI': 8,
  'Mistral': 8,
  'Cohere': 8,
  'Stability AI': 8,
  'Midjourney': 8,
  'Runway': 8,
  'Scale AI': 8,
  'Databricks': 8,

  // Tier 3: Startups prometedoras (6 pts)
  'Perplexity': 6,
  'Perplexity AI': 6,
  'Character AI': 6,
  'Character.AI': 6,
  'Hugging Face': 6,
  'Inflection AI': 6,
  'Adept': 6,
  'Adept AI': 6,
  'Replicate': 6,
  'Together AI': 6,
  'Anyscale': 6,
  'Groq': 6,
  'Cerebras': 6,

  // Default para empresas no listadas
  'default': 3,
};

// =============================================================================
// PUNTUACIÓN POR TIPO DE NOTICIA (0-9 pts)
// =============================================================================

/**
 * Puntuación por Tipo de Noticia
 *
 * Lanzamientos y nuevos modelos tienen máxima puntuación.
 * Partnerships y noticias genéricas tienen menor valor.
 */
export const NEWS_TYPE_SCORES: Record<NewsType, number> = {
  'product-launch': 9,      // Lanzamiento de producto nuevo
  'model-release': 9,       // Nuevo modelo de IA liberado
  'breakthrough': 8,        // Avance técnico importante
  'controversy': 7,         // Controversia o debate público
  'funding': 6,             // Ronda de inversión/financiamiento
  'acquisition': 6,         // Adquisición de empresa
  'research-paper': 5,      // Paper científico publicado
  'partnership': 4,         // Alianza o partnership
  'other': 2,               // Otro tipo de noticia
};

// =============================================================================
// UMBRALES DE ENGAGEMENT (0-8 pts)
// =============================================================================

/**
 * Umbrales de Engagement genéricos
 *
 * Define los views necesarios para cada nivel de puntuación.
 * Views se consideran como métrica principal.
 *
 * @updated Prompt 17-A - Eliminadas referencias a Twitter/X
 */
export const ENGAGEMENT_THRESHOLDS = {
  /** 8 pts - Contenido viral masivo (>500K views) */
  viral: 500_000,

  /** 7 pts - Engagement alto (>100K views) */
  high: 100_000,

  /** 5 pts - Engagement medio-alto (>50K views) */
  mediumHigh: 50_000,

  /** 3 pts - Engagement medio (>10K views) */
  medium: 10_000,

  /** 1 pt - Engagement bajo (>1K views) */
  low: 1_000,

  // < 1000 views = 0 pts
};

// =============================================================================
// PALABRAS CLAVE DE ALTO IMPACTO (0-7 pts)
// =============================================================================

/**
 * Palabras clave que indican alto impacto
 *
 * Se buscan en título y descripción.
 * +2 pts por cada keyword encontrada (máximo 7 pts).
 */
export const HIGH_IMPACT_KEYWORDS: string[] = [
  // Inglés - Términos de impacto
  'revolutionary',
  'breakthrough',
  'first ever',
  'historic',
  'unprecedented',
  'game-changing',
  'game changer',
  'paradigm shift',
  'world-first',
  'world first',
  'milestone',
  'quantum leap',

  // Inglés - Términos técnicos de alto impacto
  'AGI',
  'artificial general intelligence',
  'superintelligence',
  'GPT-5',
  'GPT5',
  'GPT-6',
  'next generation',
  'state-of-the-art',
  'SOTA',

  // Español - Términos de impacto
  'revolucionario',
  'revolucionaria',
  'histórico',
  'histórica',
  'sin precedentes',
  'primera vez',
  'primer',
  'hito',
  'avance',
];

// =============================================================================
// CONFIGURACIÓN DE FRESCURA (-5 a +3 pts)
// =============================================================================

/**
 * Umbrales de frescura en horas
 *
 * Noticias más recientes tienen bonus.
 * Noticias viejas tienen penalización.
 */
export const FRESHNESS_THRESHOLDS = {
  /** +3 pts - Muy reciente (<6 horas) */
  veryFresh: 6,

  /** +2 pts - Reciente (<24 horas) */
  fresh: 24,

  /** 0 pts - Aceptable (<48 horas) */
  acceptable: 48,

  /** -2 pts - Vieja (<72 horas) */
  old: 72,

  // >72 horas = -5 pts (muy vieja)
};

/**
 * Puntuación por nivel de frescura
 */
export const FRESHNESS_SCORES = {
  veryFresh: 3,    // <6h
  fresh: 2,        // <24h
  acceptable: 0,   // <48h
  old: -2,         // <72h
  veryOld: -5,     // >72h
};

// =============================================================================
// KEYWORDS DE PROFUNDIDAD ANALÍTICA (0-25 pts) - Prompt 17-A
// =============================================================================

/**
 * Keywords que indican potencial para análisis profundo
 *
 * Noticias con estas palabras tienen más "carnita" para
 * generar contenido de valor con análisis humano.
 *
 * +3 pts por cada keyword (máximo 15 pts base)
 * +5 pts bonus por comparaciones/competencia
 * +5 pts bonus por implicaciones futuras
 *
 * @since Prompt 17-A
 */
export const ANALYTICAL_KEYWORDS: string[] = [
  // Implicaciones futuras
  'futuro', 'implicaciones', 'cambio', 'transformar', 'revolucionar',
  'future', 'implications', 'transform', 'disrupt', 'paradigm',
  // Competencia
  'competencia', 'rival', 'versus', 'supera', 'competition', 'beats', 'outperforms',
  // Regulación/Ética
  'regulación', 'ética', 'privacidad', 'seguridad', 'regulation', 'ethics', 'privacy', 'safety',
  // Técnico profundo
  'arquitectura', 'benchmark', 'parámetros', 'entrenamiento', 'architecture', 'training',
  'tokens', 'parameters', 'multimodal', 'reasoning',
];

// =============================================================================
// KEYWORDS DE CONTROVERSIA (0-20 pts) - Prompt 17-A
// =============================================================================

/**
 * Keywords que indican potencial de controversia/debate
 *
 * Noticias controversiales generan más engagement y discusión.
 * +4 pts por cada keyword (máximo 15 pts)
 * +5 pts bonus por críticas/problemas
 *
 * @since Prompt 17-A
 */
export const CONTROVERSY_KEYWORDS: string[] = [
  // Debate y controversia
  'debate', 'controversia', 'crítica', 'polémica', 'preocupación',
  'controversy', 'criticism', 'concern', 'backlash', 'outrage',
  // Problemas corporativos
  'despido', 'renuncia', 'demanda', 'layoff', 'lawsuit', 'fired', 'resigned',
  // Fallas técnicas
  'error', 'fallo', 'problema', 'bug', 'failure', 'issue', 'vulnerability',
  'hacked', 'breach', 'leak', 'exposed',
];

// =============================================================================
// INDICADORES DE CLICKBAIT (penalización) - Prompt 17-A
// =============================================================================

/**
 * Indicadores de clickbait que restan puntos
 *
 * Noticias con títulos sensacionalistas sin sustancia
 * reciben penalización en el score.
 *
 * -3 pts por cada indicador
 *
 * @since Prompt 17-A
 */
export const CLICKBAIT_INDICATORS: string[] = [
  // Exageraciones en español
  'increíble', 'no creerás', 'impactante', 'te sorprenderá',
  // Exageraciones en inglés
  'shocking', 'unbelievable', 'mind-blowing', 'you won\'t believe',
  // Misterio falso
  'secreto', 'revelado', 'secret', 'revealed', 'exposed',
  // Emojis excesivos (se detectan por patrón)
  '🔥', '😱', '💥', '🚀', '❗', '‼️',
  // Urgencia falsa
  'BREAKING', 'URGENT', 'JUST IN', 'ÚLTIMA HORA',
];

// =============================================================================
// ENTIDADES DE ALTO IMPACTO (para impacto multi-dimensional) - Prompt 17-A
// =============================================================================

/**
 * Empresas, productos y personas que generan alto impacto
 *
 * Noticias que mencionan estas entidades tienen mayor
 * impacto multi-dimensional (afectan a más stakeholders).
 *
 * +4 pts por entidad (máximo 12 pts)
 *
 * @since Prompt 17-A
 */
export const HIGH_IMPACT_ENTITIES: string[] = [
  // Empresas principales
  'OpenAI', 'Anthropic', 'Google', 'Microsoft', 'Meta', 'NVIDIA', 'Apple', 'Amazon',
  'DeepMind', 'xAI', 'Mistral',
  // Productos clave
  'GPT', 'Claude', 'Gemini', 'Llama', 'DALL-E', 'Midjourney', 'Stable Diffusion',
  'ChatGPT', 'Copilot', 'Grok',
  // Personas influyentes
  'Sam Altman', 'Elon Musk', 'Satya Nadella', 'Sundar Pichai', 'Dario Amodei',
  'Yann LeCun', 'Demis Hassabis', 'Jensen Huang',
];
