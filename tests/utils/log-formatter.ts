// ===================================
// LOG FORMATTER
// Formateadores personalizados de Winston para consola y archivos
// ===================================

import winston from 'winston';
import {
  LOG_LEVEL_COLORS,
  TIMESTAMP_CONFIG,
  CONSOLE_CONFIG,
  type LogLevel,
  type LogCategory,
} from '../config/test-constants';

/**
 * Interfaz para la información de log de Winston
 */
interface LogInfo {
  level: LogLevel;
  message: string;
  timestamp?: string;
  category?: LogCategory;
  testName?: string;
  duration?: number;
  context?: Record<string, unknown>;
  error?: Error;
  [key: string]: unknown;
}

/**
 * Códigos ANSI para colores en consola
 */
const ANSI_COLORS: Record<string, string> = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

/**
 * Aplica color ANSI a un texto
 * @param text - Texto a colorear
 * @param color - Nombre del color
 * @returns Texto con códigos ANSI
 */
function colorize(text: string, color: string): string {
  const colorCode = ANSI_COLORS[color] || ANSI_COLORS.white;
  return `${colorCode}${text}${ANSI_COLORS.reset}`;
}

/**
 * Obtiene el color para un nivel de log
 * @param level - Nivel de log
 * @returns Nombre del color
 */
function getLevelColor(level: LogLevel): string {
  return LOG_LEVEL_COLORS[level] || 'white';
}

/**
 * Formatea el timestamp en formato ISO 8601
 * @returns Función de formato de Winston
 */
export const timestampFormat = winston.format.timestamp({
  format: TIMESTAMP_CONFIG.FORMAT,
});

/**
 * Formateador para salida en consola con colores
 * Produce output legible y colorizado para desarrollo
 *
 * Formato: [TIMESTAMP] LEVEL [CATEGORY] testName: message
 *          context: {...}
 *
 * @example
 * [2024-01-15T10:30:00.000Z] INFO [API] myTest: Request sent
 *   context: { url: "https://api.example.com", method: "GET" }
 */
export const consoleFormat = winston.format.printf((info: winston.Logform.TransformableInfo) => {
  const logInfo = info as unknown as LogInfo;
  const {
    level,
    message,
    timestamp,
    category,
    testName,
    duration,
    context,
    error,
  } = logInfo;

  // Construir partes del mensaje
  const parts: string[] = [];

  // Timestamp en gris
  if (timestamp) {
    parts.push(colorize(`[${timestamp}]`, 'gray'));
  }

  // Nivel con color correspondiente
  const levelColor = getLevelColor(level);
  const levelStr = level.toUpperCase().padEnd(5);
  parts.push(colorize(levelStr, levelColor));

  // Categoría en magenta si existe
  if (category) {
    parts.push(colorize(`[${category}]`, 'magenta'));
  }

  // Nombre del test en cyan si existe
  if (testName) {
    parts.push(colorize(`<${testName}>`, 'cyan'));
  }

  // Mensaje principal
  let displayMessage = message;
  if (CONSOLE_CONFIG.MAX_MESSAGE_LENGTH && message.length > CONSOLE_CONFIG.MAX_MESSAGE_LENGTH) {
    displayMessage = message.substring(0, CONSOLE_CONFIG.MAX_MESSAGE_LENGTH) + '...';
  }
  parts.push(displayMessage);

  // Duración si existe
  if (duration !== undefined) {
    parts.push(colorize(`(${duration}ms)`, 'gray'));
  }

  let output = parts.join(' ');

  // Contexto adicional en línea separada
  if (context && Object.keys(context).length > 0) {
    const contextStr = JSON.stringify(context, null, 2)
      .split('\n')
      .map(line => `  ${line}`)
      .join('\n');
    output += `\n${colorize('  context:', 'dim')}\n${colorize(contextStr, 'gray')}`;
  }

  // Error stack si existe
  if (error?.stack) {
    output += `\n${colorize('  stack:', 'red')}\n${colorize(error.stack, 'red')}`;
  }

  return output;
});

/**
 * Formateador para archivos JSON
 * Produce JSON estructurado para procesamiento y análisis
 *
 * Cada línea es un objeto JSON válido (formato JSONL)
 *
 * @example
 * {"timestamp":"2024-01-15T10:30:00.000Z","level":"info","category":"API","message":"Request sent","context":{...}}
 */
export const jsonFileFormat = winston.format.printf((info: winston.Logform.TransformableInfo) => {
  const logInfo = info as unknown as LogInfo;

  // Extraer campos conocidos
  const {
    level,
    message,
    timestamp,
    category,
    testName,
    duration,
    context,
    error,
    ...rest
  } = logInfo;

  // Construir objeto de log estructurado
  const logEntry: Record<string, unknown> = {
    timestamp,
    level,
    message,
  };

  // Agregar campos opcionales solo si existen
  if (category) logEntry.category = category;
  if (testName) logEntry.testName = testName;
  if (duration !== undefined) logEntry.duration = duration;

  // Agregar contexto
  if (context && Object.keys(context).length > 0) {
    logEntry.context = context;
  }

  // Agregar información de error
  if (error) {
    logEntry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  // Agregar campos adicionales no procesados
  const ignoredKeys = ['level', 'message', 'timestamp', 'category', 'testName', 'duration', 'context', 'error'];
  for (const [key, value] of Object.entries(rest)) {
    if (!ignoredKeys.includes(key) && value !== undefined) {
      logEntry[key] = value;
    }
  }

  return JSON.stringify(logEntry);
});

/**
 * Formateador combinado para consola
 * Incluye timestamp y formato colorizado
 */
export const combinedConsoleFormat = winston.format.combine(
  timestampFormat,
  consoleFormat,
);

/**
 * Formateador combinado para archivos JSON
 * Incluye timestamp y formato JSON estructurado
 */
export const combinedJsonFormat = winston.format.combine(
  timestampFormat,
  jsonFileFormat,
);

/**
 * Formatea bytes a una representación legible
 * @param bytes - Número de bytes
 * @returns String formateado (ej: "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formatea duración en milisegundos a formato legible
 * @param ms - Milisegundos
 * @returns String formateado (ej: "2m 30s")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Sanitiza datos sensibles de un objeto para logging
 * Reemplaza valores de campos sensibles con asteriscos
 *
 * @param data - Objeto a sanitizar
 * @param sensitiveKeys - Claves a ocultar (por defecto: key, secret, password, token, auth)
 * @returns Copia del objeto con valores sensibles ocultados
 */
export function sanitizeSensitiveData(
  data: Record<string, unknown>,
  sensitiveKeys: string[] = ['key', 'secret', 'password', 'token', 'auth', 'apikey', 'api_key'],
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sk => keyLower.includes(sk.toLowerCase()));

    if (isSensitive && typeof value === 'string') {
      sanitized[key] = '********';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeSensitiveData(value as Record<string, unknown>, sensitiveKeys);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export default {
  timestampFormat,
  consoleFormat,
  jsonFileFormat,
  combinedConsoleFormat,
  combinedJsonFormat,
  formatBytes,
  formatDuration,
  sanitizeSensitiveData,
};
