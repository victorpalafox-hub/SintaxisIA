# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sintaxis IA - Videos Short**: Sistema automatizado de generación de videos para YouTube Shorts usando Gemini API (scripts), ElevenLabs (audio) y Remotion (renderizado).

**User Profile**: QA Manual → QA Automation. Código debe incluir comentarios educativos.

**Test Status**: 1818 tests (1816 passing, 2 skipped)

**Last Updated**: 2026-02-19 (Prompt 53 - Smart Image Query: tech context obligatorio, sanitización banned terms, anti-dilución scoring)

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
| News Manager | `npm run news:history / news:stats / news:help` |

**Test suites**: 1818 tests en 69 suites. Convención: `npm run test:[nombre]` o `npm run test:prompt[N]` (alias). Ver `package.json` para lista completa.

**Playwright config**: 4 workers local / 1 en CI, timeout 2min por test, retries solo en CI (2), reporters: HTML + JSON + JUnit.

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
- **Test naming**: `tests/specs/prompt[N]-nombre.spec.ts` + script `"test:nombre"` en `package.json`

## Gotchas Comunes

| Problema | Solución |
|----------|----------|
| Tests timeout en CI | Aumentar timeout en `playwright.config.ts` o agregar `test.slow()` |
| CORS en imágenes (preview) | `SafeImage` retorna `null` en error (sin placeholder, Prompt 38-Fix2) |
| Composición no encontrada | Usar `AINewsShort` (producción) o `AINewsShort-Preview` (dev) |
| FFmpeg no disponible | Instalar FFmpeg y agregar al PATH |
| API rate limit (ElevenLabs) | Usa fallback Edge-TTS automáticamente (10k chars/mes) |
| Desarrollo sin créditos TTS | Comentar ELEVENLABS_API_KEY → usa Edge-TTS gratis |
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
npm test              # Tests pasando (1818 tests, 2 skipped)
npm run security:check # Sin vulnerabilidades críticas
```

## CI/CD Gotchas (CRITICOS)

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
- **Composición Producción** (`AINewsShort`): Duración dinámica, 1 noticia con efectos dinámicos
  - Timing: Hero 8s (silencioso) + Content max(37s, audioDuration+1s) + Breathing 1.5s + Outro 5s, crossfade 1s, cap 59.2s (Prompts 26/46)
  - Audio retrasado: narración empieza con ContentScene, no durante HeroScene
  - Efectos: zoom, blur-to-focus, parallax, sombras editoriales
  - BackgroundDirector: fondo animado persistente (gradient drift + parallax blobs + grain + light sweep + vignette)
  - 3 imágenes: hero (logo), context (screenshot), outro (hardcoded)
  - ContentScene: Texto secuencial con fade in/out (Prompt 19.2)
- **Composición Preview** (`AINewsShort-Preview`): 10s para desarrollo rápido
- Tema activo: Tech Editorial (`remotion-app/src/styles/themes.ts`) - Prompt 20
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

### Context7 Obligatorio en Agentes

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

| Server | Comando | Descripción |
|--------|---------|-------------|
| `context7` | `npx -y @upstash/context7-mcp@latest` | Documentación actualizada de librerías |

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
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

# TTS (Opcional - Prompt 19.3.1)
# Si no están definidas, usa Edge-TTS gratis como fallback
ELEVENLABS_API_KEY=...         # ElevenLabs - voz profesional Josh
ELEVENLABS_VOICE_ID=adam       # Voz por defecto

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

## Pipeline de Publicación

### Orchestrator (11 pasos)
1. `check_schedule` - Validar calendario (cada 2 días: Lun/Mié/Vie/Dom 14:00)
2. `collect_news` - Obtener noticias reales (NewsData.io + NewsEnricher, mock en dry-run)
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

### Estructura de Output
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

## Quick Reference

### Pipeline Services

| Componente | Función Principal | Umbral/Límite |
|------------|-------------------|---------------|
| Carnita Score | `scoreNews()`, `selectPublishableNews()` | 75 pts mínimo, 97 máximo |
| Gemini | `generateScript()` + Alex Torres Persona | 4/6 marcadores compliance |
| ElevenLabs | `generateAudio()` + fallback Edge-TTS | 10k chars/mes |
| YouTube | `uploadVideo()` + OAuth2 | 6 videos/día (quota 10k units) |
| Output Manager | `saveAllOutputs()` + TikTok copy | slug max 50 chars |
| Anti-Duplicación | `PublishedNewsTracker` + `selectTopNewsExcluding()` | 3 capas: ID, titulo 80%, empresa+producto 7d |
| NewsEnricher | `enrichAll()`, `detectCompany()`, `detectType()` | 81 aliases, 8 type patterns |
| SmartQuery | `translateKeywords()`, `sanitizeQuery()`, `enrichWithTechContext()` | 170+ ES→EN, BANNED_QUERY_TERMS 26 terms |
| ImageScoring | `scoreCandidate()` gate textRelevance≥8 | umbral 35 (primera 45), null si no relevante |

### Video Rendering

| Componente | Función Principal | Umbral/Límite |
|------------|-------------------|---------------|
| Video | Hero 8s + Content max(37s,audio+1s) + Breathing 1.5s + Outro 5s | 1080x1920, 30fps, cap 59.2s |
| SafeDuration | SAFE_MAX_FRAMES 1776, SAFE_END_BUFFER 20f | compressionRatio si audio excede |
| SafeImage | `hasError` → `return null` | Sin placeholder, no UI Avatars |
| AudioSync | Voz desde frame 0, phraseTimestamps pipeline | lead 200ms, lag 150ms, max 3 img |
| TextExclusivity | Max 1 texto por frame | TitleCard→Hero crossfade sin overlap |
| EditorialText | headline 72px/support 54px/punch 84px | Bloques 1-2 líneas, pause dramática |

**Todos los detalles visuales** (microDynamics, narrativeRhythm, cinematicGrade, heroImpact, musicBed, backgroundDirector, etc.) están centralizados en `remotion-app/src/styles/themes.ts`. Consultar ese archivo para valores específicos.

## Prompt History (por categoría)

Total: 53 prompts. Convención: `tests/specs/prompt[N]-*.spec.ts` + `npm run test:prompt[N]`.

### Infraestructura (4-9)
Config, tests, CI/CD: `EnvironmentManager.ts`, `TestLogger.ts`, Service Objects, `.github/workflows/test.yml`

### Pipeline de Contenido (11-12, 14-19, 21-24)
| Grupo | Archivos Clave |
|-------|----------------|
| Scoring + Noticias | `news-scorer.ts`, `scoring-rules.ts`, `news-enricher.service.ts`, `newsdata.config.ts`, `PublishedNewsTracker` |
| Imágenes | `image-searcher-v2.ts`, `image-providers/`, `smart-query-generator.ts`, `smart-image.config.ts`, `image-orchestration.service.ts` |
| Script + Audio | `scriptGen.ts`, `compliance-validator.ts`, `tts.service.ts` (ElevenLabs + Edge-TTS fallback) |
| Orchestrator | `orchestrator.ts`, `cli.ts`, `news-manager-cli.ts`, `notifiers/` |
| Output + Upload | `output-manager.service.ts`, `video-rendering.service.ts`, `youtube-upload.service.ts` |

### Video / Remotion (10, 13, 19.x, 20, 25-35)
| Grupo | Archivos Clave |
|-------|----------------|
| Escenas | `HeroScene.tsx`, `ContentScene.tsx`, `OutroScene.tsx`, `TitleCardScene.tsx`, `AINewsShort.tsx` |
| Texto + Audio Sync | `text-splitter.ts`, `phrase-timing.ts`, `text-editorial.ts`, `visual-emphasis.ts`, `whisper.service.ts` |
| Fondo + Efectos | `BackgroundDirector.tsx`, `GrainOverlay.tsx`, `LightSweep.tsx`, `SubtleGrid.tsx` |
| Imágenes dinámicas | `scene-segmenter.service.ts`, `SafeImage.tsx`, `title-derivation.ts` |
| Segmentación | `findTopicBoundaries()` (18 marcadores ES), `narrative-rhythm.ts` |
| Config central | `themes.ts` (tema, colores, animaciones, timing, microDynamics, narrativeRhythm, cinematicGrade) |

### Polish + Fixes (36-53)
Ajustes visuales, tipográficos, de timing y duración. Archivos principales:
- `themes.ts` (colores premium #4CC2F1, cinematicGrade, microDynamics, heroImpact, musicBed)
- `AINewsShort.tsx` (SAFE_MAX_FRAMES 1776, FinalFadeOut, compressionRatio, filter global)
- `HeroScene.tsx` (titleDelayedIn, breathingScale, energySwell)
- `ContentScene.tsx` (micro-dinámicas moduladas por intensidad, text exclusivity)
- `smart-query-generator.ts` (sanitizeQuery, enrichWithTechContext, BANNED_QUERY_TERMS)

## Pendientes

### Pendiente Integración
- Integrar `youtubeService` en orchestrator (paso 11) - actualmente usa mock

### Roadmap
- **#27 End-to-End Pipeline** - Integración YouTubeService en orchestrator + producción completa
- **#28 OCR + Thumbnails** - Extracción de texto de imágenes
