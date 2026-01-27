// ===================================
// TOPIC DETECTOR - Sistema de detección de tópicos con IA
// ===================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { topicConfig, EntityType, VALID_ENTITY_TYPES } from './topicConfig';
import {
  TopicDetection,
  TopicDetectionOptions,
  TopicDetectionResult,
  TopicDetectionError,
  TopicDetectionErrorCode,
  GeminiTopicResponse,
} from './types/topicDetection';
import { searchEntityImage } from './imageSearcher';
import { logger } from '../utils/logger';

// Inicializar cliente de Gemini
const genAI = new GoogleGenerativeAI(config.api.geminiApiKey);

// ===================================
// FUNCIÓN PRINCIPAL
// ===================================

/**
 * Detecta el tópico principal de un texto usando IA
 * @param text - Texto del guion a analizar
 * @param options - Opciones de configuración opcionales
 * @returns TopicDetectionResult con información extraída o error
 */
export async function detectTopicFromText(
  text: string,
  options: TopicDetectionOptions = {}
): Promise<TopicDetectionResult> {
  const startTime = Date.now();

  // Merge options con defaults de config
  const opts: Required<TopicDetectionOptions> = {
    maxTerms: options.maxTerms ?? topicConfig.maxRelatedTerms,
    temperature: options.temperature ?? topicConfig.temperature,
    timeout: options.timeout ?? topicConfig.requestTimeout,
    maxRetries: options.maxRetries ?? topicConfig.maxRetries,
  };

  logger.info('🔍 Iniciando detección de tópico...');

  let lastError: TopicDetectionError | undefined;
  let attempt = 0;

  // Intentar con reintentos
  while (attempt <= opts.maxRetries) {
    try {
      // Llamar a Gemini con timeout
      const detection = await Promise.race([
        callGeminiAPI(text, opts),
        createTimeout(opts.timeout),
      ]);

      // Validar resultado
      validateDetection(detection);

      // Buscar imagen automáticamente
      logger.info('🖼️  Buscando imagen del tópico...');
      const imageResult = await searchEntityImage({
        entityName: detection.mainEntity,
        entityType: detection.entityType,
        verifyExists: true,
      });

      // Agregar imagen al resultado
      detection.imageUrl = imageResult.url;
      detection.imageSource = imageResult.source;

      const processingTime = Date.now() - startTime;

      logger.success(
        `✅ Tópico detectado: ${detection.mainEntity} ` +
        `(${detection.entityType}, confianza: ${(detection.confidence * 100).toFixed(0)}%)`
      );
      logger.success(`✅ Imagen: ${imageResult.url} (${imageResult.source})`);

      return {
        success: true,
        data: detection,
        usedFallback: false,
        processingTime,
      };

    } catch (error) {
      attempt++;
      lastError = createError(error);

      if (attempt <= opts.maxRetries) {
        logger.warn(`⚠️ Intento ${attempt}/${opts.maxRetries + 1} falló, reintentando...`);
        await delay(topicConfig.retryDelay);
      }
    }
  }

  // Todos los intentos fallaron, usar fallback
  logger.error('❌ Detección con Gemini falló, usando fallback');

  const fallback = fallbackDetection(text);

  // Buscar imagen para el fallback también
  logger.info('🖼️  Buscando imagen para fallback...');
  const imageResult = await searchEntityImage({
    entityName: fallback.mainEntity,
    entityType: fallback.entityType,
    verifyExists: false, // No verificar en fallback para mayor velocidad
  });

  fallback.imageUrl = imageResult.url;
  fallback.imageSource = imageResult.source;

  const processingTime = Date.now() - startTime;

  return {
    success: true,
    data: fallback,
    usedFallback: true,
    processingTime,
    error: lastError,
  };
}

/**
 * Detecta tópico de forma simple (solo retorna TopicDetection o lanza error)
 */
export async function detectTopic(text: string): Promise<TopicDetection> {
  const result = await detectTopicFromText(text);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Error detectando tópico');
  }

  return result.data;
}

// ===================================
// LLAMADA A GEMINI API
// ===================================

/**
 * Llama a Gemini API para extraer tópico
 */
