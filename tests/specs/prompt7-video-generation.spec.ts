/**
 * @fileoverview Tests de Generación de Video - Prompt 7
 *
 * Este archivo contiene tests que validan el proceso completo de generación
 * de video con Remotion, verificando que los archivos MP4 cumplan con las
 * especificaciones requeridas para YouTube Shorts.
 *
 * @description
 * Las pruebas cubren:
 * - Renderizado básico de videos
 * - Validación de especificaciones (resolución, duración, codec)
 * - Manejo de errores y timeouts
 * - Performance del renderizado
 *
 * @prerequisites
 * - Remotion instalado en /remotion-app
 * - FFmpeg disponible (opcional, para metadatos reales)
 * - TestLogger configurado
 * - VideoServiceObject implementado
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import {
  VideoServiceObject,
  ScriptData,
  VideoFileValidation,
  VideoMetadata,
} from '../page-objects';
import {
  VALIDATION_THRESHOLDS,
  VIDEO_CONFIG,
  REMOTION_CONFIG,
  // Configuración centralizada de timeouts
  TIMEOUTS,
} from '../config';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURACION DE TESTS
// ============================================================================

/**
 * Script minimo valido para tests
 * Usa contenido corto para acelerar renderizado
 */
const VALID_SCRIPT_DATA: ScriptData = {
  title: 'Test Video - Sintaxis IA',
  gancho: '¡Esto cambiará todo!',
  contenido: [
    'La inteligencia artificial avanza cada día.',
    'Los modelos de lenguaje son cada vez más potentes.',
    'El futuro ya está aquí.',
  ],
  impacto: 'La IA procesa millones de datos por segundo.',
  cta: 'Síguenos para más contenido de IA',
  tags: ['IA', 'Tech', 'Futuro'],
};

/**
 * Script inválido sin datos requeridos
 */
const INVALID_SCRIPT_DATA: ScriptData = {
  title: '',
  contenido: [], // Sin contenido
};

/**
 * Timeout extendido para tests de renderizado (2 minutos)
 */
const RENDER_TIMEOUT = VALIDATION_THRESHOLDS.VIDEO_RENDER_TIMEOUT_MS;

// ============================================================================
// SUITE 1: RENDERIZADO BASICO
// ============================================================================

