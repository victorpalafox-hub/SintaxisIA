/**
 * @fileoverview Service Objects - Demo de Integración
 *
 * Este archivo de pruebas demuestra cómo usar los Service Objects creados
 * en el Prompt #6. Sirve tanto como validación de la implementación como
 * documentación de referencia para desarrollo futuro.
 *
 * @description
 * Los Service Objects implementan el patrón Page Object Model (POM) adaptado
 * para APIs y servicios. Esto proporciona:
 * - Encapsulación de la lógica de interacción con servicios
 * - Logging automático de todas las operaciones
 * - Métodos reutilizables para múltiples tests
 * - Separación clara entre lógica de test y lógica de servicio
 *
 * @example
 * // Importar Service Objects
 * import { GeminiServiceObject } from '../page-objects/services/GeminiServiceObject';
 * import { VideoServiceObject } from '../page-objects/services/VideoServiceObject';
 *
 * // Crear instancias
 * const gemini = new GeminiServiceObject();
 * const video = new VideoServiceObject();
 *
 * // Usar métodos
 * const script = await gemini.generateScript('prompt');
 * const videoPath = await video.generateVideo({ script: script.script, duration: 30 });
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { GeminiServiceObject } from '../page-objects/services/GeminiServiceObject';
import { VideoServiceObject } from '../page-objects/services/VideoServiceObject';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';

// ============================================================================
// VARIABLES COMPARTIDAS DEL SUITE
// ============================================================================

/**
 * Logger para registrar todas las operaciones del test.
 * Se inicializa en beforeEach con el nombre del test actual.
 */
let logger: TestLogger;

/**
 * Service Object para interactuar con Gemini API.
 * Proporciona métodos para generar scripts de video.
 */
let geminiSO: GeminiServiceObject;

/**
 * Service Object para operaciones de video.
 * Proporciona métodos para generar, validar y limpiar videos.
 */
let videoSO: VideoServiceObject;

// ============================================================================
// SUITE DE PRUEBAS: SERVICE OBJECTS - INTEGRATION DEMO
// ============================================================================

