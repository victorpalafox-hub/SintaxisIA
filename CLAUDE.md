# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sintaxis IA - Videos Short**: Sistema automatizado de generación de videos para YouTube Shorts usando Gemini API (scripts), ElevenLabs (audio) y Remotion (renderizado).

**User Profile**: QA Manual → QA Automation. Código debe incluir comentarios educativos.

**Test Status**: 507 tests (503 passing, 4 skipped)

**Last Updated**: 2026-02-03 (Prompt 19.2 - Texto Secuencial en Escenas)

## Prerequisites

- Node.js 18+
- FFmpeg (para renderizado de video)
- API keys: Gemini, NewsData.io, ElevenLabs

## Quick Start

```bash
npm run install:all      # Instalar dependencias (root + automation + remotion-app)
npx playwright install   # Instalar browsers de Playwright
npm test                 # Ejecutar tests
```

## Quick Debug

```bash
# Ver test fallido con detalle
npx playwright test tests/specs/[file].spec.ts --debug

# Ejecutar solo un test específico por nombre
npx playwright test -g "debe validar estructura"

# Ver último reporte HTML
npm run test:report

# Verificar setup de Remotion
npm run video:verify

# TypeScript check rápido
npm run check
```

## Essential Commands

| Task | Command |
|------|---------|
| Run all tests | `npm test` |
| Run specific test file | `npx playwright test tests/specs/[file].spec.ts` |
| Filter by name | `npx playwright test -g "pattern"` |
| Interactive UI | `npm run test:ui` |
| Debug mode | `npm run test:debug` |
| View report | `npm run test:report` |
| TypeScript check | `npm run check` |
| Generate content | `npm run generate` |
| Run orchestrator | `npm run automation:run` |
| Dry run (no publish) | `npm run automation:dry` |
| Dry run REAL (video sin publicar) | `npm run automation:dry-real` |
| Force run (ignore schedule) | `npm run automation:force` |
| Production mode | `npm run automation:prod` |
| Preview in Remotion | `npm run dev` |
| Render video | `npm run render` |
| CI validation | `npm run ci:validate` |

**Test suites** (por script npm):
- Smoke: `test` con `00-smoke-paths` (18) + `config-sync` (5) - Validación crítica
- Core: `test:logger` (4) | `test:services` (4)
- Video: `test:video` (19) | `test:content` (23) | `test:design` (29)
- Scoring: `test:scoring` (33) | `test:image-search` (23)
- Optimized: `test:video-optimized` (22) | `test:safeimage` (7) | `test:cleanup` (8)
- Pipeline: `test:orchestrator` (16) | `test:notifications` (12) | `test:notification-fix` (12)
- APIs: `test:gemini` (27) | `test:compliance` (18) | `test:tts` (27)
- Rendering: `test:video-rendering` (27)
- YouTube: `test:youtube` (53) | `test:prompt18` (alias)
- Output: `test:output-manager` (43) | `test:prompt19` (alias)
- Dynamic Images: `test:dynamic-images` (36) | `test:prompt19.1` (alias)
- Sequential Text: `test:sequential-text` (41) | `test:prompt19.2` (alias)
- **Total**: 507 tests (503 passing, 4 skipped)

Ver `README.md` para lista completa de scripts.

## Architecture

### Monorepo (3 packages)

```
/                  → Playwright tests, orchestration
/automation        → Content pipeline (news, Gemini scripts, ElevenLabs audio)
/remotion-app      → Video rendering (React + Remotion)
```

### Test Infrastructure (Service Object Pattern)

```
tests/
├── specs/              → Test files (prompt[N]-*.spec.ts)
├── page-objects/
│   ├── base/           → BaseServiceObject (logging, timing)
│   └── services/       → GeminiServiceObject, VideoServiceObject, ContentValidationServiceObject
├── config/             → service-constants.ts (magic numbers centralizados)
└── utils/              → TestLogger (Winston, sanitización automática)
```

**Imports**:
```typescript
import { GeminiServiceObject, VideoServiceObject, ContentValidationServiceObject } from './page-objects';
import { GEMINI_CONFIG, VIDEO_CONFIG, CONTENT_VALIDATION } from '../config';
```

### Configuration System

`src/config/EnvironmentManager.ts` carga: `.env` → `.env.local` → `.env.[env]` → `.env.[env].local`

