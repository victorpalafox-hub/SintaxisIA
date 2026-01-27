// ===================================
// APP CONFIG
// Configuración tipada de la aplicación usando EnvironmentManager
// ===================================

import {
  EnvironmentManager,
  Transformers,
  Validators,
  type Environment,
} from './EnvironmentManager';

// ===================================
// INTERFACES DE CONFIGURACIÓN
// ===================================

export interface ApiConfig {
  newsDataApiKey: string;
  geminiApiKey: string;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  durationFrames: number;
}

export interface ContentConfig {
  targetLanguage: string;
  maxSubtitleWords: number;
  maxNewsItems: number;
}

export interface PathsConfig {
  outputDir: string;
  assetsDir: string;
  audioDir: string;
  remotionAppDir: string;
}

export interface WatermarkConfig {
  enabled: boolean;
  opacity: number;
  size: number;
  margin: number;
}

export interface FullAppConfig {
  environment: Environment;
  api: ApiConfig;
  video: VideoConfig;
  content: ContentConfig;
  paths: PathsConfig;
  watermark: WatermarkConfig;
}

// ===================================
// CLASE APP CONFIG
// ===================================

export class AppConfig {
  private env: EnvironmentManager;
  private _config: FullAppConfig | null = null;

  constructor(env?: EnvironmentManager) {
    this.env = env ?? new EnvironmentManager();
    this.defineVariables();
  }

  private defineVariables(): void {
    this.env.defineMany({
      // API Keys - Requeridas
      NEWSDATA_API_KEY: {
        required: true,
        description: 'API key para NewsData.io',
      },
      GEMINI_API_KEY: {
        required: true,
        description: 'API key para Google Gemini',
      },
      ELEVENLABS_API_KEY: {
        required: true,
        description: 'API key para ElevenLabs TTS',
      },
      ELEVENLABS_VOICE_ID: {
        required: true,
        default: 'adam',
        description: 'ID de la voz de ElevenLabs',
      },

      // Video
      VIDEO_WIDTH: {
        required: false,
        default: 1080,
        transform: Transformers.toInteger,
        validate: Validators.isInRange(100, 4096),
      },
      VIDEO_HEIGHT: {
        required: false,
        default: 1920,
        transform: Transformers.toInteger,
        validate: Validators.isInRange(100, 4096),
      },
      VIDEO_FPS: {
        required: false,
        default: 30,
        transform: Transformers.toInteger,
        validate: Validators.isInRange(1, 120),
      },
      VIDEO_DURATION: {
        required: false,
        default: 60,
        transform: Transformers.toInteger,
        validate: Validators.isInRange(1, 600),
      },

      // Content
      TARGET_LANGUAGE: {
        required: false,
        default: 'es',
        validate: Validators.isOneOf(['es', 'en', 'pt', 'fr', 'de', 'it']),
      },
      MAX_SUBTITLE_WORDS: {
        required: false,
        default: 5,
        transform: Transformers.toInteger,
      },
      MAX_NEWS_ITEMS: {
        required: false,
        default: 5,
        transform: Transformers.toInteger,
      },

      // Paths
      OUTPUT_DIR: {
        required: false,
        default: './output',
      },

      // Watermark
      WATERMARK_ENABLED: {
        required: false,
        default: true,
        transform: Transformers.toBoolean,
      },
      WATERMARK_OPACITY: {
        required: false,
        default: 0.3,
        transform: Transformers.toFloat,
        validate: Validators.isInRange(0, 1),
      },
      WATERMARK_SIZE: {
        required: false,
        default: 80,
        transform: Transformers.toInteger,
      },
      WATERMARK_MARGIN: {
        required: false,
        default: 20,
        transform: Transformers.toInteger,
      },
    });
  }

  /**
   * Valida la configuración y lanza error si hay problemas
   */
  public validate(): this {
    this.env.validateOrThrow();
    return this;
  }

  /**
   * Obtiene la configuración completa de la aplicación
   */
  public getConfig(): FullAppConfig {
    if (this._config) {
      return this._config;
    }

    const fps = this.env.get<number>('VIDEO_FPS');
    const durationSeconds = this.env.get<number>('VIDEO_DURATION');

    this._config = {
      environment: this.env.getEnvironment(),

      api: {
        newsDataApiKey: this.env.getString('NEWSDATA_API_KEY'),
        geminiApiKey: this.env.getString('GEMINI_API_KEY'),
        elevenLabsApiKey: this.env.getString('ELEVENLABS_API_KEY'),
        elevenLabsVoiceId: this.env.getString('ELEVENLABS_VOICE_ID', 'adam'),
      },

      video: {
        width: this.env.get<number>('VIDEO_WIDTH'),
        height: this.env.get<number>('VIDEO_HEIGHT'),
        fps,
        durationSeconds,
        durationFrames: fps * durationSeconds,
      },

      content: {
        targetLanguage: this.env.getString('TARGET_LANGUAGE', 'es'),
        maxSubtitleWords: this.env.get<number>('MAX_SUBTITLE_WORDS'),
        maxNewsItems: this.env.get<number>('MAX_NEWS_ITEMS'),
      },

      paths: {
        outputDir: this.env.getString('OUTPUT_DIR', './output'),
        assetsDir: './remotion-app/public/assets',
        audioDir: './remotion-app/public/audio',
        remotionAppDir: './remotion-app',
      },

      watermark: {
        enabled: this.env.get<boolean>('WATERMARK_ENABLED'),
        opacity: this.env.get<number>('WATERMARK_OPACITY'),
        size: this.env.get<number>('WATERMARK_SIZE'),
        margin: this.env.get<number>('WATERMARK_MARGIN'),
      },
    };

    return this._config;
  }

  /**
   * Obtiene el EnvironmentManager subyacente
   */
  public getEnv(): EnvironmentManager {
    return this.env;
  }

  /**
   * Acceso directo a configuración de API
   */
  public get api(): ApiConfig {
    return this.getConfig().api;
  }

  /**
   * Acceso directo a configuración de video
   */
  public get video(): VideoConfig {
    return this.getConfig().video;
  }

  /**
   * Acceso directo a configuración de contenido
   */
  public get content(): ContentConfig {
    return this.getConfig().content;
  }

  /**
   * Acceso directo a configuración de rutas
   */
  public get paths(): PathsConfig {
    return this.getConfig().paths;
  }

  /**
   * Acceso directo a configuración de watermark
   */
  public get watermark(): WatermarkConfig {
    return this.getConfig().watermark;
  }

  /**
   * Verifica si está en desarrollo
   */
  public isDev(): boolean {
    return this.env.isDevelopment();
  }

  /**
   * Verifica si está en producción
   */
  public isProd(): boolean {
    return this.env.isProduction();
  }
}

// ===================================
// FACTORY FUNCTION
// ===================================

let appConfigInstance: AppConfig | null = null;

/**
 * Crea o obtiene la instancia singleton de AppConfig
 */
export function createAppConfig(basePath?: string): AppConfig {
  if (!appConfigInstance) {
    const env = new EnvironmentManager({
      basePath,
      autoLoad: true,
    });
    appConfigInstance = new AppConfig(env);
  }
  return appConfigInstance;
}

export default AppConfig;
