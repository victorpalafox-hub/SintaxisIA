/**
 * @fileoverview Tests de Validación de Contenido - Prompt 8
 *
 * Este archivo contiene tests que validan la calidad y estructura del contenido
 * generado para videos de YouTube Shorts, incluyendo scripts de Gemini,
 * detección de tópicos, obtención de imágenes y verificación de estándares.
 *
 * @description
 * Las pruebas cubren:
 * - Validación de estructura de scripts (titulo, gancho, contenido, CTA)
 * - Validación de longitud de contenido para TTS
 * - Detección y validación de tópicos
 * - Validación de búsqueda de imágenes
 * - Validación de calidad de contenido
 *
 * @prerequisites
 * - ContentValidationServiceObject implementado
 * - TestLogger configurado
 * - Constantes CONTENT_VALIDATION configuradas
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import {
  ContentValidationServiceObject,
  VideoScript,
} from '../page-objects';
import { CONTENT_VALIDATION } from '../config';

// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

/**
 * Script válido completo con todos los elementos requeridos
 * Cumple con todas las restricciones de longitud y estructura
 */
const VALID_SCRIPT: VideoScript = {
  title: 'OpenAI lanza GPT-5 y revoluciona la inteligencia artificial mundial',
  gancho: '¡Esto va a cambiar absolutamente todo lo que conocemos sobre la inteligencia artificial y el futuro de la tecnología!',
  contenido: [
    'OpenAI acaba de presentar GPT-5, su modelo de lenguaje más avanzado hasta la fecha con capacidades revolucionarias.',
    'Este nuevo modelo puede razonar en tiempo real, aprender de sus errores y adaptarse a nuevas situaciones.',
    'Las empresas tecnológicas ya están integrando GPT-5 en sus sistemas con resultados verdaderamente impresionantes.',
    'Los expertos predicen que esto acelerará la adopción de inteligencia artificial en absolutamente todos los sectores.',
  ],
  impacto: 'GPT-5 es diez veces más potente que su predecesor y consume cincuenta por ciento menos energía.',
  cta: 'Síguenos para más noticias de inteligencia artificial todos los días',
  tags: ['OpenAI', 'GPT5', 'IA', 'Tech'],
};

/**
 * Script sin gancho (hook)
 */
const SCRIPT_SIN_GANCHO: VideoScript = {
  title: 'Noticia importante sobre inteligencia artificial',
  gancho: '', // Vacío
  contenido: [
    'Este es el primer punto del contenido principal con información relevante.',
    'Este es el segundo punto del contenido con más detalles importantes.',
    'Este es el tercer punto del contenido para completar la estructura.',
  ],
  impacto: 'Este es el mensaje de impacto con datos relevantes.',
  cta: 'Síguenos para más contenido de tecnología',
  tags: ['IA', 'Tech', 'Noticias'],
};

/**
 * Script sin contenido principal
 */
const SCRIPT_SIN_CONTENIDO: VideoScript = {
  title: 'Título de prueba para validación de estructura',
  gancho: '¡Este es un gancho muy atractivo para captar la atención del espectador!',
  contenido: [], // Vacío
  impacto: 'Mensaje de impacto con estadística importante.',
  cta: 'Síguenos para más noticias de IA',
  tags: ['IA', 'Tech', 'Test'],
};

/**
 * Script sin CTA
 */
const SCRIPT_SIN_CTA: VideoScript = {
  title: 'Título de ejemplo para prueba sin CTA',
  gancho: '¡Descubre lo que está pasando en el mundo de la inteligencia artificial ahora mismo!',
  contenido: [
    'Primer punto del contenido con información relevante y detallada.',
    'Segundo punto del contenido con más datos interesantes.',
    'Tercer punto del contenido para cerrar la sección principal.',
  ],
  impacto: 'Dato impactante: La IA procesa millones de datos por segundo.',
  cta: '', // Vacío
  tags: ['IA', 'Datos', 'Tech'],
};

/**
 * Script con tags insuficientes
 */
const SCRIPT_POCOS_TAGS: VideoScript = {
  title: 'Título completo para prueba de validación de tags',
  gancho: '¡Noticia increíble que no te puedes perder sobre el futuro de la tecnología!',
  contenido: [
    'Primer punto del contenido principal con información relevante y datos.',
    'Segundo punto del contenido con detalles adicionales importantes.',
    'Tercer punto del contenido para completar la estructura requerida.',
  ],
  impacto: 'Estadística importante: El crecimiento de IA es exponencial.',
  cta: 'Síguenos para más contenido tecnológico',
  tags: ['IA'], // Solo 1 tag (mínimo 3)
};

