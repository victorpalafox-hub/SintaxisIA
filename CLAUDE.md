# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sintaxis IA - Videos Short**: AI-powered automated video generation system for YouTube Shorts. Generates videos from text prompts using Gemini API for scripts, ElevenLabs for audio, and Remotion for rendering.

**User Profile**: QA Manual transitioning to QA Automation - code should be heavily commented with educational explanations.

## Commands

```bash
# Install all dependencies (root + automation + remotion-app)
npm run install:all
npx playwright install  # Install browsers

# Testing
npm test                 # Run all Playwright tests
npm run test:ui          # Playwright UI mode (interactive)
npm run test:headed      # Run with visible browser
npm run test:debug       # Debug mode
npm run test:report      # View HTML report

# Run specific test suites
npm run test:logger      # TestLogger validation tests
npm run test:demo        # Service Objects demo tests

# Run a single test file
npx playwright test path/to/file.spec.ts

# Code validation
npm run validate         # Run auto-review (6 categories)
npm run check            # TypeScript type checking

# Content generation pipeline
npm run fetch            # Fetch news from NewsData.io
npm run generate         # Full pipeline: news + script + audio
npm run dev              # Open Remotion Studio for preview
npm run render           # Render full HD video (1080x1920)
npm run render:preview   # Render 10-second preview
npm run render:lowres    # Render low resolution for testing
```

## Architecture

### Monorepo Structure

Three main packages with separate `package.json`:

- **Root (`/`)**: Playwright tests, shared config, orchestration scripts
- **`/automation`**: Content generation pipeline (news fetching, Gemini scripts, ElevenLabs audio)
- **`/remotion-app`**: Video rendering with Remotion (React-based video composition)

### Test Infrastructure (Service Object Pattern)

Tests use Service Object Pattern - POM adapted for API testing:

```
tests/
├── page-objects/
│   ├── base/BaseServiceObject.ts      # Parent class with logging/timing/simulateDelay
│   └── services/
│       ├── GeminiServiceObject.ts     # Gemini API wrapper
│       ├── VideoServiceObject.ts      # Video generation & validation
│       └── ContentValidationServiceObject.ts  # Content quality validation
├── utils/
│   └── TestLogger.ts                  # Winston-based structured logging
├── specs/
│   ├── prompt5-testlogger-validation.spec.ts  # TestLogger tests (3)
│   ├── service-objects-demo.spec.ts           # Service Objects demo (5)
│   ├── prompt7-video-generation.spec.ts       # Video generation tests (19)
│   └── prompt8-content-validation.spec.ts     # Content validation tests (23)
└── config/
    ├── test-constants.ts              # Test configuration
    └── service-constants.ts           # Centralized magic numbers & config
```

**Current Test Status: 50 tests passing**

### Configuration System

Multi-environment config in `src/config/`:
- `EnvironmentManager.ts`: Loads `.env` → `.env.local` → `.env.[env]` → `.env.[env].local`
- `AppConfig.ts`: Type-safe configuration access

Environment files: `.env.dev`, `.env.staging`, `.env.prod` (gitignored)

## Key Patterns

### Service Objects
All external service interactions go through Service Objects that extend `BaseServiceObject`:

```typescript
import { GeminiServiceObject, VideoServiceObject, ContentValidationServiceObject } from './page-objects';

const gemini = new GeminiServiceObject();
const video = new VideoServiceObject();
const contentValidator = new ContentValidationServiceObject();
```

**Available Service Objects:**

| Service | Methods | Purpose |
|---------|---------|---------|
| `GeminiServiceObject` | `generateScript()`, `generateMultiple()`, `validateApiKey()` | Gemini API wrapper |
| `VideoServiceObject` | `renderVideo()`, `validateVideoFile()`, `getMetadata()`, `validateAudioContent()`, `cleanupTestVideos()` | Video generation & validation |
| `ContentValidationServiceObject` | `validateScriptStructure()`, `validateScriptLength()`, `validateTopicDetection()`, `validateImageSearch()`, `validateContentQuality()` | Content quality validation |

### Test Logging
Use `TestLogger` for all test logging - provides structured JSON logs with automatic credential sanitization:

```typescript
logger.logApiRequest('Gemini', { url, method, body });
logger.logApiResponse('Gemini', { statusCode, duration });
logger.logVideoGeneration({ id, status, progress });
logger.logValidationResults({ validator, passed, details });
```

### Service Constants
All magic numbers and hardcoded values are centralized in `tests/config/service-constants.ts`:

