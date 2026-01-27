// ===================================
// LOGGER - Sistema de logs con colores
// ===================================

// Códigos ANSI para colores en terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Colores de texto
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Colores de fondo
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

// Iconos para diferentes tipos de log
const icons = {
  info: 'ℹ',
  success: '✓',
  warn: '⚠',
  error: '✗',
  step: '→',
  header: '◆'
};

/**
 * Obtiene timestamp actual formateado
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Sistema de logging con colores para Sintaxis IA
 */
export const logger = {
  /**
   * Log informativo (cyan)
   */
  info(message: string): void {
    console.log(
      `${colors.dim}[${getTimestamp()}]${colors.reset} ` +
      `${colors.cyan}${icons.info}${colors.reset} ${message}`
    );
  },

  /**
   * Log de éxito (verde)
   */
  success(message: string): void {
    console.log(
      `${colors.dim}[${getTimestamp()}]${colors.reset} ` +
      `${colors.green}${icons.success}${colors.reset} ${message}`
    );
  },

  /**
   * Log de advertencia (amarillo)
   */
  warn(message: string): void {
    console.log(
      `${colors.dim}[${getTimestamp()}]${colors.reset} ` +
      `${colors.yellow}${icons.warn}${colors.reset} ${message}`
    );
  },

  /**
   * Log de error (rojo)
   */
  error(message: string): void {
    console.error(
      `${colors.dim}[${getTimestamp()}]${colors.reset} ` +
      `${colors.red}${icons.error}${colors.reset} ${colors.red}${message}${colors.reset}`
    );
  },

  /**
   * Log de paso en proceso (magenta)
   */
  step(current: number, total: number, message: string): void {
    console.log(
      `\n${colors.dim}[${getTimestamp()}]${colors.reset} ` +
      `${colors.magenta}${icons.step} [${current}/${total}]${colors.reset} ` +
      `${colors.bright}${message}${colors.reset}`
    );
  },

  /**
   * Header decorativo
   */
  header(title: string): void {
    const line = '═'.repeat(title.length + 4);
    console.log(`\n${colors.cyan}${colors.bright}╔${line}╗${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}║  ${title}  ║${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}╚${line}╝${colors.reset}\n`);
  },

  /**
   * Separador visual
   */
  separator(): void {
    console.log(`${colors.dim}${'─'.repeat(50)}${colors.reset}`);
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${colors.dim}[DEBUG] ${message}${colors.reset}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    }
  }
};

export default logger;