### Timeout Configuration (Anti-Hardcode)

`automation/src/config/timeouts.config.ts` centraliza TODOS los timeouts del proyecto:

```typescript
import { TIMEOUTS, getTimeout, isShortTimeout } from './config/timeouts.config';

// Uso directo (se adapta automáticamente a CI/CD)
const timeout = TIMEOUTS.videoRender.value;  // 30s local, 120s CI

// Con override opcional
const customTimeout = getTimeout('videoRender', userOverride);

// Verificar si timeout es "corto" (para tests de error)
if (isShortTimeout(timeout)) { /* manejar error */ }
```

| Timeout | Local | CI/CD | Env Var |
|---------|-------|-------|---------|
| videoRender | 30s | 120s | `VIDEO_RENDER_TIMEOUT_MS` |
| videoValidation | 10s | 30s | `VIDEO_VALIDATION_TIMEOUT_MS` |
| apiCall | 15s | 60s | `API_CALL_TIMEOUT_MS` |
| imageFetch | 5s | 15s | `IMAGE_FETCH_TIMEOUT_MS` |
| tts | 60s | 120s | `TTS_TIMEOUT_MS` |

## Key Patterns

- **Service Objects**: Toda interacción con servicios externos via clases que extienden `BaseServiceObject`
- **TestLogger**: Usar para logging estructurado (nunca `console.log` en tests)
- **Constants**: Magic numbers en `tests/config/service-constants.ts`
- **AAA Pattern**: Arrange, Act, Assert en todos los tests
- **Record<string, unknown>**: Preferir sobre `any` para objetos de contexto
- **Anti-Hardcode Timeouts**: NUNCA usar valores hardcodeados, usar `TIMEOUTS.xxx.value`

## Gotchas Comunes

| Problema | Solución |
|----------|----------|
| Tests timeout en CI | Aumentar timeout en `playwright.config.ts` o agregar `test.slow()` |
| CORS en imágenes (preview) | `SafeImage` usa fallback UI Avatars automáticamente |
| Composición no encontrada | Usar `AINewsShort` (producción) o `AINewsShort-Preview` (dev) |
| FFmpeg no disponible | Instalar FFmpeg y agregar al PATH |
| API rate limit (ElevenLabs) | Usa fallback Edge-TTS automáticamente (10k chars/mes) |
| Tests flaky en calendario | Usar rango 1-7 días, no valores exactos |

## Windows-specific

| Problema | Solución |
|----------|----------|
| Scripts bash no funcionan | Usar Git Bash o WSL |
| FFmpeg no encontrado | `choco install ffmpeg` o agregar manualmente al PATH |
| Playwright browsers fallan | `npx playwright install --with-deps` |
| Paths con espacios | Usar comillas: `cd "Videos short"` |
| Line endings (CRLF vs LF) | Configurar: `git config core.autocrlf true` |

## Pre-commit Checklist

```bash
npm run check          # TypeScript sin errores
npm test              # Tests pasando (507 tests)
npm run security:check # Sin vulnerabilidades críticas
```

## ⚠️ CI/CD Gotchas (CRÍTICOS)

### 1. Variables de Entorno en CI (20 failures fix)
**Error**: `Variable de entorno NEWSDATA_API_KEY no está definida en .env`

**Causa**: `automation/src/config.ts` lanzaba error al importar si no existían las API keys.

**Solución aplicada** (commit `bdcbc29`):
```typescript
// automation/src/config.ts
const isTestOrCI = (): boolean => {
  return process.env.CI === 'true' ||
         process.env.GITHUB_ACTIONS === 'true' ||
         process.env.NODE_ENV === 'test' ||
         process.env.NODE_ENV === 'ci';
};

// Solo validar en producción, no en CI/test
if (!isTestOrCI()) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Variable de entorno ${envVar} no está definida`);
    }
  }
}