```typescript
import { GEMINI_CONFIG, VIDEO_CONFIG, MOCK_DELAYS, CONTENT_VALIDATION } from '../config';

// Use constants instead of magic numbers
const delay = MOCK_DELAYS.GEMINI_API.MIN;
const maxTokens = GEMINI_CONFIG.DEFAULT_OPTIONS.MAX_TOKENS;
const minDuration = CONTENT_VALIDATION.VIDEO_DURATION_ESTIMATE.MIN_SECONDS;
```

Available constant groups:
- `GEMINI_CONFIG` - API configuration
- `VIDEO_CONFIG` - Video rendering defaults
- `MOCK_DELAYS` - Simulated delays for mocks
- `VALIDATION_THRESHOLDS` - Video file validation limits
- `REMOTION_CONFIG` - Remotion CLI configuration
- `CONTENT_VALIDATION` - Script structure/length/quality thresholds
- `CONTENT_VALIDATION_DELAYS` - Content validation delays

### Test Organization
- Follow AAA pattern (Arrange, Act, Assert)
- Use `beforeEach`/`afterEach` for setup/teardown
- Tests go in `tests/specs/[category]/`
- 2-minute timeout per test (configured for video generation)
- Use `Record<string, unknown>` instead of `any` for context objects

## File Placement

| Content Type | Location |
|-------------|----------|
| New tests | `tests/specs/[category]/` |
| Service Objects | `tests/page-objects/services/` |
| Test utilities | `tests/utils/` |
| Production services | `src/services/` |
| Configuration | `src/config/` or `tests/config/` |

## Video Specs

- Resolution: 1080x1920 (9:16 vertical)
- Frame Rate: 30 FPS
- Duration: 60 seconds
- Theme customization: `remotion-app/src/theme.ts`

## Required Environment Variables

```env
GEMINI_API_KEY=...
NEWSDATA_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=adam
NODE_ENV=development
```

See `.env.example` for full list.

## Custom Agents

Este proyecto tiene agentes personalizados configurados. Úsalos **proactivamente** cuando corresponda:

### qa-automation-lead
**Trigger automático:** Después de modificar código en `/src`, `/services`, `/config` o `package.json`

- Crea, actualiza y ejecuta tests siguiendo el Service Object Pattern
- Genera reporte `Tests.md` con resumen ejecutivo, cambios detectados y resultados
- Valida que los tests existentes sigan pasando después de cambios
- Solo modifica archivos dentro de `/tests` - nunca código de producción

```
Task tool → subagent_type: "qa-automation-lead"
```

### clean-code-refactorer
**Trigger automático:** Después de escribir código nuevo en `.ts/.tsx` o al solicitar mejora de calidad

- Detecta y elimina código muerto, imports no usados, `console.log` (excepto TestLogger)
- Extrae valores hardcodeados a `src/config/` o `tests/config/`
- Simplifica condicionales complejos y funciones >50 líneas
- Reemplaza magic numbers con constantes nombradas
- Genera reporte `Refactorizacion.md` con antes/después
- **Si los tests fallan después del refactoring → revierte automáticamente**

```
Task tool → subagent_type: "clean-code-refactorer"
```

### security-reviewer
**Trigger automático:** Cambios en `.env`, `config/`, credenciales, o nuevas dependencias

- Audita dependencias con `npm audit`
- Revisa manejo de secretos y API keys
- Valida que `.gitignore` proteja archivos sensibles
- Ejecuta antes de merges a producción

```
Task tool → subagent_type: "security-reviewer"
```

### devops-pipeline-architect
**Trigger automático:** Cambios en `.github/workflows/`, `package.json` scripts, o setup de CI/CD

- Crea/modifica GitHub Actions workflows
- Configura jobs programados (cron) para generación automática
- Optimiza pipelines con caching y paralelización
- Gestiona secretos en CI/CD

```
Task tool → subagent_type: "devops-pipeline-architect"
```

### documentation-specialist
**Trigger automático:** Después de cambios exitosos en código y tests pasando

- Actualiza README.md y CLAUDE.md
- Sincroniza documentación con cambios de código
- Ejecuta DESPUÉS de qa-automation-lead

```
Task tool → subagent_type: "documentation-specialist"
```

### Flujo de trabajo entre agentes

```
Cambio en código → clean-code-refactorer → qa-automation-lead → documentation-specialist → commit
                         ↓                        ↓                       ↓
              Refactorizacion.md              Tests.md            README/CLAUDE.md
```

### Scripts de Agentes

```bash
# Security
npm run security:audit    # Auditoría completa de dependencias
npm run security:check    # Check rápido de vulnerabilidades

# CI/CD
npm run ci:validate       # Lint + Tests (pipeline completo)
npm run ci:test          # Tests con reporter para CI
npm run ci:build         # Build de todos los paquetes

# Utilidades
npm run agents:list      # Lista agentes disponibles
```

**Nota:** Ejecutar `/agents` para ver agentes disponibles y su estado.