test.describe('Service Objects - Integration Demo', () => {
  // ==========================================================================
  // HOOKS DE CONFIGURACIÓN
  // ==========================================================================

  /**
   * Hook que se ejecuta ANTES de cada test.
   *
   * Inicializa:
   * - TestLogger con el nombre del test actual
   * - GeminiServiceObject para generación de scripts
   * - VideoServiceObject para operaciones de video
   *
   * El parámetro testInfo de Playwright nos da acceso a metadata del test.
   */
  test.beforeEach(async ({}, testInfo) => {
    // Inicializar logger con nombre del test desde testInfo de Playwright
    // Esto permite que cada test tenga su propio contexto de logging
    logger = new TestLogger({ testName: testInfo.title });
    logger.logTestStart(testInfo.title);

    // Inicializar Service Objects
    // Los Service Objects internamente crean sus propios loggers,
    // pero usamos el logger principal para mensajes del test
    geminiSO = new GeminiServiceObject();
    videoSO = new VideoServiceObject();

    // Confirmar inicialización exitosa
    logger.info('============================================================');
    logger.info(`Ejecutando: ${testInfo.title}`);
    logger.info('============================================================');
    logger.info('Service Objects inicializados exitosamente', {
      geminiService: geminiSO.getServiceName(),
      videoService: videoSO.getServiceName(),
    });
  });

  /**
   * Hook que se ejecuta DESPUÉS de cada test.
   *
   * Realiza:
   * - Limpieza de archivos de video temporales
   * - Registro de finalización del test con estado y duración
   * - Generación y guardado del resumen de ejecución
   *
   * Es importante limpiar archivos temporales para evitar acumulación.
   */
  test.afterEach(async ({}, testInfo) => {
    // Limpiar archivos de video temporales
    // Esto elimina todos los .mp4 generados en tests/temp/
    await videoSO.cleanup();

    // Registrar finalización del test con metadata de Playwright
    logger.logTestEnd(
      testInfo.title,
      testInfo.status || 'unknown',
      testInfo.duration
    );

    // Generar y guardar resumen de ejecución
    // Esto crea un archivo JSON con estadísticas del test
    const summary = logger.generateSummary();
    await logger.saveSummaryToFile(summary);

    logger.info('============================================================');
    logger.info(`Test finalizado: ${testInfo.status?.toUpperCase()}`);
    logger.info('============================================================');
  });

  // ==========================================================================
  // PRUEBA 1: GENERACIÓN DE SCRIPT CON GEMINI SERVICE OBJECT
  // ==========================================================================

  /**
   * Prueba 1: Uso básico de GeminiServiceObject
   *
   * Esta prueba demuestra cómo usar el GeminiServiceObject para generar
   * un script de video a partir de un prompt de texto. Valida que:
   * - El método generateScript() funciona correctamente
   * - El resultado contiene todos los campos esperados
   * - Los valores son razonables (script no vacío, tokens > 0, etc.)
   *
   * Este es el patrón más básico de uso de un Service Object:
   * crear instancia → llamar método → verificar resultado.
   */
  test('should use GeminiServiceObject to generate script from prompt', async () => {
    // ========================================
    // ARRANGE: Configurar datos de prueba
    // ========================================
    logger.info('📝 Preparando generación de script con GeminiServiceObject...');

    // Definir un prompt realista para generación de script
    // Este prompt simula lo que un usuario real pediría
    const prompt = 'Create a 30-second video script about artificial intelligence breakthroughs in 2025';

    logger.info('Prompt definido:', { prompt, length: prompt.length });

    // ========================================
    // ACT: Ejecutar el método del Service Object
    // ========================================
    logger.info('🚀 Ejecutando generación de script...');

    // Llamar al método generateScript() del Service Object
    // Los Service Objects automáticamente registran todas las operaciones vía TestLogger
    const result = await geminiSO.generateScript(prompt);

    // Registrar preview del resultado (primeros 100 caracteres)
    const scriptPreview = result.script.substring(0, 100) + '...';
    logger.info('✓ Script generado exitosamente', {
      preview: scriptPreview,
      fullLength: result.script.length,
      tokensUsed: result.tokensUsed,
      duration: `${result.duration}ms`,
    });

    // ========================================
    // ASSERT: Verificar resultados
    // ========================================
    logger.info('🔍 Verificando resultados...');

    // Esto demuestra el Patrón Service Object - lógica de prueba separada de interacción con servicio
    // El Service Object maneja toda la complejidad de la API, el test solo verifica resultados

    // Verificar que el resultado existe
    expect(result).toBeDefined();
    logger.debug('✓ Resultado definido');

    // Verificar que el script existe y tiene contenido
    expect(result.script).toBeDefined();
    expect(result.script.length).toBeGreaterThan(50);
    logger.debug('✓ Script tiene contenido suficiente', { length: result.script.length });

    // Verificar métricas de uso
    expect(result.tokensUsed).toBeGreaterThan(0);
    logger.debug('✓ Tokens usados registrados', { tokens: result.tokensUsed });

    // Verificar duración de la operación
    expect(result.duration).toBeGreaterThan(0);
    logger.debug('✓ Duración registrada', { duration: result.duration });

    // Verificar timestamp
    expect(result.timestamp).toBeDefined();
    logger.debug('✓ Timestamp presente', { timestamp: result.timestamp });

    // Mensaje final de éxito
    logger.info('🎉 Prueba de GeminiServiceObject completada exitosamente', {
      scriptLength: result.script.length,
      tokensUsed: result.tokensUsed,
      duration: `${result.duration}ms`,
    });
  });

  // ==========================================================================
  // PRUEBA 2: GENERACIÓN DE VIDEO CON METADATA
  // ==========================================================================

  /**
   * Prueba 2: Generación de video y extracción de metadata
   *
   * Esta prueba demuestra el flujo completo de:
   * 1. Configurar parámetros de video (script, duración, fps, resolución)
   * 2. Generar el video usando VideoServiceObject
   * 3. Verificar que el archivo existe
   * 4. Extraer y validar metadata del video
   *
   * La validación de metadata es crucial para asegurar que el video
   * cumple con las especificaciones requeridas.
   */
  test('should use VideoServiceObject to generate video with metadata', async () => {
    // ========================================
    // ARRANGE: Configurar datos de prueba
    // ========================================
    logger.info('🎬 Preparando generación de video con VideoServiceObject...');

    // Definir configuración completa del video
    // Estos parámetros simulan una configuración de producción
    // Usamos formato vertical (1080x1920) típico de YouTube Shorts
    const config = {
      script: 'Artificial intelligence is transforming our world in unprecedented ways.',
      duration: 30,
      fps: 30,
      resolution: { width: 1080, height: 1920 },
    };

    logger.info('Configuración de video definida:', {
      scriptLength: config.script.length,
      duration: `${config.duration}s`,
      fps: config.fps,
      resolution: `${config.resolution.width}x${config.resolution.height} (vertical)`,
    });

    // ========================================
    // ACT: Generar video y extraer metadata
    // ========================================
    logger.info('🚀 Ejecutando generación de video...');

    // Generar video usando el Service Object
    // El Service Object maneja toda la complejidad de renderizado
    const videoPath = await videoSO.generateVideo(config);

    logger.info('✓ Video generado', { path: videoPath });

    // Verificar existencia del archivo
    // Usamos fs.existsSync para verificación sincrónica
    const exists = fs.existsSync(videoPath);
    logger.info('Verificando existencia del archivo...', { exists });

    // Extraer metadata del video
    logger.info('📊 Extrayendo metadata del video...');
    const metadata = await videoSO.getMetadata(videoPath);

    logger.info('✓ Metadata extraída:', {
      duration: `${metadata.duration}s`,
      fps: metadata.fps,
      resolution: `${metadata.width}x${metadata.height}`,
      codec: metadata.codec,
      fileSize: metadata.fileSizeMB,
    });

    // ========================================
    // ASSERT: Verificar resultados
    // ========================================
    logger.info('🔍 Verificando resultados...');

    // Verificar que el archivo existe
    expect(exists).toBe(true);
    logger.debug('✓ Archivo de video existe');

    // Verificar duración (con tolerancia de ±1 segundo)
    expect(metadata.duration).toBeGreaterThanOrEqual(29);
    expect(metadata.duration).toBeLessThanOrEqual(31);
    logger.debug('✓ Duración dentro del rango esperado');

    // Verificar FPS
    expect(metadata.fps).toBe(30);
    logger.debug('✓ FPS correcto');

    // Verificar resolución
    // Nota: El mock de VideoServiceObject devuelve 1080x1920 (formato vertical YouTube Shorts)
    // independientemente de la configuración. En la implementación real, esto reflejará
    // los valores reales extraídos del video con FFprobe.
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1920);
    logger.debug('✓ Resolución correcta (formato vertical)');

    // Verificar tamaño de archivo
    expect(metadata.fileSize).toBeGreaterThan(0);
    logger.debug('✓ Archivo tiene contenido');

    // Verificar codec
    expect(metadata.codec).toBeDefined();
    logger.debug('✓ Codec definido', { codec: metadata.codec });

    // Mensaje final de éxito
    logger.info('🎉 Prueba de VideoServiceObject completada exitosamente', {
      videoPath,
      fileSize: metadata.fileSizeMB,
      duration: `${metadata.duration}s`,
    });
  });

  // ==========================================================================
  // PRUEBA 3: VALIDACIÓN COMPLETA DE CONTENIDO
  // ==========================================================================

  /**
   * Prueba 3: Flujo completo de validación de contenido
   *
   * Esta prueba demuestra los tres tipos de validación disponibles:
   *
   * 1. **Validación de Texto (OCR)**: Verifica que textos específicos
   *    aparecen en los frames del video. Útil para verificar títulos,
   *    subtítulos y overlays de texto.
   *
   * 2. **Validación de Audio (STT)**: Verifica que el video tiene
   *    pista de audio y puede ser transcrito. Útil para verificar
   *    que la narración existe y es comprensible.
   *
   * 3. **Validación de Sincronización**: Verifica que el audio está
   *    sincronizado con el texto visual. Detecta problemas de timing
   *    que afectarían la experiencia del usuario.
   *
   * Estas validaciones son esenciales para QA de contenido de video.
   */
  test('should validate video content using all validation methods', async () => {
    // ========================================
    // ARRANGE: Generar video de prueba
    // ========================================
    logger.info('🎬 Generando video de prueba para validación...');

    // Primero generamos un video para tener algo que validar
    const config = {
      script: 'Artificial intelligence and AI technology are revolutionizing the world.',
      duration: 30,
      fps: 30,
      resolution: { width: 1080, height: 1920 },
    };

    const videoPath = await videoSO.generateVideo(config);
    logger.info('✓ Video de prueba generado', { path: videoPath });

    // Definir textos esperados para validación OCR
    // Estos textos deberían aparecer en el video
    const expectedTexts = ['artificial intelligence', 'AI', 'technology'];

    logger.info('Textos esperados para validación:', { expectedTexts });

    // ========================================
    // ACT: Ejecutar validaciones
    // ========================================

    // --- Validación 1: Texto (OCR) ---
    logger.info('📝 Validación 1/3: Verificando textos en pantalla (OCR)...');

    const textResult = await videoSO.validateTextContent(videoPath, expectedTexts);

    logger.info('Resultado de validación de texto:', {
      allFound: textResult.allFound,
      found: textResult.found,
      missing: textResult.missing,
    });

    // --- Validación 2: Audio (STT) ---
    logger.info('🔊 Validación 2/3: Verificando audio generado (STT)...');

    const audioResult = await videoSO.validateAudioContent(videoPath);

    // Mostrar preview de transcripción (primeros 50 caracteres)
    const transcriptionPreview = audioResult.transcription
      ? audioResult.transcription.substring(0, 50) + '...'
      : 'N/A';

    logger.info('Resultado de validación de audio:', {
      hasAudio: audioResult.hasAudio,
      duration: audioResult.duration ? `${audioResult.duration}s` : 'N/A',
      transcriptionPreview,
    });

    // --- Validación 3: Sincronización ---
    logger.info('🔄 Validación 3/3: Verificando sincronización audio-texto...');

    const syncResult = await videoSO.validateSync(videoPath);

    logger.info('Resultado de validación de sincronización:', {
      passed: syncResult.passed,
      maxOffset: `${syncResult.maxOffset}ms`,
      avgOffset: `${syncResult.avgOffset}ms`,
      issueCount: syncResult.issues.length,
    });

    // ========================================
    // ASSERT: Verificar resultados
    // ========================================
    logger.info('🔍 Verificando resultados de todas las validaciones...');

    // Verificar validación de texto
    expect(textResult.allFound).toBe(true);
    expect(textResult.found.length).toBe(expectedTexts.length);
    logger.debug('✓ Validación de texto: Todos los textos encontrados');

    // Verificar validación de audio
    expect(audioResult.hasAudio).toBe(true);
    expect(audioResult.duration).toBeGreaterThan(0);
    logger.debug('✓ Validación de audio: Audio presente y válido');

    // Verificar validación de sincronización
    expect(syncResult.passed).toBe(true);
    expect(syncResult.maxOffset).toBeLessThan(100); // Umbral de 100ms
    logger.debug('✓ Validación de sync: Dentro del umbral aceptable');

    // Resumen de validación
    logger.info('📊 Resumen de validaciones:');
    logger.info(`   • Texto (OCR): ${textResult.allFound ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info(`   • Audio (STT): ${audioResult.hasAudio ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info(`   • Sincronización: ${syncResult.passed ? '✅ PASSED' : '❌ FAILED'}`);

    // Mensaje final de éxito
    logger.info('🎉 Todas las validaciones completadas exitosamente');
  });

  // ==========================================================================
  // PRUEBA 4: FLUJO DE TRABAJO E2E COMPLETO
  // ==========================================================================

  /**
   * Prueba 4: Flujo de trabajo End-to-End completo
   *
   * Esta prueba demuestra el patrón de flujo de trabajo recomendado
   * que combina ambos Service Objects en un pipeline realista:
   *
   * 1. **Gemini → Script**: Generar contenido con IA
   * 2. **Script → Video**: Renderizar el video
   * 3. **Video → Validación**: Verificar calidad del contenido
   *
   * Este es el flujo que se usaría en producción para generar
   * y validar videos de forma automatizada. La prueba verifica
   * que todos los componentes trabajan juntos correctamente.
   *
   * @timeout 120000 - 2 minutos debido a la complejidad del flujo
   */
  test('should demonstrate complete E2E workflow: Gemini → Video → Validation', async () => {
    // Registrar inicio del flujo de trabajo
    const workflowStartTime = Date.now();
    logger.info('🚀 Iniciando flujo de trabajo E2E completo...');
    logger.info('   Pipeline: Gemini → Video → Validación');

    // ========================================
    // PASO 1: Generar Script con Gemini
    // ========================================
    logger.info('');
    logger.info('📝 PASO 1/4: Generando script con Gemini...');

    // Prompt comprehensivo que simula un caso de uso real
    const prompt = 'Create an engaging 30-second video script about how artificial intelligence is revolutionizing healthcare, education, and creative industries in 2025.';

    const scriptResult = await geminiSO.generateScript(prompt);

    logger.info('✓ Paso 1 completado: Script generado', {
      scriptLength: scriptResult.script.length,
      tokensUsed: scriptResult.tokensUsed,
      duration: `${scriptResult.duration}ms`,
    });

    // ========================================
    // PASO 2: Generar Video
    // ========================================
    logger.info('');
    logger.info('🎬 PASO 2/4: Generando video con el script...');

    // Usar el script generado por Gemini
    const videoConfig = {
      script: scriptResult.script,
      duration: 30,
      fps: 30,
      resolution: { width: 1080, height: 1920 },
    };

    const videoPath = await videoSO.generateVideo(videoConfig);

    logger.info('✓ Paso 2 completado: Video generado', {
      path: videoPath,
      config: {
        duration: `${videoConfig.duration}s`,
        resolution: `${videoConfig.resolution.width}x${videoConfig.resolution.height}`,
      },
    });

    // ========================================
    // PASO 3: Validar Contenido
    // ========================================
    logger.info('');
    logger.info('🔍 PASO 3/4: Validando contenido del video...');

    // Ejecutar las tres validaciones
    const textResult = await videoSO.validateTextContent(videoPath, ['AI', 'intelligence']);
    const audioResult = await videoSO.validateAudioContent(videoPath);
    const syncResult = await videoSO.validateSync(videoPath);

    logger.info('✓ Paso 3 completado: Validaciones ejecutadas', {
      textValidation: textResult.allFound ? 'PASSED' : 'FAILED',
      audioValidation: audioResult.hasAudio ? 'PASSED' : 'FAILED',
      syncValidation: syncResult.passed ? 'PASSED' : 'FAILED',
    });

    // ========================================
    // PASO 4: Resumen del Flujo de Trabajo
    // ========================================
    logger.info('');
    logger.info('📊 PASO 4/4: Generando resumen del flujo de trabajo...');

    // Calcular duración total
    const workflowDuration = Date.now() - workflowStartTime;

    // Mostrar resumen completo
    logger.info('');
    logger.info('╔══════════════════════════════════════════════════════════╗');
    logger.info('║           RESUMEN DEL FLUJO DE TRABAJO E2E               ║');
    logger.info('╠══════════════════════════════════════════════════════════╣');
    logger.info(`║  Script generado:        ✅ ${scriptResult.script.length} caracteres`);
    logger.info(`║  Tokens usados:          📊 ${scriptResult.tokensUsed} tokens`);
    logger.info(`║  Video generado:         ✅ ${videoPath.split('/').pop() || videoPath.split('\\').pop()}`);
    logger.info(`║  Validación de texto:    ${textResult.allFound ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info(`║  Validación de audio:    ${audioResult.hasAudio ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info(`║  Validación de sync:     ${syncResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info('╠══════════════════════════════════════════════════════════╣');
    logger.info(`║  Duración total:         ⏱️  ${workflowDuration}ms`);
    logger.info('╚══════════════════════════════════════════════════════════╝');

    // ========================================
    // ASSERT: Verificar todo el flujo
    // ========================================
    logger.info('');
    logger.info('🔍 Verificando resultados del flujo completo...');

    // Verificar generación de script
    expect(scriptResult.script).toBeDefined();
    expect(scriptResult.script.length).toBeGreaterThan(50);
    logger.debug('✓ Script generado correctamente');

    // Verificar generación de video
    expect(videoPath).toBeDefined();
    expect(fs.existsSync(videoPath)).toBe(true);
    logger.debug('✓ Video generado y existe en disco');

    // Verificar validaciones
    expect(textResult.allFound).toBe(true);
    expect(audioResult.hasAudio).toBe(true);
    expect(syncResult.passed).toBe(true);
    logger.debug('✓ Todas las validaciones pasaron');

    // Mensaje final de éxito
    logger.info('');
    logger.info('🎉 Flujo de trabajo E2E completado exitosamente', {
      totalDuration: `${workflowDuration}ms`,
      steps: 4,
      allValidationsPassed: true,
    });
  }, 120000); // Timeout de 2 minutos para esta prueba larga
});
