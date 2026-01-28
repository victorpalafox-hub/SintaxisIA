/**
 * @fileoverview Content Validation Service Object - Validador de contenido para videos
 *
 * Este modulo proporciona un service object que encapsula todas las validaciones
 * de contenido para scripts de video de YouTube Shorts. Valida estructura,
 * longitud, topicos, imagenes y calidad del contenido.
 *
 * @description
 * El ContentValidationServiceObject esta diseñado para:
 * - Validar estructura completa de scripts (titulo, gancho, contenido, CTA)
 * - Verificar longitudes apropiadas para narracion TTS
 * - Detectar y validar topicos relevantes de IA/Tech
 * - Validar URLs de imagenes y logos
 * - Evaluar calidad general del contenido
 *
 * ESTADO ACTUAL: Implementacion MOCK
 * Las validaciones son simuladas para desarrollo de tests.
 * Integracion real con NLP/AI sera implementada posteriormente.
 *
 * @example
 * const validator = new ContentValidationServiceObject();
 *
 * // Validar estructura de script
 * const structureResult = await validator.validateScriptStructure(script);
 * if (!structureResult.isValid) {
 *   console.log('Errores:', structureResult.errors);
 * }
 *
 * // Validar longitud
 * const lengthResult = await validator.validateScriptLength(script);
 * console.log(`Duracion estimada: ${lengthResult.estimatedDuration}s`);
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

import { BaseServiceObject } from '../base/BaseServiceObject';
import {
  CONTENT_VALIDATION,
  CONTENT_VALIDATION_DELAYS,
} from '../../config/service-constants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Estructura de un script de video completo
 *
 * @interface VideoScript
 */
export interface VideoScript {
  /** Titulo del video (5-15 palabras) */
  title: string;
  /** Gancho inicial para captar atencion (10-20 palabras) */
  gancho: string;
  /** Contenido principal - array de puntos (3-7 items, 15-30 palabras c/u) */
  contenido: string[];
  /** Mensaje de impacto/estadistica (10-25 palabras) */
  impacto: string;
  /** Call to Action (5-15 palabras) */
  cta: string;
  /** Tags relevantes (3-5 tags) */
  tags: string[];
}

/**
 * Resultado de validacion de estructura de script
 *
 * @interface ScriptStructureValidation
 */
export interface ScriptStructureValidation {
  /** Si la estructura es valida */
  isValid: boolean;
  /** Si tiene titulo valido */
  hasTitle: boolean;
  /** Si tiene gancho valido */
  hasGancho: boolean;
  /** Si tiene contenido valido */
  hasContenido: boolean;
  /** Si tiene impacto valido */
  hasImpacto: boolean;
  /** Si tiene CTA valido */
  hasCTA: boolean;
  /** Si tiene tags validos */
  hasTags: boolean;
  /** Numero de puntos en contenido */
  contenidoCount: number;
  /** Numero de tags */
  tagsCount: number;
  /** Lista de errores encontrados */
  errors: string[];
  /** Lista de advertencias */
  warnings: string[];
}

/**
 * Resultado de validacion de longitud de script
 *
 * @interface ScriptLengthValidation
 */
export interface ScriptLengthValidation {
  /** Si las longitudes son validas */
  isValid: boolean;
  /** Conteo de palabras por seccion */
  wordCounts: {
    title: number;
    gancho: number;
    contenido: number[];
    impacto: number;
    cta: number;
    total: number;
  };
  /** Duracion estimada en segundos */
  estimatedDuration: number;
  /** Si la duracion esta en rango valido */
  durationInRange: boolean;
  /** Secciones que exceden el limite */
  sectionsOverLimit: string[];
  /** Secciones por debajo del minimo */
  sectionsUnderLimit: string[];
  /** Lista de errores */
  errors: string[];
}

/**
 * Resultado de validacion de topico
 *
 * @interface TopicValidation
 */
export interface TopicValidation {
  /** Si el topico es valido */
  isValid: boolean;
  /** Topico detectado */
  detectedTopic: string;
  /** Si el topico esta en la lista de validos */
  isValidTopic: boolean;
  /** Si el topico aparece en el contenido */
  topicInContent: boolean;
  /** Nivel de relevancia (0-100) */
  relevanceScore: number;
  /** Topicos sugeridos basados en contenido */
  suggestedTopics: string[];
  /** Lista de errores */
  errors: string[];
}

