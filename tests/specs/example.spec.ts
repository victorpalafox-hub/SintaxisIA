/**
 * @fileoverview Ejemplos completos de uso del TestLogger
 *
 * Este archivo demuestra todas las capacidades del sistema de logging
 * para tests de Playwright. Incluye ejemplos de:
 *
 * - Logging de llamadas API (request/response)
 * - Logging de generación de video con progreso
 * - Logging de validaciones de contenido
 * - Logging de errores y manejo de excepciones
 *
 * Cada test es independiente y puede ejecutarse por separado.
 * Los tests usan simulaciones con delays para representar
 * operaciones reales sin hacer llamadas externas.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 *
 * @example
 * // Ejecutar todos los tests de ejemplo:
 * npx playwright test tests/specs/example.spec.ts
 *
 * // Ejecutar un test específico:
 * npx playwright test -g "debe registrar llamadas API"
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';

// ===================================
// CONFIGURACIÓN DEL TEST SUITE
// ===================================

/**
 * Suite principal de ejemplos del TestLogger
 *
 * Contiene 4 tests que demuestran las diferentes
 * capacidades del sistema de logging.
 */
test.describe('TestLogger - Ejemplos de Uso', () => {
  /** Instancia del logger para cada test */
  let logger: TestLogger;

  /** Timestamp de inicio del test actual */
  let testStartTime: number;

  // ===================================
  // HOOKS DE CONFIGURACIÓN
  // ===================================

  /**
   * Hook beforeEach - Se ejecuta antes de cada test
   *
   * Inicializa el logger con el nombre del test actual,
   * registra el inicio del test y muestra separadores
   * visuales en los logs para mejor legibilidad.
   *
   * @param testInfo - Información del test proporcionada por Playwright
   */
  test.beforeEach(async ({}, testInfo) => {
    // Guardar timestamp de inicio para calcular duración
    testStartTime = Date.now();

    // Crear nueva instancia del logger con el nombre del test
    logger = new TestLogger({
      testName: testInfo.title,
      console: true,
      file: true,
    });

    // Registrar inicio del test en el sistema de logging
    logger.logTestStart(testInfo.title);

    // Mostrar separadores visuales para mejor legibilidad
    const separator = '='.repeat(60);
    logger.info(separator);
    logger.info(`Ejecutando: ${testInfo.title}`);
    logger.info(separator);
  });

  /**
   * Hook afterEach - Se ejecuta después de cada test
   *
   * Registra el fin del test con su estado y duración,
   * genera un resumen de la ejecución y lo guarda
   * en un archivo JSON para análisis posterior.
   *
   * @param testInfo - Información del test proporcionada por Playwright
   */
  test.afterEach(async ({}, testInfo) => {
    // Calcular duración total del test
    const duration = Date.now() - testStartTime;

    // Determinar el estado del test
    const status = testInfo.status === 'passed' ? 'passed'
      : testInfo.status === 'failed' ? 'failed'
      : testInfo.status === 'skipped' ? 'skipped'
      : 'timeout';

    // Mostrar separadores visuales de cierre
    const separator = '='.repeat(60);
    logger.info(separator);
    logger.info(`Test finalizado: ${status.toUpperCase()}`);
    logger.info(separator);

    // Registrar fin del test en el sistema de logging
    logger.logTestEnd(testInfo.title, status, duration);

    // Generar y guardar resumen de ejecución
    const summary = logger.generateSummary();
    await logger.saveSummaryToFile(summary);

    // Cerrar el logger para liberar recursos
    await logger.close();
  });

  // ===================================
  // TEST 1: LLAMADAS API
  // ===================================

  /**
   * Test 1: Demuestra el logging de llamadas API
   *
   * Este test simula una llamada a la API de Google Gemini
   * para generar contenido. Demuestra:
   *
   * - logApiRequest(): Registra la petición saliente
   * - logApiResponse(): Registra la respuesta recibida
   * - Sanitización automática de headers sensibles
   * - Medición de duración de llamadas
   *
   * La simulación incluye un delay de 1200ms para
   * representar el tiempo real de una llamada API.
   */
  test('debe registrar llamadas API simuladas', async () => {
    // ----------------------------------------
    // Paso 1: Preparar datos de la petición
    // ----------------------------------------
    logger.info('📤 Preparando petición a Gemini API...');

    const requestData = {
      url: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk_live_abc123xyz789_secret_key', // Será sanitizado
        'X-API-Key': 'gemini_api_key_12345', // Será sanitizado
      },
      body: {
        contents: [{
          parts: [{
            text: 'Genera un script corto sobre inteligencia artificial para un video de YouTube Shorts',
          }],
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          topP: 0.9,
        },
      },
    };

    // ----------------------------------------
    // Paso 2: Registrar la petición API
    // ----------------------------------------
    logger.info('📝 Registrando petición en el logger...');
    logger.logApiRequest('Gemini', requestData);

    // ----------------------------------------
    // Paso 3: Simular tiempo de respuesta API
    // ----------------------------------------
    logger.info('⏳ Esperando respuesta de la API (simulando 1200ms)...');
    const apiStartTime = Date.now();

    await new Promise(resolve => setTimeout(resolve, 1200));

    const apiDuration = Date.now() - apiStartTime;
    logger.info(`✅ Respuesta recibida en ${apiDuration}ms`);

    // ----------------------------------------
    // Paso 4: Preparar datos de respuesta
    // ----------------------------------------
    const responseData = {
      url: requestData.url,
      statusCode: 200,
      statusText: 'OK',
      duration: apiDuration,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': 'req_abc123xyz789',
      },
      body: {
        candidates: [{
          content: {
            parts: [{
              text: '🤖 La inteligencia artificial está transformando el mundo. Desde asistentes virtuales hasta diagnósticos médicos, la IA está en todas partes. ¿Estás listo para el futuro?',
            }],
          },
          finishReason: 'STOP',
        }],
        usageMetadata: {
          promptTokenCount: 45,
          candidatesTokenCount: 52,
          totalTokenCount: 97,
        },
      },
    };

    // ----------------------------------------
    // Paso 5: Registrar la respuesta API
    // ----------------------------------------
    logger.info('📝 Registrando respuesta en el logger...');
    logger.logApiResponse('Gemini', responseData);

    // ----------------------------------------
    // Paso 6: Validaciones
    // ----------------------------------------
    logger.info('✔️ Verificando resultados...');

    // Verificar que el status code es exitoso
    expect(responseData.statusCode).toBe(200);

    // Verificar que la respuesta contiene el texto generado
    expect(responseData.body.candidates[0].content.parts[0].text).toContain('inteligencia artificial');

    // Verificar que se registró el uso de tokens
    expect(responseData.body.usageMetadata.totalTokenCount).toBeGreaterThan(0);

    // Verificar que la duración es razonable
    expect(apiDuration).toBeGreaterThanOrEqual(1000);

    logger.info('🎉 Test de API completado exitosamente');
  });

  // ===================================
  // TEST 2: GENERACIÓN DE VIDEO
  // ===================================

  /**
   * Test 2: Demuestra el logging de generación de video
   *
   * Este test simula el proceso completo de renderizado
   * de un video con Remotion. Demuestra:
   *
   * - logVideoGeneration() con diferentes estados
   * - Tracking de progreso (0%, 25%, 50%, 75%, 100%)
   * - Información de configuración del video
   * - Métricas finales (tamaño, duración, tiempo de render)
   *
   * La simulación incluye delays de 500ms entre fases
   * para representar el progreso real del renderizado.
   */
  test('debe registrar generación de video simulada', async () => {
    // ID único para el video
    const videoId = `video_${Date.now()}`;

    // ----------------------------------------
    // Fase 1: Inicio de generación
    // ----------------------------------------
    logger.info('🎬 Iniciando proceso de generación de video...');

    logger.logVideoGeneration({
      videoId,
      title: 'AI News - Últimas Novedades',
      status: 'started',
      resolution: { width: 1920, height: 1080 },
      fps: 30,
      durationSeconds: 30,
    });

    // Simular tiempo de inicialización
    await new Promise(resolve => setTimeout(resolve, 500));

    // ----------------------------------------
    // Fase 2: Progreso 25% - Renderizando frames
    // ----------------------------------------
    logger.info('🖼️ Renderizando frames... (25%)');

    logger.logVideoGeneration({
      videoId,
      status: 'processing',
      progress: 25,
    });

    // Simular tiempo de renderizado de frames
    await new Promise(resolve => setTimeout(resolve, 500));

    // ----------------------------------------
    // Fase 3: Progreso 50% - Aplicando transiciones
    // ----------------------------------------
    logger.info('✨ Aplicando transiciones... (50%)');

    logger.logVideoGeneration({
      videoId,
      status: 'processing',
      progress: 50,
    });

    // Simular tiempo de aplicación de transiciones
    await new Promise(resolve => setTimeout(resolve, 500));

    // ----------------------------------------
    // Fase 4: Progreso 75% - Codificando video
    // ----------------------------------------
    logger.info('🔧 Codificando video (H.264)... (75%)');

    logger.logVideoGeneration({
      videoId,
      status: 'processing',
      progress: 75,
    });

    // Simular tiempo de codificación
    await new Promise(resolve => setTimeout(resolve, 500));

    // ----------------------------------------
    // Fase 5: Completado - 100%
    // ----------------------------------------
    const renderTime = 2000; // 2 segundos simulados
    const outputPath = `./output/${videoId}.mp4`;
    const fileSize = 15678234; // ~15 MB

    logger.info('✅ Generación completada (100%)');

    logger.logVideoGeneration({
      videoId,
      title: 'AI News - Últimas Novedades',
      status: 'completed',
      resolution: { width: 1920, height: 1080 },
      fps: 30,
      durationSeconds: 30.5,
      fileSize,
      outputPath,
      progress: 100,
    });

    // ----------------------------------------
    // Validaciones
    // ----------------------------------------
    logger.info('✔️ Verificando resultados de generación...');

    // Verificar que el video tiene un ID válido
    expect(videoId).toMatch(/^video_\d+$/);

    // Verificar tamaño del archivo (debe ser mayor a 10MB para un video de 30s)
    expect(fileSize).toBeGreaterThan(10000000);

    // Verificar que la ruta de salida es correcta
    expect(outputPath).toContain(videoId);
    expect(outputPath.endsWith('.mp4')).toBe(true);

    // Verificar duración del video
    expect(30.5).toBeGreaterThanOrEqual(30);

    logger.info(`🎉 Video generado exitosamente: ${outputPath}`);
    logger.info(`📊 Tamaño: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`⏱️ Tiempo de render: ${renderTime}ms`);
  });

  // ===================================
  // TEST 3: VALIDACIONES DE CONTENIDO
  // ===================================

  /**
   * Test 3: Demuestra el logging de validaciones
   *
   * Este test simula tres tipos de validaciones que
   * se realizarían sobre un video generado:
   *
   * 1. Validación de texto (OCR) - Verifica textos en el video
   * 2. Validación de audio (STT) - Verifica el audio generado
   * 3. Validación de sincronización - Verifica timing audio/texto
   *
   * Demuestra el uso de logValidationResults() con
   * diferentes tipos de datos y resultados.
   */
  test('debe registrar validaciones de contenido', async () => {
    logger.info('🔍 Iniciando validaciones de contenido del video...');

    // ----------------------------------------
    // Validación 1: Texto (OCR)
    // ----------------------------------------
    logger.info('📝 Validación 1/3: Verificando textos en pantalla (OCR)...');

    const textValidation = {
      validatorName: 'TextOCRValidator',
      target: 'VideoFrames',
      passed: true,
      details: {
        type: 'text',
        expected: ['Inteligencia Artificial', 'IA', 'Tecnología'],
        actual: ['Inteligencia Artificial', 'IA', 'Tecnología', 'Futuro'],
        matchRate: 100,
        extraTextsFound: ['Futuro'],
      },
    };

    logger.logValidationResults(textValidation);

    // Simular tiempo de procesamiento OCR
    await new Promise(resolve => setTimeout(resolve, 300));

    logger.info('✅ Validación de texto: Todos los textos esperados encontrados');

    // ----------------------------------------
    // Validación 2: Audio (Speech-to-Text)
    // ----------------------------------------
    logger.info('🔊 Validación 2/3: Verificando audio generado (STT)...');

    const audioValidation = {
      validatorName: 'AudioSTTValidator',
      target: 'AudioTrack',
      passed: true,
      details: {
        type: 'audio',
        hasAudio: true,
        duration: 30.2,
        sampleRate: 44100,
        channels: 2,
        bitrate: 128000,
        transcription: 'La inteligencia artificial está transformando el mundo...',
        confidenceScore: 0.95,
        silenceSegments: 2,
        silenceDuration: 1.5,
      },
    };

    logger.logValidationResults(audioValidation);

    // Simular tiempo de procesamiento de audio
    await new Promise(resolve => setTimeout(resolve, 300));

    logger.info('✅ Validación de audio: Audio detectado y transcrito correctamente');

    // ----------------------------------------
    // Validación 3: Sincronización Audio-Texto
    // ----------------------------------------
    logger.info('🔄 Validación 3/3: Verificando sincronización audio-texto...');

    const syncValidation = {
      validatorName: 'AudioTextSyncValidator',
      target: 'VideoSync',
      passed: true,
      details: {
        type: 'sync',
        checkpoints: [
          { time: 5, expectedText: 'inteligencia', offset: 15, status: 'in_sync' },
          { time: 10, expectedText: 'artificial', offset: 8, status: 'in_sync' },
          { time: 15, expectedText: 'transformando', offset: 30, status: 'in_sync' },
          { time: 20, expectedText: 'mundo', offset: 5, status: 'in_sync' },
          { time: 25, expectedText: 'futuro', offset: 12, status: 'in_sync' },
        ],
        maxOffset: 30,
        avgOffset: 14,
        threshold: 100,
        syncQuality: 'excellent',
      },
    };

    logger.logValidationResults(syncValidation);

    // Simular tiempo de procesamiento de sincronización
    await new Promise(resolve => setTimeout(resolve, 300));

    logger.info('✅ Validación de sync: Sincronización dentro de límites aceptables');

    // ----------------------------------------
    // Resumen de validaciones
    // ----------------------------------------
    logger.info('📊 Resumen de validaciones:');
    logger.info('  • Texto (OCR): ✅ PASSED');
    logger.info('  • Audio (STT): ✅ PASSED');
    logger.info('  • Sincronización: ✅ PASSED');

    // ----------------------------------------
    // Validaciones finales
    // ----------------------------------------
    logger.info('✔️ Verificando resultados de todas las validaciones...');

    // Verificar que todas las validaciones pasaron
    expect(textValidation.passed).toBe(true);
    expect(audioValidation.passed).toBe(true);
    expect(syncValidation.passed).toBe(true);

    // Verificar detalles de la validación de texto
    expect(textValidation.details.matchRate).toBe(100);
    expect(textValidation.details.actual).toContain('Inteligencia Artificial');

    // Verificar detalles de la validación de audio
    expect(audioValidation.details.hasAudio).toBe(true);
    expect(audioValidation.details.duration).toBeGreaterThan(30);
    expect(audioValidation.details.confidenceScore).toBeGreaterThan(0.9);

    // Verificar detalles de la validación de sincronización
    expect(syncValidation.details.avgOffset).toBeLessThan(syncValidation.details.threshold);
    expect(syncValidation.details.checkpoints).toHaveLength(5);

    logger.info('🎉 Todas las validaciones completadas exitosamente');
  });

  // ===================================
  // TEST 4: MANEJO DE ERRORES
  // ===================================

  /**
   * Test 4: Demuestra el logging de errores
   *
   * Este test simula un escenario de error durante
   * una llamada API. Demuestra:
   *
   * - Logging de peticiones que fallan
   * - Captura y logging de excepciones
   * - Uso de logger.error() con stack traces
   * - Comportamiento del logger cuando un test falla
   *
   * NOTA: Este test está diseñado para FALLAR
   * intencionalmente para demostrar el logging
   * de tests fallidos.
   */
  test('debe registrar errores correctamente', async () => {
    logger.info('⚠️ Este test demostrará el manejo de errores...');

    // ----------------------------------------
    // Preparar petición API que fallará
    // ----------------------------------------
    logger.info('📤 Preparando petición API que causará error...');

    const requestData = {
      url: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_expired_token',
      },
      body: {
        contents: [{
          parts: [{ text: 'Test prompt' }],
        }],
      },
    };

    // ----------------------------------------
    // Registrar la petición
    // ----------------------------------------
    logger.logApiRequest('Gemini', requestData);

    // ----------------------------------------
    // Simular error de API
    // ----------------------------------------
    logger.info('💥 Simulando error de API...');

    let errorCaptured = false;
    let capturedError: Error | null = null;

    try {
      // Simular tiempo de respuesta antes del error
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simular error de rate limit
      throw new Error('Internal Server Error: API rate limit exceeded');
    } catch (error) {
      errorCaptured = true;
      capturedError = error as Error;

      // ----------------------------------------
      // Registrar el error capturado
      // ----------------------------------------
      logger.info('🔴 Error capturado, registrando en el logger...');

      // Registrar respuesta de error
      logger.logApiResponse('Gemini', {
        url: requestData.url,
        statusCode: 429,
        statusText: 'Too Many Requests',
        duration: 500,
        body: {
          error: {
            code: 429,
            message: 'API rate limit exceeded',
            status: 'RESOURCE_EXHAUSTED',
          },
        },
      });

      // Registrar error con stack trace completo
      logger.error(
        'Error durante llamada a Gemini API',
        error,
        {
          endpoint: requestData.url,
          method: requestData.method,
          timestamp: new Date().toISOString(),
          retryAfter: 60,
        },
      );

      logger.info('📝 Error registrado correctamente en los logs');
    }

    // ----------------------------------------
    // Demostrar logging adicional de errores
    // ----------------------------------------
    logger.info('📊 Información adicional del error:');
    logger.warn('Se recomienda implementar retry con backoff exponencial');
    logger.warn('Considerar cache de respuestas para reducir llamadas');

    // ----------------------------------------
    // Verificar que el error fue capturado correctamente
    // ----------------------------------------
    logger.info('✅ Verificando que el error fue manejado correctamente...');

    expect(errorCaptured).toBe(true);
    expect(capturedError).not.toBeNull();
    expect(capturedError?.message).toContain('API rate limit exceeded');

    logger.info('🎉 Test de manejo de errores completado exitosamente');
  });
});