// Valores mock para CI (nunca se usan en producción real)
const CI_MOCK_VALUE = 'ci-test-mock-key';
```

**Regla**: NUNCA lanzar errores de env vars al momento de importar módulos. Validar solo cuando realmente se use la API.

### 2. Cross-Package Imports (path resolution)
**Error**: Imports desde `tests/` a `automation/` fallan en CI (Linux vs Windows paths)

**Solución**: Duplicar constantes necesarias en `tests/config/service-constants.ts` en lugar de importar de `automation/`.

**Archivos sincronizados**:
- `automation/src/config/timeouts.config.ts` (FUENTE - producción)
- `tests/config/service-constants.ts` (COPIA - tests)
- Test de sync: `tests/specs/config-sync.spec.ts`

### 3. Timeout Tests Flaky
**Error**: Tests de timeout con valores hardcodeados fallan intermitentemente.

**Solución**: Usar `TIMEOUTS.shortTimeoutThreshold.value` (500ms) y calcular valores relativos:
```typescript
const shortTimeout = Math.floor(TIMEOUTS.shortTimeoutThreshold.value / 5); // 100ms
```

### 4. Archivos .env en CI
**Regla**: NUNCA hacer commit de `.env` real. CI usa:
- Variables de entorno del workflow (`.github/workflows/test.yml`)
- Valores mock en código (`CI_MOCK_VALUE`)
- Detección automática con `isTestOrCI()`

## File Placement

| Tipo | Ubicación |
|------|-----------|
| Tests | `tests/specs/prompt[N]-*.spec.ts` |
| Service Objects | `tests/page-objects/services/` |
| Constants | `tests/config/service-constants.ts` |
| Production services | `src/services/` |
| Automation services | `automation/src/services/` |
| Config files | `automation/src/config/` |

## Common Workflows

### Añadir nuevo test suite
```bash
# 1. Crear archivo de test
touch tests/specs/prompt[N]-nombre.spec.ts

# 2. Estructura básica
import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import { NombreServiceObject } from '../page-objects';

test.describe('Prompt [N] - Nombre Feature', () => {
  const logger = TestLogger.getInstance();

  test('debe validar X', async () => {
    // Arrange, Act, Assert
  });
});

# 3. Agregar script en package.json
"test:nombre": "playwright test tests/specs/prompt[N]-nombre.spec.ts"

# 4. Actualizar conteo en CLAUDE.md
```

### Añadir nuevo Service Object
```bash
# 1. Crear clase en tests/page-objects/services/
# 2. Extender BaseServiceObject
# 3. Exportar desde tests/page-objects/index.ts
```

### Añadir nuevo servicio de producción
```bash
# 1. Crear en automation/src/services/nombre.service.ts
# 2. Crear tipos en automation/src/types/nombre.types.ts
# 3. Crear config en automation/src/config/nombre.config.ts
# 4. Exportar desde automation/src/services/index.ts
```

## Video Specs

- 1080x1920 (9:16), 30 FPS
- **Composición Producción** (`AINewsShort`): 55s, 1 noticia con efectos dinámicos
  - Timing: Hero 8s + Content 37s + Outro 10s
  - Efectos: zoom, blur-to-focus, parallax, glow pulsante
  - 3 imágenes: hero (logo), context (screenshot), outro (hardcoded)
  - ContentScene: Texto secuencial con fade in/out (Prompt 19.2)
- **Composición Preview** (`AINewsShort-Preview`): 10s para desarrollo rápido
- Tema activo: Cyberpunk Neón (`remotion-app/src/styles/themes.ts`)
- AudioMixer: ducking automático (voz 100%, música 15% → 9%)

## Custom Agents

Usar **proactivamente** cuando corresponda:

| Agent | Trigger | Acción |
|-------|---------|--------|
| `qa-automation-lead` | Cambios en `/src`, `/services`, `/config`, `package.json` | Crea/actualiza tests, genera `Tests.md` |
| `clean-code-refactorer` | Código nuevo en `.ts/.tsx` | Elimina dead code, extrae constants, genera `Refactorizacion.md` |
| `security-reviewer` | Cambios en `.env`, `config/`, dependencias | Audita con `npm audit`, genera `Security-Review.md` |
| `devops-pipeline-architect` | Cambios en `.github/workflows/`, scripts CI/CD | Modifica GitHub Actions |
| `documentation-specialist` | Después de tests pasando | Actualiza README.md, CLAUDE.md |

**Flujo**: código → `clean-code-refactorer` → `qa-automation-lead` → `documentation-specialist` → commit

**Invocar**: `Task tool → subagent_type: "[agent-name]"`

### 🔴 Context7 Obligatorio en Agentes

**TODOS los agentes DEBEN usar Context7** antes de realizar cualquier modificación, creación o cambio. Esto garantiza que usen documentación actualizada y mejores prácticas.

**Flujo obligatorio de cada agente:**
```
1. Recibir tarea
2. mcp__context7__resolve-library-id → Obtener ID de librería
3. mcp__context7__query-docs → Consultar documentación actual
4. Implementar siguiendo best practices de docs oficiales
```

**Librerías por agente:**

| Agent | Librerías a Consultar |
|-------|----------------------|
| `qa-automation-lead` | playwright, typescript, node, winston |
| `clean-code-refactorer` | typescript, node, eslint |
| `security-reviewer` | node, googleapis, dotenv |
| `devops-pipeline-architect` | github-actions, remotion, playwright |
| `documentation-specialist` | playwright, remotion, typescript, node |

**Ejemplo de uso Context7:**
```typescript
// Paso 1: Resolver ID de librería
mcp__context7__resolve-library-id({
  libraryName: "playwright",
  query: "test fixtures and page object pattern"
})

