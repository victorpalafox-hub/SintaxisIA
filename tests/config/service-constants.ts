// ===================================
// SERVICE CONSTANTS
// Constantes de configuracion para Service Objects
// Centraliza magic numbers y valores hardcodeados
// ===================================

// ============================================================================
// TIMEOUT CONFIGURATION (LOCAL - evita imports cross-package que fallan en CI)
// ============================================================================
// NOTA: Estos valores DEBEN coincidir con automation/src/config/timeouts.config.ts
// Si cambias valores allá, actualízalos aquí también.

/**
 * Detecta si estamos en entorno CI/CD
 */
export const isCI = (): boolean => {
  return process.env.CI === 'true' ||
         process.env.GITHUB_ACTIONS === 'true' ||
         process.env.NODE_ENV === 'ci' ||
         process.env.NODE_ENV === 'test';
};

/**
 * Interface para configuración de timeout
 */
interface TimeoutConfig {
  readonly default: number;
  readonly ci: number;
  readonly value: number;
}

/**
 * Crea configuración de timeout adaptativa
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
 * Configuración de timeouts para TESTS
 * Valores idénticos a automation/src/config/timeouts.config.ts
 */
export const TIMEOUTS = {
  videoRender: createTimeoutConfig('VIDEO_RENDER_TIMEOUT', 30000, 120000),
  videoValidation: createTimeoutConfig('VIDEO_VALIDATION_TIMEOUT', 10000, 30000),
  fileOperation: createTimeoutConfig('FILE_OPERATION_TIMEOUT', 5000, 15000),
  apiCall: createTimeoutConfig('API_CALL_TIMEOUT', 15000, 60000),
  test: createTimeoutConfig('TEST_TIMEOUT', 30000, 120000),
  build: createTimeoutConfig('BUILD_TIMEOUT', 60000, 180000),
  imageFetch: createTimeoutConfig('IMAGE_FETCH_TIMEOUT', 5000, 15000),
  tts: createTimeoutConfig('TTS_TIMEOUT', 60000, 120000),
  /** Umbral para timeout "corto" - NO cambia entre entornos */
  shortTimeoutThreshold: {
    default: 500,
    ci: 500,
    get value() { return this.default; }
  }
} as const;

export type TimeoutType = keyof typeof TIMEOUTS;

export function getTimeout(type: TimeoutType, override?: number): number {
  if (override !== undefined && override > 0) return override;
  return TIMEOUTS[type].value;
}

export function isShortTimeout(timeout: number): boolean {
  return timeout < TIMEOUTS.shortTimeoutThreshold.value;
}

export function logTimeoutConfig(): void {
  console.log('⏱️  Timeout Configuration:');
  console.log(`   Environment: ${isCI() ? 'CI/CD' : 'Local'}`);
  Object.entries(TIMEOUTS).forEach(([key, config]) => {
    if (typeof config === 'object' && 'value' in config) {
      console.log(`     ${key}: ${config.value}ms`);
    }
  });
}

/**
 * Configuracion de la API de Gemini
 */
export const GEMINI_CONFIG = {
  /** URL base de la API de Gemini */
  BASE_URL: 'https://generativelanguage.googleapis.com/v1',

  /** Modelo por defecto */
  DEFAULT_MODEL: 'gemini-pro',

  /** Opciones de generacion por defecto */
  DEFAULT_OPTIONS: {
    /** Maximo de tokens en la respuesta */
    MAX_TOKENS: 500,
    /** Temperatura para creatividad (0.0-1.0) */
    TEMPERATURE: 0.7,
    /** Top-p para seleccion de tokens */
    TOP_P: 0.9,
  },

  /** Estimacion de caracteres por token para calculos de uso */
  CHARS_PER_TOKEN_ESTIMATE: 4,
} as const;

/**
 * Configuracion de video por defecto
 */
export const VIDEO_CONFIG = {
  /** Resolucion por defecto (formato vertical YouTube Shorts) */
  DEFAULT_RESOLUTION: {
    WIDTH: 1080,
    HEIGHT: 1920,
  },

  /** FPS por defecto */
  DEFAULT_FPS: 30,

  /** Duracion por defecto en segundos */
  DEFAULT_DURATION: 30,

  /** Bitrate estimado en bits por segundo (5 Mbps) */
  ESTIMATED_BITRATE_BPS: 5 * 1024 * 1024,

  /** Codec por defecto */
  DEFAULT_CODEC: 'h264',
} as const;