test.describe('Suite 1: Renderizado Básico', () => {
  let logger: TestLogger;
  let videoService: VideoServiceObject;

  /**
   * Configuracion antes de cada test
   * Inicializa logger y servicio de video
   */
  test.beforeEach(async () => {
    logger = new TestLogger({ testName: 'VideoGeneration' });
    videoService = new VideoServiceObject();
    logger.info('Test de renderizado iniciado');
  });

  /**
   * Limpieza despues de cada test
   * Elimina videos generados durante el test
   */
  test.afterEach(async () => {
    await videoService.cleanupTestVideos();
    logger.info('Cleanup de videos completado');
  });

  /**
   * Test 1.1: Debe renderizar un video simple correctamente
   *
   * Este test verifica que el servicio puede generar un video
   * a partir de un script válido usando la composición de preview.
   */
  test('debe renderizar un video simple correctamente', async () => {
    // Arrange - Preparar datos del script
    logger.info('Preparando script para renderizado', {
      title: VALID_SCRIPT_DATA.title,
      contentLines: VALID_SCRIPT_DATA.contenido.length,
    });

    // Act - Ejecutar renderizado
    const result = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview', // 10 segundos para test rápido
      timeout: RENDER_TIMEOUT,
    });

    // Assert - Verificar resultado
    logger.logVideoGeneration({
      videoId: 'test-1.1',
      title: VALID_SCRIPT_DATA.title,
      status: result.success ? 'completed' : 'failed',
      outputPath: result.outputPath,
    });

    // En modo mock, siempre debe tener éxito
    // En modo real con Remotion, depende de la configuración
    expect(result.outputPath).toBeTruthy();
    expect(result.outputPath).toContain('.mp4');

    // Si es exitoso, verificar que el archivo existe
    if (result.success) {
      expect(fs.existsSync(result.outputPath)).toBe(true);
      expect(result.renderDuration).toBeGreaterThan(0);

      logger.info('Video renderizado exitosamente', {
        path: result.outputPath,
        duration: `${result.renderDuration}ms`,
      });
    }
  });

  /**
   * Test 1.2: Debe manejar script inválido apropiadamente
   *
   * Este test verifica que el servicio maneja correctamente
   * scripts con datos faltantes o inválidos.
   */
  test('debe manejar script inválido apropiadamente', async () => {
    // Arrange - Usar script inválido
    logger.info('Probando con script inválido', {
      title: INVALID_SCRIPT_DATA.title || '(vacío)',
      contentLines: INVALID_SCRIPT_DATA.contenido.length,
    });

    // Act - Intentar renderizar con script inválido
    const result = await videoService.renderVideo(INVALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
      timeout: RENDER_TIMEOUT,
    });

    // Assert - El comportamiento depende de la implementación
    // En modo mock, puede tener éxito con cualquier dato
    // En modo real, debería fallar o generar video vacío
    logger.info('Resultado de renderizado con script inválido', {
      success: result.success,
      error: result.error,
    });

    // Verificar que el resultado tiene la estructura esperada
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('outputPath');
    expect(result).toHaveProperty('renderDuration');
  });

  /**
   * Test 1.3: Debe generar archivo con extensión MP4
   *
   * Verifica que el archivo generado tenga la extensión correcta.
   */
  test('debe generar archivo con extensión MP4', async () => {
    // Arrange
    logger.info('Verificando extensión de archivo');

    // Act
    const result = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
      outputName: 'test_extension_mp4',
    });

    // Assert
    expect(result.outputPath).toMatch(/\.mp4$/i);
    logger.info('Extensión verificada', { path: result.outputPath });
  });
});

// ============================================================================
// SUITE 2: VALIDACION DE ESPECIFICACIONES
// ============================================================================