async function callGeminiAPI(
  text: string,
  opts: Required<TopicDetectionOptions>
): Promise<TopicDetection> {
  const model = genAI.getGenerativeModel({
    model: topicConfig.defaultModel,
    generationConfig: {
      temperature: opts.temperature,
      maxOutputTokens: topicConfig.maxOutputTokens,
    },
  });

  const prompt = buildPrompt(text, opts.maxTerms);

  logger.info(`📡 Llamando a Gemini (modelo: ${topicConfig.defaultModel})...`);

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Limpiar y parsear JSON
  const cleanJson = cleanJsonResponse(responseText);
  const parsed: GeminiTopicResponse = JSON.parse(cleanJson);

  // Normalizar entityType
  const normalizedType = normalizeEntityType(parsed.entityType);

  return {
    mainEntity: parsed.mainEntity.trim(),
    entityType: normalizedType,
    relatedTerms: parsed.relatedTerms
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, opts.maxTerms),
    imageSearchQuery: parsed.imageSearchQuery.trim(),
    confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.8)),
  };
}

// ===================================
// PROMPT BUILDER
// ===================================

/**
 * Construye el prompt para Gemini
 */
function buildPrompt(text: string, maxTerms: number): string {
  const validTypes = VALID_ENTITY_TYPES.join(' | ');

  return `
Analiza el siguiente texto de noticia sobre tecnología e identifica el tópico principal.

═══════════════════════════════════════════════════════════
TEXTO A ANALIZAR:
═══════════════════════════════════════════════════════════
"${text}"

═══════════════════════════════════════════════════════════
INSTRUCCIONES:
═══════════════════════════════════════════════════════════
1. Identifica la empresa, producto o tecnología PRINCIPAL mencionada
2. Clasifica el tipo de entidad: ${validTypes}
3. Extrae máximo ${maxTerms} términos relacionados importantes
4. Genera una query optimizada para buscar la imagen/logo oficial
5. Asigna un nivel de confianza entre 0 y 1

═══════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (JSON puro, sin markdown):
═══════════════════════════════════════════════════════════
{
  "mainEntity": "nombre exacto de la entidad principal",
  "entityType": "company|product|technology|person|organization",
  "relatedTerms": ["término1", "término2", "término3"],
  "imageSearchQuery": "query para buscar imagen oficial",
  "confidence": 0.9
}

═══════════════════════════════════════════════════════════
EJEMPLOS:
═══════════════════════════════════════════════════════════
Texto: "OpenAI presenta GPT-5 con capacidades revolucionarias"
Respuesta: {"mainEntity": "OpenAI", "entityType": "company", "relatedTerms": ["GPT-5", "AI", "LLM"], "imageSearchQuery": "OpenAI official logo", "confidence": 0.95}

Texto: "Cursor IDE mejora su autocompletado con IA"
Respuesta: {"mainEntity": "Cursor", "entityType": "product", "relatedTerms": ["IDE", "AI", "Coding"], "imageSearchQuery": "Cursor IDE logo", "confidence": 0.9}

Texto: "Los transformers revolucionan el procesamiento de lenguaje"
Respuesta: {"mainEntity": "Transformers", "entityType": "technology", "relatedTerms": ["NLP", "Neural Networks", "AI"], "imageSearchQuery": "transformer neural network diagram", "confidence": 0.85}

RESPONDE SOLO CON EL JSON, SIN EXPLICACIONES NI MARKDOWN.
`.trim();
}

// ===================================
// UTILIDADES
// ===================================

/**
 * Limpia respuesta JSON de Gemini (quita markdown, etc.)
 */
function cleanJsonResponse(text: string): string {
  return text
    // Quitar bloques de código markdown
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    // Quitar texto antes del primer {
    .replace(/^[^{]*/, '')
    // Quitar texto después del último }
    .replace(/[^}]*$/, '')
    .trim();
}

/**
 * Normaliza el tipo de entidad a un valor válido
 */
function normalizeEntityType(type: string): EntityType {
  const normalized = type.toLowerCase().trim();

  // Mapeo de sinónimos
  const typeMap: Record<string, EntityType> = {
    'company': 'company',
    'empresa': 'company',
    'product': 'product',
    'producto': 'product',
    'technology': 'technology',
    'tecnología': 'technology',
    'tech': 'technology',
    'person': 'person',
    'persona': 'person',
    'organization': 'organization',
    'organización': 'organization',
    'org': 'organization',
  };

  return typeMap[normalized] || 'technology';
}