/**
 * Resultado de validacion de imagen
 *
 * @interface ImageValidation
 */
export interface ImageValidation {
  /** Si la imagen es valida */
  isValid: boolean;
  /** Si la URL tiene formato valido */
  hasValidUrl: boolean;
  /** Si la imagen es accesible (mock: siempre true) */
  isAccessible: boolean;
  /** Si es relevante al topico */
  isRelevantToTopic: boolean;
  /** Si tiene imagen de fallback disponible */
  hasFallback: boolean;
  /** URL de fallback si aplica */
  fallbackUrl?: string;
  /** Lista de errores */
  errors: string[];
}

/**
 * Resultado de validacion de calidad de contenido
 *
 * @interface ContentQualityValidation
 */
export interface ContentQualityValidation {
  /** Si el contenido tiene calidad aceptable */
  isValid: boolean;
  /** Si tiene repeticiones de frases */
  hasRepetitions: boolean;
  /** Frases repetidas encontradas */
  repetitions: string[];
  /** Si el contenido es coherente con el titulo */
  isCoherent: boolean;
  /** Score de coherencia (0-100) */
  coherenceScore: number;
  /** Si contiene lenguaje inapropiado */
  hasInappropriateLanguage: boolean;
  /** Palabras inapropiadas encontradas */
  inappropriateWords: string[];
  /** Si el contenido es informativo (no solo clickbait) */
  isInformative: boolean;
  /** Si usa terminologia tech apropiada */
  hasTechTerms: boolean;
  /** Terminos tech encontrados */
  techTermsFound: string[];
  /** Lista de errores */
  errors: string[];
  /** Lista de advertencias */
  warnings: string[];
}

// ============================================================================
// CONTENT VALIDATION SERVICE OBJECT
// ============================================================================

/**
 * Content Validation Service Object - Validador de contenido para videos
 *
 * Proporciona metodos para validar todos los aspectos del contenido
 * de scripts de video para YouTube Shorts, incluyendo estructura,
 * longitud, topicos, imagenes y calidad.
 *
 * ESTADO: Implementacion MOCK para desarrollo de tests.
 *
 * @extends BaseServiceObject
 *
 * @example
 * const validator = new ContentValidationServiceObject();
 *
 * // Validacion completa de un script
 * const script: VideoScript = {
 *   title: 'OpenAI lanza GPT-5',
 *   gancho: '¡Esto cambiara todo lo que conocemos!',
 *   contenido: ['Punto 1...', 'Punto 2...', 'Punto 3...'],
 *   impacto: 'GPT-5 es 10 veces mas potente.',
 *   cta: 'Siguenos para mas noticias de IA',
 *   tags: ['OpenAI', 'GPT5', 'IA']
 * };
 *
 * const structure = await validator.validateScriptStructure(script);
 * const length = await validator.validateScriptLength(script);
 * const quality = await validator.validateContentQuality(script);
 */
export class ContentValidationServiceObject extends BaseServiceObject {
  /**
   * Crea una instancia de ContentValidationServiceObject
   *
   * @example
   * const validator = new ContentValidationServiceObject();
   */
  constructor() {
    super('ContentValidation');

    this.logInfo('ContentValidationServiceObject initialized');
  }

  // ============================================================================
  // METODOS PUBLICOS DE VALIDACION
  // ============================================================================