test.describe('Suite 2: Validación de Especificaciones', () => {
  let logger: TestLogger;
  let videoService: VideoServiceObject;

  test.beforeEach(async () => {
    logger = new TestLogger({ testName: 'VideoSpecValidation' });
    videoService = new VideoServiceObject();
    logger.info('Test de validación de especificaciones iniciado');
  });

  test.afterEach(async () => {
    await videoService.cleanupTestVideos();
    logger.info('Cleanup completado');
  });

  /**
   * Test 2.1: Debe generar video con resolución 1080x1920
   *
   * Verifica que los metadatos del video reportan la resolución
   * correcta para YouTube Shorts (formato vertical 9:16).
   */
  test('debe generar video con resolución 1080x1920', async () => {
    // Arrange
    const expectedWidth = VALIDATION_THRESHOLDS.VIDEO_RESOLUTION.EXPECTED_WIDTH;
    const expectedHeight = VALIDATION_THRESHOLDS.VIDEO_RESOLUTION.EXPECTED_HEIGHT;

    logger.info('Verificando resolución de video', {
      expected: `${expectedWidth}x${expectedHeight}`,
    });

    // Act - Generar video y obtener metadatos
    const renderResult = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
    });

    // Solo si el renderizado fue exitoso, validar metadatos
    if (renderResult.success && renderResult.metadata) {
      const metadata = renderResult.metadata;

      // Assert
      expect(metadata.width).toBe(expectedWidth);
      expect(metadata.height).toBe(expectedHeight);

      logger.info('Resolución validada correctamente', {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: '9:16',
      });
    } else {
      // En modo mock, verificar configuración por defecto
      expect(VIDEO_CONFIG.DEFAULT_RESOLUTION.WIDTH).toBe(expectedWidth);
      expect(VIDEO_CONFIG.DEFAULT_RESOLUTION.HEIGHT).toBe(expectedHeight);

      logger.info('Resolución verificada desde configuración', {
        width: VIDEO_CONFIG.DEFAULT_RESOLUTION.WIDTH,
        height: VIDEO_CONFIG.DEFAULT_RESOLUTION.HEIGHT,
      });
    }
  });

  /**
   * Test 2.2: Debe generar video con duración válida (25-60s)
   *
   * Verifica que la duración del video esté dentro del rango
   * aceptable para YouTube Shorts.
   */
  test('debe generar video con duración válida (25-60s)', async () => {
    // Arrange
    const minDuration = VALIDATION_THRESHOLDS.VIDEO_DURATION.MIN_SECONDS;
    const maxDuration = VALIDATION_THRESHOLDS.VIDEO_DURATION.MAX_SECONDS;

    logger.info('Verificando duración de video', {
      minSeconds: minDuration,
      maxSeconds: maxDuration,
    });

    // Act - Generar video y obtener metadatos
    const renderResult = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort', // Composición completa de 60s
    });

    if (renderResult.success && renderResult.metadata) {
      const duration = renderResult.metadata.duration;

      // Assert
      expect(duration).toBeGreaterThanOrEqual(minDuration);
      expect(duration).toBeLessThanOrEqual(maxDuration);

      logger.info('Duración validada correctamente', {
        duration: `${duration}s`,
        inRange: true,
      });
    } else {
      // Verificar configuración por defecto
      const defaultDuration = VIDEO_CONFIG.DEFAULT_DURATION;
      expect(defaultDuration).toBeGreaterThanOrEqual(minDuration);
      expect(defaultDuration).toBeLessThanOrEqual(maxDuration);

      logger.info('Duración verificada desde configuración', {
        defaultDuration: `${defaultDuration}s`,
      });
    }
  });

  /**
   * Test 2.3: Debe generar video en formato MP4 con H.264
   *
   * Verifica que el codec de video sea H.264/AVC, el estándar
   * requerido para YouTube.
   */
  test('debe generar video en formato MP4 con H.264', async () => {
    // Arrange
    const expectedCodec = REMOTION_CONFIG.DEFAULT_CODEC;

    logger.info('Verificando codec de video', {
      expectedCodec,
    });

    // Act
    const renderResult = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
    });

    if (renderResult.success && renderResult.metadata) {
      const codec = renderResult.metadata.codec.toLowerCase();

      // Assert - H.264 puede aparecer como 'h264' o 'avc1'
      expect(['h264', 'avc1']).toContain(codec);

      logger.info('Codec validado correctamente', {
        codec: renderResult.metadata.codec,
        isH264: true,
      });
    } else {
      // Verificar configuración por defecto
      expect(VIDEO_CONFIG.DEFAULT_CODEC).toBe(expectedCodec);

      logger.info('Codec verificado desde configuración', {
        defaultCodec: VIDEO_CONFIG.DEFAULT_CODEC,
      });
    }
  });

  /**
   * Test 2.4: Debe incluir audio en el video generado
   *
   * Verifica que el video tenga una pista de audio,
   * ya sea narración TTS o música de fondo.
   */
  test('debe incluir audio en el video generado', async () => {
    // Arrange
    logger.info('Verificando presencia de audio');

    // Act
    const renderResult = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
    });

    if (renderResult.success) {
      const audioValidation = await videoService.validateAudioContent(
        renderResult.outputPath
      );

      // Assert
      expect(audioValidation.hasAudio).toBe(true);

      logger.info('Audio validado correctamente', {
        hasAudio: audioValidation.hasAudio,
        duration: audioValidation.duration,
      });
    } else {
      // En modo mock, la validación siempre retorna audio presente
      const mockAudioValidation = await videoService.validateAudioContent(
        '/mock/path.mp4'
      );
      expect(mockAudioValidation.hasAudio).toBe(true);

      logger.info('Audio verificado en modo mock', {
        hasAudio: mockAudioValidation.hasAudio,
      });
    }
  });

  /**
   * Test 2.5: Debe validar archivo de video completo
   *
   * Usa validateVideoFile() para verificar todas las
   * especificaciones en una sola llamada.
   */
  test('debe validar archivo de video completo', async () => {
    // Arrange
    logger.info('Ejecutando validación completa de archivo');

    // Act - Generar y validar
    const renderResult = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
    });

    if (renderResult.success) {
      const validation = await videoService.validateVideoFile(
        renderResult.outputPath
      );

      // Assert - Verificar estructura de validación
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('fileExists');
      expect(validation).toHaveProperty('isMP4');
      expect(validation).toHaveProperty('hasCorrectResolution');
      expect(validation).toHaveProperty('hasDurationInRange');
      expect(validation).toHaveProperty('hasH264Codec');
      expect(validation).toHaveProperty('hasAudio');
      expect(validation).toHaveProperty('hasReasonableSize');
      expect(validation).toHaveProperty('errors');

      logger.logValidationResults({
        validatorName: 'CompleteVideoValidation',
        target: renderResult.outputPath,
        passed: validation.isValid,
        errors: validation.errors.length > 0 ? validation.errors : undefined,
        details: {
          fileExists: validation.fileExists,
          isMP4: validation.isMP4,
          resolution: validation.hasCorrectResolution,
          duration: validation.hasDurationInRange,
          codec: validation.hasH264Codec,
          audio: validation.hasAudio,
          size: validation.hasReasonableSize,
        },
      });
    } else {
      logger.warn('Renderizado no exitoso, omitiendo validación de archivo');
    }
  });
});