/**
 * Valida que la detección tenga datos válidos
 */
function validateDetection(detection: TopicDetection): void {
  if (!detection.mainEntity || detection.mainEntity.length < 2) {
    throw new Error('mainEntity inválido o muy corto');
  }

  if (!VALID_ENTITY_TYPES.includes(detection.entityType)) {
    throw new Error(`entityType inválido: ${detection.entityType}`);
  }

  if (!Array.isArray(detection.relatedTerms)) {
    throw new Error('relatedTerms debe ser un array');
  }

  if (!detection.imageSearchQuery || detection.imageSearchQuery.length < 3) {
    throw new Error('imageSearchQuery inválido');
  }

  if (detection.confidence < topicConfig.minConfidence) {
    throw new Error(`Confianza muy baja: ${detection.confidence}`);
  }
}

/**
 * Crea error estructurado
 */
function createError(error: unknown): TopicDetectionError {
  const err = error instanceof Error ? error : new Error(String(error));
  const message = err.message.toLowerCase();

  let code: TopicDetectionErrorCode = 'UNKNOWN';

  if (message.includes('timeout')) {
    code = 'TIMEOUT';
  } else if (message.includes('json') || message.includes('parse')) {
    code = 'PARSE_ERROR';
  } else if (message.includes('invalid') || message.includes('validation')) {
    code = 'VALIDATION_ERROR';
  } else if (message.includes('network') || message.includes('fetch')) {
    code = 'NETWORK_ERROR';
  } else if (message.includes('api') || message.includes('gemini')) {
    code = 'GEMINI_ERROR';
  }

  return {
    code,
    message: err.message,
    originalError: err,
    timestamp: new Date(),
  };
}

/**
 * Crea promesa que rechaza después de timeout
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: la operación excedió ${ms}ms`));
    }, ms);
  });
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================================
// FALLBACK DETECTION
// ===================================

/**
 * Detección de fallback usando keywords configurables
 */
function fallbackDetection(text: string): TopicDetection {
  logger.warn('⚠️ Usando detección de fallback por keywords...');

  const textLower = text.toLowerCase();
  const { fallbackKeywords } = topicConfig;

  // Buscar empresas
  for (const company of fallbackKeywords.companies) {
    if (textLower.includes(company.toLowerCase())) {
      return {
        mainEntity: company,
        entityType: 'company',
        relatedTerms: extractBasicTerms(text),
        imageSearchQuery: `${company} official logo`,
        confidence: 0.5,
      };
    }
  }

  // Buscar productos
  for (const product of fallbackKeywords.products) {
    if (textLower.includes(product.toLowerCase())) {
      return {
        mainEntity: product,
        entityType: 'product',
        relatedTerms: extractBasicTerms(text),
        imageSearchQuery: `${product} logo icon`,
        confidence: 0.5,
      };
    }
  }

  // Buscar tecnologías
  for (const tech of fallbackKeywords.technologies) {
    if (textLower.includes(tech.toLowerCase())) {
      return {
        mainEntity: tech,
        entityType: 'technology',
        relatedTerms: extractBasicTerms(text),
        imageSearchQuery: `${tech} technology illustration`,
        confidence: 0.4,
      };
    }
  }

  // Fallback genérico
  logger.warn('⚠️ No se encontró ningún keyword conocido, usando fallback genérico');

  return {
    mainEntity: 'AI Technology',
    entityType: 'technology',
    relatedTerms: ['Artificial Intelligence', 'Technology', 'Innovation'],
    imageSearchQuery: 'artificial intelligence technology concept',
    confidence: 0.3,
  };
}

/**
 * Extrae términos básicos del texto (palabras capitalizadas)
 */
function extractBasicTerms(text: string): string[] {
  const words = text
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => /^[A-Z]/.test(word))
    .filter(word => !['The', 'This', 'That', 'With', 'From', 'About'].includes(word))
    .map(word => word.replace(/[^a-zA-Z0-9]/g, ''));

  // Eliminar duplicados y limitar
  const unique = [...new Set(words)];
  return unique.slice(0, topicConfig.maxRelatedTerms);
}

// ===================================
// EXPORTS
// ===================================

export {
  TopicDetection,
  TopicDetectionOptions,
  TopicDetectionResult,
  TopicDetectionError,
};

export default detectTopicFromText;