  /**
   * Valida la estructura completa de un script de video
   *
   * Verifica que el script tenga todos los elementos requeridos:
   * - Titulo no vacio
   * - Gancho (hook) presente
   * - Contenido principal (3-7 puntos)
   * - Mensaje de impacto
   * - Call to Action
   * - Tags (3-5)
   *
   * @param {VideoScript} script - Script a validar
   * @returns {Promise<ScriptStructureValidation>} Resultado de la validacion
   *
   * @example
   * const result = await validator.validateScriptStructure(script);
   * if (!result.isValid) {
   *   console.log('Errores de estructura:', result.errors);
   * }
   */
  async validateScriptStructure(
    script: VideoScript
  ): Promise<ScriptStructureValidation> {
    this.logInfo('Validando estructura de script', {
      title: script.title?.substring(0, 30) + '...',
    });

    const { result, duration } = await this.executeWithTiming(
      'validateScriptStructure',
      async () => {
        await this.simulateDelay(CONTENT_VALIDATION_DELAYS.STRUCTURE_VALIDATION);

        const errors: string[] = [];
        const warnings: string[] = [];
        const { SCRIPT_STRUCTURE } = CONTENT_VALIDATION;

        // Validar titulo
        const hasTitle = !!(script.title && script.title.trim().length > 0);
        if (!hasTitle) {
          errors.push('El script debe tener un titulo');
        }

        // Validar gancho
        const hasGancho = !!(script.gancho && script.gancho.trim().length > 0);
        if (!hasGancho) {
          errors.push('El script debe tener un gancho (hook)');
        }

        // Validar contenido
        const contenidoCount = script.contenido?.length || 0;
        const hasContenido =
          contenidoCount >= SCRIPT_STRUCTURE.MIN_CONTENIDO_PUNTOS &&
          contenidoCount <= SCRIPT_STRUCTURE.MAX_CONTENIDO_PUNTOS;

        if (contenidoCount < SCRIPT_STRUCTURE.MIN_CONTENIDO_PUNTOS) {
          errors.push(
            `El contenido debe tener al menos ${SCRIPT_STRUCTURE.MIN_CONTENIDO_PUNTOS} puntos ` +
            `(tiene ${contenidoCount})`
          );
        } else if (contenidoCount > SCRIPT_STRUCTURE.MAX_CONTENIDO_PUNTOS) {
          warnings.push(
            `El contenido tiene ${contenidoCount} puntos, ` +
            `maximo recomendado: ${SCRIPT_STRUCTURE.MAX_CONTENIDO_PUNTOS}`
          );
        }

        // Validar impacto
        const hasImpacto = !!(script.impacto && script.impacto.trim().length > 0);
        if (!hasImpacto) {
          errors.push('El script debe tener un mensaje de impacto');
        }

        // Validar CTA
        const hasCTA = !!(script.cta && script.cta.trim().length > 0);
        if (!hasCTA) {
          errors.push('El script debe tener un Call to Action (CTA)');
        }

        // Validar tags
        const tagsCount = script.tags?.length || 0;
        const hasTags =
          tagsCount >= SCRIPT_STRUCTURE.MIN_TAGS &&
          tagsCount <= SCRIPT_STRUCTURE.MAX_TAGS;

        if (tagsCount < SCRIPT_STRUCTURE.MIN_TAGS) {
          errors.push(
            `El script debe tener al menos ${SCRIPT_STRUCTURE.MIN_TAGS} tags ` +
            `(tiene ${tagsCount})`
          );
        } else if (tagsCount > SCRIPT_STRUCTURE.MAX_TAGS) {
          warnings.push(
            `El script tiene ${tagsCount} tags, ` +
            `maximo recomendado: ${SCRIPT_STRUCTURE.MAX_TAGS}`
          );
        }

        const isValid = errors.length === 0;

        return {
          isValid,
          hasTitle,
          hasGancho,
          hasContenido,
          hasImpacto,
          hasCTA,
          hasTags,
          contenidoCount,
          tagsCount,
          errors,
          warnings,
        };
      }
    );

    // Log resultado
    this.getLogger().logValidationResults({
      validatorName: 'ScriptStructureValidator',
      target: script.title || 'script',
      passed: result.isValid,
      errors: result.errors.length > 0 ? result.errors : undefined,
      warnings: result.warnings.length > 0 ? result.warnings : undefined,
      details: {
        type: 'script-structure',
        hasTitle: result.hasTitle,
        hasGancho: result.hasGancho,
        hasContenido: result.hasContenido,
        contenidoCount: result.contenidoCount,
        tagsCount: result.tagsCount,
      },
    });

    this.logInfo('Validacion de estructura completada', {
      isValid: result.isValid,
      errorCount: result.errors.length,
      duration: `${duration}ms`,
    });

    return result;
  }