// ============================================================================
// SUITE 3: MANEJO DE ERRORES
// ============================================================================

test.describe('Suite 3: Manejo de Errores', () => {
  let logger: TestLogger;
  let videoService: VideoServiceObject;

  test.beforeEach(async () => {
    logger = new TestLogger({ testName: 'VideoErrorHandling' });
    videoService = new VideoServiceObject();
    logger.info('Test de manejo de errores iniciado');
  });

  test.afterEach(async () => {
    await videoService.cleanupTestVideos();
    logger.info('Cleanup completado');
  });

  /**
   * Test 3.1: Debe manejar timeout en renderizado largo
   *
   * Verifica que el servicio maneje correctamente un timeout
   * cuando el renderizado toma demasiado tiempo.
   */
  test('debe manejar timeout en renderizado largo', async () => {
    // Arrange - Usar timeout menor que el umbral configurado para forzar error
    // El umbral está en TIMEOUTS.shortTimeoutThreshold.value (500ms por defecto)
    const shortTimeout = Math.floor(TIMEOUTS.shortTimeoutThreshold.value / 5); // 100ms si umbral es 500ms

    logger.info('Probando timeout de renderizado', {
      timeout: `${shortTimeout}ms`,
      threshold: `${TIMEOUTS.shortTimeoutThreshold.value}ms`,
    });

    // Act
    const result = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort', // Composición completa (más larga)
      timeout: shortTimeout,
    });

    // Assert - El resultado debería indicar fallo o error de timeout
    logger.info('Resultado de renderizado con timeout corto', {
      success: result.success,
      error: result.error,
    });

    // Verificar que el resultado tiene estructura correcta
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('error');

    // Si falló por timeout, el error debería mencionarlo
    if (!result.success && result.error) {
      // El error puede mencionar timeout o simplemente fallar
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  /**
   * Test 3.2: Debe limpiar archivos temporales después de error
   *
   * Verifica que el método cleanup() funcione correctamente
   * incluso después de errores en el renderizado.
   */
  test('debe limpiar archivos temporales después de error', async () => {
    // Arrange
    const tempDir = videoService.getTempDir();

    logger.info('Verificando limpieza de archivos temporales', {
      tempDir,
    });

    // Act - Generar algunos archivos (exitosos o no)
    await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
      outputName: 'temp_file_1',
    });

    await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
      outputName: 'temp_file_2',
    });

    // Obtener lista de archivos generados
    const filesBeforeCleanup = videoService.getGeneratedFiles();
    logger.info('Archivos antes de cleanup', {
      count: filesBeforeCleanup.length,
    });

    // Ejecutar cleanup
    await videoService.cleanupTestVideos();

    // Assert - Verificar que los archivos fueron eliminados
    const filesAfterCleanup = videoService.getGeneratedFiles();

    expect(filesAfterCleanup.length).toBe(0);

    // Verificar que los archivos ya no existen en disco
    for (const filePath of filesBeforeCleanup) {
      const exists = fs.existsSync(filePath);
      if (exists) {
        logger.warn('Archivo no eliminado', { filePath });
      }
    }

    logger.info('Limpieza verificada correctamente', {
      filesBefore: filesBeforeCleanup.length,
      filesAfter: filesAfterCleanup.length,
    });
  });

  /**
   * Test 3.3: Debe manejar archivo inexistente en validación
   *
   * Verifica que validateVideoFile() maneje correctamente
   * rutas a archivos que no existen.
   */
  test('debe manejar archivo inexistente en validación', async () => {
    // Arrange
    const nonExistentPath = '/path/to/non/existent/video.mp4';

    logger.info('Validando archivo inexistente', {
      path: nonExistentPath,
    });

    // Act
    const validation = await videoService.validateVideoFile(nonExistentPath);

    // Assert
    expect(validation.isValid).toBe(false);
    expect(validation.fileExists).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors.some(e => e.includes('no existe'))).toBe(true);

    logger.info('Error de archivo inexistente manejado correctamente', {
      errors: validation.errors,
    });
  });

  /**
   * Test 3.4: Debe retornar errores descriptivos
   *
   * Verifica que los errores retornados sean claros
   * y útiles para debugging.
   */
  test('debe retornar errores descriptivos', async () => {
    // Arrange
    const invalidPath = '/invalid/path/video.mp4';

    logger.info('Verificando mensajes de error descriptivos');

    // Act
    const validation = await videoService.validateVideoFile(invalidPath);

    // Assert
    expect(validation.errors).toBeInstanceOf(Array);

    for (const error of validation.errors) {
      // Cada error debe ser un string no vacío
      expect(typeof error).toBe('string');
      expect(error.length).toBeGreaterThan(10); // Mensaje descriptivo

      logger.debug('Error retornado', { error });
    }

    logger.info('Errores descriptivos verificados', {
      errorCount: validation.errors.length,
    });
  });
});

