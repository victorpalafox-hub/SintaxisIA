// ===================================
// TEST LOGGER
// Sistema de logging estructurado para tests de Playwright
// ===================================

import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {
  LOG_LEVELS,
  LOG_LEVEL_PRIORITIES,
  LOG_PATHS,
  LOG_RETENTION,
  LOG_CATEGORIES,
  TEST_STATUS,
  CONSOLE_CONFIG,
  type LogLevel,
  type LogCategory,
  type TestStatus,
} from '../config/test-constants';
import {
  combinedConsoleFormat,
  combinedJsonFormat,
  formatDuration,
  formatBytes,
  sanitizeSensitiveData,
} from './log-formatter';

// ===================================
// INTERFACES
// ===================================

/**
 * Datos de una petición API para logging
 */
export interface ApiRequestData {
  /** URL del endpoint */
  url: string;
  /** Método HTTP (GET, POST, etc.) */
  method: string;
  /** Headers de la petición (se sanitizarán datos sensibles) */
  headers?: Record<string, string>;
  /** Body de la petición */
  body?: unknown;
  /** Timestamp de inicio */
  startTime?: number;
}

/**
 * Datos de una respuesta API para logging
 */
export interface ApiResponseData {
  /** URL del endpoint */
  url: string;
  /** Código de estado HTTP */
  statusCode: number;
  /** Texto de estado */
  statusText?: string;
  /** Headers de la respuesta */
  headers?: Record<string, string>;
  /** Body de la respuesta (truncado si es muy largo) */
  body?: unknown;
  /** Duración de la petición en ms */
  duration?: number;
}

/**
 * Datos de generación de video para logging
 */
export interface VideoGenerationData {
  /** ID único del video */
  videoId: string;
  /** Título o descripción del video */
  title?: string;
  /** Resolución del video */
  resolution?: { width: number; height: number };
  /** Duración del video en segundos */
  durationSeconds?: number;
  /** FPS del video */
  fps?: number;
  /** Tamaño del archivo en bytes */
  fileSize?: number;
  /** Ruta del archivo generado */
  outputPath?: string;
  /** Estado de la generación */
  status: 'started' | 'processing' | 'completed' | 'failed';
  /** Progreso en porcentaje */
  progress?: number;
  /** Error si falló */
  error?: string;
}

/**
 * Datos de validación para logging
 */
export interface ValidationData {
  /** Nombre de la validación */
  validatorName: string;
  /** Qué se está validando */
  target: string;
  /** Resultado de la validación */
  passed: boolean;
  /** Errores encontrados */
  errors?: string[];
  /** Advertencias */
  warnings?: string[];
  /** Detalles adicionales */
  details?: Record<string, unknown>;
}

/**
 * Resumen de ejecución de tests
 */
export interface TestExecutionSummary {
  /** Timestamp de inicio de la suite */
  startTime: string;
  /** Timestamp de fin de la suite */
  endTime: string;
  /** Duración total en ms */
  totalDuration: number;
  /** Total de tests ejecutados */
  totalTests: number;
  /** Tests pasados */
  passed: number;
  /** Tests fallidos */
  failed: number;
  /** Tests saltados */
  skipped: number;
  /** Tests que excedieron timeout */
  timeout: number;
  /** Lista de tests fallidos */
  failedTests: Array<{
    name: string;
    error?: string;
    duration: number;
  }>;
}

/**
 * Registro de un test individual
 */
interface TestRecord {
  name: string;
  startTime: number;
  endTime?: number;
  status?: TestStatus;
  error?: string;
}

/**
 * Opciones de configuración del TestLogger
 */
export interface TestLoggerOptions {
  /** Nivel mínimo de log */
  level?: LogLevel;
  /** Si debe loggear a consola */
  console?: boolean;
  /** Si debe loggear a archivos */
  file?: boolean;
  /** Directorio base para logs */
  logDir?: string;
  /** Nombre del test actual (para contexto) */
  testName?: string;
}

// ===================================
// CLASE PRINCIPAL
// ===================================

