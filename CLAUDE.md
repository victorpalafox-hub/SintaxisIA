# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sintaxis IA - Videos Short**: Sistema automatizado de generación de videos para YouTube Shorts usando Gemini API (scripts), ElevenLabs (audio) y Remotion (renderizado).

**User Profile**: QA Manual → QA Automation. Código debe incluir comentarios educativos.

**Test Status**: 1498 tests (1496 passing, 2 skipped)

**Last Updated**: 2026-02-09 (Prompt 41 - Cierre editorial real: voz termina antes de outro, breathing room 1.5s, CTA delay 1.5s)

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

**Test suites**: 1498 tests en 58 suites. Convención: `npm run test:[nombre]` o `npm run test:prompt[N]` (alias). Ver `package.json` para lista completa.

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
| CORS en imágenes (preview) | `SafeImage` usa fallback UI Avatars automáticamente |
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
npm test              # Tests pasando (1498 tests, 2 skipped)
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
  - Timing: Hero 8s (silencioso) + Content max(37s, audioDuration+1s) + Outro 5s, crossfade 1s (Prompt 26)
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

| Componente | Función Principal | Umbral/Límite |
|------------|-------------------|---------------|
| Carnita Score | `scoreNews()`, `selectPublishableNews()` | 75 pts mínimo, 97 máximo |
| Gemini | `generateScript()` + Alex Torres Persona | 4/6 marcadores compliance |
| ElevenLabs | `generateAudio()` + fallback Edge-TTS | 10k chars/mes |
| YouTube | `uploadVideo()` + OAuth2 | 6 videos/día (quota 10k units) |
| Video | Dinámico: Hero 8s + Content max(37s,audio+1s) + Breathing 1s + Outro 5s, cap 60s (YouTube Shorts) | 1080x1920, 30fps |
| Output Manager | `saveAllOutputs()` + TikTok copy | slug max 50 chars |
| Sequential Text | `splitIntoReadablePhrases()` + `getPhraseTiming()` | 60 chars/frase, fade 15 frames |
| Whisper | `whisperService.transcribe()` + `groupIntoPhrases()` | Opcional (OPENAI_API_KEY), ~$0.006/min |
| ContentAnimation | parallax + zoom + per-phrase slide | Full 37s duration, config en themes.ts |
| OutroAnimation | fade-out + Easing + textShadow editorial | 5s, spring + config en themes.ts |
| SceneTransition | crossfade 30 frames entre Sequences | sceneTransition en themes.ts |
| BackgroundDirector | gradient drift + parallax blobs + color pulse + accent glow + grain + light sweep dual | Persistente, configs en themes.ts + premiumBackground |
| EditorialShadow | textDepth, imageElevation, logoBrandTint | Reemplaza glows neón (Prompt 20) |
| Anti-Duplicación | `PublishedNewsTracker` + `selectTopNewsExcluding()` | 3 capas: ID, titulo 80%, empresa+producto 7d |
| SmartQuery | `translateKeywords()`, `generateQueries()` | 170+ ES→EN, max 3 kw/query, 2 alternativas |
| ImageScoring | `searchPexelsWithScoring()`, `scoreCandidate()` | 5 candidatos, gate textRelevance≥8, penalty genérico -20, umbral 35, null si no relevante |
| SafeImage | `SafeImage.tsx`, `hasError`, `return null` | Sin placeholder (Prompt 38-Fix2), error=null, no UI Avatars, fallbackSrc opcional |
| News Manager CLI | `news-manager-cli.ts` (10 comandos: history/active/expired/search/view/unlock/cleanup/clear/stats/help) | Peer de cli.ts, ts-node directo para args |
| NewsEnricher | `enrichAll()`, `detectCompany()`, `detectType()` | 81 aliases, 8 type patterns, PASO 2 real |
| AudioSync | `Sequence(0)`, `phraseTimestamps` pipeline | Voz desde frame 0 (Prompt 37-Fix1), ContentScene offset contentStart/fps, lead 200ms, lag 150ms, max 3 img |
| HeroFlash | `flashMaxOpacity`, `flashDurationFrames` | 0.15 opacity, 10 frames (~0.3s) |
| MusicBed | `musicBed` config + `<Audio>` loop desde frame 0 | hero 22%, content 8%, fadeOut 60 frames |
| ImageEditorial | `imageAnimation` width/height/borderRadius | 920x520, borderRadius 24, crossfade real |
| TopicSegmentation | `findTopicBoundaries()`, `findMarkerPositions()` | 18 marcadores ES, targets 33%/66%, min 8s, score ≥0.3 |
| DynamicDuration | `calculateMetadata` en Root.tsx, `BREATHING_ROOM_FRAMES` | Composition dinámica via props, 1s breathing room antes de outro |
| TitleCard | `TitleCardScene.tsx`, `title-derivation.ts`, `deriveTitleCardText()`, `deriveBadge()` | Overlay 3s (90 frames), fade-out 15f, badge contextual, hero image background, max 7 palabras |
| EditorialText | `text-editorial.ts`, `editorialText` config, `getBlockTiming()` | Bloques 1-2 líneas, headline 72px/support 54px/punch 84px, slide por peso (20/12/30px), easing diferenciado, pause 10f antes + 8f después punch |
| VisualEmphasis | `visual-emphasis.ts`, `visualEmphasis` config, `detectEmphasis()` | Max 3 momentos (1 hard + 2 soft), scale 1.08/1.03, dimming overlay, ramp 10f, min 4 bloques |
| EditorialClosing | `AINewsShort.tsx` Narration→outroStart, `AudioMixer.tsx` fade 45f, `themes.ts` ctaDelay 45f | Voz termina antes de outro, breathing 1.5s, CTA delay 1.5s, voice fade 1.5s |