/**
 * Script muy corto (menos de 100 palabras)
 */
const SCRIPT_MUY_CORTO: VideoScript = {
  title: 'Título corto',
  gancho: 'Gancho breve.',
  contenido: [
    'Punto uno.',
    'Punto dos.',
    'Punto tres.',
  ],
  impacto: 'Impacto.',
  cta: 'Síguenos.',
  tags: ['IA', 'Tech', 'News'],
};

/**
 * Script muy largo (más de 200 palabras)
 */
const SCRIPT_MUY_LARGO: VideoScript = {
  title: 'Este es un título extremadamente largo que contiene demasiadas palabras para ser efectivo en un video corto de YouTube Shorts',
  gancho: 'Este gancho es excesivamente largo y contiene demasiada información que debería ser más concisa y directa para captar la atención del espectador de manera efectiva y rápida en los primeros segundos del video.',
  contenido: [
    'Este es el primer punto del contenido que es extremadamente largo y contiene demasiada información detallada que debería ser más concisa para un formato de video corto.',
    'Este es el segundo punto del contenido que también es demasiado extenso y verbose, incluyendo muchos detalles innecesarios que alargan el video más allá de lo recomendado.',
    'El tercer punto del contenido sigue siendo muy extenso con información adicional que podría resumirse de manera más efectiva para el formato de Shorts.',
    'El cuarto punto continúa con la tendencia de ser demasiado largo y detallado para el formato requerido de videos cortos.',
    'El quinto punto también excede las recomendaciones de longitud para contenido de YouTube Shorts de manera significativa.',
    'El sexto punto agrega aún más contenido innecesario que hace el script demasiado largo para ser efectivo.',
    'El séptimo punto finaliza con más contenido extenso que excede claramente los límites recomendados.',
  ],
  impacto: 'Este mensaje de impacto es extremadamente largo y contiene demasiadas palabras que deberían ser más concisas.',
  cta: 'Por favor síguenos en todas nuestras redes sociales para recibir más contenido de tecnología e inteligencia artificial todos los días',
  tags: ['IA', 'Tech', 'News', 'AI'],
};

/**
 * Script con contenido repetido
 */
const SCRIPT_CON_REPETICIONES: VideoScript = {
  title: 'OpenAI revoluciona la inteligencia artificial con nuevo modelo',
  gancho: '¡La inteligencia artificial está cambiando todo lo que conocemos!',
  contenido: [
    'La inteligencia artificial está cambiando todo lo que conocemos!', // Repetición del gancho
    'OpenAI presenta innovaciones increíbles en el campo de la tecnología.',
    'Los modelos de lenguaje son cada vez más potentes y eficientes.',
  ],
  impacto: 'La inteligencia artificial procesa millones de datos por segundo.',
  cta: 'Síguenos para más noticias de tecnología',
  tags: ['OpenAI', 'IA', 'Tech'],
};

/**
 * Script con lenguaje inapropiado
 */
const SCRIPT_LENGUAJE_INAPROPIADO: VideoScript = {
  title: 'Noticia sobre inteligencia artificial y tecnología',
  gancho: '¡Esta mierda de noticia te va a sorprender mucho!', // Palabra inapropiada
  contenido: [
    'La inteligencia artificial está revolucionando el mundo tecnológico.',
    'Los nuevos modelos son increíblemente potentes y eficientes.',
    'Las empresas están adoptando estas tecnologías rápidamente.',
  ],
  impacto: 'El crecimiento de la IA es verdaderamente exponencial.',
  cta: 'Síguenos para más contenido de tecnología',
  tags: ['IA', 'Tech', 'Noticias'],
};

/**
 * Contenido de noticia sobre Anthropic
 */
const NEWS_CONTENT_ANTHROPIC = `
  Anthropic, la empresa detrás de Claude, ha anunciado una nueva versión de su modelo de lenguaje.
  Claude 3 Opus representa un avance significativo en capacidades de razonamiento y análisis.
  La compañía fundada por ex-empleados de OpenAI continúa su enfoque en IA segura y alineada.
  Anthropic ha recaudado más de 7 mil millones de dólares en inversiones recientes.
`;

/**
 * Contenido de noticia sobre OpenAI
 */