// Paso 2: Consultar documentación
mcp__context7__query-docs({
  libraryId: "/microsoft/playwright",
  query: "How to create reusable test fixtures"
})
```

## MCP Servers

Servidores MCP configurados para este proyecto:

| Server | Comando | Descripción |
|--------|---------|-------------|
| `context7` | `npx -y @upstash/context7-mcp@latest` | Documentación actualizada de librerías |

**Uso de context7**: Cuando necesites documentación actualizada de una librería (React, Remotion, Playwright, etc.), usa el MCP context7 para obtener docs frescos en lugar de depender del conocimiento base.

```bash
# Agregar MCP server
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Ver servidores configurados
claude mcp list
```

## CI/CD

GitHub Actions (`.github/workflows/test.yml`):
- Triggers: push/PR a main, develop
- Pipeline: install → TypeScript check → tests → upload artifacts
- Reporters: HTML, JSON, JUnit

## Environment Variables

```env
# APIs (Requeridas)
NEWSDATA_API_KEY=...           # NewsData.io - noticias de IA
GEMINI_API_KEY=...             # Google AI Studio - generación de scripts
ELEVENLABS_API_KEY=...         # ElevenLabs - TTS (10k chars/mes gratis)
ELEVENLABS_VOICE_ID=adam       # Voz por defecto (Josh en código)

# YouTube Data API v3 (Prompt 18)
YOUTUBE_CLIENT_ID=...          # OAuth2 Client ID (Google Cloud Console)
YOUTUBE_CLIENT_SECRET=...      # OAuth2 Client Secret
YOUTUBE_REFRESH_TOKEN=...      # Refresh token (obtener con flujo OAuth)
YOUTUBE_REDIRECT_URI=...       # Callback URL (default: localhost:3000)
YOUTUBE_CATEGORY_ID=28         # 28 = Science & Technology
YOUTUBE_DEFAULT_PRIVACY=private # private | unlisted | public

# Notificaciones (Opcional)
NOTIFICATION_EMAIL=...         # Email destino para notificaciones
RESEND_API_KEY=re_...          # Resend API key (usa onboarding@resend.dev en dev)
TELEGRAM_BOT_TOKEN=...         # Bot token de @BotFather
TELEGRAM_CHAT_ID=...           # Chat ID (obtener con getUpdates)

# Output Manager (Prompt 19) - Todos opcionales con defaults
OUTPUT_BASE_DIR=./output              # Directorio base de outputs
OUTPUT_TIKTOK_DIR=./output/tiktok-manual  # Copia para TikTok
OUTPUT_SLUG_MAX_LENGTH=50             # Longitud máxima del slug
OUTPUT_FILE_NEWS=news.json            # Nombre archivo noticia
OUTPUT_FILE_SCRIPT_JSON=script.json   # Nombre archivo script JSON
OUTPUT_FILE_SCRIPT_TXT=script.txt     # Nombre archivo script legible
OUTPUT_FILE_VIDEO=video-final.mp4     # Nombre archivo video

