# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sintaxis IA - Videos Short**: Sistema automatizado de generación de videos para YouTube Shorts usando Gemini API (scripts), ElevenLabs (audio) y Remotion (renderizado).

**User Profile**: QA Manual → QA Automation. Código debe incluir comentarios educativos.

**Test Status**: 198 tests passing (ver `npm test`)

**Last Updated**: 2026-01-29 (Prompts 14, 14.1, 14.2, 14.2.1)

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
| Force run (ignore schedule) | `npm run automation:force` |
| Production mode | `npm run automation:prod` |
| Preview in Remotion | `npm run dev` |
| Render video | `npm run render` |
| CI validation | `npm run ci:validate` |

**Test suites**:
- `test:logger` (3), `test:services` (5), `test:video` (19), `test:content` (23), `test:design` (29)
- `test:scoring` (19), `test:image-search` (23), `test:video-optimized` (22)
- `test:safeimage` (7), `test:cleanup` (8)
- `test:orchestrator` (16), `test:notifications` (12), `test:notification-fix` (12)
- **Total**: 198 tests

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

## Key Patterns

- **Service Objects**: Toda interacción con servicios externos via clases que extienden `BaseServiceObject`
- **TestLogger**: Usar para logging estructurado (nunca `console.log` en tests)
- **Constants**: Magic numbers en `tests/config/service-constants.ts`
- **AAA Pattern**: Arrange, Act, Assert en todos los tests
- **Record<string, unknown>**: Preferir sobre `any` para objetos de contexto

## File Placement

| Tipo | Ubicación |
|------|-----------|
| Tests | `tests/specs/prompt[N]-*.spec.ts` |
| Service Objects | `tests/page-objects/services/` |
| Constants | `tests/config/service-constants.ts` |
| Production services | `src/services/` |

## Video Specs

- 1080x1920 (9:16), 30 FPS
- **Composición Producción** (`AINewsShort`): 55s, 1 noticia con efectos dinámicos
  - Timing: Hero 8s + Content 37s + Outro 10s
  - Efectos: zoom, blur-to-focus, parallax, glow pulsante
  - 3 imágenes: hero (logo), context (screenshot), outro (hardcoded)
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

## CI/CD

GitHub Actions (`.github/workflows/test.yml`):
- Triggers: push/PR a main, develop
- Pipeline: install → TypeScript check → tests → upload artifacts
- Reporters: HTML, JSON, JUnit

## Environment Variables

```env
# APIs
GEMINI_API_KEY=...
NEWSDATA_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=adam

# Notificaciones (opcional)
NOTIFICATION_EMAIL=your_email@gmail.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF
TELEGRAM_CHAT_ID=123456789
DASHBOARD_URL=http://localhost:3000
DASHBOARD_SECRET=your_secret_key

# Entorno
NODE_ENV=development
TEMP_STORAGE_PATH=./automation/temp/videos
```

Ver `.env.example` y `SETUP-NOTIFICATIONS.md` para configuración completa.

## Prompt History

| # | Feature | Tests |
|---|---------|-------|
| 4 | EnvironmentManager + AppConfig | - |
| 5 | TestLogger (Winston) | 3 |
| 6 | Service Objects | 5 |
| 7 | Video Generation Tests | 19 |
| 8 | Content Validation Tests | 23 |
| 9 | CI/CD, npm scripts, reporters | - |
| 10 | AudioMixer, ProgressBar, Temas | 27 |
| 10.1 | Hashtags removidos de video (solo en título YouTube) | 2 |
| 11 | News Scoring System (rankeo por importancia) | 19 |
| 12 | Image Search System (multi-provider con fallback) | 23 |
| 13 | Video Optimizado (1 noticia, efectos dinámicos) | 22 |
| 13.1 | SafeImage (fix CORS en preview) | 7 |
| 13.2 | Limpieza de composiciones obsoletas | 8 |
| 14 | Orchestrator + Calendario de Publicación | 16 |
| 14.1 | Sistema de Notificaciones (Email + Telegram) | 12 |
| 14.2 | Fix Notificaciones (callbacks + dominio Resend) | 12 |