const NEWS_CONTENT_OPENAI = `
  OpenAI presenta GPT-5, su modelo más avanzado hasta la fecha.
  El nuevo modelo supera a GPT-4 en todas las métricas de rendimiento.
  Sam Altman confirma que GPT-5 representa un salto generacional en IA.
  Microsoft continúa su asociación estratégica con OpenAI.
`;

// ============================================================================
// SUITE 1: VALIDACIÓN DE ESTRUCTURA DE SCRIPTS
// ============================================================================

test.describe('Suite 1: Validación de Estructura de Scripts', () => {
  let logger: TestLogger;
  let validator: ContentValidationServiceObject;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ContentStructure' });
    validator = new ContentValidationServiceObject();
    logger.info('Test de validación de estructura iniciado');
  });

  /**
   * Test 1.1: Debe validar script con estructura completa
   */
  test('debe validar script con estructura completa', async () => {
    // Arrange
    logger.info('Validando script con estructura completa');

    // Act
    const result = await validator.validateScriptStructure(VALID_SCRIPT);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.hasTitle).toBe(true);
    expect(result.hasGancho).toBe(true);
    expect(result.hasContenido).toBe(true);
    expect(result.hasImpacto).toBe(true);
    expect(result.hasCTA).toBe(true);
    expect(result.hasTags).toBe(true);
    expect(result.errors).toHaveLength(0);

    logger.info('Script válido verificado', {
      contenidoCount: result.contenidoCount,
      tagsCount: result.tagsCount,
    });
  });

  /**
   * Test 1.2: Debe detectar script sin gancho
   */
  test('debe detectar script sin gancho', async () => {
    // Arrange
    logger.info('Validando script sin gancho');

    // Act
    const result = await validator.validateScriptStructure(SCRIPT_SIN_GANCHO);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.hasGancho).toBe(false);
    expect(result.errors.some(e => e.includes('gancho'))).toBe(true);

    logger.info('Error de gancho detectado', {
      errors: result.errors,
    });
  });

  /**
   * Test 1.3: Debe detectar script sin contenido principal
   */
  test('debe detectar script sin contenido principal', async () => {
    // Arrange
    logger.info('Validando script sin contenido');

    // Act
    const result = await validator.validateScriptStructure(SCRIPT_SIN_CONTENIDO);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.hasContenido).toBe(false);
    expect(result.contenidoCount).toBe(0);
    expect(result.errors.some(e => e.includes('contenido') || e.includes('puntos'))).toBe(true);

    logger.info('Error de contenido detectado', {
      contenidoCount: result.contenidoCount,
    });
  });

  /**
   * Test 1.4: Debe detectar script sin CTA
   */
  test('debe detectar script sin CTA', async () => {
    // Arrange
    logger.info('Validando script sin CTA');

    // Act
    const result = await validator.validateScriptStructure(SCRIPT_SIN_CTA);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.hasCTA).toBe(false);
    expect(result.errors.some(e => e.includes('CTA') || e.includes('Call to Action'))).toBe(true);

    logger.info('Error de CTA detectado', {
      errors: result.errors,
    });
  });

  /**
   * Test 1.5: Debe validar presencia de tags relevantes
   */
  test('debe validar presencia de tags relevantes', async () => {
    // Arrange
    logger.info('Validando tags del script');

    // Act
    const validResult = await validator.validateScriptStructure(VALID_SCRIPT);
    const invalidResult = await validator.validateScriptStructure(SCRIPT_POCOS_TAGS);

    // Assert
    expect(validResult.hasTags).toBe(true);
    expect(validResult.tagsCount).toBeGreaterThanOrEqual(CONTENT_VALIDATION.SCRIPT_STRUCTURE.MIN_TAGS);

    expect(invalidResult.hasTags).toBe(false);
    expect(invalidResult.tagsCount).toBeLessThan(CONTENT_VALIDATION.SCRIPT_STRUCTURE.MIN_TAGS);

    logger.info('Validación de tags completada', {
      validTags: validResult.tagsCount,
      invalidTags: invalidResult.tagsCount,
    });
  });
});

// ============================================================================
// SUITE 2: VALIDACIÓN DE LONGITUD DE CONTENIDO
// ============================================================================

