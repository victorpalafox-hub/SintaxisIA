# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sintaxis IA - Videos Short**: AI-powered automated video generation system for YouTube Shorts. Generates videos from text prompts using Gemini API for scripts, ElevenLabs for audio, and Remotion for rendering.

**User Profile**: QA Manual transitioning to QA Automation - code should be heavily commented with educational explanations.

**Last Updated:** 2026-01-29 (Prompt 10: Video Design - AudioMixer y ProgressBar)

**Security Status:**
- Latest audit: 2026-01-29
- Dependencies: 0 vulnerabilities
- Security posture: PASSED (see `Security-Review.md`)

## Commands

### Installation & Setup
```bash
npm run install:all      # Install all dependencies (root + automation + remotion-app)
npx playwright install   # Install Playwright browsers
```

### Testing - Basic Commands
```bash
npm test                 # Run all Playwright tests
npm run test:ui          # Playwright UI mode (interactive)
npm run test:headed      # Run with visible browser
npm run test:debug       # Debug mode with step-through
```

### Testing - By Suite (77 tests total)
```bash
npm run test:logger      # TestLogger validation (3 tests)
npm run test:services    # Service Objects demo (5 tests)
npm run test:video       # Video Generation (19 tests)
npm run test:content     # Content Validation (23 tests)
npm run test:design      # Video Design (27 tests)
```

### Testing - By Category
```bash
npm run test:unit        # Unit tests: logger + services (8 tests)
npm run test:integration # Integration tests: video + content (42 tests)
npm run test:design      # Design tests: Themes + AudioMixer + ProgressBar (27 tests)
npm run test:all         # All tests in specs/ directory (77 tests)
```

### Testing - Reports
```bash
npm run test:report      # View last HTML report in browser
npm run test:html        # Generate HTML report only
npm run test:json        # Generate JSON report only
npm run test:junit       # Generate JUnit XML report (for CI/CD)
```

### Testing - CI/CD
```bash
npm run test:ci          # Run tests with HTML + JSON + JUnit reporters
npm run validate:all     # TypeScript check + all tests + open report (deprecated)
npm run ci:validate      # Lint + tests (full pipeline validation)
npm run ci:test          # Tests with list + JUnit reporters (for CI)
npm run ci:build         # Build all packages
```

### Content Generation Pipeline
```bash
npm run fetch            # Fetch news from NewsData.io
npm run generate         # Full pipeline: news + script + audio
npm run dev              # Open Remotion Studio for preview
npm run preview:video    # Alias for npm run dev (Remotion Studio)
npm run render           # Render full HD video (1080x1920)
npm run render:sample    # Alias for npm run render
npm run render:preview   # Render 10-second preview
npm run render:lowres    # Render low resolution for testing
```

### Code Validation
```bash
npm run validate         # Run auto-review (6 categories)
npm run check            # TypeScript type checking (all packages)
```

### Advanced Testing
```bash
# Run specific test file
npx playwright test tests/specs/prompt7-video-generation.spec.ts

# Filter tests by name pattern
npx playwright test -g "should validate"

# Control parallelization
npx playwright test --workers=4

# Run with retries
npx playwright test --retries=2
```

**See `tests/README-COMMANDS.md` for complete command documentation**

## Architecture

### Monorepo Structure

Three main packages with separate `package.json`:

- **Root (`/`)**: Playwright tests, shared config, orchestration scripts
- **`/automation`**: Content generation pipeline (news fetching, Gemini scripts, ElevenLabs audio)
- **`/remotion-app`**: Video rendering with Remotion (React-based video composition)

### Test Infrastructure (Service Object Pattern)

Tests use Service Object Pattern - POM adapted for API testing. Key directories:

- `tests/page-objects/base/` - BaseServiceObject with logging/timing
- `tests/page-objects/services/` - Service wrappers (Gemini, Video, ContentValidation)
- `tests/utils/` - TestLogger, formatters, and test-runner utility
- `tests/specs/` - Test files (`*.spec.ts`)
- `tests/config/` - Constants and configuration
- `tests/reports/` - HTML, JSON, and JUnit reports (gitignored)

**Current Test Status: 77 tests passing** (8 unit + 42 integration + 27 design)

**Test Runner Utility:** `tests/utils/test-runner.ts` provides programmatic test execution:
- `runTests(options)` - Execute tests with custom configuration
- `generateTestSummary()` - Generate test result summary
- `readTestResults()` - Parse JSON report
- `printSummary()` - Display formatted test summary in console

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
- Tests go in `tests/specs/` directory (flat structure, no subdirectories)
- 2-minute timeout per test (configured for video generation)
- Use `Record<string, unknown>` instead of `any` for context objects

**Test Categorization:**
- **Unit tests** (8): TestLogger + Service Objects (fast, no external dependencies)
- **Integration tests** (42): Video Generation + Content Validation (slower, external services)
- **Design tests** (27): Themes + AudioMixer + ProgressBar + Config (component validation)