## Prompt History (Resumen)

| # | Feature | Tests | Archivos Clave |
|---|---------|-------|----------------|
| 4 | EnvironmentManager + AppConfig | - | `src/config/EnvironmentManager.ts` |
| 5 | TestLogger (Winston) | 4 | `tests/utils/TestLogger.ts` |
| 6 | Service Objects | 4 | `tests/page-objects/services/` |
| 7 | Video Generation Tests | 19 | `tests/specs/prompt7-*.spec.ts` |
| 8 | Content Validation Tests | 23 | `tests/specs/prompt8-*.spec.ts` |
| 9 | CI/CD + npm scripts | - | `.github/workflows/test.yml` |
| 10 | AudioMixer + ProgressBar + Temas | 29 | `remotion-app/src/styles/themes.ts` |
| 11 | News Scoring "Carnita" | 33 | `automation/src/news-scorer.ts`, `config/scoring-rules.ts` |
| 12 | Image Search Multi-Provider | 23 | `automation/src/image-searcher-v2.ts`, `image-providers/` |
| 13 | Video Optimizado (1 noticia) | 22 | `remotion-app/src/` (HeroScene, ContentScene, OutroScene) |
| 13.1 | SafeImage CORS Fix | 7 | `remotion-app/src/components/elements/SafeImage.tsx` |
| 13.2 | Cleanup Composiciones | 8 | Eliminadas SintaxisIA* (obsoletas) |
| 14 | Orchestrator + Calendario | 16 | `automation/src/orchestrator.ts`, `cli.ts` |
| 14.1 | Notificaciones Email + Telegram | 12 | `automation/src/notifiers/` |
| 14.2 | Fix Callbacks Telegram | 12 | Aprobación desde Telegram sin dashboard |
| 15 | Gemini Script Generation | 45 | `automation/src/scriptGen.ts`, `services/compliance-validator.ts` |
| 16 | ElevenLabs TTS | 27 | `automation/src/services/tts.service.ts` |
| 17-A | Carnita Score Refactor | - | Eliminado Twitter/X, umbral 75, max 97 |
| 17 | Video Rendering Service | 27 | `automation/src/services/video-rendering.service.ts` |
| 18 | YouTube Upload Service | 53 | `automation/src/services/youtube-upload.service.ts` |
| 19 | Output Manager + Dry-Run Real | 43 | `automation/src/services/output-manager.service.ts` |
| 19.1 | Dynamic Images per Segment | 36 | `scene-segmenter.service.ts`, `image-orchestration.service.ts` |
| 19.2 | Texto Secuencial en Escenas | 41 | `remotion-app/src/utils/text-splitter.ts`, `phrase-timing.ts` |
| 19.3 | Image Preload & Transitions | 26 | `themes.ts` (imageAnimation), `SafeImage.tsx` (delayRender) |
| 19.3.1 | ELEVENLABS Optional Fallback | - | TTS usa Edge-TTS si API key no definida |
| 19.2.6 | No Bullet Points | 21 | Solo texto secuencial en ContentScene |
| 19.2.7 | Large Text | 25 | fontSize 72px, maxCharsPerPhrase 60, contentTextStyle |
| 19.4 | Outro Duration Sync | 16 | Reducido de 10s a 5s |
| 19.3.2 | SafeImage Preload | 17 | delayRender + continueRender |
| 19.1.6 | Specific Queries | 17 | Clearbit/Logo.dev para logos, sin sufijos genéricos |
| 19.5 | Visual Queries | 24 | `extractVisualConcepts()` en scene-segmenter |
| 19.6 | Hero Image Fallback | 10 | Fallback a URL si archivo local no existe |
| 19.7 | Audio Sync (Whisper) | 29 | `whisper.service.ts`, timestamps reales texto-voz |
| 19.8 | Dynamic Animations | 16 | parallax/zoom/glow/slide en ContentScene |
| 19.9 | OutroScene Mejorado | 13 | fade-out, glow cíclico, Easing, textShadow |
| 19.10 | Glow Intenso | 13 | heroAnimation config, multi-layer glow +50% |
| 19.11 | Smooth Transitions | 37 | crossfade 30 frames, sceneTransition config |
| 19.12 | Duration Fix | 12 | Composition 50s = Sequences 50s |
| 20 | Tech Editorial + Background Animado | 45 | `BackgroundDirector.tsx`, `GrainOverlay.tsx`, `LightSweep.tsx`, `themes.ts` |
| 20.1 | Background Revival (fix visibilidad) | 15 | Fix doble alpha, `SubtleGrid.tsx`, micro-zoom, transition boost |
| 21 | Anti-Duplicación de Noticias | 35 | `PublishedNewsTracker`, `selectTopNewsExcluding`, 3-layer dedup |
| 22 | CLI News Manager | 42 | `automation/src/news-manager-cli.ts`, nuevos métodos tracker, TrackerStats |
| 23 | Smart Image Selector | 49 | `smart-query-generator.ts`, `smart-image.config.ts`, scoring en pexels, retry alternativas |
| 24 | NewsData.io Integration | 44 | `newsdata.config.ts`, `news-enricher.service.ts`, PASO 2 real, 81 company aliases |
| 25 | Audio Sync Fix + Hook Visual | 34 | Frame offset, phraseTimestamps pipeline, flash overlay, MAX_IMAGE_SEGMENTS=3 |
| 25.2 | Fix texto fade-out prematuro | - | phraseEndFrame + fadeOutFrames buffer en phrase-timing.ts |
| 25.3 | Sync broadcast-grade | - | sceneStartSecond fix (8→7s crossfade), captionLeadMs/LagMs (200/150ms) |
| 26 | Audio retrasado + Duración dinámica | - | AudioMixer en Sequence(contentStart), duración basada en audioDuration, HeroScene silenciosa |
| 27 | Hero Audio Bed + Visual Hook | 23 | `musicBed` en themes.ts, BackgroundMusic Sequence, sceneZoom en HeroScene, `generate-news-bed.js` |
| 28 | Imágenes Editoriales + Crossfade Real | 25 | imageAnimation width/height, ContentScene 920x520, crossfade dual, newsTitle en queries |
| 29 | Segmentación Topic-Aware | 35 | TRANSITION_MARKERS, `findTopicBoundaries()`, marcadores ES→cortes 33%/66%, fallback uniforme |
| 30 | Duración Dinámica + CTA Fix | 23 | `calculateMetadata` en Root.tsx, `BREATHING_ROOM_FRAMES`, duration +1s breathing |
| 31 | Fondo Premium "con vida" | 25 | Boost configs 2-3x, color pulse hue-rotate, accent glow blob, dual LightSweep, GrainOverlay variable, secciones dinámicas |
| 32 | Title Card / Thumbnail Topic-Aware | 31 | `TitleCardScene.tsx`, `title-derivation.ts`, overlay 0.5s, badge contextual, SafeImage hero background |
| 32.1 | Fix Title Card + Audio + Fondo + Timeout | - | TitleCard 3s fade-out, voice fade-out 30f, gradientes azul-navy, accent blob, timeout 20x |
| 33 | Texto Editorial Humano | 46 | `text-editorial.ts`, `editorialText` config, bloques headline/support/punch, getBlockTiming, agrupación de frases |
| 34 | Sistema de Énfasis Visual | 48 | `visual-emphasis.ts`, `visualEmphasis` config, detectEmphasis, scale/dimming/letterSpacing en momentos de impacto |
| 35 | Fix Imágenes Genéricas | 53 | Gate textRelevance en `scoreCandidate()`, `GENERIC_PENALTY_PATTERNS`, pesos rebalanceados, null fallback (sin UI Avatars), `imageUrl: string \| null` |
| 36 | Polish Editorial Premium | 30 | Colores premium (#F5F7FA/#C9CED6/#0B0D10), accent unificado #4DA3FF, glows=0, sombras sutiles, overlay editorial imágenes, shadow condicional |
| 37 | Fix audioDuration incorrecto | 21 | Whisper override en `video-rendering.service.ts`, fallback 48kbps en `tts.service.ts`, dynamicScenes recalc, cap 60s YouTube Shorts |
| 37-Fix1 | Voz desde frame 0 (anti-silencio) | 6 | Narration from=0, music ducked siempre, sceneStartSecond=contentStart/fps |
| 38-Fix2 | Regla dura imagenes (render) | 22 | SafeImage sin placeholder (hasError+null), ContentScene no reuse imagen previa |
| 39-Fix3 | Jerarquía tipográfica fija | 18 | headline 78→72, support 66→54, punch 84, HeroScene/OutroScene via editorialText |
| 40-Fix4 | Ritmo humano + Fix ElevenLabs | 24 | Slide/easing por peso (punch rápido, support suave), pausas dramáticas 10f/8f, validateElevenLabsKey, logging detallado axios |
| 41 | Cierre editorial real | 21 | Narración termina en outroStart (no durationInFrames), breathing room 30→45f, CTA delay 20→45f, voice fade 30→45f |

## Pendientes

### Pendiente Integración
- Integrar `youtubeService` en orchestrator (paso 11) - actualmente usa mock

### Roadmap
- **#27 End-to-End Pipeline** - Integración YouTubeService en orchestrator + producción completa
- **#28 OCR + Thumbnails** - Extracción de texto de imágenes
