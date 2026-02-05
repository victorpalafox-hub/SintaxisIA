// ===================================
// THEME - Configuración centralizada de estilos
// ===================================

/**
 * Sistema de temas para Sintaxis IA
 * Todos los colores, fuentes y tamaños deben referenciarse desde aquí
 */

export const theme = {
  // Paleta de colores
  colors: {
    // Colores primarios
    primary: '#00f0ff',      // Cyan - color principal
    secondary: '#ff0099',    // Magenta - color secundario
    accent: '#cc00ff',       // Purple - acento

    // Colores de estado
    gold: '#ffd700',         // Dorado - impacto/destacado
    red: '#ff3366',          // Rojo - alertas/urgente

    // Fondos
    darkBg: '#0a0a0f',       // Fondo principal oscuro
    cardBg: '#1a1a2e',       // Fondo de tarjetas
    surfaceBg: '#15151f',    // Fondo de superficies

    // Texto
    text: '#ffffff',         // Texto principal
    textMuted: '#888888',    // Texto secundario
    textDark: '#666666',     // Texto deshabilitado
  },

  // Tipografía
  fonts: {
    main: 'Arial, sans-serif',
    title: 'Arial Black, sans-serif',
    subtitle: 'Roboto Condensed, sans-serif',
  },

  // Tamaños de fuente
  fontSizes: {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 36,
    xl: 48,
    xxl: 56,
    title: 72,
    hero: 96,
  },

  // Tamaños y dimensiones
  sizes: {
    // Logo y marca de agua
    logoWidth: 80,
    logoHeight: 80,
    watermarkOpacity: 0.3,
    watermarkMargin: 20,

    // Bordes y espaciado
    borderRadius: 5,
    borderRadiusLg: 10,
    borderRadiusXl: 20,

    // Padding
    paddingSm: 5,
    paddingMd: 10,
    paddingLg: 20,
    paddingXl: 40,
  },

  // Configuración de animaciones
  animation: {
    springDamping: 100,
    springStiffness: 200,
    glitchInterval: 90,      // frames entre glitches
    transitionDuration: 0.2, // segundos
  },

  // Configuración de video
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationSeconds: 50,
    get durationFrames() {
      return this.durationSeconds * this.fps;
    },
    // Resoluciones alternativas
    lowRes: {
      width: 540,
      height: 960,
    },
    preview: {
      durationSeconds: 10,
      get durationFrames() {
        return this.durationSeconds * 30;
      },
    },
  },

  // Configuración de audio
  audio: {
    /** Volumen de voz TTS (protagonista). 1.0 = 100% */
    voiceVolume: 1.0,
    /** Volumen base de música de fondo. 0.15 = 15% */
    musicVolume: 0.15,
    /** Factor de reducción durante ducking. 0.6 = música al 60% cuando hay voz */
    duckingReduction: 0.6,
    /** Duración del fade in en segundos */
    fadeInSeconds: 1,
    /** Duración del fade out en segundos */
    fadeOutSeconds: 2,
  },

  // Configuración de barra de progreso
  progressBar: {
    /** Altura de la barra en pixels */
    height: 4,
    /** Margen desde los bordes */
    margin: 20,
    /** Opacidad del track (fondo) */
    trackOpacity: 0.1,
  },

  // Sombras y efectos
  shadows: {
    text: '0 2px 10px rgba(0,0,0,0.8)',
    neon: (color: string) => `0 0 20px ${color}, 0 0 40px ${color}`,
    glow: (color: string) => `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`,
  },

  // Gradientes
  gradients: {
    primary: (color1: string, color2: string) =>
      `linear-gradient(90deg, ${color1}, ${color2})`,
    diagonal: (color1: string, color2: string) =>
      `linear-gradient(135deg, ${color1}, ${color2})`,
    vertical: (color1: string, color2: string) =>
      `linear-gradient(180deg, ${color1}, ${color2})`,
    transparent: (color: string) =>
      `linear-gradient(90deg, transparent, ${color}, transparent)`,
  },
};

// Keywords para resaltado especial en subtítulos
export const HIGHLIGHT_KEYWORDS = [
  'OpenAI',
  'Claude',
  'GPT',
  'Gemini',
  'IA',
  'AI',
  'Anthropic',
  'Google',
  'Microsoft',
  'Meta',
  'Llama',
  'ChatGPT',
  'Copilot',
  'Cursor',
  'Midjourney',
  'DALL-E',
  'Sora',
];

// Tipo exportado para usar en componentes
export type Theme = typeof theme;

export default theme;