**Prompt 11 - News Scoring (2026-01-29):**
- Sistema de puntuación para rankear noticias (0-37 pts)
- Criterios: Empresa (0-10), Tipo (0-9), Engagement (0-8), Frescura (-5 a +3), Impacto (0-7)
- Archivos: `automation/src/news-scorer.ts`, `automation/src/config/scoring-rules.ts`, `automation/src/types/{scoring,news}.types.ts`
- Funciones: `scoreNews()`, `rankNews()`, `selectTopNews()`

**Prompt 12 - Image Search (2026-01-29):**
- Sistema de búsqueda de imágenes con múltiples proveedores y fallback robusto
- Estrategia 3 imágenes: HERO (logo empresa), CONTEXT (screenshot/demo), OUTRO (logo Sintaxis IA)
- Providers: Clearbit → Logo.dev → Google → Unsplash → OpenGraph → UI Avatars (fallback garantizado)
- Sistema de caché (7 días, `automation/cache/images/`)
- Archivos: `automation/src/image-searcher-v2.ts`, `automation/src/image-providers/`, `automation/src/utils/image-cache.ts`
- Tipos: `automation/src/types/image.types.ts` (ImageSearchParams, ImageSearchResult)

**Prompt 13 - Video Optimizado (2026-01-29):**
- Video optimizado para 1 noticia completa con efectos dinámicos
- Timing: Hero 8s (hook) + Content 37s (explicación) + Outro 10s (branding) = 55s
- Efectos: zoom dramático (0.8→1.2), blur-to-focus, parallax (-20px), glow pulsante
- 3 imágenes: hero (logo empresa), context (screenshot/demo), outro (logo Sintaxis IA hardcoded)
- Composición: `AINewsShort` en `remotion-app/src/compositions/`
- Escenas: `HeroScene`, `ContentScene`, `OutroScene` en `remotion-app/src/components/scenes/`
- Tipos: `VideoProps`, `NewsType` en `remotion-app/src/types/video.types.ts`
- Hashtags: NO se renderizan (solo metadata para YouTube)

**Fix CORS - Prompt 13.1 (2026-01-29):**
- Componente `SafeImage` con fallback automatico para errores de CORS
- Genera placeholder dinamico (UI Avatars) si imagen falla
- Extrae inicial del dominio de Clearbit/Logo.dev para placeholder
- Usado en HeroScene y ContentScene (reemplaza <Img> directo)
- Preview funciona sin errores de carga de imagenes externas
- Archivo: `remotion-app/src/components/elements/SafeImage.tsx`

**Limpieza de Composiciones - Prompt 13.2 (2026-01-29):**
- Eliminadas composiciones obsoletas: SintaxisIA, SintaxisIA-Preview, SintaxisIA-LowRes
- Mantenidas solo 2 composiciones productivas:
  - `AINewsShort` (55s) - Producción final
  - `AINewsShort-Preview` (10s) - Desarrollo rápido
- Eliminado import de Video.tsx (ya no se usa)
- Preview muestra solo composiciones activas

**Prompt 14 - Orchestrator + Calendario (2026-01-29):**
- Coordinador maestro que orquesta todo el pipeline de generación
- Calendario de publicación: cada 2 días (Lun/Mié/Vie/Dom a las 14:00)
- Pipeline de 9 pasos: check_schedule → collect_news → select_top → generate_script → search_images → generate_audio → render_video → manual_approval → publish
- CLI con opciones: `--dry` (sin publicar), `--force` (forzar), `--prod` (producción)
- Archivos: `automation/src/orchestrator.ts`, `automation/src/cli.ts`, `automation/src/config/publication-calendar.ts`, `automation/src/types/orchestrator.types.ts`
- Scripts: `npm run automation:run`, `automation:dry`, `automation:force`, `automation:prod`
- Mocks implementados para: news collection, script generation, audio generation, video rendering
- Funcional: calendario, scoring, image search

