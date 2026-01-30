/**
 * @fileoverview Configuración de Variables de Entorno
 *
 * Carga y valida variables sensibles de manera segura.
 * NO incluye valores hardcodeados - todo viene de .env
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14.1
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar .env desde la raíz del proyecto
const rootDir = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(rootDir, '.env') });

// =============================================================================
// CONFIGURACIÓN DE NOTIFICACIONES
// =============================================================================

/**
 * Configuración de Notificaciones
 *
 * Incluye email (Resend) y Telegram.
 * Valores cargados desde variables de entorno.
 */
export const NOTIFICATION_CONFIG = {
  email: {
    /** Email destino de notificaciones */
    to: process.env.NOTIFICATION_EMAIL || '',
    /** API Key de Resend */
    apiKey: process.env.RESEND_API_KEY || '',
    /** Email remitente (debe estar verificado en Resend) */
    from: 'Sintaxis IA <notificaciones@sintaxis-ia.com>',
  },

  telegram: {
    /** Token del bot de Telegram (de @BotFather) */
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    /** Chat ID del destinatario */
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },

  dashboard: {
    /** URL base del dashboard de aprobación */
    url: process.env.DASHBOARD_URL || 'http://localhost:3000',
    /** Secret key para autenticar acciones */
    secret: process.env.DASHBOARD_SECRET || '',
  },
};

// =============================================================================
// CONFIGURACIÓN DE STORAGE
// =============================================================================

/**
 * Configuración de almacenamiento temporal
 */
export const STORAGE_CONFIG = {
  /** Path para videos pendientes de aprobación */
  tempPath: process.env.TEMP_STORAGE_PATH || './automation/temp/videos',
};

// =============================================================================
// VALIDACIÓN
// =============================================================================

/**
 * Lista de variables de entorno requeridas para notificaciones
 */
const REQUIRED_ENV_VARS = [
  'NOTIFICATION_EMAIL',
  'RESEND_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'DASHBOARD_SECRET',
];

/**
 * Valida que todas las variables requeridas estén configuradas
 *
 * @returns Objeto con estado de validación y variables faltantes
 *
 * @example
 * ```typescript
 * const { valid, missing } = validateEnvConfig();
 * if (!valid) {
 *   console.error('Variables faltantes:', missing);
 * }
 * ```
 */
export function validateEnvConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Valida configuración de forma permisiva (solo warnings)
 *
 * Útil para desarrollo cuando no todas las variables están configuradas.
 *
 * @returns true si hay al menos las variables mínimas
 */
export function validateEnvConfigPermissive(): boolean {
  const { missing } = validateEnvConfig();

  if (missing.length > 0) {
    console.warn('⚠️  Variables de entorno faltantes (notificaciones deshabilitadas):');
    missing.forEach(key => console.warn(`   - ${key}`));
    return false;
  }

  return true;
}

// =============================================================================
// INICIALIZACIÓN
// =============================================================================

/**
 * Inicializa directorios necesarios para el sistema
 *
 * Crea directorios de storage temporal si no existen.
 */
export function initializeStorage(): void {
  const tempPath = path.resolve(rootDir, STORAGE_CONFIG.tempPath);

  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
    console.log(`✅ Directorio temporal creado: ${tempPath}`);
  }
}

// =============================================================================
// UTILIDADES DE SEGURIDAD
// =============================================================================

/**
 * Obtiene configuración de manera segura para logging
 *
 * Enmascara todos los valores sensibles para que puedan
 * ser loggeados sin exponer credenciales.
 *
 * @returns Configuración con valores enmascarados
 */
export function getSafeConfig(): Record<string, unknown> {
  return {
    email: {
      to: maskEmail(NOTIFICATION_CONFIG.email.to),
      apiKey: maskSecret(NOTIFICATION_CONFIG.email.apiKey),
      from: NOTIFICATION_CONFIG.email.from,
    },
    telegram: {
      botToken: maskSecret(NOTIFICATION_CONFIG.telegram.botToken),
      chatId: maskSecret(NOTIFICATION_CONFIG.telegram.chatId),
    },
    dashboard: {
      url: NOTIFICATION_CONFIG.dashboard.url,
      secret: maskSecret(NOTIFICATION_CONFIG.dashboard.secret),
    },
    storage: {
      tempPath: STORAGE_CONFIG.tempPath,
    },
  };
}

/**
 * Enmascara email para logging seguro
 *
 * @param email - Email a enmascarar
 * @returns Email enmascarado (ej: v*******1@gmail.com)
 *
 * @example
 * ```typescript
 * maskEmail('victor@gmail.com'); // 'v****r@gmail.com'
 * ```
 */
function maskEmail(email: string): string {
  if (!email) return '[NO CONFIGURADO]';

  const atIndex = email.indexOf('@');
  if (atIndex === -1) return '[INVÁLIDO]';

  const local = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  if (local.length <= 2) {
    return '*'.repeat(local.length) + domain;
  }

  const masked = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
  return masked + domain;
}

/**
 * Enmascara secreto para logging seguro
 *
 * @param secret - Secreto a enmascarar
 * @returns Secreto enmascarado (ej: abc***456)
 *
 * @example
 * ```typescript
 * maskSecret('abc123def456'); // 'abc***456'
 * ```
 */
function maskSecret(secret: string): string {
  if (!secret) return '[NO CONFIGURADO]';
  if (secret.length < 8) return '***';

  return secret.slice(0, 3) + '***' + secret.slice(-3);
}

/**
 * Verifica si las notificaciones están habilitadas
 *
 * @returns true si todas las variables de notificación están configuradas
 */
export function areNotificationsEnabled(): boolean {
  return (
    !!NOTIFICATION_CONFIG.email.to &&
    !!NOTIFICATION_CONFIG.email.apiKey &&
    !!NOTIFICATION_CONFIG.telegram.botToken &&
    !!NOTIFICATION_CONFIG.telegram.chatId
  );
}

// Export por defecto
export default {
  NOTIFICATION_CONFIG,
  STORAGE_CONFIG,
  validateEnvConfig,
  validateEnvConfigPermissive,
  initializeStorage,
  getSafeConfig,
  areNotificationsEnabled,
};
