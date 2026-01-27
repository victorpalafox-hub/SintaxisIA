// ===================================
// TEST CONSTANTS
// Configuración de constantes para el sistema de logging de tests
// ===================================

import * as path from 'path';

/**
 * Niveles de log soportados por el sistema
 * Ordenados por severidad (menor a mayor)
 */
export const LOG_LEVELS = {
  /** Información detallada para debugging */
  DEBUG: 'debug',
  /** Información general de ejecución */
  INFO: 'info',
  /** Advertencias que no detienen la ejecución */
  WARN: 'warn',
  /** Errores que pueden afectar la ejecución */
  ERROR: 'error',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

/**
 * Prioridades numéricas de cada nivel de log
 * Usado internamente por Winston
 */
export const LOG_LEVEL_PRIORITIES: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Colores asociados a cada nivel de log para la consola
 */
export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'cyan',
};

/**
 * Configuración de rutas para archivos de log
 */
export const LOG_PATHS = {
  /** Directorio base donde se guardan los logs */
  BASE_DIR: path.resolve(__dirname, '../logs'),

  /** Patrón para archivos de log combinados (todos los niveles) */
  COMBINED_PATTERN: 'test-combined-%DATE%.log',

  /** Patrón para archivos de log de errores */
  ERROR_PATTERN: 'test-error-%DATE%.log',

  /** Patrón para archivos de log de API */
  API_PATTERN: 'test-api-%DATE%.log',

  /** Patrón para archivos de log de generación de video */
  VIDEO_PATTERN: 'test-video-%DATE%.log',

  /** Archivo de resumen de ejecución de tests */
  SUMMARY_FILE: 'test-summary.json',
} as const;

/**
 * Configuración de retención y rotación de logs
 */
export const LOG_RETENTION = {
  /** Días que se mantienen los archivos de log antes de eliminarlos */
  RETENTION_DAYS: 7,

  /** Tamaño máximo de cada archivo de log antes de rotar (20MB) */
  MAX_FILE_SIZE: '20m',

  /** Número máximo de archivos a mantener (como respaldo adicional) */
  MAX_FILES: '7d',

  /** Formato de fecha para los nombres de archivo */
  DATE_PATTERN: 'YYYY-MM-DD',

  /** Si se debe comprimir los archivos rotados */
  COMPRESS_ROTATED: true,
} as const;

/**
 * Configuración del formato de timestamps
 */
export const TIMESTAMP_CONFIG = {
  /** Formato ISO 8601 completo con zona horaria */
  FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ',

  /** Zona horaria por defecto */
  TIMEZONE: 'America/Mexico_City',
} as const;

/**
 * Etiquetas para categorizar los logs
 */
export const LOG_CATEGORIES = {
  /** Logs relacionados con llamadas a APIs externas */
  API: 'API',

  /** Logs relacionados con generación de video */
  VIDEO: 'VIDEO',

  /** Logs relacionados con validación */
  VALIDATION: 'VALIDATION',

  /** Logs relacionados con el ciclo de vida del test */
  TEST_LIFECYCLE: 'TEST_LIFECYCLE',

  /** Logs generales del sistema */
  SYSTEM: 'SYSTEM',
} as const;

export type LogCategory = typeof LOG_CATEGORIES[keyof typeof LOG_CATEGORIES];

/**
 * Estados posibles de un test
 */
export const TEST_STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  TIMEOUT: 'timeout',
} as const;

export type TestStatus = typeof TEST_STATUS[keyof typeof TEST_STATUS];

/**
 * Configuración de consola
 */
export const CONSOLE_CONFIG = {
  /** Si se debe mostrar logs en consola */
  ENABLED: true,

  /** Nivel mínimo para mostrar en consola */
  LEVEL: LOG_LEVELS.DEBUG,

  /** Si se debe usar colores en consola */
  COLORIZE: true,

  /** Ancho máximo de mensaje antes de truncar */
  MAX_MESSAGE_LENGTH: 500,
} as const;

export default {
  LOG_LEVELS,
  LOG_LEVEL_PRIORITIES,
  LOG_LEVEL_COLORS,
  LOG_PATHS,
  LOG_RETENTION,
  TIMESTAMP_CONFIG,
  LOG_CATEGORIES,
  TEST_STATUS,
  CONSOLE_CONFIG,
};