**Playwright Configuration** (`playwright.config.ts`):
- Workers: 4 (local) / 1 (CI) - parallel execution control
- Retries: 0 (local) / 2 (CI) - automatic retry on failure in CI
- Reporters: HTML (default), JSON, JUnit (CI/CD)
- Screenshots/Video/Trace: captured on test failure

## File Placement

| Content Type | Location |
|-------------|----------|
| New tests | `tests/specs/` (use `prompt[N]-*.spec.ts` naming) |
| Service Objects | `tests/page-objects/services/` |
| Test utilities | `tests/utils/` |
| Test reports | `tests/reports/` (HTML, JSON, JUnit - gitignored) |
| Production services | `src/services/` |
| Configuration | `src/config/` or `tests/config/` |

## Video Specs

- Resolution: 1080x1920 (9:16 vertical)
- Frame Rate: 30 FPS
- Duration: 60 seconds
- Theme customization: `remotion-app/src/theme.ts`

### Sistema de Temas
- **Temas disponibles:** Cyberpunk Neón (activo) + Minimalista Profesional
- **Cambiar tema:** Editar `remotion-app/src/styles/themes.ts` → línea `activeTheme`
- **Colores cyberpunk:** `#00F0FF` (cyan) + `#FF0099` (magenta)
- **Configuración:** `remotion-app/src/styles/themes.ts`

### Audio System
- **AudioMixer**: Mezcla inteligente de voz y música con ducking automático
- Voz TTS: 100% volumen (protagonista)
- Música fondo: 15% volumen base, 9% durante ducking (0.6 factor)
- Fade in/out automático para transiciones suaves
- Loop de música si es más corta que el video
- Configuración: `remotion-app/src/theme.ts` → `audio`

### UI Components
- **ProgressBar**: Barra de progreso con efecto neón cyberpunk
- Progreso 0-100% basado en frame actual
- Estilo configurable (color, altura, mostrar porcentaje)

**Documentación completa:** Ver `README-REMOTION.md`

### Remotion Compositions

| Composition | Command | Output |
|-------------|---------|--------|
| `SintaxisIA` | `npm run render` | Full HD 1080x1920, 60s |
| `SintaxisIA-Preview` | `npm run render:preview` | 10-second preview |
| `SintaxisIA-LowRes` | `npm run render:lowres` | Low resolution for testing |

## Required Environment Variables

```env
GEMINI_API_KEY=...
NEWSDATA_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=adam
NODE_ENV=development
```

See `.env.example` for full list.

## Development Workflow

```bash
# 1. Generar contenido (noticias + script + audio)
npm run generate

# 2. Previsualizar en Remotion Studio
npm run dev

# 3. Renderizar preview rápido para verificar
npm run render:preview

# 4. Renderizar video final
npm run render

# 5. Validar código antes de commit
npm run ci:validate    # TypeScript check + tests with CI reporters
```

## CI/CD Integration

### GitHub Actions Workflow
Located at `.github/workflows/test.yml` - runs automatically on push/PR to main or develop.

**Pipeline stages:**
1. **Setup** - Checkout, Node.js 20, npm cache
2. **Install** - Dependencies for root + automation + remotion-app + Playwright browsers
3. **Validate** - TypeScript type check (`npm run check`)
4. **Test** - Run all tests with `npm run test:ci` (HTML + JSON + JUnit reporters)
5. **Artifacts** - Upload test reports (30 days) and failure artifacts (7 days)
6. **Publish** - Publish JUnit results to GitHub Checks
7. **Security** (parallel job) - npm audit on all packages

**Configuration:**
- Runs on: Ubuntu latest
- Timeout: 15 minutes
- Workers: 1 (CI mode, no parallelization)
- Retries: 2 (automatic retry on failure)
- Node.js: 20 with npm cache

**Reports generated:**
- `tests/reports/html/` - Interactive HTML report
- `tests/reports/results.json` - JSON results for programmatic access
- `tests/reports/junit.xml` - JUnit XML for GitHub Checks integration

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
- Genera reporte `Security-Review.md` con hallazgos y recomendaciones

**Última ejecución:** 2026-01-29
- 0 vulnerabilidades en dependencias
- 2 problemas de prioridad media corregidos (M-001, M-002)
- Security posture: PASSED

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
npm run security:audit    # Auditoría completa de dependencias (root + automation + remotion-app)
npm run security:check    # Check rápido de vulnerabilidades (moderate level)
npm run security:review   # Ejecutar agente security-reviewer

# CI/CD
npm run ci:validate       # Lint + Tests (pipeline completo de validación)
npm run ci:test          # Tests con reporter para CI (list + JUnit)
npm run ci:build         # Build de todos los paquetes

