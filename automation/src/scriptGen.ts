/**
 * @fileoverview Generador de Scripts con Gemini API
 *
 * Genera scripts de video usando Gemini con el personaje
 * "Alex Torres" y validacion de compliance (elementos humanos).
 *
 * Caracteristicas:
 * - Usa prompt personalizado con persona definida
 * - Valida compliance (minimo 4/6 marcadores humanos)
 * - Reintenta automaticamente si no pasa compliance
 * - Fallback escalonado: 2.5-flash → 2.0-flash → 1.5-flash
 *
 * @example
 * ```typescript
 * import { ScriptGenerator } from './scriptGen';
 *
 * const generator = new ScriptGenerator();
 * const script = await generator.generateScript(news);
 *
 * if (script.complianceReport?.passed) {
 *   console.log('Script listo para produccion');
 * }
 * ```
 *
 * @author Sintaxis IA
 * @version 2.1.0
 * @since Prompt 15
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { logger } from '../utils/logger';
import {
  generateScriptPrompt,
  generateImprovementFeedback,
  GEMINI_SYSTEM_INSTRUCTION,
} from './prompts/script-generation-templates';
import { ComplianceValidator } from './services/compliance-validator';
import type { ComplianceReport } from './types/script.types';
import type { NewsItem } from './types/news.types';
import type {
  GeneratedScript,
  VideoScript,
  ScriptGeneratorOptions,
} from './types/script.types';
import { NewsArticle } from './newsAPI';

// =============================================================================
// CONFIGURACION
// =============================================================================

/**
 * Cadena de fallback de modelos Gemini
 * Orden de prioridad: 2.5-flash → 2.0-flash → 1.5-flash
 *
 * Si un modelo falla, se intenta con el siguiente en la lista.
 * Esto garantiza maxima disponibilidad del servicio.
 */
export const GEMINI_FALLBACK_CHAIN = [
  'gemini-2.5-flash',   // Prioridad 1: Mejor precision actual
  'gemini-2.0-flash',   // Prioridad 2: Fallback estable
  'gemini-1.5-flash',   // Prioridad 3: Legacy garantizado
] as const;

export type GeminiFallbackModel = (typeof GEMINI_FALLBACK_CHAIN)[number];

/**
 * Opciones por defecto del generador
 */
const DEFAULT_OPTIONS: Required<ScriptGeneratorOptions> = {
  maxRetries: 2,
  temperature: 0.8,
  model: 'gemini-2.5-flash',
  validateCompliance: true,
};

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

/**
 * Generador de scripts usando Gemini API
 *
 * Integra el personaje "Alex Torres" para generar scripts
 * con tono humano que cumplen con las politicas de YouTube.
 *
 * @example
 * ```typescript
 * const generator = new ScriptGenerator();
 *
 * // Generar desde NewsItem (nuevo formato)
 * const script = await generator.generateScript(newsItem);
 *
 * // Generar desde NewsArticle (formato legacy)
 * const legacyScript = await generator.generateFromArticle(article);
 * ```
 */
export class ScriptGenerator {
  private genAI: GoogleGenerativeAI;
  private complianceValidator: ComplianceValidator;
  private options: Required<ScriptGeneratorOptions>;