  /**
   * Valida la longitud del contenido del script
   *
   * Verifica que cada seccion tenga la longitud apropiada
   * para una narracion TTS de 25-60 segundos.
   *
   * @param {VideoScript} script - Script a validar
   * @returns {Promise<ScriptLengthValidation>} Resultado de la validacion
   *
   * @example
   * const result = await validator.validateScriptLength(script);
   * console.log(`Duracion estimada: ${result.estimatedDuration}s`);
   */
  async validateScriptLength(
    script: VideoScript
  ): Promise<ScriptLengthValidation> {
    this.logInfo('Validando longitud de script');

    const { result, duration } = await this.executeWithTiming(
      'validateScriptLength',
      async () => {
        await this.simulateDelay(CONTENT_VALIDATION_DELAYS.LENGTH_VALIDATION);

        const errors: string[] = [];
        const sectionsOverLimit: string[] = [];
        const sectionsUnderLimit: string[] = [];
        const { SCRIPT_LENGTH, VIDEO_DURATION_ESTIMATE } = CONTENT_VALIDATION;

        // Contar palabras por seccion
        const titleWords = this.countWords(script.title);
        const ganchoWords = this.countWords(script.gancho);
        const contenidoWords = script.contenido?.map(c => this.countWords(c)) || [];
        const impactoWords = this.countWords(script.impacto);
        const ctaWords = this.countWords(script.cta);
        const totalWords = titleWords + ganchoWords +
          contenidoWords.reduce((a, b) => a + b, 0) +
          impactoWords + ctaWords;

        // Validar titulo
        if (titleWords < SCRIPT_LENGTH.TITLE.MIN) {
          sectionsUnderLimit.push('title');
          errors.push(`Titulo muy corto: ${titleWords} palabras (min: ${SCRIPT_LENGTH.TITLE.MIN})`);
        } else if (titleWords > SCRIPT_LENGTH.TITLE.MAX) {
          sectionsOverLimit.push('title');
          errors.push(`Titulo muy largo: ${titleWords} palabras (max: ${SCRIPT_LENGTH.TITLE.MAX})`);
        }

        // Validar gancho
        if (ganchoWords < SCRIPT_LENGTH.GANCHO.MIN) {
          sectionsUnderLimit.push('gancho');
          errors.push(`Gancho muy corto: ${ganchoWords} palabras (min: ${SCRIPT_LENGTH.GANCHO.MIN})`);
        } else if (ganchoWords > SCRIPT_LENGTH.GANCHO.MAX) {
          sectionsOverLimit.push('gancho');
          errors.push(`Gancho muy largo: ${ganchoWords} palabras (max: ${SCRIPT_LENGTH.GANCHO.MAX})`);
        }

        // Validar cada punto de contenido
        contenidoWords.forEach((words, index) => {
          if (words < SCRIPT_LENGTH.CONTENIDO_PUNTO.MIN) {
            sectionsUnderLimit.push(`contenido[${index}]`);
            errors.push(`Contenido punto ${index + 1} muy corto: ${words} palabras`);
          } else if (words > SCRIPT_LENGTH.CONTENIDO_PUNTO.MAX) {
            sectionsOverLimit.push(`contenido[${index}]`);
            errors.push(`Contenido punto ${index + 1} muy largo: ${words} palabras`);
          }
        });

        // Validar impacto
        if (impactoWords < SCRIPT_LENGTH.IMPACTO.MIN) {
          sectionsUnderLimit.push('impacto');
          errors.push(`Impacto muy corto: ${impactoWords} palabras (min: ${SCRIPT_LENGTH.IMPACTO.MIN})`);
        } else if (impactoWords > SCRIPT_LENGTH.IMPACTO.MAX) {
          sectionsOverLimit.push('impacto');
          errors.push(`Impacto muy largo: ${impactoWords} palabras (max: ${SCRIPT_LENGTH.IMPACTO.MAX})`);
        }

        // Validar CTA
        if (ctaWords < SCRIPT_LENGTH.CTA.MIN) {
          sectionsUnderLimit.push('cta');
          errors.push(`CTA muy corto: ${ctaWords} palabras (min: ${SCRIPT_LENGTH.CTA.MIN})`);
        } else if (ctaWords > SCRIPT_LENGTH.CTA.MAX) {
          sectionsOverLimit.push('cta');
          errors.push(`CTA muy largo: ${ctaWords} palabras (max: ${SCRIPT_LENGTH.CTA.MAX})`);
        }

        // Validar total
        if (totalWords < SCRIPT_LENGTH.TOTAL.MIN) {
          errors.push(`Script muy corto: ${totalWords} palabras (min: ${SCRIPT_LENGTH.TOTAL.MIN})`);
        } else if (totalWords > SCRIPT_LENGTH.TOTAL.MAX) {
          errors.push(`Script muy largo: ${totalWords} palabras (max: ${SCRIPT_LENGTH.TOTAL.MAX})`);
        }

        // Calcular duracion estimada
        const estimatedDuration = totalWords / VIDEO_DURATION_ESTIMATE.WORDS_PER_SECOND;
        const durationInRange =
          estimatedDuration >= VIDEO_DURATION_ESTIMATE.MIN_SECONDS &&
          estimatedDuration <= VIDEO_DURATION_ESTIMATE.MAX_SECONDS;

        if (!durationInRange) {
          errors.push(
            `Duracion estimada ${estimatedDuration.toFixed(1)}s fuera de rango ` +
            `(${VIDEO_DURATION_ESTIMATE.MIN_SECONDS}-${VIDEO_DURATION_ESTIMATE.MAX_SECONDS}s)`
          );
        }

        const isValid = errors.length === 0;

        return {
          isValid,
          wordCounts: {
            title: titleWords,
            gancho: ganchoWords,
            contenido: contenidoWords,
            impacto: impactoWords,
            cta: ctaWords,
            total: totalWords,
          },
          estimatedDuration: Math.round(estimatedDuration * 10) / 10,
          durationInRange,
          sectionsOverLimit,
          sectionsUnderLimit,
          errors,
        };
      }
    );

    this.logInfo('Validacion de longitud completada', {
      totalWords: result.wordCounts.total,
      estimatedDuration: `${result.estimatedDuration}s`,
      isValid: result.isValid,
      duration: `${duration}ms`,
    });

    return result;
  }

