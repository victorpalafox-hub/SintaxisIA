# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sintaxis IA - Videos Short**: Sistema automatizado de generación de videos para YouTube Shorts usando Gemini API (scripts), ElevenLabs (audio) y Remotion (renderizado).

**User Profile**: QA Manual → QA Automation. Código debe incluir comentarios educativos.

**Test Status**: 158 tests passing (ver `npm test`)

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
| Preview in Remotion | `npm run dev` |
| Render video | `npm run render` |
| CI validation | `npm run ci:validate` |

**Test suites**: `test:logger` (3), `test:services` (5), `test:video` (19), `test:content` (23), `test:design` (29), `test:scoring` (19), `test:image-search` (23), `test:video-optimized` (22)

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
GEMINI_API_KEY=...
NEWSDATA_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=adam
NODE_ENV=development
```

Ver `.env.example` para lista completa.

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

**Pendientes**: #14 Orchestrator + Calendario publicación, #15 Gemini real, #16 Remotion CLI real, #17 OCR, #18 STT, #19 E2E completo
