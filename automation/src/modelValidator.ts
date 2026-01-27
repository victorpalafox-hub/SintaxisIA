// ===================================
// MODEL VALIDATOR - Sistema inteligente de selección de modelos
// ===================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { MODEL_PRIORITY, topicConfig, GeminiModel, MODEL_INFO } from './topicConfig';
import { logger } from '../utils/logger';

// ===================================
// ESTADO GLOBAL (CACHE)
// ===================================

let validatedModel: GeminiModel | null = null;
let validationAttempted = false;
let failedModels: Set<GeminiModel> = new Set();

// ===================================
// FUNCIONES INTERNAS
// ===================================

/**
 * Crea timeout promise
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
}

/**
 * Valida si un modelo específico está disponible
 */
async function validateSingleModel(modelName: GeminiModel): Promise<boolean> {
  // Si ya sabemos que este modelo falló, skip
  if (failedModels.has(modelName)) {
    return false;
  }

  try {
    logger.info(`   Probando ${modelName}...`);

    const genAI = new GoogleGenerativeAI(config.api.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 20,
      },
    });

    // Test rápido con timeout
    const result = await Promise.race([
      model.generateContent('Responde solo: OK'),
      createTimeout(topicConfig.validationTimeout),
    ]);

    const response = result.response.text();

    if (response && response.length > 0) {
      const info = MODEL_INFO[modelName];
      logger.success(`   ✅ ${modelName} - ${info.description}`);
      return true;
    }

    failedModels.add(modelName);
    return false;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    if (errorMsg.includes('models/' + modelName) || errorMsg.includes('404') || errorMsg.includes('not found')) {
      logger.warn(`   ⚠️  ${modelName} no disponible`);
    } else if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota') || errorMsg.includes('429')) {
      logger.warn(`   ⚠️  ${modelName} sin cuota`);
    } else if (errorMsg.includes('Timeout')) {
      logger.warn(`   ⚠️  ${modelName} timeout`);
    } else {
      logger.warn(`   ⚠️  ${modelName} error: ${errorMsg.substring(0, 50)}`);
    }

    failedModels.add(modelName);
    return false;
  }
}

// ===================================
// FUNCIONES PÚBLICAS
// ===================================

/**
 * Obtiene el primer modelo funcional
 * Valida al inicio y cachea el resultado
 */
export async function getWorkingModel(): Promise<GeminiModel> {
  // Si ya tenemos modelo validado, usarlo
  if (validatedModel) {
    return validatedModel;
  }

  // Si ya validamos y nada funcionó, error
  if (validationAttempted && !validatedModel) {
    throw new Error('Ningún modelo de Gemini disponible');
  }

  validationAttempted = true;

  logger.info('🔍 Detectando mejor modelo de Gemini disponible...');
  logger.info('');

  // Probar cada modelo en orden de prioridad
  for (const modelName of MODEL_PRIORITY) {
    const isValid = await validateSingleModel(modelName);

    if (isValid) {
      validatedModel = modelName;
      const info = MODEL_INFO[modelName];

      logger.info('');
      logger.success(`✅ Modelo seleccionado: ${modelName}`);
      logger.info(`   ${info.description}`);
      logger.info(`   Prioridad: ${info.priority}/${MODEL_PRIORITY.length}`);
      logger.info('');

      return modelName;
    }
  }

  // Ninguno funciona
  logger.error('');
  logger.error('❌ CRÍTICO: Ningún modelo de Gemini disponible');
  logger.error('💡 Revisa:');
  logger.error('   1. API key válida en .env');
  logger.error('   2. Cuota disponible en Google AI Studio');
  logger.error('   3. Conexión a internet');

  throw new Error('Ningún modelo de Gemini disponible');
}

/**
 * Re-valida modelos si hay error en runtime
 * Útil si el modelo actual falla mid-sesión
 */
export async function retryWithNextModel(failedModel: GeminiModel): Promise<GeminiModel> {
  if (!topicConfig.retryWithFallback) {
    throw new Error(`Modelo ${failedModel} falló y retry deshabilitado`);
  }

  logger.warn(`⚠️  ${failedModel} falló, probando siguiente modelo...`);

  // Marcar modelo actual como fallido
  failedModels.add(failedModel);
  validatedModel = null;

  // Buscar siguiente modelo disponible
  return await getWorkingModel();
}

/**
 * Wrapper seguro para requests a Gemini
 * Auto-retry con siguiente modelo si falla
 */
export async function safeModelRequest<T>(
  requestFn: (model: GeminiModel) => Promise<T>
): Promise<T> {
  let currentModel = await getWorkingModel();
  let attempts = 0;
  const maxAttempts = MODEL_PRIORITY.length;

  while (attempts < maxAttempts) {
    try {
      return await requestFn(currentModel);

    } catch (error) {
      attempts++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown';

      // Si es el último intento, throw
      if (attempts >= maxAttempts) {
        logger.error(`❌ Todos los modelos fallaron después de ${attempts} intentos`);
        throw error;
      }

      // Si el error es recoverable, reintentar con siguiente modelo
      if (
        errorMsg.includes('RESOURCE_EXHAUSTED') ||
        errorMsg.includes('quota') ||
        errorMsg.includes('429') ||
        errorMsg.includes('models/') ||
        errorMsg.includes('404') ||
        errorMsg.includes('not found')
      ) {
        logger.warn(`   Reintento ${attempts}/${maxAttempts} con siguiente modelo...`);
        currentModel = await retryWithNextModel(currentModel);
      } else {
        // Error no recoverable (ej: error de parsing, validación, etc.)
        throw error;
      }
    }
  }

  throw new Error('No se pudo completar request con ningún modelo');
}

/**
 * Obtiene el modelo actual sin validar
 */
export function getCurrentModel(): GeminiModel | null {
  return validatedModel;
}

/**
 * Verifica si hay un modelo validado
 */
export function hasValidModel(): boolean {
  return validatedModel !== null;
}

/**
 * Reset cache (útil para testing)
 */
export function resetModelCache(): void {
  validatedModel = null;
  validationAttempted = false;
  failedModels.clear();
}

/**
 * Obtiene lista de modelos que fallaron
 */
export function getFailedModels(): GeminiModel[] {
  return Array.from(failedModels);
}
