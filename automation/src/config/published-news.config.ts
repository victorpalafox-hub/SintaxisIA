/**
 * @fileoverview Configuracion de Anti-Duplicacion de Noticias - Prompt 21
 *
 * Configuracion centralizada para el sistema de deduplicacion.
 * Todos los valores son configurables via variables de entorno.
 *
 * ANTI-HARDCODE: Ningun valor esta hardcodeado en el servicio.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 21
 */

import * as path from 'path';

// =============================================================================
// DETECCION DE PROYECTO ROOT (mismo patron que output.config.ts)
// =============================================================================

/**
 * Detecta el directorio raiz del proyecto
 *
 * Funciona tanto cuando se ejecuta desde:
 * - Raiz del proyecto (tests con Playwright)
 * - Directorio automation/ (CLI, scripts)
 */
function getProjectRoot(): string {
  const cwd = process.cwd();
  if (cwd.endsWith('automation') || cwd.includes('automation' + path.sep)) {
    return path.resolve(cwd, '..');
  }
  return cwd;
}

const PROJECT_ROOT = getProjectRoot();

// =============================================================================
// CONFIGURACION DE ANTI-DUPLICACION
// =============================================================================

/**
 * Configuracion del sistema anti-duplicacion de noticias
 *
 * Controla como se detectan y excluyen noticias previamente publicadas.
 * Tres capas de deteccion: ID exacto, similitud de titulo, empresa+producto.
 */
export const PUBLISHED_NEWS_CONFIG = {
  /** Path al archivo JSON de noticias publicadas */
  get dataFilePath(): string {
    return process.env.PUBLISHED_NEWS_DATA_PATH ||
      path.join(PROJECT_ROOT, 'data', 'published-news.json');
  },

  /** Directorio de datos */
  get dataDir(): string {
    return process.env.PUBLISHED_NEWS_DATA_DIR ||
      path.join(PROJECT_ROOT, 'data');
  },

  /** Dias hacia atras para verificar duplicados (default: 30) */
  get cooldownDays(): number {
    return parseInt(process.env.PUBLISHED_NEWS_COOLDOWN_DAYS || '30', 10);
  },

  /**
   * Umbral de similitud de titulo (0.0-1.0)
   * Default 0.8 = 80% word overlap (Jaccard) para considerar duplicado
   */
  get titleSimilarityThreshold(): number {
    return parseFloat(process.env.PUBLISHED_NEWS_SIMILARITY_THRESHOLD || '0.8');
  },

  /** Dias cooldown para misma empresa+producto (default: 7) */
  get companyProductCooldownDays(): number {
    return parseInt(process.env.PUBLISHED_NEWS_COMPANY_COOLDOWN_DAYS || '7', 10);
  },

  /** Maximo de entries en historial antes de podar (default: 100) */
  get maxHistoryEntries(): number {
    return parseInt(process.env.PUBLISHED_NEWS_MAX_HISTORY || '100', 10);
  },

  /** Version del formato de datos */
  dataVersion: 1,
};

export default PUBLISHED_NEWS_CONFIG;