  /**
   * Valida la deteccion de topico del contenido
   *
   * Verifica que el topico detectado sea correcto, relevante
   * y aparezca en el contenido.
   *
   * @param {string} newsContent - Contenido de la noticia
   * @param {string} detectedTopic - Topico detectado
   * @returns {Promise<TopicValidation>} Resultado de la validacion
   *
   * @example
   * const result = await validator.validateTopicDetection(
   *   'OpenAI ha lanzado un nuevo modelo...',
   *   'openai'
   * );
   */
  async validateTopicDetection(
    newsContent: string,
    detectedTopic: string
  ): Promise<TopicValidation> {
    this.logInfo('Validando deteccion de topico', {
      detectedTopic,
      contentLength: newsContent.length,
    });

    const { result, duration } = await this.executeWithTiming(
      'validateTopicDetection',
      async () => {
        await this.simulateDelay(CONTENT_VALIDATION_DELAYS.TOPIC_DETECTION);

        const errors: string[] = [];
        const contentLower = newsContent.toLowerCase();
        const topicLower = detectedTopic.toLowerCase();

        // Verificar si el topico esta en la lista de validos
        const isValidTopic = CONTENT_VALIDATION.VALID_TOPICS.includes(topicLower);
        if (!isValidTopic) {
          errors.push(`Topico '${detectedTopic}' no esta en la lista de topicos validos`);
        }

        // Verificar si el topico aparece en el contenido
        const topicInContent = contentLower.includes(topicLower);
        if (!topicInContent) {
          errors.push(`Topico '${detectedTopic}' no aparece en el contenido`);
        }

        // Calcular relevancia (mock: basado en frecuencia)
        const topicOccurrences = (contentLower.match(new RegExp(topicLower, 'g')) || []).length;
        const relevanceScore = Math.min(100, topicOccurrences * 25);

        // Sugerir topicos basados en contenido
        const suggestedTopics = CONTENT_VALIDATION.VALID_TOPICS.filter(topic =>
          contentLower.includes(topic.toLowerCase())
        );

        const isValid = errors.length === 0 && relevanceScore >= 25;

        return {
          isValid,
          detectedTopic,
          isValidTopic,
          topicInContent,
          relevanceScore,
          suggestedTopics,
          errors,
        };
      }
    );

    this.logInfo('Validacion de topico completada', {
      isValid: result.isValid,
      relevanceScore: result.relevanceScore,
      duration: `${duration}ms`,
    });

    return result;
  }

