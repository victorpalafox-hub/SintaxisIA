// ===================================
// THEMES - Sistema de temas flexible
// ===================================

/**
 * Sistema de Temas - Sintaxis IA
 *
 * Permite cambiar fácilmente entre estilos visuales.
 * Actualmente activo: Cyberpunk Neón
 *
 * Para cambiar de tema:
 * 1. Cambiar la línea: export const activeTheme = themes.cyberpunk;
 * 2. Guardar archivo
 * 3. El video se regenera automáticamente con nuevo estilo
 */

// ==========================================
// INTERFACE DE TEMA
// ==========================================

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      dark: string;
      darker: string;
      gradient: {
        start: string;
        middle: string;
        end: string;
      };
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    overlay: {
      light: string;
      medium: string;
      strong: string;
    };
  };
  spacing: {
    unit: number;
    padding: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    safe: {
      top: number;
      bottom: number;
      horizontal: number;
    };
  };
}

// ==========================================
// TEMA 1: CYBERPUNK NEÓN (ACTUAL)
// ==========================================

/**
 * Tema Cyberpunk Neón
 *
 * Estilo futurista con colores neón vibrantes.
 * Perfecto para contenido tech, gaming, y viral.
 *
 * Paleta:
 * - Cyan (#00F0FF): Color principal, energético
 * - Magenta (#FF0099): Color secundario, impacto
 * - Verde neón (#00FF88): Acento opcional
 */
export const cyberpunkTheme: Theme = {
  name: 'Cyberpunk Neón',
  colors: {
    primary: '#00F0FF',      // Cyan neón brillante
    secondary: '#FF0099',    // Magenta vibrante
    accent: '#00FF88',       // Verde neón (opcional)
    background: {
      dark: '#0a0a0a',       // Negro profundo
      darker: '#000000',     // Negro puro
      gradient: {
        start: '#0a0a0a',
        middle: '#1a0a1a',   // Tono magenta oscuro
        end: '#0a1a1a',      // Tono cyan oscuro
      },
    },
    text: {
      primary: '#FFFFFF',    // Blanco puro
      secondary: '#00F0FF',  // Cyan (texto secundario)
      muted: '#888888',      // Gris
    },
    overlay: {
      light: '#00F0FF10',    // Cyan 10%
      medium: '#00F0FF20',   // Cyan 20%
      strong: '#00F0FF40',   // Cyan 40%
    },
  },
  spacing: {
    unit: 8,
    padding: { xs: 16, sm: 24, md: 32, lg: 48, xl: 64 },
    safe: { top: 80, bottom: 120, horizontal: 40 },
  },
};

// ==========================================
// TEMA 2: MINIMALISTA PROFESIONAL (BACKUP)
// ==========================================

/**
 * Tema Minimalista Profesional
 *
 * Estilo limpio y profesional con colores suaves.
 * Ideal para contenido corporativo o educativo.
 *
 * Paleta:
 * - Azul (#0EA5E9): Color principal, confianza
 * - Morado (#8B5CF6): Color secundario, creatividad
 * - Verde (#10B981): Acento, éxito
 */
export const minimalistTheme: Theme = {
  name: 'Minimalista Profesional',
  colors: {
    primary: '#0EA5E9',      // Azul profesional
    secondary: '#8B5CF6',    // Morado
    accent: '#10B981',       // Verde
    background: {
      dark: '#0F172A',       // Azul oscuro
      darker: '#020617',     // Casi negro
      gradient: {
        start: '#0F172A',
        middle: '#1E293B',
        end: '#334155',
      },
    },
    text: {
      primary: '#F8FAFC',    // Blanco
      secondary: '#CBD5E1',  // Gris claro
      muted: '#64748B',      // Gris medio
    },
    overlay: {
      light: '#FFFFFF10',
      medium: '#FFFFFF20',
      strong: '#FFFFFF40',
    },
  },
  spacing: {
    unit: 8,
    padding: { xs: 16, sm: 24, md: 32, lg: 48, xl: 64 },
    safe: { top: 80, bottom: 120, horizontal: 40 },
  },
};

// ==========================================
// TEMA ACTIVO (CAMBIAR AQUÍ)
// ==========================================

/**
 * TEMA ACTIVO
 *
 * Para cambiar de tema, modifica esta línea:
 * - Cyberpunk: export const activeTheme = cyberpunkTheme;
 * - Minimalista: export const activeTheme = minimalistTheme;
 */
export const activeTheme = cyberpunkTheme;

// ==========================================
// EXPORTS PARA COMPATIBILIDAD
// ==========================================

// Exports para uso directo en componentes
export const colors = activeTheme.colors;
export const spacing = activeTheme.spacing;

// Layout estándar YouTube Shorts (9:16)
export const layout = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationSeconds: 60,
  safeZone: {
    x: 40,
    y: 80,
    width: 1000,
    height: 1760,
  },
};

// ==========================================
// CONFIGURACIÓN DE TEXTO SECUENCIAL (Prompt 19.2)
// ==========================================

