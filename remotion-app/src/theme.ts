// ===================================
// THEME - Configuración centralizada de estilos
// ===================================

/**
 * Sistema de temas para Sintaxis IA
 * Todos los colores, fuentes y tamaños deben referenciarse desde aquí
 */

export const theme = {
  // Paleta de colores (Tech Editorial - Prompt 20)
  colors: {
    // Colores primarios
    primary: '#4A9EFF',      // Azul profesional - color principal
    secondary: '#64748B',    // Slate gray - color secundario
    accent: '#38BDF8',       // Sky blue - acento sutil

    // Colores de estado
    gold: '#ffd700',         // Dorado - impacto/destacado
    red: '#ff3366',          // Rojo - alertas/urgente

    // Fondos
    darkBg: '#0F1419',       // Navy-charcoal profundo
    cardBg: '#1a2332',       // Tarjetas azul-gris
    surfaceBg: '#151d28',    // Superficies oscuras

    // Texto
    text: '#F0F6FC',         // Off-white (menos agresivo)
    textMuted: '#8B949E',    // Gris profesional
    textDark: '#484F58',     // Gris sutil
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

  // Sombras y efectos (Tech Editorial - Prompt 20)
  shadows: {
    text: '0 2px 8px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.3)',
    subtle: (color: string) => `0 2px 12px ${color}20`,
    elevation: (color: string) => `0 4px 24px ${color}15, 0 8px 32px rgba(0,0,0,0.3)`,
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
