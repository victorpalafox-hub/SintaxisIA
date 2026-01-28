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
│       └── VideoServiceObject.ts      # Video generation wrapper
├── utils/
│   └── TestLogger.ts                  # Winston-based structured logging
├── specs/
│   ├── api/                           # API integration tests
│   ├── video/                         # Video generation tests
│   ├── content/                       # OCR/STT content validation
│   └── e2e/                           # End-to-end pipeline tests
└── config/
    ├── test-constants.ts              # Test configuration
    └── service-constants.ts           # Centralized magic numbers & config
```

### Configuration System

Multi-environment config in `src/config/`:
- `EnvironmentManager.ts`: Loads `.env` → `.env.local` → `.env.[env]` → `.env.[env].local`
- `AppConfig.ts`: Type-safe configuration access

Environment files: `.env.dev`, `.env.staging`, `.env.prod` (gitignored)

## Key Patterns

### Service Objects
All external service interactions go through Service Objects that extend `BaseServiceObject`:

```typescript
import { GeminiServiceObject } from './page-objects';

const gemini = new GeminiServiceObject();
const result = await gemini.generateScript('prompt');
```

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
import { GEMINI_CONFIG, VIDEO_CONFIG, MOCK_DELAYS } from '../config';

// Use constants instead of magic numbers
const delay = MOCK_DELAYS.GEMINI_API.MIN;
const maxTokens = GEMINI_CONFIG.DEFAULT_OPTIONS.MAX_TOKENS;
```

Available constant groups: `GEMINI_CONFIG`, `VIDEO_CONFIG`, `MOCK_DELAYS`, `VALIDATION_THRESHOLDS`, `MOCK_VALIDATION_VALUES`

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

Este proyecto tiene agentes personalizados configurados. Úsalos proactivamente cuando corresponda:

### qa-automation-lead
**Cuándo usar:** Después de modificar código en `/src`, `/services`, `/config` o `package.json`

- Crea, actualiza y ejecuta tests siguiendo el Service Object Pattern
- Genera reportes de cobertura de tests (Tests.md)
- Valida que los tests existentes sigan pasando después de cambios

```
# Ejemplo de uso
Task tool → subagent_type: "qa-automation-lead"
```

### clean-code-refactorer
**Cuándo usar:** Después de escribir código nuevo o cuando se solicite mejorar calidad

- Detecta y elimina código muerto, imports no usados
- Elimina `console.log` (excepto TestLogger)
- Extrae valores hardcodeados a configuración
- Simplifica condicionales complejos
- Reemplaza magic numbers con constantes nombradas
- Ejecuta tests después de cada refactoring

```
# Ejemplo de uso
Task tool → subagent_type: "clean-code-refactorer"
```

**Nota:** Ejecutar `/agents` para ver agentes disponibles y su estado.