# Entorno
NODE_ENV=development           # development | staging | production
TEMP_STORAGE_PATH=./automation/temp/videos
```

Configuración completa: Ver `.env.example` | Guía notificaciones: `SETUP-NOTIFICATIONS.md`

## Prompt History

### Prompts 4-10: Fundación (Tests + Infraestructura)
| # | Feature | Tests | Archivos Clave |
|---|---------|-------|----------------|
| 4 | EnvironmentManager + AppConfig | - | `src/config/EnvironmentManager.ts` |
| 5 | TestLogger (Winston) | 4 | `tests/utils/TestLogger.ts` |
| 6 | Service Objects | 4 | `tests/page-objects/services/` |
| 7 | Video Generation Tests | 19 | `tests/specs/prompt7-*.spec.ts` |
| 8 | Content Validation Tests | 23 | `tests/specs/prompt8-*.spec.ts` |
| 9 | CI/CD + npm scripts | - | `.github/workflows/test.yml` |
| 10 | AudioMixer + ProgressBar + Temas | 29 | `remotion-app/src/styles/themes.ts` |

### Prompts 11-14.2.1: Pipeline de Publicación
| # | Feature | Tests | Descripción |
|---|---------|-------|-------------|
| 11 | News Scoring "Carnita" | 33 | Scoring 0-97 pts, umbral 75 |
| 12 | Image Search Multi-Provider | 23 | Clearbit → Logo.dev → Google → Unsplash |
| 13 | Video Optimizado (1 noticia) | 22 | 55s: Hero 8s + Content 37s + Outro 10s |
| 13.1 | SafeImage CORS Fix | 7 | Fallback UI Avatars para preview |
| 13.2 | Cleanup Composiciones | 8 | Eliminadas SintaxisIA* (obsoletas) |
| 14 | Orchestrator + Calendario | 16 | Pipeline 9 pasos, publica cada 2 días |
| 14.1 | Notificaciones Email + Telegram | 12 | Resend API + bot con callbacks |
| 14.2 | Fix Callbacks Telegram | 12 | Aprobación desde Telegram sin dashboard |

### Prompts 15-19: Integración APIs Reales
| # | Feature | Tests | Descripción |
|---|---------|-------|-------------|
| 15 | Gemini Script Generation | 45 | Persona Alex Torres + Compliance 6 marcadores |
| 16 | ElevenLabs TTS | 27 | Voz Josh + cache + fallback Edge-TTS |
| 17-A | Carnita Score Refactor | - | Eliminado Twitter/X, umbral 75 pts, max 97 pts |
| 17 | Video Rendering Service | 27 | Remotion CLI + subtítulos + secciones |
| 18 | YouTube Upload Service | 53 | OAuth2 + upload resumible + quota management |
| 19 | Output Manager + Dry-Run Real | 43 | VideoRenderingService integrado + --dry-real CLI |
| 19.1 | Dynamic Images per Segment | 36 | N segmentos = N imágenes únicas + Pexels API |
| 19.2 | Texto Secuencial en Escenas | 41 | Frases con fade in/out en ContentScene |

### Archivos Clave por Feature

| Feature | Archivos Principales |
|---------|---------------------|
| News Scoring | `automation/src/news-scorer.ts`, `automation/src/config/scoring-rules.ts` |
| Image Search | `automation/src/image-searcher-v2.ts`, `automation/src/image-providers/` |
| Video Optimizado | `remotion-app/src/` (HeroScene, ContentScene, OutroScene) |
| Orchestrator | `automation/src/orchestrator.ts`, `automation/src/cli.ts` |
| Notificaciones | `automation/src/notifiers/` (email, telegram, callbacks) |
| Gemini Scripts | `automation/src/scriptGen.ts`, `automation/src/services/compliance-validator.ts` |
| TTS | `automation/src/services/tts.service.ts`, `automation/src/config/tts.config.ts` |
| Video Rendering | `automation/src/services/video-rendering.service.ts`, `automation/src/config/video.config.ts` |
| YouTube Upload | `automation/src/services/youtube-upload.service.ts`, `automation/src/config/youtube.config.ts` |
| Output Manager | `automation/src/services/output-manager.service.ts`, `automation/src/config/output.config.ts` |
| Dynamic Images | `automation/src/services/scene-segmenter.service.ts`, `automation/src/services/image-orchestration.service.ts`, `automation/src/image-providers/pexels-provider.ts` |
| Sequential Text | `remotion-app/src/utils/text-splitter.ts`, `remotion-app/src/utils/phrase-timing.ts`, `remotion-app/src/styles/themes.ts` (textAnimation) |

### Quick Reference

| Componente | Función Principal | Umbral/Límite |
|------------|-------------------|---------------|
| Carnita Score | `scoreNews()`, `selectPublishableNews()` | 75 pts mínimo, 97 máximo |
| Gemini | `generateScript()` + Alex Torres Persona | 4/6 marcadores compliance |
| ElevenLabs | `generateAudio()` + fallback Edge-TTS | 10k chars/mes |
| YouTube | `uploadVideo()` + OAuth2 | 6 videos/día (quota 10k units) |
| Video | 55s total: Hero 8s + Content 37s + Outro 10s | 1080x1920, 30fps |
| Output Manager | `saveAllOutputs()` + TikTok copy | slug max 50 chars |
| Sequential Text | `splitIntoReadablePhrases()` + `getPhraseTiming()` | 100 chars/frase, fade 15 frames |

## Pipeline de Publicación

### Orchestrator (11 pasos)
1. `check_schedule` - Validar calendario (cada 2 días: Lun/Mié/Vie/Dom 14:00)
2. `collect_news` - Obtener noticias (NewsData.io)
3. `select_top` - Scoring Carnita (umbral 75 pts)
4. `generate_script` - Gemini 2.5 Flash + Alex Torres Persona
5. `search_images` - Multi-provider (hero, context, outro)
6. `generate_audio` - ElevenLabs (fallback Edge-TTS)
7. `render_video` - Remotion CLI + VideoRenderingService (INTEGRADO Prompt 19)
8. `save_outputs` - OutputManager (news, score, script, images, audio, video, TikTok)
9. `send_notifications` - Email (Resend) + Telegram (callbacks)
10. `manual_approval` - Esperar aprobación humana
11. `publish` - YouTubeUploadService (pendiente integración)

### CLI
```bash
npm run automation:run        # Normal (respeta calendario)
npm run automation:dry        # Dry run (simula, sin video real)
npm run automation:dry-real   # Dry run REAL (genera video, no publica)
npm run automation:force      # Forzar (ignora calendario)
npm run automation:prod       # Producción (con notificaciones)
```

### Estructura de Output (Prompt 19)
```
output/
├── YYYY-MM-DD_slug-titulo/   # Carpeta por video
│   ├── news.json             # Noticia original
│   ├── score.json            # Score Carnita
│   ├── script.json           # Script estructurado
│   ├── script.txt            # Script legible (para revisión)
│   ├── images.json           # Imágenes encontradas
│   ├── audio.mp3             # Audio TTS
│   ├── metadata.json         # Metadata completa
│   └── video-final.mp4       # Video renderizado
│
└── tiktok-manual/            # Copia para subir a TikTok
    └── YYYY-MM-DD_slug.mp4