/**
 * TestLogger - Sistema de logging estructurado para tests de Playwright
 *
 * Proporciona logging estructurado a consola (colorizado) y archivos (JSON)
 * con soporte para rotación diaria y métodos especializados para diferentes
 * tipos de eventos de test.
 *
 * @example
 * ```typescript
 * import { TestLogger } from '../../utils/TestLogger';
 *
 * // Crear instancia
 * const logger = new TestLogger({ testName: 'my-test' });
 *
 * // Logging básico
 * logger.info('Test iniciado');
 * logger.debug('Datos de debug', { key: 'value' });
 *
 * // Logging de API
 * logger.logApiRequest('Gemini', { url: '...', method: 'POST' });
 * logger.logApiResponse('Gemini', { url: '...', statusCode: 200 });
 *
 * // Logging de video
 * logger.logVideoGeneration({
 *   videoId: 'vid-001',
 *   status: 'completed',
 *   durationSeconds: 60
 * });
 *
 * // Ciclo de vida de test
 * logger.logTestStart('api-integration');
 * // ... ejecutar test ...
 * logger.logTestEnd('api-integration', 'passed', 1500);
 *
 * // Generar resumen
 * const summary = logger.generateSummary();
 * ```
 */
export class TestLogger {
  private logger: winston.Logger;
  private testName?: string;
  private testRecords: Map<string, TestRecord> = new Map();
  private suiteStartTime: number = Date.now();
  private logDir: string;

  /**
   * Crea una nueva instancia de TestLogger
   *
   * @param options - Opciones de configuración
   */
  constructor(options: TestLoggerOptions = {}) {
    this.testName = options.testName;
    this.logDir = options.logDir ?? LOG_PATHS.BASE_DIR;

    // Asegurar que el directorio de logs existe
    this.ensureLogDirectory();

    // Crear transports
    const transports: winston.transport[] = [];

    // Transport de consola
    if (options.console !== false && CONSOLE_CONFIG.ENABLED) {
      transports.push(
        new winston.transports.Console({
          level: options.level ?? CONSOLE_CONFIG.LEVEL,
          format: combinedConsoleFormat,
        }),
      );
    }

    // Transports de archivo con rotación
    if (options.file !== false) {
      // Archivo combinado (todos los niveles)
      transports.push(this.createRotatingTransport(LOG_PATHS.COMBINED_PATTERN, options.level ?? LOG_LEVELS.DEBUG));

      // Archivo solo de errores
      transports.push(this.createRotatingTransport(LOG_PATHS.ERROR_PATTERN, LOG_LEVELS.ERROR));
    }

    // Crear logger de Winston
    this.logger = winston.createLogger({
      levels: LOG_LEVEL_PRIORITIES,
      level: options.level ?? LOG_LEVELS.DEBUG,
      transports,
      exitOnError: false,
    });
  }

  /**
   * Asegura que el directorio de logs existe
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Crea un transport de archivo con rotación diaria
   *
   * @param filenamePattern - Patrón del nombre de archivo
   * @param level - Nivel mínimo de log
   * @returns Transport configurado
   */
  private createRotatingTransport(filenamePattern: string, level: LogLevel): DailyRotateFile {
    return new DailyRotateFile({
      dirname: this.logDir,
      filename: filenamePattern,
      datePattern: LOG_RETENTION.DATE_PATTERN,
      maxSize: LOG_RETENTION.MAX_FILE_SIZE,
      maxFiles: LOG_RETENTION.MAX_FILES,
      zippedArchive: LOG_RETENTION.COMPRESS_ROTATED,
      level,
      format: combinedJsonFormat,
    });
  }

  // ===================================
  // MÉTODOS DE LOGGING BÁSICOS
  // ===================================

  /**
   * Log de nivel debug - Información detallada para debugging
   *
   * @param message - Mensaje a loggear
   * @param context - Datos adicionales de contexto
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.DEBUG, message, context);
  }

  /**
   * Log de nivel info - Información general de ejecución
   *
   * @param message - Mensaje a loggear
   * @param context - Datos adicionales de contexto
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * Log de nivel warn - Advertencias que no detienen la ejecución
   *
   * @param message - Mensaje a loggear
   * @param context - Datos adicionales de contexto
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * Log de nivel error - Errores que pueden afectar la ejecución
   *
   * @param message - Mensaje a loggear
   * @param error - Error capturado (opcional)
   * @param context - Datos adicionales de contexto
   */
  public error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : undefined;
    const errorContext = error && !(error instanceof Error) ? { errorData: error } : {};