# QA Automation
npm run test:qa-automation # Ejecutar tests (alias de npm test)

# Code Quality
npm run refactor:apply    # Ejecutar agente clean-code-refactorer

# Documentation
npm run docs:update       # Ejecutar agente documentation-specialist

# Utilidades
npm run agents:list       # Lista agentes disponibles
```

**Nota:** Ejecutar `/agents` para ver agentes disponibles y su estado.

## Reports and Artifacts

| Report | Location | Description |
|--------|----------|-------------|
| Security Audit | `Security-Review.md` | Full security review with vulnerabilities, secrets management, and recommendations |
| HTML Test Report | `tests/reports/html/index.html` | Interactive Playwright HTML report (gitignored) |
| JSON Test Results | `tests/reports/results.json` | Structured JSON test results for programmatic access (gitignored) |
| JUnit Test Report | `tests/reports/junit.xml` | JUnit XML format for CI/CD integration (gitignored) |
| Test Logs | `tests/logs/` | Winston JSON logs with daily rotation (gitignored) |
| Test Artifacts | `tests/test-results/` | Screenshots, videos, traces on test failure (gitignored) |
| Refactoring Report | `Refactorizacion.md` | Clean code refactoring changes (generated by clean-code-refactorer) |
| Test Updates | `Tests.md` | Test suite changes (generated by qa-automation-lead) |
| Documentation Updates | `Documentation-Update.md` | Documentation sync report (generated by documentation-specialist) |
| Command Reference | `tests/README-COMMANDS.md` | Complete testing commands documentation |
| Remotion Docs | `README-REMOTION.md` | Complete Remotion system documentation (audio, components, compositions) |

## Prompt History

Historial de implementaciones por prompt para contexto del progreso del proyecto:

| Prompt | Descripción | Tests | Status |
|--------|-------------|-------|--------|
| #4 | EnvironmentManager + AppConfig | - | ✅ Completado |
| #5 | TestLogger con Winston | 3 | ✅ Completado |
| #6 | Service Objects (BaseServiceObject, GeminiServiceObject) | 5 | ✅ Completado |
| #7 | Video Generation Tests (renderizado, validación, metadatos) | 19 | ✅ Completado |
| #8 | Content Validation Tests (estructura, longitud, topics, imágenes) | 23 | ✅ Completado |
| #9 | npm scripts organizados, reporters (HTML/JSON/JUnit), CI/CD setup | - | ✅ Completado |
| #10 | Video Design: AudioMixer, ProgressBar, Sistema de Temas | 27 | ✅ Completado |

### Prompt 9 - CI/CD y Scripts (2026-01-29)

**Cambios principales:**
- Scripts npm reorganizados por categoría (suite, category, reports, CI/CD)
- Múltiples reporters configurados: HTML, JSON, JUnit
- GitHub Actions workflow (`.github/workflows/test.yml`)
- Validación de TypeScript integrada en pipeline
- Scripts de agentes (`security:audit`, `ci:validate`, etc.)

**Archivos clave:**
- `package.json` - Scripts organizados
- `playwright.config.ts` - Reporters configurados
- `.github/workflows/test.yml` - CI/CD pipeline

### Prompt 10 - Video Design (2026-01-29)

**Componentes nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `remotion-app/src/components/audio/AudioMixer.tsx` | Mezcla de voz + música con ducking automático |
| `remotion-app/src/components/ui/ProgressBar.tsx` | Barra de progreso con efecto neón |
| `remotion-app/src/styles/themes.ts` | Sistema de temas (Cyberpunk + Minimalista) |
| `remotion-app/src/types/audio.types.ts` | Interfaces TypeScript para audio |
| `README-REMOTION.md` | Documentación completa de Remotion |

**AudioMixer - Ducking automático:**
```typescript
// Voz: 100% volumen (protagonista)
// Música: 15% base → 9% cuando hay voz (ducking factor: 0.6)
<AudioMixer
  voice={{ src: 'narration.mp3', volume: 1.0 }}
  music={{ src: 'background.mp3', volume: 0.15, ducking: true }}
/>
```

**ProgressBar - Progreso visual:**
```typescript
// Barra neón que progresa 0-100% según frame actual
<ProgressBar color="#00f0ff" height={4} showPercentage={false} />
```

**Sistema de Temas:**
```typescript
// Cambiar tema en remotion-app/src/styles/themes.ts
export const activeTheme = cyberpunkTheme;  // o minimalistTheme
```

### Próximos Prompts (Pendientes)

| Prompt | Objetivo |
|--------|----------|
| #11 | Integración real con Gemini API (reemplazar mocks) |
| #12 | Renderizado real con Remotion CLI |
| #13 | Validación OCR (Tesseract.js) |
| #14 | Validación STT (transcripción de audio) |
| #15 | E2E completo: Prompt → Gemini → Video → Validación |
