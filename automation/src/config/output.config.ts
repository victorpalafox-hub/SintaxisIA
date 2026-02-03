/**
 * @fileoverview Configuración de Output Manager - Prompt 19
 *
 * Configuración centralizada para la gestión de outputs del pipeline.
 * Define paths, formatos y opciones de guardado.
 *
 * ANTI-HARDCODE: Todos los valores son configurables vía variables de entorno.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19
 */

import * as path from 'path';

// =============================================================================
// DETECCIÓN DE PROYECTO ROOT
// =============================================================================

/**
 * Detecta el directorio raíz del proyecto
 *
 * Funciona tanto cuando se ejecuta desde:
 * - Raíz del proyecto (tests con Playwright)
 * - Directorio automation/ (CLI, scripts)
 */
function getProjectRoot(): string {
  const cwd = process.cwd();
  // Si estamos en automation/, subir un nivel
  if (cwd.endsWith('automation') || cwd.includes('automation' + path.sep)) {
    return path.resolve(cwd, '..');
  }
  // Si estamos en la raíz del proyecto
  return cwd;
}

const PROJECT_ROOT = getProjectRoot();

// =============================================================================
// CONFIGURACIÓN DE PATHS
// =============================================================================

/**
 * Paths de salida del pipeline
 *
 * Configurables vía variables de entorno:
 * - OUTPUT_BASE_DIR: Directorio base de outputs
 * - OUTPUT_TIKTOK_DIR: Subdirectorio para videos de TikTok
 */
export const OUTPUT_PATHS = {
  /** Directorio raíz del proyecto */
  projectRoot: PROJECT_ROOT,

  /** Directorio base para outputs */
  get baseDir() {
    return process.env.OUTPUT_BASE_DIR || path.join(PROJECT_ROOT, 'output');
  },

  /** Directorio para videos de TikTok (copia manual) */
  get tiktokManual() {
    return process.env.OUTPUT_TIKTOK_DIR || path.join(this.baseDir, 'tiktok-manual');
  },

  /** Genera path completo para una carpeta de output */
  getOutputFolder(folderName: string): string {
    return path.join(this.baseDir, folderName);
  },

  /** Genera path completo para video de TikTok */
  getTiktokPath(fileName: string): string {
    return path.join(this.tiktokManual, fileName);
  },
};

// =============================================================================
// CONFIGURACIÓN DE FORMATO
// =============================================================================

/**
 * Configuración de formato de nombres y archivos
 *
 * Configurables vía variables de entorno:
 * - OUTPUT_SLUG_MAX_LENGTH: Longitud máxima del slug
 * - OUTPUT_DATE_FORMAT: Formato de fecha (simple)
 */
export const OUTPUT_FORMAT = {
  /** Longitud máxima del slug (default: 50) */
  get slugMaxLength() {
    return parseInt(process.env.OUTPUT_SLUG_MAX_LENGTH || '50', 10);
  },

  /** Separador entre fecha y slug */
  dateSeparator: '_',

  /** Separador de palabras en slug */
  wordSeparator: '-',

  /** Caracteres permitidos en slug (regex) */
  allowedCharsRegex: /[^a-z0-9-]/g,
};

// =============================================================================
// NOMBRES DE ARCHIVOS
// =============================================================================

/**
 * Nombres de archivos de output
 *
 * Configurables vía variables de entorno para flexibilidad
 */
export const OUTPUT_FILES = {
  /** Archivo de noticia original */
  get news() {
    return process.env.OUTPUT_FILE_NEWS || 'news.json';
  },

  /** Archivo de score */
  get score() {
    return process.env.OUTPUT_FILE_SCORE || 'score.json';
  },

  /** Archivo de script estructurado */
  get scriptJson() {
    return process.env.OUTPUT_FILE_SCRIPT_JSON || 'script.json';
  },

  /** Archivo de script legible */
  get scriptTxt() {
    return process.env.OUTPUT_FILE_SCRIPT_TXT || 'script.txt';
  },

  /** Archivo de imágenes */
  get images() {
    return process.env.OUTPUT_FILE_IMAGES || 'images.json';
  },

  /** Archivo de audio (nombre base, se copia con este nombre) */
  get audio() {
    return process.env.OUTPUT_FILE_AUDIO || 'audio.mp3';
  },

  /** Archivo de metadata completa */
  get metadata() {
    return process.env.OUTPUT_FILE_METADATA || 'metadata.json';
  },

  /** Archivo de video final */
  get video() {
    return process.env.OUTPUT_FILE_VIDEO || 'video-final.mp4';
  },
};

// =============================================================================
// CONFIGURACIÓN DE SCRIPT LEGIBLE
// =============================================================================

/**
 * Configuración para el formato legible del script (script.txt)
 */
export const SCRIPT_FORMAT = {
  /** Separador principal */
  mainSeparator: '='.repeat(55),

  /** Separador de sección */
  sectionSeparator: '-'.repeat(40),

  /** Títulos de secciones */
  sections: {
    header: 'SINTAXIS IA - Script de Video',
    hook: 'HOOK (0-3 segundos)',
    body: 'BODY (3-35 segundos)',
    opinion: 'OPINION - Alex Torres (35-50 segundos)',
    cta: 'CTA (50-55 segundos)',
    compliance: 'COMPLIANCE REPORT',
  },

  /** Marcadores de compliance (nombres coinciden con HumanMarkers interface) */
  complianceMarkers: {
    hasFirstPerson: 'Primera persona',
    hasOpinion: 'Opinion subjetiva',
    admitsUncertainty: 'Admite incertidumbre',
    hasReflectiveQuestion: 'Preguntas reflexivas',
    avoidsCorpSpeak: 'Evita jerga corporativa',
    hasAnalogy: 'Usa analogias',
  },
};

// =============================================================================
// CONFIGURACIÓN COMPLETA EXPORTADA
// =============================================================================

/**
 * Configuración completa de Output Manager
 */
export const OUTPUT_CONFIG = {
  paths: OUTPUT_PATHS,
  format: OUTPUT_FORMAT,
  files: OUTPUT_FILES,
  scriptFormat: SCRIPT_FORMAT,
};

export default OUTPUT_CONFIG;