/**
 * Configuración para texto secuencial en ContentScene
 *
 * El texto de la descripción se divide en frases que aparecen
 * secuencialmente con transiciones suaves.
 */
export const textAnimation = {
  /** Frames para fade in de cada frase (0.5s @ 30fps) */
  fadeInFrames: 15,
  /** Frames para fade out de cada frase (0.5s @ 30fps) */
  fadeOutFrames: 15,
  /** Máximo de caracteres por frase (reducido de 100 en Prompt 19.2.7) */
  maxCharsPerPhrase: 60,
  /** Mínimo de palabras para considerar frase completa */
  minWordsPerPhrase: 3,
};

// ==========================================
// CONFIGURACIÓN DE TRANSICIONES DE IMAGEN (Prompt 19.3)
// ==========================================

/**
 * Configuración para transiciones de imagen en escenas
 *
 * Controla cómo las imágenes aparecen y desaparecen.
 * El componente <Img> de Remotion ya incluye preload automático.
 */
export const imageAnimation = {
  /** Frames para fade in de imagen (1s @ 30fps) */
  fadeInFrames: 30,
  /** Frames para fade out de imagen (0.5s @ 30fps) */
  fadeOutFrames: 15,
  /** Frames de overlap en crossfade entre imágenes */
  crossfadeFrames: 20,
};

// ==========================================
// CONFIGURACIÓN DE ANIMACIONES CONTENT (Prompt 19.8)
// ==========================================

/**
 * Configuración de animaciones dinámicas para ContentScene
 *
 * Centraliza magic numbers de parallax, zoom, glow y
 * animaciones por frase para evitar hardcoding.
 *
 * @since Prompt 19.8
 */
export const contentAnimation = {
  /** Keyframes multi-point para parallax orgánico (px) */
  parallaxKeyframes: [0, -15, -8, -20] as readonly number[],
  /** Rango de zoom sutil [inicio, fin] */
  zoomRange: [1.0, 1.05] as readonly [number, number],
  /** Intensidad máxima del glow de texto (px) */
  textGlowMax: 10,
  /** Ciclo del glow de texto (frames, 4s @ 30fps) */
  textGlowCycle: 120,
  /** Intensidad máxima del glow de imagen (px) */
  imageGlowMax: 8,
  /** Ciclo del glow de imagen (frames, 6s @ 30fps) */
  imageGlowCycle: 180,
  /** Distancia de slide-up por frase (px) */
  phraseSlideDistance: 15,
  /** Frames para slide-up de cada frase */
  phraseSlideFrames: 20,
};

// ==========================================
// CONFIGURACIÓN DE ANIMACIONES OUTRO (Prompt 19.9)
// ==========================================

/**
 * Configuración de animaciones para OutroScene
 *
 * Centraliza magic numbers de spring, glow, fade y CTA
 * siguiendo el patrón de contentAnimation (Prompt 19.8).
 *
 * @since Prompt 19.9
 */
export const outroAnimation = {
  /** Damping del spring del logo (menos rebote que hero) */
  springDamping: 80,
  /** Stiffness del spring del logo */
  springStiffness: 150,
  /** Intensidad máxima del glow del logo (px) */
  glowMax: 40,
  /** Ciclo del glow pulsante (frames, 3s @ 30fps) */
  glowCycle: 90,
  /** Frames para fade-out al final de la escena */
  fadeOutFrames: 30,
  /** Frame donde empieza el CTA */
  ctaDelayFrames: 20,
  /** Duración del fade-in del CTA (frames) */
  ctaFadeDuration: 30,
};

// ==========================================
// CONFIGURACIÓN DE TIPOGRAFÍA CONTENT (Prompt 19.2.7)
// ==========================================

/**
 * Configuración de estilos de texto para ContentScene
 *
 * Centraliza la tipografía del texto descriptivo que aparece
 * secuencialmente durante la escena de contenido.
 *
 * Aumentado de 32px a 72px para mejor legibilidad en YouTube Shorts.
 *
 * @since Prompt 19.2.7
 */
export const contentTextStyle = {
  /** Familia tipográfica (consistente con HeroScene) */
  fontFamily: 'Inter, Roboto, Arial, sans-serif',
  /** Peso de fuente (600 = semi-bold para mejor legibilidad) */
  fontWeight: 600,
  /** Tamaño de fuente en pixels (aumentado de 32 a 72) */
  fontSize: 72,
  /** Altura de línea (reducido de 1.6 a 1.4 para texto más compacto) */
  lineHeight: 1.4,
  /** Ancho máximo con imagen */
  maxWidthWithImage: 900,
  /** Ancho máximo sin imagen */
  maxWidthWithoutImage: 1000,
  /** Padding horizontal */
  paddingHorizontal: 60,
  /** Altura mínima del contenedor (calculado para 3 líneas) */
  minHeight: 350,
  /** Margen inferior con imagen */
  marginBottomWithImage: 60,
  /** Margen inferior sin imagen */
  marginBottomWithoutImage: 80,
};

// Colección de todos los temas disponibles
export const themes = {
  cyberpunk: cyberpunkTheme,
  minimalist: minimalistTheme,
};

export default activeTheme;