    this.log(LOG_LEVELS.ERROR, message, { ...context, ...errorContext }, errorObj);
  }

  /**
   * Método interno de logging
   *
   * @param level - Nivel de log
   * @param message - Mensaje
   * @param context - Contexto adicional
   * @param error - Error si existe
   * @param category - Categoría del log
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    category?: LogCategory,
  ): void {
    this.logger.log({
      level,
      message,
      testName: this.testName,
      category,
      context,
      error,
    });
  }

  // ===================================
  // MÉTODOS ESPECIALIZADOS
  // ===================================

  /**
   * Registra una petición API saliente
   *
   * Sanitiza automáticamente headers con información sensible
   * (API keys, tokens, etc.)
   *
   * @param serviceName - Nombre del servicio (ej: 'Gemini', 'ElevenLabs')
   * @param requestData - Datos de la petición
   *
   * @example
   * ```typescript
   * logger.logApiRequest('Gemini', {
   *   url: 'https://api.gemini.com/v1/generate',
   *   method: 'POST',
   *   headers: { 'Authorization': 'Bearer sk-xxx' },
   *   body: { prompt: 'Hello' }
   * });
   * ```
   */
  public logApiRequest(serviceName: string, requestData: ApiRequestData): void {
    const sanitizedHeaders = requestData.headers
      ? sanitizeSensitiveData(requestData.headers)
      : undefined;

    this.log(
      LOG_LEVELS.INFO,
      `[${serviceName}] API Request: ${requestData.method} ${requestData.url}`,
      {
        service: serviceName,
        request: {
          url: requestData.url,
          method: requestData.method,
          headers: sanitizedHeaders,
          bodySize: requestData.body ? JSON.stringify(requestData.body).length : 0,
        },
      },
      undefined,
      LOG_CATEGORIES.API,
    );

    // Log de debug con body completo (si existe)
    if (requestData.body) {
      this.debug(`[${serviceName}] Request body`, { body: requestData.body });
    }
  }

  /**
   * Registra una respuesta API recibida
   *
   * @param serviceName - Nombre del servicio
   * @param responseData - Datos de la respuesta
   *
   * @example
   * ```typescript
   * logger.logApiResponse('Gemini', {
   *   url: 'https://api.gemini.com/v1/generate',
   *   statusCode: 200,
   *   statusText: 'OK',
   *   duration: 1500,
   *   body: { result: '...' }
   * });
   * ```
   */
  public logApiResponse(serviceName: string, responseData: ApiResponseData): void {
    const level = responseData.statusCode >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    const statusEmoji = responseData.statusCode >= 400 ? '❌' : '✅';

    this.log(
      level,
      `[${serviceName}] API Response: ${statusEmoji} ${responseData.statusCode} ${responseData.statusText || ''}`,
      {
        service: serviceName,
        response: {
          url: responseData.url,
          statusCode: responseData.statusCode,
          statusText: responseData.statusText,
          duration: responseData.duration,
          durationFormatted: responseData.duration ? formatDuration(responseData.duration) : undefined,
        },
      },
      undefined,
      LOG_CATEGORIES.API,
    );

    // Log de debug con body de respuesta
    if (responseData.body) {
      const bodyStr = JSON.stringify(responseData.body);
      const truncatedBody = bodyStr.length > 1000
        ? JSON.parse(bodyStr.substring(0, 1000) + '...')
        : responseData.body;
      this.debug(`[${serviceName}] Response body`, { body: truncatedBody });
    }
  }

  /**
   * Registra eventos de generación de video
   *
   * @param videoData - Datos de la generación de video
   *
   * @example
   * ```typescript
   * logger.logVideoGeneration({
   *   videoId: 'vid-001',
   *   title: 'AI News Short',
   *   status: 'started',
   *   resolution: { width: 1080, height: 1920 }
   * });
   *
   * // Más tarde...
   * logger.logVideoGeneration({
   *   videoId: 'vid-001',
   *   status: 'completed',
   *   fileSize: 15000000,
   *   outputPath: './output/video.mp4'
   * });
   * ```
   */
  public logVideoGeneration(videoData: VideoGenerationData): void {
    const statusMessages: Record<VideoGenerationData['status'], string> = {
      started: '🎬 Video generation started',
      processing: '⏳ Video generation in progress',
      completed: '✅ Video generation completed',
      failed: '❌ Video generation failed',
    };

    const level = videoData.status === 'failed' ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;

    this.log(
      level,
      `${statusMessages[videoData.status]}: ${videoData.videoId}`,
      {
        video: {
          id: videoData.videoId,
          title: videoData.title,
          status: videoData.status,
          resolution: videoData.resolution,
          durationSeconds: videoData.durationSeconds,
          fps: videoData.fps,
          fileSize: videoData.fileSize,
          fileSizeFormatted: videoData.fileSize ? formatBytes(videoData.fileSize) : undefined,
          outputPath: videoData.outputPath,
          progress: videoData.progress,
          error: videoData.error,
        },
      },
      undefined,
      LOG_CATEGORIES.VIDEO,
    );
  }

  /**
   * Registra resultados de validación
   *
   * @param validationData - Datos de la validación
   *
   * @example
   * ```typescript
   * logger.logValidationResults({
   *   validatorName: 'SchemaValidator',
   *   target: 'VideoConfig',
   *   passed: true,
   *   warnings: ['Optional field missing: description']
   * });
   *
   * logger.logValidationResults({
   *   validatorName: 'ContentValidator',
   *   target: 'Script',
   *   passed: false,
   *   errors: ['Script exceeds maximum length', 'Invalid characters found']
   * });
   * ```
   */
  public logValidationResults(validationData: ValidationData): void {
    const level = validationData.passed ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR;
    const statusEmoji = validationData.passed ? '✅' : '❌';

    this.log(
      level,
      `${statusEmoji} Validation [${validationData.validatorName}]: ${validationData.target} - ${validationData.passed ? 'PASSED' : 'FAILED'}`,
      {
        validation: {
          validator: validationData.validatorName,
          target: validationData.target,
          passed: validationData.passed,
          errorCount: validationData.errors?.length ?? 0,
          warningCount: validationData.warnings?.length ?? 0,
          errors: validationData.errors,
          warnings: validationData.warnings,
          details: validationData.details,
        },
      },
      undefined,
      LOG_CATEGORIES.VALIDATION,
    );
  }

  /**
   * Registra el inicio de un test
   *
   * @param testName - Nombre del test
   *
   * @example
   * ```typescript
   * logger.logTestStart('api-integration-test');
   * // ... ejecutar test ...
   * logger.logTestEnd('api-integration-test', 'passed', 2500);
   * ```
   */
  public logTestStart(testName: string): void {
    const startTime = Date.now();

    this.testRecords.set(testName, {
      name: testName,
      startTime,
    });

    this.log(
      LOG_LEVELS.INFO,
      `🚀 Test started: ${testName}`,
      {
        test: {
          name: testName,
          startTime: new Date(startTime).toISOString(),
        },
      },
      undefined,
      LOG_CATEGORIES.TEST_LIFECYCLE,
    );
  }

  /**
   * Registra el fin de un test
   *
   * @param testName - Nombre del test
   * @param status - Estado final del test
   * @param duration - Duración en milisegundos (opcional, se calcula automáticamente si se usó logTestStart)
   *
   * @example
   * ```typescript
   * logger.logTestEnd('api-integration-test', 'passed', 2500);
   * logger.logTestEnd('failing-test', 'failed', 1000);
   * ```
   */
  public logTestEnd(testName: string, status: TestStatus, duration?: number): void {
    const record = this.testRecords.get(testName);
    const endTime = Date.now();
    const actualDuration = duration ?? (record ? endTime - record.startTime : 0);

    // Actualizar registro
    if (record) {
      record.endTime = endTime;
      record.status = status;
    }

    const statusEmojis: Record<TestStatus, string> = {
      passed: '✅',
      failed: '❌',
      skipped: '⏭️',
      timeout: '⏰',
    };

    const level = status === TEST_STATUS.PASSED ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR;

    this.log(
      level,
      `${statusEmojis[status]} Test ${status}: ${testName}`,
      {
        test: {
          name: testName,
          status,
          duration: actualDuration,
          durationFormatted: formatDuration(actualDuration),
        },
      },
      undefined,
      LOG_CATEGORIES.TEST_LIFECYCLE,
    );
  }

  // ===================================
  // RESUMEN Y REPORTES
  // ===================================

  /**
   * Genera un resumen de la ejecución de tests
   *
   * Recopila estadísticas de todos los tests registrados con
   * logTestStart/logTestEnd y genera un resumen completo.
   *
   * @returns Resumen de ejecución
   *
   * @example
   * ```typescript
   * const summary = logger.generateSummary();
   * console.log(`Total: ${summary.totalTests}, Passed: ${summary.passed}`);
   *
   * // Guardar resumen a archivo
   * await logger.saveSummaryToFile(summary);
   * ```
   */
  public generateSummary(): TestExecutionSummary {
    const endTime = Date.now();
    const records = Array.from(this.testRecords.values());

    const passed = records.filter(r => r.status === TEST_STATUS.PASSED).length;
    const failed = records.filter(r => r.status === TEST_STATUS.FAILED).length;
    const skipped = records.filter(r => r.status === TEST_STATUS.SKIPPED).length;
    const timeout = records.filter(r => r.status === TEST_STATUS.TIMEOUT).length;

    const failedTests = records
      .filter(r => r.status === TEST_STATUS.FAILED)
      .map(r => ({
        name: r.name,
        error: r.error,
        duration: (r.endTime ?? endTime) - r.startTime,
      }));

    const summary: TestExecutionSummary = {
      startTime: new Date(this.suiteStartTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      totalDuration: endTime - this.suiteStartTime,
      totalTests: records.length,
      passed,
      failed,
      skipped,
      timeout,
      failedTests,
    };

    // Log del resumen
    this.log(
      LOG_LEVELS.INFO,
      `📊 Test Execution Summary: ${passed}/${records.length} passed`,
      {
        summary: {
          ...summary,
          totalDurationFormatted: formatDuration(summary.totalDuration),
          passRate: records.length > 0
            ? `${((passed / records.length) * 100).toFixed(1)}%`
            : 'N/A',
        },
      },
      undefined,
      LOG_CATEGORIES.TEST_LIFECYCLE,
    );

    return summary;
  }

  /**
   * Guarda el resumen de ejecución a un archivo JSON
   *
   * @param summary - Resumen a guardar (si no se proporciona, se genera uno nuevo)
   * @param filename - Nombre del archivo (por defecto: test-summary.json)
   * @returns Ruta del archivo guardado
   */
  public async saveSummaryToFile(
    summary?: TestExecutionSummary,
    filename?: string,
  ): Promise<string> {
    const summaryData = summary ?? this.generateSummary();
    const filepath = path.join(this.logDir, filename ?? LOG_PATHS.SUMMARY_FILE);

    await fs.promises.writeFile(filepath, JSON.stringify(summaryData, null, 2), 'utf-8');

    this.info(`Summary saved to ${filepath}`);
    return filepath;
  }

  /**
   * Exporta los logs a un archivo en formato especificado
   *
   * @param format - Formato de exportación ('json' o 'readable')
   * @param filename - Nombre del archivo de salida
   * @returns Ruta del archivo exportado
   */
  public async exportLogs(
    format: 'json' | 'readable' = 'json',
    filename?: string,
  ): Promise<string> {
    const ext = format === 'json' ? '.json' : '.txt';
    const defaultFilename = `test-export-${new Date().toISOString().split('T')[0]}${ext}`;
    const filepath = path.join(this.logDir, filename ?? defaultFilename);

    // Leer el archivo de log combinado más reciente
    const combinedPattern = LOG_PATHS.COMBINED_PATTERN.replace('%DATE%', '*');
    const files = await fs.promises.readdir(this.logDir);
    const logFiles = files
      .filter(f => f.match(/test-combined-.*\.log/))
      .sort()
      .reverse();

    if (logFiles.length === 0) {
      this.warn('No log files found to export');
      return '';
    }

    const latestLogFile = path.join(this.logDir, logFiles[0]);
    const content = await fs.promises.readFile(latestLogFile, 'utf-8');

    if (format === 'readable') {
      // Convertir JSONL a formato legible
      const lines = content.trim().split('\n');
      const readableContent = lines.map(line => {
        try {
          const entry = JSON.parse(line);
          return `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.category ? `[${entry.category}]` : ''} ${entry.message}`;
        } catch {
          return line;
        }
      }).join('\n');

      await fs.promises.writeFile(filepath, readableContent, 'utf-8');
    } else {
      // Mantener formato JSON
      await fs.promises.writeFile(filepath, content, 'utf-8');
    }

    this.info(`Logs exported to ${filepath}`);
    return filepath;
  }

  // ===================================
  // UTILIDADES
  // ===================================

  /**
   * Establece el nombre del test actual para contexto
   *
   * @param testName - Nombre del test
   */
  public setTestName(testName: string): void {
    this.testName = testName;
  }

  /**
   * Limpia el nombre del test actual
   */
  public clearTestName(): void {
    this.testName = undefined;
  }

  /**
   * Obtiene el directorio de logs
   *
   * @returns Ruta del directorio de logs
   */
  public getLogDirectory(): string {
    return this.logDir;
  }

  /**
   * Cierra el logger y libera recursos
   */
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }
}

// ===================================
// INSTANCIA SINGLETON
// ===================================

let defaultLogger: TestLogger | null = null;

/**
 * Obtiene la instancia singleton del TestLogger
 *
 * @param options - Opciones de configuración (solo aplicadas en la primera llamada)
 * @returns Instancia del TestLogger
 */
export function getTestLogger(options?: TestLoggerOptions): TestLogger {
  if (!defaultLogger) {
    defaultLogger = new TestLogger(options);
  }
  return defaultLogger;
}

/**
 * Resetea la instancia singleton (útil para testing)
 */
export function resetTestLogger(): void {
  if (defaultLogger) {
    defaultLogger.close();
    defaultLogger = null;
  }
}

export default TestLogger;
