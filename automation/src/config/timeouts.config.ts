/**
 * @fileoverview Configuración centralizada de timeouts
 * @description Valores configurables por entorno (local vs CI/CD)
 * @module config/timeouts
 * @prompt Fix definitivo - Anti-hardcode timeouts
 *
 * Este archivo centraliza TODOS los timeouts del proyecto para evitar
 * valores hardcodeados dispersos. Los valores se adaptan automáticamente
 * según el entorno (local o CI/CD).
 *
 * @example
 * ```typescript
 * import { TIMEOUTS, getTimeout } from './config/timeouts.config';
 *
 * // Uso directo
 * const timeout = TIMEOUTS.videoRender.value;
 *
 * // Con override opcional
 * const customTimeout = getTimeout('videoRender', userOverride);
 * ```
 */

/**
 * Detecta si estamos en entorno CI/CD
 * Verifica múltiples variables de entorno comunes en sistemas CI
 */
const isCI = (): boolean => {
  return process.env.CI === 'true' ||
         process.env.GITHUB_ACTIONS === 'true' ||
         process.env.NODE_ENV === 'ci' ||
         process.env.NODE_ENV === 'test';
};

/**
 * Interface para configuración de timeout individual
 */
interface TimeoutConfig {
  /** Valor por defecto para entorno local */
  readonly default: number;
  /** Valor para entorno CI/CD (generalmente más alto) */
  readonly ci: number;
  /** Valor actual basado en el entorno detectado */
  readonly value: number;
}

/**
 * Crea una configuración de timeout adaptativa
 * @param envVar - Nombre de la variable de entorno (sin sufijo)
 * @param defaultValue - Valor por defecto para local
 * @param ciValue - Valor por defecto para CI
 */
const createTimeoutConfig = (
  envVar: string,
  defaultValue: number,
  ciValue: number
): TimeoutConfig => ({
  default: parseInt(process.env[`${envVar}_MS`] || String(defaultValue), 10),
  ci: parseInt(process.env[`${envVar}_CI_MS`] || String(ciValue), 10),
  get value() {
    return isCI() ? this.ci : this.default;
  }
});

/**
 * Configuración centralizada de timeouts adaptativa por entorno
 *
 * - **Local**: Valores más bajos para desarrollo rápido
 * - **CI/CD**: Valores más altos para evitar falsos negativos
 *
 * Todos los valores son configurables via variables de entorno.
 */
export const TIMEOUTS = {
  /**
   * Renderizado de video completo con Remotion
   * Local: 30s | CI: 120s
   */
  videoRender: createTimeoutConfig('VIDEO_RENDER_TIMEOUT', 30000, 120000),

  /**
   * Validación de archivos de video (metadata, duración, etc.)
   * Local: 10s | CI: 30s
   */
  videoValidation: createTimeoutConfig('VIDEO_VALIDATION_TIMEOUT', 10000, 30000),

  /**
   * Operaciones de archivo (copiar, mover, descargar)
   * Local: 5s | CI: 15s
   */
  fileOperation: createTimeoutConfig('FILE_OPERATION_TIMEOUT', 5000, 15000),

  /**
   * Llamadas a APIs externas (Gemini, ElevenLabs, NewsData)
   * Local: 15s | CI: 60s
   */
  apiCall: createTimeoutConfig('API_CALL_TIMEOUT', 15000, 60000),

  /**
   * Timeout para tests individuales de Playwright
   * Local: 30s | CI: 120s
   */
  test: createTimeoutConfig('TEST_TIMEOUT', 30000, 120000),

  /**
   * Build de proyectos (TypeScript, Remotion)
   * Local: 60s | CI: 180s
   */
  build: createTimeoutConfig('BUILD_TIMEOUT', 60000, 180000),

  /**
   * Fetch de imágenes desde providers externos
   * Local: 5s | CI: 15s
   */
  imageFetch: createTimeoutConfig('IMAGE_FETCH_TIMEOUT', 5000, 15000),

  /**
   * Text-to-Speech generation (ElevenLabs/Edge-TTS)
   * Local: 60s | CI: 120s
   */
  tts: createTimeoutConfig('TTS_TIMEOUT', 60000, 120000),

  /**
   * Umbral mínimo para considerar un timeout como "corto"
   * Usado en tests para simular timeouts que deben fallar
   * Este valor NO cambia entre entornos
   */
  shortTimeoutThreshold: {
    default: 500,
    ci: 500,
    get value() {
      return this.default; // Siempre el mismo valor
    }
  }
} as const;

/**
 * Tipo para las claves de timeout disponibles
 */
export type TimeoutType = keyof typeof TIMEOUTS;

/**
 * Helper para obtener timeout con override opcional
 *
 * @param type - Tipo de timeout a obtener
 * @param override - Valor override opcional (si se proporciona, se usa este)
 * @returns El timeout en milisegundos
 *
 * @example
 * ```typescript
 * // Usar valor configurado
 * const timeout = getTimeout('videoRender');
 *
 * // Usar override si está definido, sino el configurado
 * const timeout = getTimeout('videoRender', userProvidedTimeout);
 * ```
 */
export function getTimeout(
  type: TimeoutType,
  override?: number
): number {
  if (override !== undefined && override > 0) return override;
  return TIMEOUTS[type].value;
}

/**
 * Verifica si un timeout es considerado "corto" (para tests de error)
 *
 * @param timeout - Timeout a verificar en ms
 * @returns true si el timeout es menor al umbral configurado
 *
 * @example
 * ```typescript
 * if (isShortTimeout(100)) {
 *   return { error: 'Timeout muy corto para completar operación' };
 * }
 * ```
 */
export function isShortTimeout(timeout: number): boolean {
  return timeout < TIMEOUTS.shortTimeoutThreshold.value;
}

/**
 * Helper para logging de configuración de timeouts (debug)
 * Útil para diagnosticar problemas en CI/CD
 */
export function logTimeoutConfig(): void {
  console.log('⏱️  Timeout Configuration:');
  console.log(`   Environment: ${isCI() ? 'CI/CD' : 'Local'}`);
  console.log(`   CI detected: ${isCI()}`);
  console.log('   Values:');
  Object.entries(TIMEOUTS).forEach(([key, config]) => {
    if (typeof config === 'object' && 'value' in config) {
      console.log(`     ${key}: ${config.value}ms (local: ${config.default}ms, ci: ${config.ci}ms)`);
    }
  });
}

/**
 * Obtiene la configuración completa para un tipo de timeout
 * Útil para tests o debugging
 */
export function getTimeoutConfig(type: TimeoutType): TimeoutConfig {
  return TIMEOUTS[type];
}

/**
 * Verifica si estamos en entorno CI/CD
 * Exportado para uso en otros módulos
 */
export { isCI };
