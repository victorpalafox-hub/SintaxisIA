# Sintaxis IA - Generador de YouTube Shorts

Generador automatizado de videos cortos sobre noticias de Inteligencia Artificial.

## Estructura del Proyecto

```
sintaxis-ia/
├── automation/           # Scripts de automatización
│   ├── src/
│   │   ├── config.ts        # Configuración centralizada
│   │   ├── entityMapping.ts # Mapeo de entidades de IA
│   │   ├── newsAPI.ts       # Fetch de noticias (NewsData.io)
│   │   ├── scriptGen.ts     # Generación de guiones (Gemini)
│   │   ├── audioGen.ts      # Generación de audio (ElevenLabs)
│   │   ├── dataContract.ts  # Estructura de datos para Remotion
│   │   └── index.ts         # Orquestador principal
│   └── utils/
│       ├── logger.ts        # Sistema de logs
│       └── validators.ts    # Validaciones
│
├── remotion-app/         # Aplicación de video
│   ├── src/
│   │   ├── theme.ts         # Sistema de temas centralizado
│   │   ├── components/
│   │   │   ├── backgrounds/ # Fondos animados
│   │   │   ├── effects/     # Efectos visuales
│   │   │   ├── sequences/   # Secuencias del video
│   │   │   └── ui/          # Componentes UI (Watermark, etc.)
│   │   ├── Video.tsx        # Composición principal
│   │   ├── Root.tsx         # Root de Remotion
│   │   └── data.json        # Datos del video
│   └── public/assets/       # Assets estáticos
│
├── output/               # Videos renderizados
├── .env                  # Variables de entorno (no subir)
└── .gitignore
```

## Requisitos

- Node.js 18+
- npm o yarn
- APIs configuradas:
  - NewsData.io
  - Google AI Studio (Gemini)
  - ElevenLabs

## Instalación

```bash
# Instalar dependencias de todos los proyectos
npm run install:all
```

## Uso

### 1. Generar contenido (fetch noticias + guión + audio)

```bash
npm run generate
```

### 2. Previsualizar en Remotion Studio

```bash
npm run dev
```

### 3. Renderizar video final

```bash
npm run render
```

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run fetch` | Obtener noticias y generar datos |
| `npm run generate` | Pipeline completo de generacion |
| `npm run dev` | Abrir Remotion Studio |
| `npm run render` | Renderizar video HD (1080x1920) |
| `npm run render:preview` | Renderizar preview de 10s |
| `npm run render:lowres` | Renderizar en baja resolucion |

---

## Configuracion

### Variables de entorno (.env)

Crear archivo `.env` en la raiz del proyecto:

```env
# ============================
# APIs (Requeridas)
# ============================
NEWSDATA_API_KEY=tu_api_key
GEMINI_API_KEY=tu_api_key
ELEVENLABS_API_KEY=tu_api_key
ELEVENLABS_VOICE_ID=adam

# ============================
# Contenido
# ============================
TARGET_LANGUAGE=es
MAX_SUBTITLE_WORDS=5
MAX_NEWS_ITEMS=5

# ============================
# Video (Opcional - tiene defaults)
# ============================
VIDEO_WIDTH=1080
VIDEO_HEIGHT=1920
VIDEO_FPS=30
VIDEO_DURATION=60

# ============================
# Marca de agua (Opcional)
# ============================
WATERMARK_ENABLED=true
WATERMARK_OPACITY=0.3
WATERMARK_SIZE=80
WATERMARK_MARGIN=20

# ============================
# Paths (Opcional)
# ============================
OUTPUT_DIR=./output
```

### Personalizacion de colores (theme.ts)

Editar `remotion-app/src/theme.ts` para cambiar los colores del tema:

```typescript
export const theme = {
  colors: {
    primary: '#00f0ff',      // Cyan - color principal
    secondary: '#ff0099',    // Magenta - color secundario
    accent: '#cc00ff',       // Purple - acento
    gold: '#ffd700',         // Dorado - impacto
    red: '#ff3366',          // Rojo - alertas
    darkBg: '#0a0a0f',       // Fondo principal
    // ... mas colores
  },
  fonts: {
    main: 'Arial, sans-serif',
    title: 'Arial Black, sans-serif',
    subtitle: 'Roboto Condensed, sans-serif',
  },
  // ... configuracion de animaciones, tamanos, etc.
};
```

### Agregar nuevas entidades (entityMapping.ts)

Para agregar nuevas empresas o productos de IA, editar `automation/src/entityMapping.ts`:

```typescript
export const ENTITY_MAP: Record<string, EntityConfig> = {
  // Agregar nueva entidad
  mistral: {
    domain: 'mistral.ai',
    displayName: 'Mistral AI',
    category: 'ai-company',
    aliases: ['mistral', 'mixtral'],
  },
  // ...
};
```

### Keywords para resaltado

Las palabras clave que se resaltan en los subtitulos se definen en `remotion-app/src/theme.ts`:

```typescript
export const HIGHLIGHT_KEYWORDS = [
  'OpenAI', 'Claude', 'GPT', 'Gemini', 'IA', 'AI',
  // Agregar mas keywords aqui
];
```

---

## Tema de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Cyan Primary | `#00f0ff` | Color principal |
| Magenta Secondary | `#ff0099` | Acentos |
| Purple Accent | `#cc00ff` | Degradados |
| Dark BG | `#0a0a0f` | Fondo |
| Gold Accent | `#ffd700` | Impacto |
| Red Accent | `#ff3366` | Alertas |

## Especificaciones del Video

- **Resolucion:** 1080x1920 (9:16 vertical)
- **FPS:** 30
- **Duracion:** 60 segundos
- **Codec:** H.264
- **Audio:** AAC
- **Marca de agua:** Esquina inferior derecha, 30% opacidad

## Estructura del Video

1. **Gancho (0-3s):** Intro explosiva con logo
2. **Headline (3-8s):** Titulo de la noticia
3. **Contenido (8-50s):** Puntos principales con subtitulos
4. **Impacto (50-55s):** Dato clave
5. **Outro (55-60s):** CTA y branding

---

## Arquitectura

### Configuracion Centralizada

- `automation/src/config.ts` - Configuracion de APIs, video, paths
- `remotion-app/src/theme.ts` - Colores, fuentes, animaciones
- `automation/src/entityMapping.ts` - Entidades de IA reconocidas

### Componentes Reutilizables

Todos los componentes usan el tema centralizado para colores y estilos, permitiendo cambios globales desde un solo archivo.

---

Creado con Remotion + Node.js + TypeScript