test.describe('Suite 2: Validación de Longitud de Contenido', () => {
  let logger: TestLogger;
  let validator: ContentValidationServiceObject;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ContentLength' });
    validator = new ContentValidationServiceObject();
    logger.info('Test de validación de longitud iniciado');
  });

  /**
   * Test 2.1: Debe validar longitud total apropiada (100-200 palabras)
   */
  test('debe validar longitud total apropiada (100-200 palabras)', async () => {
    // Arrange
    const { TOTAL } = CONTENT_VALIDATION.SCRIPT_LENGTH;
    logger.info('Validando longitud total', {
      minWords: TOTAL.MIN,
      maxWords: TOTAL.MAX,
    });

    // Act
    const result = await validator.validateScriptLength(VALID_SCRIPT);

    // Assert
    expect(result.wordCounts.total).toBeGreaterThanOrEqual(TOTAL.MIN);
    expect(result.wordCounts.total).toBeLessThanOrEqual(TOTAL.MAX);

    logger.info('Longitud total verificada', {
      totalWords: result.wordCounts.total,
    });
  });

  /**
   * Test 2.2: Debe detectar script demasiado corto (<100 palabras)
   */
  test('debe detectar script demasiado corto (<100 palabras)', async () => {
    // Arrange
    logger.info('Validando script muy corto');

    // Act
    const result = await validator.validateScriptLength(SCRIPT_MUY_CORTO);

    // Assert
    expect(result.wordCounts.total).toBeLessThan(CONTENT_VALIDATION.SCRIPT_LENGTH.TOTAL.MIN);
    expect(result.errors.some(e => e.includes('corto'))).toBe(true);

    logger.info('Script corto detectado', {
      totalWords: result.wordCounts.total,
    });
  });

  /**
   * Test 2.3: Debe detectar script demasiado largo (>200 palabras)
   */
  test('debe detectar script demasiado largo (>200 palabras)', async () => {
    // Arrange
    logger.info('Validando script muy largo');

    // Act
    const result = await validator.validateScriptLength(SCRIPT_MUY_LARGO);

    // Assert
    expect(result.wordCounts.total).toBeGreaterThan(CONTENT_VALIDATION.SCRIPT_LENGTH.TOTAL.MAX);
    expect(result.errors.some(e => e.includes('largo'))).toBe(true);

    logger.info('Script largo detectado', {
      totalWords: result.wordCounts.total,
    });
  });

  /**
   * Test 2.4: Debe validar longitud de cada sección individualmente
   */
  test('debe validar longitud de cada sección individualmente', async () => {
    // Arrange
    logger.info('Validando secciones individuales');

    // Act
    const result = await validator.validateScriptLength(VALID_SCRIPT);

    // Assert
    expect(result.wordCounts.title).toBeGreaterThan(0);
    expect(result.wordCounts.gancho).toBeGreaterThan(0);
    expect(result.wordCounts.contenido.length).toBeGreaterThan(0);
    expect(result.wordCounts.impacto).toBeGreaterThan(0);
    expect(result.wordCounts.cta).toBeGreaterThan(0);

    logger.info('Conteos de palabras por sección', {
      title: result.wordCounts.title,
      gancho: result.wordCounts.gancho,
      contenidoPuntos: result.wordCounts.contenido.length,
      impacto: result.wordCounts.impacto,
      cta: result.wordCounts.cta,
    });
  });

  /**
   * Test 2.5: Debe estimar duración de video basada en palabras
   */
  test('debe estimar duración de video basada en palabras', async () => {
    // Arrange
    const { MIN_SECONDS, MAX_SECONDS } = CONTENT_VALIDATION.VIDEO_DURATION_ESTIMATE;
    logger.info('Estimando duración de video');

    // Act
    const result = await validator.validateScriptLength(VALID_SCRIPT);

    // Assert
    expect(result.estimatedDuration).toBeGreaterThanOrEqual(MIN_SECONDS);
    expect(result.estimatedDuration).toBeLessThanOrEqual(MAX_SECONDS);
    expect(result.durationInRange).toBe(true);

    logger.info('Duración estimada', {
      duration: `${result.estimatedDuration}s`,
      inRange: result.durationInRange,
    });
  });
});

// ============================================================================
// SUITE 3: VALIDACIÓN DE DETECCIÓN DE TÓPICOS
// ============================================================================