/**
 * Delays simulados para mock implementations (en milisegundos)
 * Usados para simular tiempos de respuesta realistas en tests
 */
export const MOCK_DELAYS = {
  /** Rango de delay para API de Gemini (min-max) */
  GEMINI_API: {
    MIN: 1000,
    MAX: 2000,
  },

  /** Delay para validacion de API key */
  API_KEY_VALIDATION: 500,

  /** Delays por fase de renderizado de video */
  VIDEO_RENDER_PHASES: {
    INITIALIZE: 500,
    RENDER_FRAMES: 800,
    APPLY_EFFECTS: 600,
    ENCODE_VIDEO: 700,
    FINALIZE: 400,
  },

  /** Delay para extraccion de metadata (FFprobe simulado) */
  METADATA_EXTRACTION: 300,

  /** Delay base para validacion OCR */
  OCR_VALIDATION_BASE: 500,
  /** Delay adicional por texto esperado en OCR */
  OCR_VALIDATION_PER_TEXT: 100,

  /** Delay para validacion de audio (STT) */
  AUDIO_VALIDATION: 800,

  /** Delay para validacion de sincronizacion */
  SYNC_VALIDATION: 1000,
} as const;

/**
 * Umbrales de validacion
 */
export const VALIDATION_THRESHOLDS = {
  /** Umbral de sincronizacion en milisegundos */
  SYNC_OFFSET_MS: 100,

  /** Longitud minima de script esperada */
  MIN_SCRIPT_LENGTH: 50,

  /** Longitud minima de API key valida */
  MIN_API_KEY_LENGTH: 10,

  /** Validacion de video - duracion */
  VIDEO_DURATION: {
    /** Duracion minima para YouTube Shorts (segundos) */
    MIN_SECONDS: 25,
    /** Duracion maxima para YouTube Shorts (segundos) */
    MAX_SECONDS: 60,
  },

  /** Validacion de video - tamaño de archivo */
  VIDEO_FILE_SIZE: {
    /** Tamaño minimo esperado en bytes (100KB) */
    MIN_BYTES: 100 * 1024,
    /** Tamaño maximo permitido en bytes (50MB) */
    MAX_BYTES: 50 * 1024 * 1024,
  },

  /** Validacion de video - resolucion */
  VIDEO_RESOLUTION: {
    /** Ancho esperado para Shorts (9:16) */
    EXPECTED_WIDTH: 1080,
    /** Alto esperado para Shorts (9:16) */
    EXPECTED_HEIGHT: 1920,
  },

  /**
   * @deprecated Usar TIMEOUTS.videoRender.value en su lugar
   */
  get VIDEO_RENDER_TIMEOUT_MS() {
    return TIMEOUTS.videoRender.value;
  },
} as const;

/**
 * Configuracion de comandos de Remotion
 */
export const REMOTION_CONFIG = {
  /** Directorio del proyecto Remotion */
  PROJECT_DIR: 'remotion-app',

  /** Composiciones disponibles (actualizadas en Prompt 13.2) */
  COMPOSITIONS: {
    /** Video completo de 55 segundos (1 noticia con efectos dinámicos) */
    FULL: 'AINewsShort',
    /** Preview de 10 segundos para desarrollo rápido */
    PREVIEW: 'AINewsShort-Preview',
  },

  /** Directorio de salida por defecto */
  OUTPUT_DIR: 'out',

  /** Codec de video por defecto */
  DEFAULT_CODEC: 'h264',

  /** Formato de audio por defecto */
  DEFAULT_AUDIO_CODEC: 'aac',
} as const;

/**
 * Valores mock para validaciones
 */
