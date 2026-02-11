# Sintaxis IA - Videos Short

> AI-powered automated video generation system using Gemini API and Remotion

Sistema automatizado para generar videos cortos (YouTube Shorts) a partir de prompts de texto utilizando inteligencia artificial. El sistema obtiene noticias de IA, genera guiones con Gemini, produce audio con ElevenLabs y renderiza videos con Remotion.

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Testing Infrastructure](#testing-infrastructure)
- [Implementation Status](#implementation-status)
- [Video Specifications](#video-specifications)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Resources](#resources)

---

## Technology Stack

### Backend/Services

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **TypeScript** | Type-safe development |
| **Gemini API** | AI script generation (Google Generative AI) |
| **ElevenLabs** | Text-to-speech audio generation |
| **Remotion** | Programmatic video rendering |
| **FFmpeg** | Video processing and encoding |

### Testing Infrastructure

| Technology | Purpose |
|------------|---------|
| **Playwright** | E2E and API testing framework |
| **Winston** | Structured logging with rotation |
| **TypeScript** | Comprehensive JSDoc comments |
| **Service Object Pattern** | POM adapted for API testing |

---

## Project Structure

```
sintaxis-ia/
├── automation/                             # Content generation pipeline
│   ├── src/
│   │   ├── orchestrator.ts                # Main pipeline coordinator
│   │   ├── cli.ts                         # CLI with --dry, --force, --prod
│   │   ├── index.ts                       # Legacy orchestrator
│   │   ├── config/
│   │   │   ├── publication-calendar.ts    # Publication schedule (every 2 days)
│   │   │   ├── env.config.ts              # Environment configuration
│   │   │   └── scoring-rules.ts           # News scoring rules
│   │   ├── notifiers/
│   │   │   ├── email-notifier.ts          # Resend email integration
│   │   │   ├── telegram-notifier.ts       # Telegram bot integration
│   │   │   ├── telegram-callback-handler.ts  # Approval callbacks
│   │   │   └── notification-orchestrator.ts  # Notification coordinator
│   │   ├── newsAPI.ts                     # NewsData.io integration
│   │   ├── news-scorer.ts                 # News scoring system
│   │   ├── scriptGen.ts                   # Gemini script generation
│   │   ├── audioGen.ts                    # ElevenLabs audio generation
│   │   ├── image-searcher-v2.ts           # Multi-provider image search
│   │   ├── image-providers/               # Clearbit, Logo.dev, Google, etc.
│   │   ├── entityMapping.ts               # AI entity recognition
│   │   └── dataContract.ts                # Remotion data structure
│   ├── temp/videos/                       # Temporary video storage
│   └── cache/images/                      # Image cache (7 days)
│   └── utils/
│       ├── logger.ts                      # Production logger
│       ├── image-cache.ts                 # Image caching utility
│       └── validators.ts                  # Input validation
│
├── remotion-app/                          # Video rendering application
│   ├── src/
│   │   ├── Video.tsx                      # Main composition
│   │   ├── Root.tsx                       # Remotion root
│   │   ├── theme.ts                       # Centralized theme system
│   │   ├── data.json                      # Video data input
│   │   └── components/
│   │       ├── backgrounds/               # Animated backgrounds
│   │       ├── effects/                   # Visual effects
│   │       ├── sequences/                 # Video sequences
│   │       └── ui/                        # UI components (Watermark)
│   └── public/assets/                     # Static assets
│
├── src/                                   # Shared production code
│   └── config/                            # Configuration management
│       ├── EnvironmentManager.ts          # Multi-environment config loader
│       ├── AppConfig.ts                   # Typed configuration access
│       └── index.ts
│
├── tests/                                 # Test suite (Service Object Pattern)
│   ├── config/
│   │   ├── test-constants.ts              # Test configuration constants
│   │   ├── service-constants.ts           # Centralized magic numbers & config
│   │   └── index.ts
│   ├── utils/
│   │   ├── TestLogger.ts                  # Test logging utility
│   │   ├── log-formatter.ts               # Winston formatters
│   │   └── index.ts
│   ├── page-objects/
│   │   ├── services/
│   │   │   ├── GeminiServiceObject.ts     # Gemini API test wrapper
│   │   │   ├── VideoServiceObject.ts      # Video generation & validation
│   │   │   └── ContentValidationServiceObject.ts  # Content quality validation
│   │   ├── base/
│   │   │   └── BaseServiceObject.ts       # Base class with logging/timing
│   │   └── index.ts                       # Central exports
│   ├── specs/
│   │   ├── prompt5-testlogger-validation.spec.ts  # TestLogger validation (3 tests)
│   │   ├── service-objects-demo.spec.ts           # Service Objects demo (5 tests)
│   │   ├── prompt7-video-generation.spec.ts       # Video generation (19 tests)
│   │   └── prompt8-content-validation.spec.ts     # Content validation (23 tests)
│   ├── temp/                              # Temporary test files (gitignored)
│   ├── logs/                              # Test execution logs (gitignored)
│   └── reports/                           # HTML test reports (gitignored)
│
├── output/                                # Rendered videos
├── .env.example                           # Environment template
├── .env.dev                               # Development config (gitignored)
├── .env.staging                           # Staging config (gitignored)
├── .env.prod                              # Production config (gitignored)
├── playwright.config.ts                   # Playwright configuration
├── package.json                           # Root package configuration
└── tsconfig.json                          # TypeScript configuration
```

---

## Installation

### Prerequisites

- Node.js 18+ and npm
- Git
- FFmpeg (for video rendering)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/victorpalafox-hub/SintaxisIA.git
cd "Videos short"

# 2. Install all dependencies (root + automation + remotion-app)
npm run install:all

# 3. Install Playwright browsers
npx playwright install

# 4. Configure environment
cp .env.example .env.dev
# Edit .env.dev with your API keys and configuration

# 5. Validate setup
npm run validate

# 6. Run tests to verify installation
npm test
```

---

## Available Scripts

### Content Generation

| Script | Description |
|--------|-------------|
| `npm run fetch` | Fetch news from NewsData.io |
| `npm run generate` | Complete pipeline: news + script + audio |
| `npm run automation:run` | Execute full orchestrator pipeline |
| `npm run automation:dry` | Dry run without publishing |
| `npm run automation:force` | Force run ignoring schedule |
| `npm run automation:prod` | Production mode with notifications |
| `npm run dev` | Open Remotion Studio for preview |
| `npm run render` | Render full HD video (1080x1920) |
| `npm run render:preview` | Render 10-second preview |
| `npm run render:lowres` | Render low resolution for testing |

### Code Quality

| Script | Description |
|--------|-------------|
| `npm run validate` | Run full code validation (6 categories) |
| `npm run watch` | Monitor files and auto-validate on changes |
| `npm run check` | TypeScript type checking without build |
| `npm run build:all` | Build automation and remotion-app |
| `npm run clean` | Remove generated videos |

### Testing

| Script | Description |
|--------|-------------|
| `npm test` | Run all Playwright tests (1557 tests) |
| `npm run test:ui` | Open Playwright UI mode (interactive) |
| `npm run test:logger` | Run TestLogger validation tests (Prompt #5) |
| `npm run test:demo` | Run Service Objects demo tests (Prompt #6) |
| `npm run test:video` | Run Video Generation tests (Prompt #7) |
| `npm run test:content` | Run Content Validation tests (Prompt #8) |
| `npm run test:design` | Run Video Design tests (Prompt #10) |
| `npm run test:scoring` | Run News Scoring tests (Prompt #11) |
| `npm run test:image-search` | Run Image Search tests (Prompt #12) |
| `npm run test:video-optimized` | Run Video Optimized tests (Prompt #13) |
| `npm run test:orchestrator` | Run Orchestrator tests (Prompt #14) |
| `npm run test:notifications` | Run Notifications tests (Prompt #14.1) |
| `npm run test:notification-fix` | Run Notification Fix tests (Prompt #14.2) |
| `npm run test:gemini` | Run Gemini API tests (Prompt #15) |
| `npm run test:compliance` | Run Compliance tests (Prompt #15) |
| `npm run test:tts` | Run TTS tests (Prompt #16) |
| `npm run test:video-rendering` | Run Video Rendering tests (Prompt #17) |
| `npm run test:youtube` | Run YouTube Upload tests (Prompt #18) |
| `npm run test:output-manager` | Run Output Manager tests (Prompt #19) |
| `npm run test:dynamic-images` | Run Dynamic Images tests (Prompt #19.1) |
| `npm run test:sequential-text` | Run Sequential Text tests (Prompt #19.2) |
| `npm run test:image-preload` | Run Image Preload tests (Prompt #19.3) |
| `npm run test:tech-editorial` | Run Tech Editorial tests (Prompt #20) |
| `npm run test:anti-duplication` | Run Anti-Duplication tests (Prompt #21) |
| `npm run test:news-manager` | Run News Manager CLI tests (Prompt #22) |
| `npm run test:smart-image` | Run Smart Image Selector tests (Prompt #23) |
| `npm run test:newsdata` | Run NewsData.io Integration tests (Prompt #24) |
| `npm run test:audio-sync-fix` | Run Audio Sync Fix tests (Prompt #25) |
| `npm run test:hero-audio-bed` | Run Hero Audio Bed tests (Prompt #27) |
| `npm run test:images-editorial` | Run Images Editorial tests (Prompt #28) |
| `npm run test:topic-segmentation` | Run Topic Segmentation tests (Prompt #29) |
| `npm run test:final-duration` | Run Dynamic Duration tests (Prompt #30) |
| `npm run test:premium-background` | Run Premium Background tests (Prompt #31) |
| `npm run test:titlecard` | Run Title Card tests (Prompt #32) |
| `npm run test:editorial` | Run Editorial Text tests (Prompt #33) |
| `npm run test:emphasis` | Run Visual Emphasis tests (Prompt #34) |
| `npm run test:image-filter` | Run Image Editorial Filter tests (Prompt #35) |
| `npm run test:editorial-color` | Run Editorial Premium Color tests (Prompt #36) |
| `npm run test:audio-duration` | Run Audio Duration Fix tests (Prompt #37) |
| `npm run test:editorial-integral` | Run Editorial Integral tests (Prompt #44) |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:report` | Open HTML test report |

### Security & CI/CD

| Script | Description |
|--------|-------------|
| `npm run security:audit` | Run npm audit on all packages |
| `npm run security:check` | Quick vulnerability check (moderate+) |
| `npm run ci:validate` | Full CI validation (lint + tests) |
| `npm run ci:test` | Run tests with CI-friendly reporter |
| `npm run ci:build` | Build all packages |
| `npm run agents:list` | List available Claude Code agents |

**Latest Security Audit (2026-01-29):**
- 0 vulnerabilities detected in dependencies
- Security posture: PASSED
- See `Security-Review.md` for detailed audit report

---

## Environment Variables

Create environment files based on `.env.example`:

```bash
cp .env.example .env.dev      # Development
cp .env.example .env.staging  # Staging
cp .env.example .env.prod     # Production
```

### Required Variables

```env
# ============================
# APIs (Required)
# ============================
GEMINI_API_KEY=your_gemini_api_key
NEWSDATA_API_KEY=your_newsdata_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=adam

# ============================
# Notifications (Optional)
# ============================
NOTIFICATION_EMAIL=your_email@gmail.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF
TELEGRAM_CHAT_ID=123456789
DASHBOARD_URL=http://localhost:3000
DASHBOARD_SECRET=your_secret_key_here

# ============================
# Environment
# ============================
NODE_ENV=development          # development | staging | production
LOG_LEVEL=debug               # debug | info | warn | error
API_TIMEOUT=30000             # API timeout in milliseconds
```

See `SETUP-NOTIFICATIONS.md` for detailed notification setup guide.

### Optional Variables

```env
# ============================
# Content Settings
# ============================
TARGET_LANGUAGE=es
MAX_SUBTITLE_WORDS=5
MAX_NEWS_ITEMS=5

# ============================
# Video Settings
# ============================
VIDEO_WIDTH=1080
VIDEO_HEIGHT=1920
VIDEO_FPS=30
VIDEO_DURATION=60

# ============================
# Watermark
# ============================
WATERMARK_ENABLED=true
WATERMARK_OPACITY=0.3
WATERMARK_SIZE=80
WATERMARK_MARGIN=20

# ============================
# Paths
# ============================
OUTPUT_DIR=./output
```

---

## Testing Infrastructure

### Test Logging (TestLogger)

All test executions generate structured logs:

```
tests/logs/
├── test-YYYY-MM-DD.log           # Daily JSON logs
├── test-summary.json             # Execution summary
└── error-YYYY-MM-DD.log          # Error-only logs
```

**Features:**
- Timestamps with timezone
- Color-coded console output
- Sanitized sensitive data (API keys, tokens)
- Request/response tracking with duration
- Error stack traces
- Daily log rotation (7 days retention, 20MB max)

**Specialized Logging Methods:**

```typescript
// API interactions
logger.logApiRequest('Gemini', { url, method, headers, body });
logger.logApiResponse('Gemini', { statusCode, duration, body });

// Video generation
logger.logVideoGeneration({ id, status, progress, resolution });

// Content validation
logger.logValidationResults({ validator, target, passed, details });

// Test lifecycle
logger.logTestStart(testName);
logger.logTestEnd(testName, status, duration);
```

### Service Object Pattern

Test architecture following Service Object Pattern (POM adapted for APIs):

```
tests/
├── config/
│   └── service-constants.ts        # Centralized config (GEMINI_CONFIG, VIDEO_CONFIG, CONTENT_VALIDATION)
├── page-objects/
│   ├── base/
│   │   └── BaseServiceObject.ts    # Common: executeWithTiming, simulateDelay, logging
│   └── services/
│       ├── GeminiServiceObject.ts  # Gemini API wrapper
│       ├── VideoServiceObject.ts   # Video generation & validation
│       └── ContentValidationServiceObject.ts  # Content quality validation
└── specs/
    ├── prompt5-testlogger-validation.spec.ts  # 3 tests
    ├── service-objects-demo.spec.ts           # 5 tests
    ├── prompt7-video-generation.spec.ts       # 19 tests
    └── prompt8-content-validation.spec.ts     # 23 tests
```

**Usage:**
```typescript
import {
  GeminiServiceObject,
  VideoServiceObject,
  ContentValidationServiceObject
} from './page-objects';
import { GEMINI_CONFIG, VIDEO_CONFIG, CONTENT_VALIDATION } from './config';

// Gemini API
const gemini = new GeminiServiceObject();
const script = await gemini.generateScript('prompt');

// Video generation
const video = new VideoServiceObject();
const result = await video.renderVideo({ title: 'Test', contenido: ['...'] });
const validation = await video.validateVideoFile(result.outputPath);

// Content validation
const validator = new ContentValidationServiceObject();
const structure = await validator.validateScriptStructure(script);
const quality = await validator.validateContentQuality(script);
```

### Running Tests

```bash
# Run all tests
npm test

# Run with UI (interactive mode)
npm run test:ui

# Run specific test files
npm run test:logger    # TestLogger validation (Prompt #5)
npm run test:demo      # Service Objects demo (Prompt #6)

# Run tests by name pattern
npx playwright test -g "should validate"

# Run with visible browser
npm run test:headed

# Debug mode
npm run test:debug

# View HTML report after test run
npm run test:report
```

---

## Implementation Status

### Test Summary

| Test Suite | Tests | Status |
|------------|-------|--------|
| Smoke Paths | 18 | ✅ Passing |
| Config Sync | 5 | ✅ Passing |
| TestLogger Validation (Prompt #5) | 4 | ✅ Passing |
| Service Objects Demo (Prompt #6) | 4 | ✅ Passing |
| Video Generation (Prompt #7) | 19 | ✅ Passing |
| Content Validation (Prompt #8) | 23 | ✅ Passing |
| Video Design (Prompt #10) | 29 | ✅ Passing |
| News Scoring (Prompt #11) | 33 | ✅ Passing |
| Image Search (Prompt #12) | 23 | ✅ Passing |
| Video Optimized (Prompt #13) | 22 | ✅ Passing |
| SafeImage Fix (Prompt #13.1) | 7 | ✅ Passing |
| Cleanup Compositions (Prompt #13.2) | 8 | ✅ Passing |
| Orchestrator (Prompt #14) | 16 | ✅ Passing |
| Notifications (Prompt #14.1) | 12 | ✅ Passing |
| Notification Fix (Prompt #14.2) | 12 | ✅ Passing |
| Gemini Real (Prompt #15) | 27 | ✅ Passing |
| Compliance (Prompt #15) | 18 | ✅ Passing |
| TTS (Prompt #16) | 27 | ✅ Passing |
| Video Rendering (Prompt #17) | 27 | ✅ Passing |
| YouTube Upload (Prompt #18) | 53 | ✅ Passing |
| Output Manager (Prompt #19) | 43 | ✅ Passing |
| Dynamic Images (Prompt #19.1) | 36 | ✅ Passing |
| Specific Queries (Prompt #19.1.6) | 17 | ✅ Passing |
| Sequential Text (Prompt #19.2) | 41 | ✅ Passing |
| No Bullet Points (Prompt #19.2.6) | 21 | ✅ Passing |
| Large Text (Prompt #19.2.7) | 25 | ✅ Passing |
| Image Preload (Prompt #19.3) | 26 | ✅ Passing |
| SafeImage Preload (Prompt #19.3.2) | 17 | ✅ Passing |
| Outro Duration (Prompt #19.4) | 16 | ✅ Passing |
| Visual Queries (Prompt #19.5) | 24 | ✅ Passing |
| Hero Image Fallback (Prompt #19.6) | 10 | ✅ Passing |
| Audio Sync (Prompt #19.7) | 29 | ✅ Passing |
| Dynamic Animations (Prompt #19.8) | 16 | ✅ Passing |
| Outro Scene (Prompt #19.9) | 13 | ✅ Passing |
| Glow Intense (Prompt #19.10) | 13 | ✅ Passing |
| Smooth Transitions (Prompt #19.11) | 37 | ✅ Passing |
| Duration Fix (Prompt #19.12) | 12 | ✅ Passing |
| Tech Editorial (Prompt #20) | 45 | ✅ Passing |
| Anti-Duplication (Prompt #21) | 35 | ✅ Passing |
| News Manager CLI (Prompt #22) | 42 | ✅ Passing |
| Smart Image Selector (Prompt #23) | 49 | ✅ Passing |
| NewsData.io Integration (Prompt #24) | 44 | ✅ Passing |
| Audio Sync Fix (Prompt #25) | 34 | ✅ Passing |
| Hero Audio Bed (Prompt #27) | 23 | ✅ Passing |
| Images Editorial (Prompt #28) | 25 | ✅ Passing |
| Topic Segmentation (Prompt #29) | 35 | ✅ Passing |
| Dynamic Duration (Prompt #30) | 23 | ✅ Passing |
| Premium Background (Prompt #31) | 25 | ✅ Passing |
| Title Card (Prompt #32) | 31 | ✅ Passing |
| Editorial Text (Prompt #33) | 46 | ✅ Passing |
| Visual Emphasis (Prompt #34) | 48 | ✅ Passing |
| Image Editorial Filter (Prompt #35) | 53 | ✅ Passing |
| Editorial Premium Color (Prompt #36) | 30 | ✅ Passing |
| Audio Duration Fix (Prompt #37) | 21 | ✅ Passing |
| Image Render Rules (Prompt #38-Fix2) | 22 | ✅ Passing |
| Typography Hierarchy (Prompt #39-Fix3) | 18 | ✅ Passing |
| Human Rhythm (Prompt #40-Fix4) | 24 | ✅ Passing |
| Editorial Closing (Prompt #41) | 21 | ✅ Passing |
| Text Single Source (Prompt #42) | 37 | ✅ Passing |
| Editorial Integral (Prompt #44) | 22 | ✅ Passing |
| **Total** | **1557** | **✅ All Passing (2 skipped)** |

### Completed (Prompts #4-10)

| Feature | Status | Description |
|---------|--------|-------------|
| EnvironmentManager | ✅ Done | Multi-environment config (dev/staging/prod) |
| AppConfig | ✅ Done | Type-safe configuration access |
| TestLogger | ✅ Done | Structured logging with Winston |
| Playwright Setup | ✅ Done | Test framework configuration |
| Service Objects | ✅ Done | Base, Gemini, Video, ContentValidation |
| Service Constants | ✅ Done | Centralized magic numbers and config values |
| Video Generation Tests | ✅ Done | Rendering, validation, metadata, cleanup (Prompt #7) |
| Content Validation Tests | ✅ Done | Structure, length, topics, images, quality (Prompt #8) |
| CI/CD Pipeline | ✅ Done | GitHub Actions, npm scripts organizados, reporters (Prompt #9) |
| Video Design | ✅ Done | AudioMixer, ProgressBar, Sistema de Temas (Prompt #10) |

**Service Objects Available:**

| Service Object | Methods | Purpose |
|----------------|---------|---------|
| `BaseServiceObject` | `executeWithTiming()`, `simulateDelay()`, logging | Base class for all services |
| `GeminiServiceObject` | `generateScript()`, `generateMultiple()`, `validateApiKey()` | Gemini API wrapper |
| `VideoServiceObject` | `renderVideo()`, `validateVideoFile()`, `getMetadata()`, `validateAudioContent()` | Video generation & validation |
| `ContentValidationServiceObject` | `validateScriptStructure()`, `validateScriptLength()`, `validateTopicDetection()`, `validateImageSearch()`, `validateContentQuality()` | Content quality validation |

**EnvironmentManager Features:**
- Cascading config: `.env` → `.env.local` → `.env.[env]` → `.env.[env].local`
- Built-in validators: `isNotEmpty`, `isUrl`, `isEmail`, `isPort`, etc.
- Environment helpers: `isDevelopment()`, `isStaging()`, `isProduction()`

**TestLogger Features:**
- Log levels: debug, info, warn, error
- Daily rotation (7 days, 20MB max)
- Automatic credential sanitization
- Duration formatting and tracking

**Configuration Constants:**
- `GEMINI_CONFIG` - API settings
- `VIDEO_CONFIG` - Video defaults (1080x1920, 30fps, H.264)
- `VALIDATION_THRESHOLDS` - Video file validation (25-60s, <50MB)
- `REMOTION_CONFIG` - Remotion CLI compositions
- `CONTENT_VALIDATION` - Script structure/length/quality rules
- `MOCK_DELAYS` - Simulated delays for testing

### Completed (Prompts #11-14.2.1)

| Feature | Status | Description |
|---------|--------|-------------|
| News Scoring System | ✅ Done | Rank news by importance (0-37 points) (Prompt #11) |
| Image Search System | ✅ Done | Multi-provider fallback (Clearbit → Logo.dev → Google → Unsplash) (Prompt #12) |
| Video Optimized | ✅ Done | 1 news per video, dynamic effects (zoom, blur, parallax) (Prompt #13) |
| SafeImage Component | ✅ Done | CORS fallback, returns null on error (Prompt #13.1, #38-Fix2) |
| Compositions Cleanup | ✅ Done | Removed obsolete compositions (Prompt #13.2) |
| Orchestrator Pipeline | ✅ Done | 9-step pipeline with publication calendar (Prompt #14) |
| Notification System | ✅ Done | Email (Resend) + Telegram with approval buttons (Prompt #14.1) |
| Notification Fix | ✅ Done | Callback handlers for local development (Prompt #14.2) |
| Storage Fix | ✅ Done | Auto-create temp directories (Prompt #14.2.1) |

### Completed (Prompts #15-19)

| Feature | Status | Description |
|---------|--------|-------------|
| Gemini Script Generation | ✅ Done | Real API with Alex Torres persona + compliance (Prompt #15) |
| ElevenLabs TTS | ✅ Done | Real API with Edge-TTS fallback (Prompt #16) |
| Video Rendering Service | ✅ Done | Remotion CLI integration + subtitles (Prompt #17) |
| YouTube Upload | ✅ Done | OAuth2 + resumable upload + quota management (Prompt #18) |
| Output Manager | ✅ Done | Save outputs + TikTok copy + Dry-Run Real (Prompt #19) |
| Dynamic Images | ✅ Done | Per-segment image orchestration + visual queries (Prompt #19.1-19.6) |
| Sequential Text | ✅ Done | Phrase-based timing, large text, no bullet points (Prompt #19.2) |
| Audio Sync (Whisper) | ✅ Done | Real timestamps text-to-speech sync (Prompt #19.7) |
| Dynamic Animations | ✅ Done | Parallax, zoom, glow, slide effects (Prompt #19.8-19.12) |

### Completed (Prompts #20-44)

| Feature | Status | Description |
|---------|--------|-------------|
| Tech Editorial + Background | ✅ Done | BackgroundDirector, GrainOverlay, LightSweep, editorial theme (Prompt #20) |
| Anti-Duplication | ✅ Done | PublishedNewsTracker, 3-layer dedup (ID, title 80%, company 7d) (Prompt #21) |
| News Manager CLI | ✅ Done | 10 commands: history/active/expired/search/view/unlock/cleanup/clear/stats/help (Prompt #22) |
| Smart Image Selector | ✅ Done | Smart query generator, scoring system, retry alternatives (Prompt #23) |
| NewsData.io Integration | ✅ Done | Real API, NewsEnricher, 81 company aliases (Prompt #24) |
| Audio Sync Fix | ✅ Done | Frame offset, phraseTimestamps pipeline, flash overlay (Prompt #25) |
| Audio Delayed + Dynamic Duration | ✅ Done | Narration starts with ContentScene, duration based on audio (Prompt #26) |
| Hero Audio Bed | ✅ Done | Music bed, scene zoom, background music sequence (Prompt #27) |
| Images Editorial | ✅ Done | 920x520 editorial images, real crossfade, newsTitle queries (Prompt #28) |
| Topic Segmentation | ✅ Done | Topic-aware boundaries, 18 Spanish transition markers (Prompt #29) |
| Dynamic Duration Fix | ✅ Done | calculateMetadata in Root.tsx, breathing room frames (Prompt #30) |
| Premium Background | ✅ Done | Color pulse, accent glow, dual LightSweep, variable grain (Prompt #31) |
| Title Card | ✅ Done | Topic-aware badge, hero image background, 3s overlay (Prompt #32) |
| Editorial Text | ✅ Done | Headline/support/punch blocks, slide by weight, easing (Prompt #33) |
| Visual Emphasis | ✅ Done | Max 3 emphasis moments, scale/dimming/letterSpacing (Prompt #34) |
| Image Editorial Filter | ✅ Done | textRelevance gate, generic penalty, null fallback (Prompt #35) |
| Editorial Premium Color | ✅ Done | Premium colors (#F5F7FA/#C9CED6/#0B0D10), accent #4DA3FF (Prompt #36) |
| Audio Duration Fix | ✅ Done | Whisper override, fallback 48kbps, cap 60s YouTube Shorts (Prompt #37) |
| Image Render Rules | ✅ Done | SafeImage null on error, no image reuse in ContentScene (Prompt #38-Fix2) |
| Typography Hierarchy | ✅ Done | headline 72px, support 54px, punch 84px fixed (Prompt #39-Fix3) |
| Human Rhythm | ✅ Done | Slide/easing by weight, dramatic pauses, ElevenLabs validation (Prompt #40-Fix4) |
| Editorial Closing | ✅ Done | Voice ends before outro, breathing 1.5s, CTA delay 1.5s (Prompt #41) |
| Text Single Source | ✅ Done | Max 1 text per frame, TitleCard→Hero→Content→Outro exclusivity (Prompt #42) |
| Editorial Integral | ✅ Done | Narration from={contentStart}, music bed hero 22%→8%, maxChars 48 (Prompt #44) |

### Pending

| Feature | Status | Description |
|---------|--------|-------------|
| E2E Pipeline | ⏳ Pending | Full integration of YouTubeService in orchestrator step 11 |
| OCR + Thumbnails | ⏳ Pending | Text extraction from images |

---

## Video Specifications

| Property | Value |
|----------|-------|
| Resolution | 1080x1920 (9:16 vertical) |
| Frame Rate | 30 FPS |
| Duration | Dynamic, cap 60s (YouTube Shorts) |
| Video Codec | H.264 |
| Audio Codec | AAC |
| Theme | Tech Editorial (premium colors) |

### Video Structure

| Segment | Duration | Content |
|---------|----------|---------|
| HeroScene | 8s (silent) | Title card overlay (3s), logo, badge contextual |
| ContentScene | max(37s, audioDuration+1s) | Sequential text (headline/support/punch), editorial images, narration |
| Breathing | 1.5s | Pause before outro |
| OutroScene | 5s | CTA with delay 1.5s, fade-out, branding |

- **Crossfade**: 1s (30 frames) between scenes
- **Audio**: Narration starts with ContentScene, music bed ducked (hero 22%, content 8%)
- **Background**: BackgroundDirector (gradient drift + parallax blobs + grain + light sweep + vignette)
- **Images**: 3 max (hero logo, context screenshot, outro hardcoded), 920x520 editorial style

---

## Configuration

### Theme Customization

Active theme: **Tech Editorial** (Prompt #36). Edit `remotion-app/src/styles/themes.ts` to customize:

```typescript
// Premium editorial palette (Prompt #36)
colors: {
  primary: '#F5F7FA',      // Light text
  secondary: '#C9CED6',    // Muted text
  accent: '#4DA3FF',       // Unified accent blue
  darkBg: '#0B0D10',       // Deep background
}
```

Key theme configs: `editorialText`, `visualEmphasis`, `imageAnimation`, `musicBed`, `sceneTransition`, `premiumBackground`, `editorialClosing`.

### Entity Mapping

Add new AI entities in `automation/src/entityMapping.ts`:

```typescript
export const ENTITY_MAP: Record<string, EntityConfig> = {
  mistral: {
    domain: 'mistral.ai',
    displayName: 'Mistral AI',
    category: 'ai-company',
    aliases: ['mistral', 'mixtral'],
  },
};
```

---

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes following existing patterns
3. Add comprehensive JSDoc comments
4. Write tests demonstrating functionality
5. Run validation: `npm run validate`
6. Run tests: `npm test`
7. Commit with descriptive message
8. Push and create pull request

### Code Standards

- **TypeScript** with strict mode enabled
- **JSDoc** comments on all public methods
- **Service Object Pattern** for test organization
- **Structured logging** for all operations
- **Environment-based configuration** (no hardcoded values)

### Commit Message Format

```
type: Short description

- Detailed change 1
- Detailed change 2

Co-Authored-By: Name <email>
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

---

## Resources

### Documentation

| Resource | URL |
|----------|-----|
| Playwright | https://playwright.dev |
| Winston | https://github.com/winstonjs/winston |
| Gemini API | https://ai.google.dev/docs |
| Remotion | https://www.remotion.dev |
| ElevenLabs | https://elevenlabs.io/docs |

### Project Context

- **Target User:** QA Manual transitioning to QA Automation
- **Focus:** Microservices testing with clear explanations
- **Code Style:** Well-commented, educational, maintainable

### Reports

| Report | Description |
|--------|-------------|
| `Security-Review.md` | Full security audit (last run: 2026-01-29) |
| `tests/reports/` | Playwright HTML test reports |
| `tests/logs/` | Test execution logs (JSON, daily rotation) |

---

## Color Reference (Tech Editorial - Prompt #36)

| Color | Hex | Usage |
|-------|-----|-------|
| Light Primary | `#F5F7FA` | Main text |
| Muted Secondary | `#C9CED6` | Support text |
| Accent Blue | `#4DA3FF` | Unified accent, highlights |
| Deep Background | `#0B0D10` | Main background |
| Editorial shadows | subtle | Replaces neon glows (Prompt #20) |

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Contact

- **Repository:** https://github.com/victorpalafox-hub/SintaxisIA
- **Issues:** https://github.com/victorpalafox-hub/SintaxisIA/issues

---

Built with Remotion + Node.js + TypeScript + Playwright