test.describe('Suite 3: Validación de Detección de Tópicos', () => {
  let logger: TestLogger;
  let validator: ContentValidationServiceObject;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'TopicDetection' });
    validator = new ContentValidationServiceObject();
    logger.info('Test de validación de tópicos iniciado');
  });

  /**
   * Test 3.1: Debe validar tópico detectado correcto
   */
  test('debe validar tópico detectado correcto', async () => {
    // Arrange
    logger.info('Validando tópico correcto: anthropic');

    // Act
    const result = await validator.validateTopicDetection(
      NEWS_CONTENT_ANTHROPIC,
      'anthropic'
    );

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.isValidTopic).toBe(true);
    expect(result.topicInContent).toBe(true);
    expect(result.relevanceScore).toBeGreaterThan(0);

    logger.info('Tópico validado correctamente', {
      relevanceScore: result.relevanceScore,
    });
  });

  /**
   * Test 3.2: Debe detectar tópico incorrecto
   */
  test('debe detectar tópico incorrecto', async () => {
    // Arrange
    logger.info('Validando tópico incorrecto');

    // Act - Contenido de OpenAI pero detectando "google"
    const result = await validator.validateTopicDetection(
      NEWS_CONTENT_OPENAI,
      'google'
    );

    // Assert
    expect(result.topicInContent).toBe(false);
    expect(result.errors.some(e => e.includes('no aparece'))).toBe(true);

    logger.info('Tópico incorrecto detectado', {
      errors: result.errors,
    });
  });

  /**
   * Test 3.3: Debe validar relevancia del tópico
   */
  test('debe validar relevancia del tópico', async () => {
    // Arrange
    logger.info('Validando relevancia de tópico');

    // Act
    const result = await validator.validateTopicDetection(
      NEWS_CONTENT_OPENAI,
      'openai'
    );

    // Assert
    expect(result.isValidTopic).toBe(true);
    expect(CONTENT_VALIDATION.VALID_TOPICS).toContain('openai');
    expect(result.relevanceScore).toBeGreaterThan(0);

    logger.info('Relevancia de tópico verificada', {
      relevanceScore: result.relevanceScore,
      isValidTopic: result.isValidTopic,
    });
  });

  /**
   * Test 3.4: Debe validar que el tópico está en el contenido
   */
  test('debe validar que el tópico está en el contenido', async () => {
    // Arrange
    logger.info('Verificando presencia de tópico en contenido');

    // Act
    const anthropicResult = await validator.validateTopicDetection(
      NEWS_CONTENT_ANTHROPIC,
      'anthropic'
    );
    const openaiResult = await validator.validateTopicDetection(
      NEWS_CONTENT_OPENAI,
      'openai'
    );

    // Assert
    expect(anthropicResult.topicInContent).toBe(true);
    expect(openaiResult.topicInContent).toBe(true);

    // Verificar sugerencias
    expect(anthropicResult.suggestedTopics).toContain('anthropic');
    expect(openaiResult.suggestedTopics).toContain('openai');

    logger.info('Presencia de tópico verificada', {
      anthropicInContent: anthropicResult.topicInContent,
      openaiInContent: openaiResult.topicInContent,
    });
  });
});

// ============================================================================
// SUITE 4: VALIDACIÓN DE BÚSQUEDA DE IMÁGENES
// ============================================================================

test.describe('Suite 4: Validación de Búsqueda de Imágenes', () => {
  let logger: TestLogger;
  let validator: ContentValidationServiceObject;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ImageSearch' });
    validator = new ContentValidationServiceObject();
    logger.info('Test de validación de imágenes iniciado');
  });

  /**
   * Test 4.1: Debe validar URL de imagen válida
   */
  test('debe validar URL de imagen válida', async () => {
    // Arrange
    const validUrl = 'https://example.com/images/openai-logo.png';
    logger.info('Validando URL de imagen válida');

    // Act
    const result = await validator.validateImageSearch('openai', validUrl);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.hasValidUrl).toBe(true);
    expect(result.isAccessible).toBe(true);

    logger.info('URL válida verificada', {
      hasValidUrl: result.hasValidUrl,
    });
  });

  /**
   * Test 4.2: Debe detectar URL de imagen inválida
   */
  test('debe detectar URL de imagen inválida', async () => {
    // Arrange
    const invalidUrl = 'not-a-valid-url';
    logger.info('Validando URL inválida');

    // Act
    const result = await validator.validateImageSearch('openai', invalidUrl);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.hasValidUrl).toBe(false);
    expect(result.errors.some(e => e.includes('URL') || e.includes('formato'))).toBe(true);

    logger.info('URL inválida detectada', {
      errors: result.errors,
    });
  });

  /**
   * Test 4.3: Debe validar relevancia de imagen con tópico
   */
  test('debe validar relevancia de imagen con tópico', async () => {
    // Arrange
    const relevantUrl = 'https://cdn.example.com/anthropic-claude-logo.png';
    const irrelevantUrl = 'https://cdn.example.com/random-image.png';
    logger.info('Validando relevancia de imagen');

    // Act
    const relevantResult = await validator.validateImageSearch('anthropic', relevantUrl);
    const irrelevantResult = await validator.validateImageSearch('anthropic', irrelevantUrl);

    // Assert
    expect(relevantResult.isRelevantToTopic).toBe(true);
    expect(irrelevantResult.isRelevantToTopic).toBe(false);

    logger.info('Relevancia de imagen verificada', {
      relevantMatch: relevantResult.isRelevantToTopic,
      irrelevantMatch: irrelevantResult.isRelevantToTopic,
    });
  });

  /**
   * Test 4.4: Debe tener imagen de fallback si falla búsqueda
   */
  test('debe tener imagen de fallback si falla búsqueda', async () => {
    // Arrange
    const invalidUrl = 'invalid-url';
    logger.info('Verificando imagen de fallback');

    // Act
    const result = await validator.validateImageSearch('openai', invalidUrl);

    // Assert
    expect(result.hasFallback).toBe(true);
    expect(result.fallbackUrl).toBeDefined();
    expect(result.fallbackUrl).toContain('http');

    logger.info('Fallback verificado', {
      hasFallback: result.hasFallback,
      fallbackUrl: result.fallbackUrl,
    });
  });
});

