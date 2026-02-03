// ===================================
// CONFIGURACIÓN - Variables de entorno y constantes
// ===================================

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables desde .env en la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ===================================
// INTERFACES
// ===================================

interface ApiConfig {
  newsDataApiKey: string;
  geminiApiKey: string;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
}

interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  durationFrames: number;
}

interface ContentConfig {
  targetLanguage: string;
  maxSubtitleWords: number;
  maxNewsItems: number;
}

interface PathsConfig {
  outputDir: string;
  assetsDir: string;
  audioDir: string;
  remotionAppDir: string;
}

interface WatermarkConfig {
  enabled: boolean;
  opacity: number;
  size: number;
  margin: number;
}

interface FullConfig {
  api: ApiConfig;
  video: VideoConfig;
  content: ContentConfig;
  paths: PathsConfig;
  watermark: WatermarkConfig;
}

// ===================================
// VALIDACIÓN
// ===================================

/**
 * Detecta si estamos en entorno CI/CD o test
 * En estos entornos, las API keys no son requeridas porque usamos mocks
 */
export const isTestOrCI = (): boolean => {
  return process.env.CI === 'true' ||
         process.env.GITHUB_ACTIONS === 'true' ||
         process.env.NODE_ENV === 'test' ||
         process.env.NODE_ENV === 'ci';
};

// Variables REQUERIDAS - el pipeline falla sin ellas
const requiredEnvVars = [
  'NEWSDATA_API_KEY',
  'GEMINI_API_KEY',
];

// Variables OPCIONALES - tienen fallback automático
// ELEVENLABS_API_KEY: Si no está, usa Edge-TTS gratis (Prompt 19.3.1)
// ELEVENLABS_VOICE_ID: Si no está, usa voz por defecto
const optionalEnvVars = [
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID',
];

// Solo validar variables REQUERIDAS en producción/desarrollo
// En CI/test usamos valores mock
if (!isTestOrCI()) {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missing.length > 0) {
    throw new Error(`Variables de entorno requeridas no definidas: ${missing.join(', ')}`);
  }

  // Log informativo para variables opcionales faltantes
  const missingOptional = optionalEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingOptional.length > 0) {
    console.log(`ℹ️  Variables opcionales no definidas (usando fallback): ${missingOptional.join(', ')}`);
  }
}

// Valores por defecto para CI/test (nunca se usan en producción)
const CI_MOCK_VALUE = 'ci-test-mock-key';

// ===================================
// HELPER FUNCTIONS
// ===================================

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvFloat(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

// ===================================
// CONFIGURACIÓN EXPORTADA
// ===================================

// Video settings
const VIDEO_FPS = getEnvNumber('VIDEO_FPS', 30);
const VIDEO_DURATION_SECONDS = getEnvNumber('VIDEO_DURATION', 60);

export const config: FullConfig = {
  // API Keys (usar mock en CI/test)
  api: {
    newsDataApiKey: process.env.NEWSDATA_API_KEY || CI_MOCK_VALUE,
    geminiApiKey: process.env.GEMINI_API_KEY || CI_MOCK_VALUE,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || CI_MOCK_VALUE,
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || 'mock-voice-id',
  },

  // Video configuration
  video: {
    width: getEnvNumber('VIDEO_WIDTH', 1080),
    height: getEnvNumber('VIDEO_HEIGHT', 1920),
    fps: VIDEO_FPS,
    durationSeconds: VIDEO_DURATION_SECONDS,
    durationFrames: VIDEO_FPS * VIDEO_DURATION_SECONDS,
  },

  // Content configuration
  content: {
    targetLanguage: process.env.TARGET_LANGUAGE || 'es',
    maxSubtitleWords: getEnvNumber('MAX_SUBTITLE_WORDS', 5),
    maxNewsItems: getEnvNumber('MAX_NEWS_ITEMS', 5),
  },

  // Paths configuration
  paths: {
    outputDir: process.env.OUTPUT_DIR || './output',
    assetsDir: './remotion-app/public/assets',
    audioDir: './remotion-app/public/audio',
    remotionAppDir: './remotion-app',
  },

  // Watermark configuration
  watermark: {
    enabled: getEnvBoolean('WATERMARK_ENABLED', true),
    opacity: getEnvFloat('WATERMARK_OPACITY', 0.3),
    size: getEnvNumber('WATERMARK_SIZE', 80),
    margin: getEnvNumber('WATERMARK_MARGIN', 20),
  },
};

// ===================================
// LEGACY EXPORTS (backward compatibility)
// ===================================

// Mantener compatibilidad con código existente
export const newsDataApiKey = config.api.newsDataApiKey;
export const geminiApiKey = config.api.geminiApiKey;
export const elevenLabsApiKey = config.api.elevenLabsApiKey;
export const elevenLabsVoiceId = config.api.elevenLabsVoiceId;
export const targetLanguage = config.content.targetLanguage;

export default config;