  /**
   * Valida una URL de imagen para el video
   *
   * Verifica que la URL sea valida, accesible y relevante
   * al topico del contenido.
   *
   * @param {string} topic - Topico del contenido
   * @param {string} imageUrl - URL de la imagen a validar
   * @returns {Promise<ImageValidation>} Resultado de la validacion
   *
   * @example
   * const result = await validator.validateImageSearch(
   *   'openai',
   *   'https://example.com/openai-logo.png'
   * );
   */
  async validateImageSearch(
    topic: string,
    imageUrl: string
  ): Promise<ImageValidation> {
    this.logInfo('Validando imagen', {
      topic,
      imageUrl: imageUrl?.substring(0, 50) + '...',
    });

    const { result, duration } = await this.executeWithTiming(
      'validateImageSearch',
      async () => {
        await this.simulateDelay(CONTENT_VALIDATION_DELAYS.IMAGE_VALIDATION);

        const errors: string[] = [];

        // Validar formato de URL
        const hasValidUrl = this.isValidUrl(imageUrl);
        if (!hasValidUrl) {
          errors.push('URL de imagen no tiene formato valido');
        }

        // Mock: Simular accesibilidad (siempre true para URLs validas)
        const isAccessible = hasValidUrl;

        // Verificar relevancia al topico (mock: verificar si URL contiene topico)
        const isRelevantToTopic = imageUrl?.toLowerCase().includes(topic.toLowerCase()) || false;

        // Fallback disponible
        const hasFallback = true;
        const fallbackUrl = 'https://example.com/placeholder-ai-logo.png';

        const isValid = hasValidUrl && isAccessible;

        if (!isRelevantToTopic) {
          // No es error, solo advertencia
        }

        return {
          isValid,
          hasValidUrl,
          isAccessible,
          isRelevantToTopic,
          hasFallback,
          fallbackUrl: !isValid ? fallbackUrl : undefined,
          errors,
        };
      }
    );

    this.logInfo('Validacion de imagen completada', {
      isValid: result.isValid,
      isRelevantToTopic: result.isRelevantToTopic,
      duration: `${duration}ms`,
    });

    return result;
  }

