// ===================================
// THEMES - Sistema de temas flexible
// ===================================

/**
 * Sistema de Temas - Sintaxis IA
 *
 * Permite cambiar fácilmente entre estilos visuales.
 * Actualmente activo: Tech Editorial (Prompt 20)
 *
 * Para cambiar de tema:
 * 1. Cambiar la línea: export const activeTheme = themes.techEditorial;
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
// TEMA 3: TECH EDITORIAL (Prompt 20)
// ==========================================

/**
 * Tema Tech Editorial
 *
 * Estilo profesional inspirado en medios tech de referencia.
 * Sombras sutiles en lugar de glows neón, paleta fría azul-slate.
 *
 * Paleta:
 * - Azul (#4A9EFF): Color principal, profesional
 * - Slate (#64748B): Color secundario, neutro
 * - Sky (#38BDF8): Acento sutil
 *
 * @since Prompt 20
 */
export const techEditorialTheme: Theme = {
  name: 'Tech Editorial',
  colors: {
    primary: '#4A9EFF',      // Azul profesional
    secondary: '#64748B',    // Slate gray
    accent: '#38BDF8',       // Sky blue sutil
    background: {
      dark: '#0F1419',       // Navy-charcoal profundo
      darker: '#0A0D12',     // Casi negro con undertone azul
      gradient: {
        start: '#0C1220',    // Azul profundo saturado
        middle: '#141E30',   // Azul-navy real
        end: '#0B1628',      // Azul oscuro con saturación
      },
    },
    text: {
      primary: '#F0F6FC',    // Off-white (menos agresivo que #FFF)
      secondary: '#8B949E',  // Gris profesional
      muted: '#484F58',      // Gris sutil
    },
    overlay: {
      light: '#4A9EFF08',    // Azul 8%
      medium: '#4A9EFF15',   // Azul 15%
      strong: '#4A9EFF25',   // Azul 25%
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
 * - Tech Editorial: export const activeTheme = techEditorialTheme;
 * - Cyberpunk: export const activeTheme = cyberpunkTheme;
 * - Minimalista: export const activeTheme = minimalistTheme;
 */
export const activeTheme = techEditorialTheme;

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
  /** Ancho de imagen editorial en px (Prompt 28: era 600) */
  width: 920,
  /** Alto de imagen editorial en px (Prompt 28: era 400) */
  height: 520,
  /** Border radius de imagen editorial (Prompt 28: era 16) */
  borderRadius: 24,
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
  /** Intensidad máxima del glow de texto (px) - aumentado Prompt 19.10 */
  textGlowMax: 15,
  /** Ciclo del glow de texto (frames, 4s @ 30fps) */
  textGlowCycle: 120,
  /** Intensidad máxima del glow de imagen (px) - aumentado Prompt 19.10 */
  imageGlowMax: 12,
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
  /** Intensidad máxima del glow del logo (px) - aumentado Prompt 19.10 */
  glowMax: 60,
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
// CONFIGURACIÓN DE ANIMACIONES HERO (Prompt 19.10)
// ==========================================

/**
 * Configuración de animaciones para HeroScene
 *
 * Centraliza magic numbers de spring, glow y escalado
 * siguiendo el patrón de contentAnimation/outroAnimation.
 *
 * @since Prompt 19.10
 */
export const heroAnimation = {
  /** Damping del spring principal */
  springDamping: 100,
  /** Stiffness del spring principal */
  springStiffness: 200,
  /** Mass del spring */
  springMass: 0.5,
  /** Keyframes del glow [frames] - intensificados Prompt 19.10 */
  glowKeyframes: [30, 60, 90, 120] as readonly number[],
  /** Valores del glow [px] - intensificados Prompt 19.10 */
  glowValues: [0, 30, 15, 22] as readonly number[],
  /** Multiplicador de glow para imagen (boxShadow) */
  imageGlowMultiplier: 2,
  /** Opacidad máxima del flash de impacto inicial (0-1, 0 = desactivado) @since Prompt 25 */
  flashMaxOpacity: 0.15,
  /** Frames de duración del flash de impacto (0.3s @ 30fps) @since Prompt 25 */
  flashDurationFrames: 10,
};

// ==========================================
// CONFIGURACIÓN DE MUSIC BED (Prompt 27)
// ==========================================

/**
 * Configuración para audio bed de fondo
 *
 * Loop corto de música ambient que arranca en frame 0
 * para eliminar el silencio de HeroScene (0-8s).
 * Volumen alto durante Hero, ducked durante Content/Outro.
 *
 * @since Prompt 27
 */
export const musicBed = {
  /** Volumen durante HeroScene (sin competencia de voz) */
  heroVolume: 0.22,
  /** Volumen durante Content/Outro (ducked por voz) */
  contentVolume: 0.08,
  /** Frames de fade-out al final del video (2s @ 30fps) */
  fadeOutFrames: 60,
  /** Ruta por defecto del archivo de audio bed */
  defaultSrc: 'audio/news-bed.wav',
};

// ==========================================
// CONFIGURACIÓN DE TRANSICIONES ENTRE ESCENAS (Prompt 19.11)
// ==========================================

/**
 * Configuración de crossfade entre escenas (Hero -> Content -> Outro)
 *
 * Las Sequences de Remotion se solapan por crossfadeFrames,
 * creando una transición suave donde una escena se desvanece
 * mientras la siguiente aparece gradualmente.
 *
 * @since Prompt 19.11
 */
export const sceneTransition = {
  /** Frames de overlap entre escenas adyacentes (1s @ 30fps) */
  crossfadeFrames: 30,
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

// ==========================================
// CONFIGURACIÓN DE TEXTO EDITORIAL (Prompt 33)
// ==========================================

/**
 * Jerarquía tipográfica para bloques editoriales
 *
 * Tres pesos visuales que crean ritmo humano:
 * - headline: apertura, nombres propios, versiones (grande, bold, blanco)
 * - support: explicación, contexto (mediano, medium, off-white)
 * - punch: impacto, preguntas, remates (el más grande, extra-bold, accent)
 *
 * @since Prompt 33
 */
export const editorialText = {
  /** Apertura y frases con peso informativo */
  headline: {
    fontSize: 78,
    fontWeight: 700 as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  /** Contexto y explicación */
  support: {
    fontSize: 66,
    fontWeight: 500 as const,
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0,
  },
  /** Impacto, preguntas retóricas, remates */
  punch: {
    fontSize: 84,
    fontWeight: 800 as const,
    color: '#38BDF8',
    letterSpacing: -1,
  },
  /** Frames de pausa visual antes de un bloque punch (0.2s @ 30fps) */
  pauseFramesBeforePunch: 6,
  /** Frames de gap mínimo entre bloques */
  blockGap: 8,
  /** Distancia de slide-up en px */
  slideDistance: 20,
  /** Duración del slide-up en frames */
  slideFrames: 18,
};

// ==========================================
// CONFIGURACIÓN DE ÉNFASIS VISUAL (Prompt 34)
// ==========================================

/**
 * Efectos de énfasis visual para momentos de impacto
 *
 * Se aplica a bloques editoriales detectados como momentos memorables.
 * HARD: punch blocks con escala grande y dimming de fondo.
 * SOFT: headlines/setup con escala sutil.
 * NONE: comportamiento actual sin cambios (Prompt 33).
 *
 * @since Prompt 34
 */
export const visualEmphasis = {
  /** Énfasis fuerte: punch blocks de impacto */
  hard: {
    /** Escala del texto (1.08 = 8% más grande) */
    scale: 1.08,
    /** Opacidad del overlay oscuro sobre el fondo (0.35 = 65% brillo) */
    bgDimOpacity: 0.35,
    /** Letter spacing override (más compacto = más impactante) */
    letterSpacing: -1.5,
    /** Frames de ramp-up para entrar en énfasis */
    rampFrames: 10,
  },
  /** Énfasis suave: headlines y setup blocks */
  soft: {
    /** Escala del texto (1.03 = 3% más grande) */
    scale: 1.03,
    /** Opacidad del overlay oscuro */
    bgDimOpacity: 0.15,
    /** Sin override de letterSpacing (usa el del peso editorial) */
    letterSpacing: null as number | null,
    /** Frames de ramp-up */
    rampFrames: 8,
  },
  /** Z-index del overlay de dimming (entre background y texto) */
  dimZIndex: 1,
};

// ==========================================
// CONFIGURACIÓN DE FONDO ANIMADO (Prompt 20)
// ==========================================

/**
 * Configuración para BackgroundDirector
 *
 * Controla los parámetros del fondo animado persistente:
 * gradiente con drift, blobs parallax, grain y vignette.
 *
 * @since Prompt 20
 */
export const backgroundAnimation = {
  /** Rango de drift del ángulo del gradiente (grados) - Prompt 31: +80% rotación */
  gradientAngleDrift: [0, 45] as readonly [number, number],
  /** Velocidad de movimiento del blob primario - Prompt 31: 2x */
  parallaxSpeed: 0.012,
  /** Velocidad de movimiento del blob secundario - Prompt 31: 2x */
  parallaxSpeedSecondary: 0.008,
  /** Rango de opacidad del grain [mínima, máxima] - Prompt 31: +50% */
  grainOpacity: [0.06, 0.10] as readonly [number, number],
  /** Fuerza del efecto vignette (0-1) - Prompt 32.1: reducido para más brillo */
  vignetteStrength: 0.35,
  /** % desde centro donde empieza el vignette - Prompt 32.1: centro más claro */
  vignetteTransparentStop: 70,
  /** Opacidad del blob primario - Prompt 32.1: +33% (era 0.30) */
  blobPrimaryOpacity: 0.40,
  /** Opacidad del blob secundario - Prompt 32.1: +36% (era 0.22) */
  blobSecondaryOpacity: 0.30,
  /** Radio de blur de los blobs (px) - Prompt 32.1: menos difuso = más visible */
  blobBlur: 65,
  /** Amplitud de drift de blobs en % - Prompt 31: +20% rango */
  blobDriftAmplitude: { x: 30, y: 22 },
  /** Multiplicador de parallax por sección - Prompt 31: hero +20%, outro +40% */
  sectionMultiplier: {
    hero: 1.8,
    content: 1.0,
    outro: 0.7,
  },
  /** Micro-zoom senoidal del wrapper completo - Prompt 31: +67% breathing, ciclo 8s */
  microZoom: {
    min: 1.0,
    max: 1.05,
    /** Duración de un ciclo completo en frames (8s @ 30fps) */
    cycleDuration: 240,
  },
  /** Boost de opacidad en transición a outro - Prompt 31: +25%, más suave */
  transitionBoost: {
    amount: 0.25,
    durationFrames: 20,
  },
};

// ==========================================
// CONFIGURACIÓN DE LIGHT SWEEP (Prompt 20)
// ==========================================

/**
 * Configuración para micro-eventos de barrido de luz
 *
 * Barrido diagonal sutil que aparece periódicamente
 * para agregar dinamismo al fondo sin distraer.
 *
 * @since Prompt 20
 */
export const lightSweep = {
  /** Frames entre cada barrido (~5s @ 30fps) - Prompt 31: era 240 */
  intervalFrames: 150,
  /** Duración del barrido en frames (~1.8s) - Prompt 31: +29% */
  durationFrames: 54,
  /** Opacidad máxima del barrido - Prompt 31: +50% (era 0.12) */
  maxOpacity: 0.18,
  /** Ángulo del barrido (grados) */
  angle: 75,
  /** Fuente de color: 'accent' usa tema, 'white' usa blanco */
  colorSource: 'accent' as const,
  /** Mix blend mode para mezcla aditiva */
  blendMode: 'screen' as const,
};

// ==========================================
// CONFIGURACIÓN DE SUBTLE GRID (Prompt 20.1)
// ==========================================

/**
 * Grid sutil de fondo - Detalle editorial
 *
 * Cuadrícula fina de líneas con drift lento que agrega
 * textura y sensación de profundidad tipo tech HUD.
 * Usa repeating-linear-gradient (performance óptima).
 *
 * @since Prompt 20.1
 */
export const subtleGrid = {
  /** Opacidad base del grid - Prompt 31: +67% (era 0.06) */
  opacity: 0.10,
  /** Tamaño de celda en px */
  cellSize: 40,
  /** Ancho de línea en px */
  lineWidth: 1,
  /** Velocidad de drift por frame (senoidal) - Prompt 31: +67% */
  driftSpeed: 0.005,
  /** Amplitud total del drift en px - Prompt 31: +25% */
  driftAmplitude: 50,
  /** Mix blend mode */
  blendMode: 'overlay' as const,
};

// ==========================================
// CONFIGURACIÓN DE EFECTOS PREMIUM (Prompt 31)
// ==========================================

/**
 * Efectos premium para BackgroundDirector
 *
 * Color pulse (hue-rotate en blobs) y accent glow spot (tercer blob)
 * que agregan vida y profundidad al fondo.
 *
 * @since Prompt 31
 */
export const premiumBackground = {
  /** Intensidad del color pulse (grados de hue-rotate) */
  colorPulseRange: 10,
  /** Velocidad del color pulse (rad/frame) */
  colorPulseSpeed: 0.008,
  /** Opacidad del accent glow spot - Prompt 32.1: +67% */
  accentGlowOpacity: 0.25,
  /** Blur del accent glow spot (px) */
  accentGlowBlur: 60,
  /** Tamaño del accent glow spot (% del viewport) - Prompt 32.1: +20% */
  accentGlowSize: 30,
  /** Radio de órbita del accent glow (% del viewport) */
  accentGlowOrbit: { x: 20, y: 15 },
};

// ==========================================
// CONFIGURACIÓN DE TITLE CARD (Prompt 32)
// ==========================================

/**
 * Configuración para title card overlay (3s = 90 frames)
 *
 * Overlay que aparece encima de HeroScene durante los primeros 3s.
 * Visible desde frame 0 (thumbnail-ready), fade-out suave al final.
 *
 * @since Prompt 32
 * @updated Prompt 32.1 - 3s duración, visible desde frame 0, fade-out
 */
export const titleCard = {
  /** Duración total del title card (3s @ 30fps) */
  durationFrames: 90,
  /** Frames para fade out al final (~0.5s) */
  fadeOutFrames: 15,
  /** Opacidad de la imagen de fondo (hero image) */
  backgroundImageOpacity: 0.35,
  /** Colores del gradient overlay (asegura legibilidad del texto) */
  gradientOverlay: {
    start: 'rgba(10, 13, 18, 0.70)',
    end: 'rgba(10, 13, 18, 0.92)',
  },
  /** Estilos del título principal */
  title: {
    fontSize: 96,
    fontWeight: 900,
    lineHeight: 1.15,
    maxWidth: 980,
  },
  /** Estilos del badge/kicker */
  badge: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: '0.15em',
    paddingV: 12,
    paddingH: 24,
    borderRadius: 8,
  },
  /** Estilos del branding pequeño */
  branding: {
    fontSize: 24,
    fontWeight: 600,
  },
  /** Zoom micro sutil (1.00 → 1.03 en 90 frames) */
  zoomRange: [1.00, 1.03] as readonly [number, number],
};

// ==========================================
// CONFIGURACIÓN DE SOMBRAS EDITORIALES (Prompt 20)
// ==========================================

/**
 * Sombras editoriales - Reemplazo de glows neón
 *
 * Sistema de sombras sutiles y profesionales que reemplaza
 * los multi-layer glow del tema Cyberpunk.
 *
 * @since Prompt 20
 */
export const editorialShadow = {
  /** Sombra de profundidad para texto principal */
  textDepth: '0 2px 8px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.3)',
  /** Sombra de elevación para imágenes */
  imageElevation: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
  /** Sombra con tinte de marca para logo/branding */
  logoBrandTint: (color: string) => `0 4px 24px ${color}25, 0 8px 32px rgba(0,0,0,0.3)`,
  /** Sombra para barra de progreso */
  progressBar: (color: string) => `0 0 8px ${color}40`,
};

// Colección de todos los temas disponibles
export const themes = {
  techEditorial: techEditorialTheme,
  cyberpunk: cyberpunkTheme,
  minimalist: minimalistTheme,
};

export default activeTheme;
