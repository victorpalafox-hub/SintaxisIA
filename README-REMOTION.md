# Sistema de Video Remotion - Sintaxis IA

Documentación completa del sistema de generación de videos para YouTube Shorts usando Remotion.

## Índice

- [Arquitectura](#arquitectura)
- [Sistema de Temas](#sistema-de-temas)
- [Componentes](#componentes)
- [Sistema de Audio](#sistema-de-audio)
- [Barra de Progreso](#barra-de-progreso)
- [Configuración (Theme)](#configuración-theme)
- [Composiciones](#composiciones)
- [Comandos](#comandos)
- [Estructura de Archivos](#estructura-de-archivos)

---

## Arquitectura

El sistema de video está ubicado en `remotion-app/` y usa Remotion para generar videos programáticamente con React.

### Flujo de Generación

```
data.json (script, audio, metadata)
         ↓
    Video.tsx (composición principal)
         ↓
    [Secuencias temporales]
         ↓
    Remotion CLI (render)
         ↓
    output/video.mp4
```

### Tecnologías

- **Remotion**: Framework de video con React
- **TypeScript**: Tipado estático
- **React**: Componentes declarativos

---

## Sistema de Temas

El proyecto incluye un sistema de temas flexible que permite cambiar el estilo visual en segundos.

### Temas Disponibles

| Tema | Primary | Secondary | Vibe |
|------|---------|-----------|------|
| **Cyberpunk Neón** (activo) | `#00F0FF` (cyan) | `#FF0099` (magenta) | Futurista, tech, viral |
| **Minimalista Profesional** | `#0EA5E9` (azul) | `#8B5CF6` (morado) | Limpio, corporativo |

### Cambiar de Tema (1 minuto)

**Paso 1:** Abrir archivo de temas
```bash
code remotion-app/src/styles/themes.ts
```

**Paso 2:** Cambiar línea del tema activo
```typescript
// De cyberpunk:
export const activeTheme = cyberpunkTheme;

// A minimalista:
export const activeTheme = minimalistTheme;
```

**Paso 3:** Guardar. El video se regenera automáticamente con el nuevo estilo.

### Estilo Actual: Cyberpunk Neón

Características visuales:
- Colores neón vibrantes (cyan + magenta)
- Fondos oscuros con gradientes
- Efectos de glow/neón en texto y bordes
- Partículas flotantes animadas
- Grid de fondo estilo matrix

---

## Componentes

### Estructura de Carpetas

```
remotion-app/src/
├── components/
│   ├── audio/           # Componentes de audio
│   │   └── AudioMixer.tsx
│   ├── backgrounds/     # Fondos animados
│   │   ├── CyberpunkBG.tsx
│   │   └── ParticleField.tsx
│   ├── effects/         # Efectos visuales
│   │   ├── GlitchEffect.tsx
│   │   └── NeonBorder.tsx
│   ├── sequences/       # Secciones del video
│   │   ├── GanchoExplosivo.tsx
│   │   ├── HeadlineImpacto.tsx
│   │   ├── ContenidoPrincipal.tsx
│   │   ├── SeccionImpacto.tsx
│   │   └── OutroBranding.tsx
│   └── ui/              # Elementos de interfaz
│       ├── DataOverlay.tsx
│       ├── FloatingTags.tsx
│       ├── KaraokeSubtitles.tsx
│       ├── ProgressBar.tsx
│       └── Watermark.tsx
├── styles/              # Sistema de temas
│   └── themes.ts        # Cyberpunk + Minimalista
├── types/               # Definiciones TypeScript
│   └── audio.types.ts
├── theme.ts             # Configuración visual base
├── Video.tsx            # Composición principal
└── Root.tsx             # Registro de composiciones
```

### Secuencias Temporales

| Secuencia | Frames | Tiempo | Descripción |
|-----------|--------|--------|-------------|
| Gancho | 0-90 | 0-3s | Texto de impacto inicial |
| Headline | 90-240 | 3-8s | Titular de la noticia |
| Contenido | 240-1500 | 8-50s | Desarrollo con subtítulos |
| Impacto | 1500-1650 | 50-55s | Dato destacado |
| Outro | 1650-1800 | 55-60s | CTA y branding |

---

## Sistema de Audio

### AudioMixer

Componente inteligente que mezcla voz TTS y música de fondo con **ducking automático**.

#### ¿Qué es Ducking?

El ducking es una técnica de audio profesional donde el volumen de la música de fondo se reduce automáticamente cuando hay voz, asegurando que el narrador siempre se escuche claramente.

#### Configuración

```tsx
<AudioMixer
  voice={{
    src: 'audio/narration.mp3',  // Ruta al TTS
    volume: 1.0                   // 100% volumen
  }}
  music={{
    src: 'audio/background.mp3', // Música de fondo
    volume: 0.15,                // 15% volumen base
    ducking: true,               // Reducir cuando hay voz
    fadeIn: 30,                  // Fade in de 1 segundo (30 frames)
    fadeOut: 60                  // Fade out de 2 segundos (60 frames)
  }}
/>
```

#### Volúmenes por Defecto

| Audio | Volumen Base | Con Ducking |
|-------|-------------|-------------|
| Voz TTS | 100% | 100% (no cambia) |
| Música | 15% | 9% (60% del base) |

#### Props

```typescript
interface AudioMixerProps {
  voice: {
    src: string;       // Ruta al archivo de audio
    volume?: number;   // 0-1, default: 1.0
    startFrom?: number; // Frame de inicio, default: 0
  };
  music?: {
    src: string;
    volume?: number;   // 0-1, default: 0.15
    ducking?: boolean; // default: true
    fadeIn?: number;   // frames, default: 30
    fadeOut?: number;  // frames, default: 60
    loop?: boolean;    // default: true
  };
}
```

---

## Barra de Progreso

### ProgressBar

Muestra el progreso del video como una barra horizontal en la parte inferior con efecto neón cyberpunk.

#### Características

- Progreso 0-100% basado en frame actual
- Efecto glow/neón usando colores del theme
- Fade gradual en la parte inferior para mejor integración
- Opción de mostrar porcentaje como texto

#### Uso

```tsx
// Uso básico
<ProgressBar />

// Con configuración personalizada
<ProgressBar
  color="#00f0ff"      // Color cyan
  height={6}           // 6px de alto
  showPercentage={true} // Mostrar "45%"
/>
```

#### Props

```typescript
interface ProgressBarProps {
  color?: string;          // default: theme.colors.primary
  height?: number;         // pixels, default: 4
  showPercentage?: boolean; // default: false
}
```

---

## Configuración (Theme)

El archivo `theme.ts` centraliza toda la configuración visual y de audio.

### Sección de Audio

```typescript
audio: {
  voiceVolume: 1.0,       // Volumen de voz TTS
  musicVolume: 0.15,      // Volumen base de música
  duckingReduction: 0.4,  // Factor de reducción (40%)
  fadeInSeconds: 1,       // Fade in de música
  fadeOutSeconds: 2,      // Fade out de música
}
```

### Sección de ProgressBar

```typescript
progressBar: {
  height: 4,         // Altura en pixels
  margin: 20,        // Margen desde bordes
  trackOpacity: 0.1, // Opacidad del fondo
}
```

### Paleta de Colores

```typescript
colors: {
  primary: '#00f0ff',    // Cyan - color principal
  secondary: '#ff0099',  // Magenta - color secundario
  accent: '#cc00ff',     // Purple - acento
  gold: '#ffd700',       // Dorado - destacados
  darkBg: '#0a0a0f',     // Fondo principal
}
```

---

## Composiciones

### Registradas en Root.tsx

| Composición | Resolución | Duración | Uso |
|-------------|-----------|----------|-----|
| `SintaxisIA` | 1080x1920 | 60s | Producción |
| `SintaxisIA-Preview` | 1080x1920 | 10s | Vista previa rápida |
| `SintaxisIA-LowRes` | 540x960 | 60s | Testing |

---

## Comandos

### Desarrollo

```bash
# Abrir Remotion Studio (vista previa interactiva)
npm run dev

# También disponible como:
npm run preview:video
```

### Renderizado

```bash
# Video full HD (1080x1920, 60s)
npm run render

# Preview de 10 segundos
npm run render:preview

# Baja resolución (testing)
npm run render:lowres

# También disponible como:
npm run render:sample
```

### Testing

```bash
# Tests de diseño de video (Prompt 10)
npm run test:design

# Todos los tests de video
npm run test:video
```

---

## Estructura de Archivos

### Entrada (data.json)

```json
{
  "videoConfig": {
    "themeColor": "#00f0ff",
    "duration": 1800
  },
  "newsItems": [
    {
      "id": "video-001",
      "headline": "Título de la noticia",
      "gancho": "¡Esto cambiará todo!",
      "contenido": ["Párrafo 1", "Párrafo 2"],
      "impacto": "Dato impactante",
      "cta": "Síguenos para más",
      "audioPath": "./public/audio/narration.mp3",
      "subtitles": [
        { "word": "Hola", "startFrame": 0, "endFrame": 15 }
      ]
    }
  ]
}
```

### Salida

```
output/
├── video.mp4           # Video final HD
├── preview.mp4         # Preview corto
└── lowres.mp4          # Baja resolución
```

---

## Especificaciones de Video

| Parámetro | Valor |
|-----------|-------|
| Resolución | 1080x1920 (9:16 vertical) |
| FPS | 30 |
| Duración | 60 segundos |
| Codec Video | H.264 |
| Codec Audio | AAC |
| CRF | 18 (alta calidad) |

---

## Estilo Visual

El proyecto usa un estilo **Cyberpunk Neón** caracterizado por:

- Fondos oscuros con gradientes
- Colores cyan y magenta brillantes
- Efectos de glow/neón en texto y bordes
- Partículas flotantes animadas
- Glitch effects ocasionales
- Grid de fondo estilo matrix

---

## Recursos Adicionales

- [Documentación de Remotion](https://www.remotion.dev/docs)
- [API de Hooks](https://www.remotion.dev/docs/use-current-frame)
- [Renderizado con CLI](https://www.remotion.dev/docs/cli)