// ============================================================================
// SUITE 5: VALIDACIÓN DE CALIDAD DE CONTENIDO
// ============================================================================

test.describe('Suite 5: Validación de Calidad de Contenido', () => {
  let logger: TestLogger;
  let validator: ContentValidationServiceObject;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ContentQuality' });
    validator = new ContentValidationServiceObject();
    logger.info('Test de validación de calidad iniciado');
  });

  /**
   * Test 5.1: Debe detectar repeticiones exactas en contenido
   */
  test('debe detectar repeticiones exactas en contenido', async () => {
    // Arrange
    logger.info('Detectando repeticiones en contenido');

    // Act
    const result = await validator.validateContentQuality(SCRIPT_CON_REPETICIONES);

    // Assert
    expect(result.hasRepetitions).toBe(true);
    expect(result.repetitions.length).toBeGreaterThan(0);

    logger.info('Repeticiones detectadas', {
      count: result.repetitions.length,
      repetitions: result.repetitions,
    });
  });

  /**
   * Test 5.2: Debe validar coherencia del contenido
   */
  test('debe validar coherencia del contenido', async () => {
    // Arrange
    logger.info('Validando coherencia de contenido');

    // Act
    const result = await validator.validateContentQuality(VALID_SCRIPT);

    // Assert
    expect(result.isCoherent).toBe(true);
    expect(result.coherenceScore).toBeGreaterThanOrEqual(50);

    logger.info('Coherencia verificada', {
      isCoherent: result.isCoherent,
      coherenceScore: result.coherenceScore,
    });
  });

  /**
   * Test 5.3: Debe detectar lenguaje inapropiado
   */
  test('debe detectar lenguaje inapropiado', async () => {
    // Arrange
    logger.info('Detectando lenguaje inapropiado');

    // Act
    const result = await validator.validateContentQuality(SCRIPT_LENGUAJE_INAPROPIADO);

    // Assert
    expect(result.hasInappropriateLanguage).toBe(true);
    expect(result.inappropriateWords.length).toBeGreaterThan(0);
    expect(result.isValid).toBe(false);

    logger.info('Lenguaje inapropiado detectado', {
      words: result.inappropriateWords,
    });
  });

  /**
   * Test 5.4: Debe validar que el contenido es informativo
   */
  test('debe validar que el contenido es informativo', async () => {
    // Arrange
    logger.info('Validando contenido informativo');

    // Act
    const result = await validator.validateContentQuality(VALID_SCRIPT);

    // Assert
    expect(result.isInformative).toBe(true);

    logger.info('Contenido informativo verificado', {
      isInformative: result.isInformative,
    });
  });

  /**
   * Test 5.5: Debe validar formato adecuado para audiencia tech
   */
  test('debe validar formato adecuado para audiencia tech', async () => {
    // Arrange
    logger.info('Validando términos tech');

    // Act
    const result = await validator.validateContentQuality(VALID_SCRIPT);

    // Assert
    expect(result.hasTechTerms).toBe(true);
    expect(result.techTermsFound.length).toBeGreaterThanOrEqual(2);

    logger.info('Términos tech verificados', {
      hasTechTerms: result.hasTechTerms,
      termsFound: result.techTermsFound,
    });
  });
});