  /**
   * Crea una nueva instancia del generador
   *
   * @param options - Opciones de configuracion (parcial)
   */
  constructor(options: ScriptGeneratorOptions = {}) {
    this.genAI = new GoogleGenerativeAI(config.api.geminiApiKey);
    this.complianceValidator = new ComplianceValidator();
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Genera script con validacion de compliance
   *
   * Si el primer intento no pasa compliance (score < 4/6),
   * reintenta hasta maxRetries veces con feedback de mejora.
   *
   * @param news - Noticia a convertir en script
   * @returns Script generado con reporte de compliance
   *
   * @throws Error si falla despues de todos los reintentos
   */
  async generateScript(news: NewsItem): Promise<GeneratedScript> {
    let attempts = 0;
    let lastScript: GeneratedScript | null = null;
    let lastReport: ComplianceReport | null = null;

    while (attempts < this.options.maxRetries) {
      attempts++;

      try {
        logger.info(`[ScriptGenerator] Intento ${attempts}/${this.options.maxRetries}`);

        // Generar script con Gemini
        const script = await this.callGeminiAPI(news, lastReport);
        lastScript = script;

        // Si no se requiere validacion, devolver directamente
        if (!this.options.validateCompliance) {
          logger.info('[ScriptGenerator] Validacion de compliance deshabilitada');
          return script;
        }

        // Validar compliance
        const complianceReport =
          this.complianceValidator.validateHumanElements(script);

        logger.info(`[ScriptGenerator] Human score: ${complianceReport.humanScore}/6`);
        logger.info(`[ScriptGenerator] Passed: ${complianceReport.passed}`);

        if (complianceReport.passed) {
          logger.success('[ScriptGenerator] Script pasa compliance');
          return {
            ...script,
            complianceReport,
          };
        }

        logger.warn(
          `[ScriptGenerator] Script necesita mejoras: ${complianceReport.recommendation}`
        );
        logger.info(`[ScriptGenerator] Issues: ${complianceReport.issues.join(', ')}`);

        lastReport = complianceReport;

        // Si es el ultimo intento y no paso, devolver con warning
        if (attempts === this.options.maxRetries) {
          logger.warn(
            '[ScriptGenerator] Max reintentos alcanzados. Devolviendo script con warnings.'
          );
          return {
            ...script,
            complianceReport,
          };
        }
      } catch (error) {
        logger.error(`[ScriptGenerator] Error en intento ${attempts}: ${error}`);

        if (attempts === this.options.maxRetries) {
          throw new Error(
            `Fallo al generar script despues de ${this.options.maxRetries} intentos: ${error}`
          );
        }
      }
    }

    // Fallback (no deberia llegar aqui)
    if (lastScript) {
      return lastScript;
    }

    throw new Error('Fallo al generar script');
  }

  /**
   * Genera script con fallback escalonado entre modelos
   *
   * Cadena de fallback: gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash
   *
   * Si un modelo falla (error de API, modelo no disponible, etc.),
   * automaticamente intenta con el siguiente modelo en la cadena.
   *
   * @param news - Noticia a convertir en script
   * @returns Script generado con metadata del modelo usado
   *
   * @example
   * ```typescript
   * const script = await generator.generateScriptWithFallback(news);
   * console.log(`Modelo usado: ${script.metadata?.modelUsed}`);
   * ```
   */
  async generateScriptWithFallback(news: NewsItem): Promise<GeneratedScript> {
    const errors: Array<{ model: string; error: string }> = [];

    // Iterar sobre la cadena de fallback
    for (let i = 0; i < GEMINI_FALLBACK_CHAIN.length; i++) {
      const currentModel = GEMINI_FALLBACK_CHAIN[i];
      const isLastModel = i === GEMINI_FALLBACK_CHAIN.length - 1;

      try {
        logger.info(
          `[ScriptGenerator] Intentando con ${currentModel} (${i + 1}/${GEMINI_FALLBACK_CHAIN.length})...`
        );

        // Crear generador con el modelo actual
        const tempGenerator = new ScriptGenerator({
          ...this.options,
          model: currentModel,
        });

        const script = await tempGenerator.generateScript(news);

        // Agregar metadata del modelo usado
        if (script.metadata) {
          script.metadata.modelUsed = currentModel;
          if (i > 0) {
            script.metadata.modelUsed += '-fallback';
            script.metadata.fallbackReason = errors.map((e) => `${e.model}: ${e.error}`);
          }
        }

        logger.success(`[ScriptGenerator] Exito con ${currentModel}`);
        return script;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({ model: currentModel, error: errorMessage });

        logger.warn(`[ScriptGenerator] ${currentModel} fallo: ${errorMessage}`);

        // Si es el ultimo modelo, lanzar error con todo el historial
        if (isLastModel) {
          const fullErrorMessage = errors
            .map((e) => `  - ${e.model}: ${e.error}`)
            .join('\n');

          throw new Error(
            `Todos los modelos de Gemini fallaron:\n${fullErrorMessage}`
          );
        }

        // Continuar con el siguiente modelo
        logger.info('[ScriptGenerator] Intentando siguiente modelo en cadena de fallback...');
      }
    }

    // Nunca deberia llegar aqui
    throw new Error('Error inesperado en cadena de fallback');
  }

  /**
   * Prueba la disponibilidad de un modelo especifico
   *
   * Util para diagnostico y tests.
   *
   * @param modelName - Nombre del modelo a probar
   * @returns true si el modelo responde correctamente
   */
  async testModelAvailability(modelName: GeminiFallbackModel): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 50,
        },
      });

      const result = await model.generateContent('Responde solo "OK"');
      const text = result.response.text();

      return text.toLowerCase().includes('ok');
    } catch {
      return false;
    }
  }

  /**
   * Llama a Gemini API con prompt personalizado
   *
   * @param news - Noticia fuente
   * @param previousReport - Reporte de compliance del intento anterior (opcional)
   * @returns Script parseado
   */
  private async callGeminiAPI(
    news: NewsItem,
    previousReport: ComplianceReport | null
  ): Promise<GeneratedScript> {
    // Generar prompt base
    let prompt = generateScriptPrompt(news);

    // Si hay reporte previo, agregar feedback
    if (previousReport) {
      prompt += generateImprovementFeedback(
        previousReport.issues,
        previousReport.humanScore
      );
    }

    // Configurar modelo
    const model = this.genAI.getGenerativeModel({
      model: this.options.model,
      systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: this.options.temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

    logger.info('[ScriptGenerator] Llamando a Gemini API...');

    // Generar contenido
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    logger.success('[ScriptGenerator] Respuesta de Gemini recibida');

    // Parsear JSON
    let parsedScript: Record<string, unknown>;
    try {
      // Limpiar markdown si existe
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedScript = JSON.parse(cleanText);
    } catch (parseError) {
      logger.error(`[ScriptGenerator] Fallo al parsear JSON: ${text}`);
      throw new Error(`Gemini devolvio JSON invalido: ${parseError}`);
    }

    // Mapear a nuestro tipo (soportar ambos formatos: body/analysis, opinion/reflection)
    const script: GeneratedScript = {
      hook: (parsedScript.hook as string) || '',
      body:
        (parsedScript.body as string) || (parsedScript.analysis as string) || '',
      opinion:
        (parsedScript.opinion as string) ||
        (parsedScript.reflection as string) ||
        '',
      cta: (parsedScript.cta as string) || '',
      duration:
        (parsedScript.estimatedDuration as number) ||
        (parsedScript.duration as number) ||
        55,
      hashtags: [],
      metadata: {
        newsId: news.id,
        company: news.company,
        category: news.type,
        generatedAt: new Date().toISOString(),
        technicalTerms: (parsedScript.technicalTermsUsed as string[]) || [],
        humanMarkers: (parsedScript.humanMarkers as Record<string, string>) || {},
      },
    };

    return script;
  }

  /**
   * Genera script desde NewsArticle (formato legacy de newsAPI.ts)
   *
   * Convierte el articulo a NewsItem y genera el script.
   *
   * @param article - Articulo en formato legacy
   * @returns Script generado
   */
  async generateFromArticle(article: NewsArticle): Promise<GeneratedScript> {
    // Convertir NewsArticle a NewsItem
    const newsItem: NewsItem = {
      id: article.article_id,
      title: article.title,
      description: article.description || '',
      url: article.link,
      publishedAt: new Date(article.pubDate),
      source: article.source_name,
      imageUrl: article.image_url || undefined,
      keywords: article.keywords || undefined,
    };

    return this.generateScript(newsItem);
  }
}

// =============================================================================
// FUNCION LEGACY (Compatibilidad con codigo existente)
// =============================================================================

/**
 * Genera un guion para video short basado en un articulo
 *
 * Esta funcion mantiene compatibilidad con el codigo existente
 * que usa el formato VideoScript.
 *
 * @deprecated Usar ScriptGenerator.generateScript() para nuevo codigo
 * @param article - Articulo de noticia
 * @returns Guion estructurado para el video en formato legacy
 */
export async function generateScript(article: NewsArticle): Promise<VideoScript> {
  logger.info('Generando guion con Gemini AI (Prompt 15)...');

  const generator = new ScriptGenerator();

  try {
    // Generar con nuevo formato
    const newScript = await generator.generateFromArticle(article);

    // Log de compliance
    if (newScript.complianceReport) {
      logger.info(
        `Compliance score: ${newScript.complianceReport.humanScore}/6 - ${newScript.complianceReport.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}`
      );
    }

    // Convertir a formato legacy
    const contenido = newScript.body
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 5);

    const legacyScript: VideoScript = {
      gancho: newScript.hook,
      headline: newScript.hook,
      contenido,
      impacto: newScript.opinion,
      cta: newScript.cta,
      tags: newScript.hashtags || [],
      fullScript: `${newScript.hook} ${newScript.body} ${newScript.opinion} ${newScript.cta}`,
    };

    logger.success('Guion generado exitosamente');
    logger.info(`Gancho: "${legacyScript.gancho}"`);

    return legacyScript;
  } catch (error) {
    logger.error(`Error generando guion: ${error}`);
    throw error;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { GeneratedScript, VideoScript, ScriptGeneratorOptions };

export default { generateScript, ScriptGenerator };