```

### Notificaciones
- **Email**: `onboarding@resend.dev` (dev, sin DNS) | HTML con preview
- **Telegram**: Botones inline (Aprobar/Rechazar/Detalles) | Callbacks en tiempo real
- **Storage**: `automation/temp/videos/{videoId}.json`

## Estado de Implementación

### Funcional (Real API) ✅
| Componente | Tecnología | Prompt |
|------------|------------|--------|
| News Collection | NewsData.io API | Base |
| News Scoring | Carnita Score (0-97 pts, umbral 75) | 11, 17-A |
| Image Search | Multi-provider + caché (7 días) | 12 |
| Script Generation | Gemini 2.5 Flash + Alex Torres Persona | 15 |
| Audio Generation | ElevenLabs + fallback Edge-TTS | 16 |
| Video Rendering | Remotion CLI + subtítulos (INTEGRADO) | 17, **19** |
| YouTube Upload | OAuth2 + upload resumible + quota | 18 |
| **Output Manager** | Guarda outputs + TikTok copy | **19** |
| Publication Calendar | Cada 2 días (Lun/Mié/Vie/Dom 14:00) | 14 |
| Notification System | Email (Resend) + Telegram callbacks | 14.1, 14.2 |

### Pendiente Integración 🔧
- Integrar `youtubeService` en orchestrator (paso 10) - actualmente usa mock

### Pendientes 📅
- **#20 Visual Identity** - Branding humanizado
- **#21 End-to-End Pipeline** - Integración YouTubeService + producción completa
- **#22 OCR + Thumbnails** - Extracción de texto de imágenes

---

*Para historial detallado de prompts anteriores, ver secciones "Prompts Detallados" arriba.*