export const MOCK_VALIDATION_VALUES = {
  /** Offset maximo simulado en sync */
  MAX_SYNC_OFFSET: 45,
  /** Offset promedio simulado en sync */
  AVG_SYNC_OFFSET: 18,

  /** Duracion de audio simulada */
  AUDIO_DURATION: 30,
  /** Transcripcion mock */
  AUDIO_TRANSCRIPTION: 'La inteligencia artificial esta transformando el mundo...',
} as const;

/**
 * Configuracion de validacion de contenido para scripts de video
 *
 * Define limites y umbrales para validar la calidad del contenido
 * generado para YouTube Shorts.
 */
export const CONTENT_VALIDATION = {
  /**
   * Limites de longitud por seccion del script (en palabras)
   */
  SCRIPT_LENGTH: {
    /** Titulo: 5-15 palabras */
    TITLE: { MIN: 5, MAX: 15 },
    /** Gancho/Hook: 10-20 palabras */
    GANCHO: { MIN: 10, MAX: 20 },
    /** Cada punto de contenido: 15-30 palabras */
    CONTENIDO_PUNTO: { MIN: 15, MAX: 30 },
    /** Mensaje de impacto: 10-25 palabras */
    IMPACTO: { MIN: 10, MAX: 25 },
    /** Call to Action: 5-15 palabras */
    CTA: { MIN: 5, MAX: 15 },
    /** Total del script: 100-200 palabras */
    TOTAL: { MIN: 100, MAX: 200 },
  },

  /**
   * Estructura requerida del script
   */
  SCRIPT_STRUCTURE: {
    /** Minimo de puntos en contenido principal */
    MIN_CONTENIDO_PUNTOS: 3,
    /** Maximo de puntos en contenido principal */
    MAX_CONTENIDO_PUNTOS: 7,
    /** Minimo de tags requeridos */
    MIN_TAGS: 3,
    /** Maximo de tags permitidos */
    MAX_TAGS: 5,
  },

  /**
   * Estimacion de duracion de video basada en palabras
   */
  VIDEO_DURATION_ESTIMATE: {
    /** Velocidad promedio de TTS (palabras por segundo) */
    WORDS_PER_SECOND: 2.5,
    /** Duracion minima aceptable (segundos) */
    MIN_SECONDS: 25,
    /** Duracion maxima aceptable (segundos) */
    MAX_SECONDS: 60,
  },

  /**
   * Topicos validos para contenido de IA/Tech
   */
  VALID_TOPICS: [
    'anthropic',
    'openai',
    'google',
    'deepmind',
    'meta',
    'mistral',
    'microsoft',
    'nvidia',
    'llm',
    'ai-tools',
    'machine-learning',
    'chatgpt',
    'claude',
    'gemini',
    'general-ai',
  ] as readonly string[],

  /**
   * Palabras prohibidas/inapropiadas (basico)
   */
  INAPPROPRIATE_WORDS: [
    'mierda',
    'puta',
    'joder',
    'carajo',
    'idiota',
    'estupido',
  ] as readonly string[],

  /**
   * Palabras clave esperadas en contenido tech/IA
   */
  TECH_KEYWORDS: [
    'inteligencia artificial',
    'ia',
    'ai',
    'modelo',
    'tecnología',
    'datos',
    'algoritmo',
    'aprendizaje',
    'neural',
    'machine learning',
    'deep learning',
    'llm',
    'gpt',
    'chatbot',
  ] as readonly string[],
} as const;

/**
 * Delays para validacion de contenido (mock)
 */
export const CONTENT_VALIDATION_DELAYS = {
  /** Delay para validacion de estructura */
  STRUCTURE_VALIDATION: 100,
  /** Delay para validacion de longitud */
  LENGTH_VALIDATION: 50,
  /** Delay para deteccion de topico */
  TOPIC_DETECTION: 150,
  /** Delay para validacion de imagen */
  IMAGE_VALIDATION: 200,
  /** Delay para validacion de calidad */
  QUALITY_VALIDATION: 250,
} as const;

export default {
  GEMINI_CONFIG,
  VIDEO_CONFIG,
  MOCK_DELAYS,
  VALIDATION_THRESHOLDS,
  MOCK_VALIDATION_VALUES,
  REMOTION_CONFIG,
  CONTENT_VALIDATION,
  CONTENT_VALIDATION_DELAYS,
};