  /**
   * Valida la calidad general del contenido
   *
   * Verifica que el contenido no tenga repeticiones, sea coherente,
   * use lenguaje apropiado y sea informativo.
   *
   * @param {VideoScript} script - Script a validar
   * @returns {Promise<ContentQualityValidation>} Resultado de la validacion
   *
   * @example
   * const result = await validator.validateContentQuality(script);
   * if (result.hasRepetitions) {
   *   console.log('Frases repetidas:', result.repetitions);
   * }
   */
  async validateContentQuality(
    script: VideoScript
  ): Promise<ContentQualityValidation> {
    this.logInfo('Validando calidad de contenido');

    const { result, duration } = await this.executeWithTiming(
      'validateContentQuality',
      async () => {
        await this.simulateDelay(CONTENT_VALIDATION_DELAYS.QUALITY_VALIDATION);

        const errors: string[] = [];
        const warnings: string[] = [];

        // Combinar todo el contenido para analisis
        const allContent = [
          script.title,
          script.gancho,
          ...script.contenido,
          script.impacto,
          script.cta,
        ].join(' ').toLowerCase();

        // Detectar repeticiones
        const repetitions = this.findRepetitions(script);
        const hasRepetitions = repetitions.length > 0;
        if (hasRepetitions) {
          warnings.push(`Se encontraron ${repetitions.length} frases repetidas`);
        }

        // Evaluar coherencia (mock: verificar que palabras del titulo aparezcan en contenido)
        const titleWords = script.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const titleWordsInContent = titleWords.filter(word => allContent.includes(word));
        const coherenceScore = titleWords.length > 0
          ? Math.round((titleWordsInContent.length / titleWords.length) * 100)
          : 0;
        const isCoherent = coherenceScore >= 50;

        if (!isCoherent) {
          errors.push(`Contenido poco coherente con el titulo (score: ${coherenceScore}%)`);
        }

        // Detectar lenguaje inapropiado
        const inappropriateWords = CONTENT_VALIDATION.INAPPROPRIATE_WORDS.filter(word =>
          allContent.includes(word.toLowerCase())
        );
        const hasInappropriateLanguage = inappropriateWords.length > 0;

        if (hasInappropriateLanguage) {
          errors.push(`Contenido contiene lenguaje inapropiado: ${inappropriateWords.join(', ')}`);
        }

        // Verificar si es informativo (tiene datos/estadisticas o terminos especificos)
        const hasNumbers = /\d+/.test(allContent);
        const hasSpecificTerms = CONTENT_VALIDATION.TECH_KEYWORDS.some(term =>
          allContent.includes(term.toLowerCase())
        );
        const isInformative = hasNumbers || hasSpecificTerms;

        if (!isInformative) {
          warnings.push('El contenido podria ser mas informativo (agregar datos o estadisticas)');
        }

        // Verificar terminologia tech
        const techTermsFound = CONTENT_VALIDATION.TECH_KEYWORDS.filter(term =>
          allContent.includes(term.toLowerCase())
        );
        const hasTechTerms = techTermsFound.length >= 2;

        if (!hasTechTerms) {
          warnings.push('Contenido tiene pocos terminos tecnicos');
        }

        const isValid = errors.length === 0;

        return {
          isValid,
          hasRepetitions,
          repetitions,
          isCoherent,
          coherenceScore,
          hasInappropriateLanguage,
          inappropriateWords,
          isInformative,
          hasTechTerms,
          techTermsFound,
          errors,
          warnings,
        };
      }
    );

    this.getLogger().logValidationResults({
      validatorName: 'ContentQualityValidator',
      target: script.title,
      passed: result.isValid,
      errors: result.errors.length > 0 ? result.errors : undefined,
      warnings: result.warnings.length > 0 ? result.warnings : undefined,
      details: {
        type: 'content-quality',
        coherenceScore: result.coherenceScore,
        hasRepetitions: result.hasRepetitions,
        techTermsCount: result.techTermsFound.length,
      },
    });

    this.logInfo('Validacion de calidad completada', {
      isValid: result.isValid,
      coherenceScore: result.coherenceScore,
      techTermsFound: result.techTermsFound.length,
      duration: `${duration}ms`,
    });

    return result;
  }

  // ============================================================================
  // METODOS PRIVADOS AUXILIARES
  // ============================================================================

  /**
   * Cuenta las palabras en un texto
   *
   * @private
   */
  private countWords(text: string | undefined): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Verifica si una URL tiene formato valido
   *
   * @private
   */
  private isValidUrl(url: string | undefined): boolean {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Encuentra frases repetidas en el script
   *
   * @private
   */
  private findRepetitions(script: VideoScript): string[] {
    const allPhrases = [
      script.gancho,
      ...script.contenido,
      script.impacto,
      script.cta,
    ].filter(Boolean);

    const repetitions: string[] = [];
    const seen = new Set<string>();

    for (const phrase of allPhrases) {
      // Normalizar: minusculas, quitar signos de puntuacion especiales, trim
      const normalized = this.normalizePhrase(phrase);
      if (seen.has(normalized)) {
        repetitions.push(phrase);
      } else {
        seen.add(normalized);
      }
    }

    return repetitions;
  }

  /**
   * Normaliza una frase para comparacion
   * Quita signos de puntuacion especiales y convierte a minusculas
   *
   * @private
   */
  private normalizePhrase(phrase: string): string {
    return phrase
      .toLowerCase()
      .trim()
      // Quitar signos de puntuacion especiales al inicio y final
      .replace(/^[¡¿!?.,;:]+/, '')
      .replace(/[¡¿!?.,;:]+$/, '')
      .trim();
  }
}

export default ContentValidationServiceObject;