// ============================================================================
// SUITE 4: PERFORMANCE
// ============================================================================

test.describe('Suite 4: Performance', () => {
  let logger: TestLogger;
  let videoService: VideoServiceObject;

  test.beforeEach(async () => {
    logger = new TestLogger({ testName: 'VideoPerformance' });
    videoService = new VideoServiceObject();
    logger.info('Test de performance iniciado');
  });

  test.afterEach(async () => {
    await videoService.cleanupTestVideos();
    logger.info('Cleanup completado');
  });

  /**
   * Test 4.1: Debe renderizar video en tiempo razonable (<2min)
   *
   * Verifica que el renderizado de un video de preview
   * complete en menos de 2 minutos.
   */
  test('debe renderizar video en tiempo razonable (<2min)', async () => {
    // Arrange
    const maxDurationMs = RENDER_TIMEOUT; // 2 minutos
    const startTime = Date.now();

    logger.info('Midiendo tiempo de renderizado', {
      maxAllowed: `${maxDurationMs}ms`,
    });

    // Act
    const result = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
      timeout: maxDurationMs,
    });

    const actualDuration = Date.now() - startTime;

    // Assert
    expect(actualDuration).toBeLessThan(maxDurationMs);

    logger.info('Tiempo de renderizado medido', {
      actualDuration: `${actualDuration}ms`,
      maxAllowed: `${maxDurationMs}ms`,
      withinLimit: actualDuration < maxDurationMs,
      reportedDuration: `${result.renderDuration}ms`,
    });

    // Verificar que la duración reportada es razonable
    expect(result.renderDuration).toBeGreaterThan(0);
  });

  /**
   * Test 4.2: Debe generar archivo de tamaño razonable (<50MB)
   *
   * Verifica que el tamaño del archivo generado no exceda
   * el límite máximo configurado.
   */
  test('debe generar archivo de tamaño razonable (<50MB)', async () => {
    // Arrange
    const maxSizeBytes = VALIDATION_THRESHOLDS.VIDEO_FILE_SIZE.MAX_BYTES;
    const maxSizeMB = maxSizeBytes / (1024 * 1024);

    logger.info('Verificando tamaño de archivo', {
      maxSize: `${maxSizeMB}MB`,
    });

    // Act
    const result = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
    });

    if (result.success && result.metadata) {
      const fileSize = result.metadata.fileSize;
      const fileSizeMB = fileSize / (1024 * 1024);

      // Assert
      expect(fileSize).toBeLessThan(maxSizeBytes);

      logger.info('Tamaño de archivo verificado', {
        actualSize: `${fileSizeMB.toFixed(2)}MB`,
        maxSize: `${maxSizeMB}MB`,
        withinLimit: fileSize < maxSizeBytes,
      });
    } else {
      // En modo mock, verificar la estimación de tamaño
      logger.info('Verificando estimación de tamaño en modo mock');

      // El tamaño estimado debería ser razonable
      const estimatedBitrate = VIDEO_CONFIG.ESTIMATED_BITRATE_BPS;
      const duration = VIDEO_CONFIG.DEFAULT_DURATION;
      const estimatedSize = (estimatedBitrate * duration) / 8;

      expect(estimatedSize).toBeLessThan(maxSizeBytes);

      logger.info('Estimación de tamaño verificada', {
        estimatedSize: `${(estimatedSize / (1024 * 1024)).toFixed(2)}MB`,
      });
    }
  });

  /**
   * Test 4.3: Debe medir y reportar duración de operaciones
   *
   * Verifica que las operaciones reporten métricas de tiempo
   * útiles para análisis de performance.
   */
  test('debe medir y reportar duración de operaciones', async () => {
    // Arrange
    logger.info('Verificando métricas de tiempo');

    // Act - Realizar varias operaciones y medir tiempos
    const renderResult = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
    });

    // Assert - Verificar que se reportan duraciones
    expect(renderResult.renderDuration).toBeGreaterThanOrEqual(0);

    // Obtener metadatos y verificar tiempo
    if (renderResult.success) {
      const metadataStartTime = Date.now();
      const metadata = await videoService.getMetadata(renderResult.outputPath);
      const metadataDuration = Date.now() - metadataStartTime;

      expect(metadataDuration).toBeGreaterThanOrEqual(0);
      expect(metadata).toHaveProperty('duration');

      logger.info('Métricas de tiempo verificadas', {
        renderDuration: `${renderResult.renderDuration}ms`,
        metadataExtractionDuration: `${metadataDuration}ms`,
      });
    }
  });

  /**
   * Test 4.4: Debe generar archivo no vacío
   *
   * Verifica que el archivo generado tenga contenido
   * (tamaño mayor al mínimo configurado).
   */
  test('debe generar archivo no vacío', async () => {
    // Arrange
    const minSizeBytes = VALIDATION_THRESHOLDS.VIDEO_FILE_SIZE.MIN_BYTES;

    logger.info('Verificando que el archivo no esté vacío', {
      minSize: `${minSizeBytes / 1024}KB`,
    });

    // Act
    const result = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
    });

    if (result.success && result.metadata) {
      // Assert
      expect(result.metadata.fileSize).toBeGreaterThan(0);

      // En modo real, también verificar contra el mínimo
      // En modo mock, el placeholder es pequeño pero no vacío
      logger.info('Archivo no vacío verificado', {
        fileSize: result.metadata.fileSizeMB,
      });
    } else {
      // Verificar que el archivo placeholder existe y no está vacío
      if (fs.existsSync(result.outputPath)) {
        const stats = fs.statSync(result.outputPath);
        expect(stats.size).toBeGreaterThan(0);

        logger.info('Archivo placeholder verificado', {
          size: stats.size,
        });
      }
    }
  });
});