**Prompt 14.1 - Sistema de Notificaciones (2026-01-29):**
- Notificaciones duales: Email (Resend API) + Telegram Bot
- Email HTML profesional con botones de acción
- Telegram con botones inline para aprobar/rechazar desde celular
- Variables de entorno encriptadas (.env)
- Datos sensibles enmascarados en logs (getSafeConfig)
- Storage temporal para videos pendientes de aprobación
- Archivos: `automation/src/notifiers/`, `automation/src/config/env.config.ts`
- Configurar: copiar `.env.example` a `.env` y completar credenciales
- Obtener: API key en resend.com, bot token de @BotFather

**Prompt 14.2 - Fix Notificaciones para Desarrollo (2026-01-29):**
- Email: Usa `onboarding@resend.dev` (dominio pre-verificado, sin DNS)
- Telegram: Botones callback (`callback_data`) en lugar de URLs
- Callback handler: Escucha aprobaciones/rechazos directamente desde Telegram
- Aprobación sin dashboard: 100% funcional en desarrollo local
- CLI actualizado: Inicializa callback handler y espera Ctrl+C
- Archivos modificados:
  - `automation/src/notifiers/telegram-notifier.ts` (callbacks)
  - `automation/src/notifiers/telegram-callback-handler.ts` (nuevo)
  - `automation/src/notifiers/notification-orchestrator.ts` (videoId)
  - `automation/src/cli.ts` (callback handler + SIGINT)
  - `automation/src/notifiers/email-notifier.ts` (onboarding@resend.dev)
- Flujo de aprobación:
  1. Pipeline genera video → envía notificaciones
  2. Usuario recibe mensaje en Telegram con 3 botones
  3. Toca "Aprobar" / "Rechazar" / "Ver Detalles"
  4. Bot ejecuta acción inmediatamente
  5. Usuario recibe confirmación
  6. Ctrl+C para salir

**Prompt 14.2.1 - Fix Storage Temporal:**
- Directorio temporal creado automáticamente (`automation/temp/videos/`)
- Logging mejorado en callback handler para diagnóstico
- Validaciones de existencia de archivos
- Mensajes de error más descriptivos en Telegram
- .gitkeep en directorio temporal

## Pipeline de Publicación

### Orchestrator (9 pasos)
1. **check_schedule**: Validar si toca publicar según calendario
2. **collect_news**: Obtener noticias de NewsData.io API
3. **select_top**: Rankear y seleccionar mejor noticia (scoring)
4. **generate_script**: Generar guion con Gemini API
5. **search_images**: Buscar 3 imágenes (hero, context, outro)
6. **generate_audio**: TTS con ElevenLabs
7. **render_video**: Renderizar con Remotion
8. **manual_approval**: Enviar notificaciones y esperar aprobación
9. **publish**: Publicar en YouTube (pendiente)

### Calendario de Publicación
- Frecuencia: Cada 2 días
- Días: Lunes, Miércoles, Viernes, Domingo
- Hora: 14:00 (timezone del servidor)
- Configuración: `automation/src/config/publication-calendar.ts`

### Sistema de Notificaciones
- **Email**: HTML profesional con preview y botones (Resend API)
- **Telegram**: Mensaje con botones inline para aprobar/rechazar desde celular
- **Callbacks**: Handler que escucha respuestas de Telegram en tiempo real
- **Desarrollo**: Usa `onboarding@resend.dev` (dominio pre-verificado)
- **Storage**: Metadata de videos en `automation/temp/videos/{videoId}.json`

### CLI Options
```bash
npm run automation:run        # Modo normal (respeta calendario)
npm run automation:dry        # Dry run (sin publicar)
npm run automation:force      # Forzar ejecución (ignora calendario)
npm run automation:prod       # Producción (con notificaciones)
```

## Estado de Implementación

### Funcional (Real API)
- News Collection (NewsData.io)
- News Scoring (0-37 puntos)
- Image Search (multi-provider con caché)
- Publication Calendar
- Notification System (Email + Telegram)

### Mock (Tests pasando)
- Script Generation (Gemini)
- Audio Generation (ElevenLabs)
- Video Rendering (Remotion CLI)

**Pendientes**: #15 Gemini real, #16 ElevenLabs real, #17 Remotion CLI real, #18 OCR, #19 STT, #20 YouTube API