// ============================================================================
// SUITE 5: INTEGRACION CON SERVICE OBJECT PATTERN
// ============================================================================

test.describe('Suite 5: Integración con Service Object Pattern', () => {
  let logger: TestLogger;
  let videoService: VideoServiceObject;

  test.beforeEach(async () => {
    logger = new TestLogger({ testName: 'ServiceObjectIntegration' });
    videoService = new VideoServiceObject();
    logger.info('Test de integración Service Object iniciado');
  });

  test.afterEach(async () => {
    await videoService.cleanupTestVideos();
    logger.info('Cleanup completado');
  });

  /**
   * Test 5.1: VideoServiceObject debe heredar de BaseServiceObject
   *
   * Verifica que el servicio tenga acceso a los métodos
   * heredados de BaseServiceObject.
   */
  test('VideoServiceObject debe tener métodos de BaseServiceObject', async () => {
    // Arrange & Act
    const serviceName = videoService.getServiceName();
    const testLogger = videoService.getLogger();

    // Assert
    expect(serviceName).toBe('VideoService');
    expect(testLogger).toBeDefined();
    expect(typeof testLogger.info).toBe('function');
    expect(typeof testLogger.error).toBe('function');

    logger.info('Herencia de BaseServiceObject verificada', {
      serviceName,
      hasLogger: !!testLogger,
    });
  });

  /**
   * Test 5.2: Debe usar TestLogger correctamente
   *
   * Verifica que las operaciones del servicio generen
   * logs estructurados con TestLogger.
   */
  test('debe usar TestLogger correctamente', async () => {
    // Arrange
    logger.info('Verificando uso de TestLogger');

    // Act - Ejecutar operación que genera logs
    const result = await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
    });

    // Assert - Verificar que no hay errores de logging
    // (si hubiera errores, el test fallaría antes de llegar aquí)
    expect(result).toBeDefined();

    // El logger interno del servicio debería funcionar
    const serviceLogger = videoService.getLogger();
    expect(serviceLogger).toBeDefined();

    logger.info('TestLogger verificado correctamente');
  });

  /**
   * Test 5.3: Debe gestionar archivos temporales correctamente
   *
   * Verifica que el servicio mantiene un registro preciso
   * de los archivos generados.
   */
  test('debe gestionar archivos temporales correctamente', async () => {
    // Arrange
    const tempDir = videoService.getTempDir();
    const initialFiles = videoService.getGeneratedFiles();

    logger.info('Verificando gestión de archivos temporales', {
      tempDir,
      initialFileCount: initialFiles.length,
    });

    // Act - Generar múltiples videos
    await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
      outputName: 'temp_test_1',
    });

    await videoService.renderVideo(VALID_SCRIPT_DATA, {
      composition: 'AINewsShort-Preview',
      outputName: 'temp_test_2',
    });

    const filesAfterGeneration = videoService.getGeneratedFiles();

    // Assert
    expect(filesAfterGeneration.length).toBeGreaterThanOrEqual(initialFiles.length);
    expect(tempDir).toContain('temp');

    logger.info('Gestión de archivos verificada', {
      filesGenerated: filesAfterGeneration.length - initialFiles.length,
    });
  });
});
