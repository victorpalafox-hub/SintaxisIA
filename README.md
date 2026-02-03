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
| `npm test` | Run all Playwright tests (430 tests) |
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
| Smoke Paths | 18 | ✅ Passing |
| Config Sync | 5 | ✅ Passing |
| **Total** | **430** | **✅ All Passing (4 skipped)** |

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
| SafeImage Component | ✅ Done | CORS fallback with UI Avatars placeholders (Prompt #13.1) |
| Compositions Cleanup | ✅ Done | Removed obsolete compositions (Prompt #13.2) |
| Orchestrator Pipeline | ✅ Done | 9-step pipeline with publication calendar (Prompt #14) |
| Notification System | ✅ Done | Email (Resend) + Telegram with approval buttons (Prompt #14.1) |
| Notification Fix | ✅ Done | Callback handlers for local development (Prompt #14.2) |
| Storage Fix | ✅ Done | Auto-create temp directories (Prompt #14.2.1) |

### Completed (Prompts #15-18)

| Feature | Status | Description |
|---------|--------|-------------|
| Gemini Script Generation | ✅ Done | Real API with Alex Torres persona + compliance (Prompt #15) |
| ElevenLabs TTS | ✅ Done | Real API with Edge-TTS fallback (Prompt #16) |
| Video Rendering Service | ✅ Done | Remotion CLI integration + subtitles (Prompt #17) |
| YouTube Upload | ✅ Done | OAuth2 + resumable upload + quota management (Prompt #18) |
| Output Manager | ✅ Done | Save outputs + TikTok copy + Dry-Run Real (Prompt #19) |

### Pending (Prompt #20+)

| Feature | Status | Description |
|---------|--------|-------------|
| Visual Identity | ⏳ Pending | Humanized branding (Prompt #20) |
| E2E Pipeline | ⏳ Pending | Full integration of YouTubeService (Prompt #21) |
| OCR + Thumbnails | ⏳ Pending | Text extraction from images (Prompt #22) |

---

## Video Specifications

| Property | Value |
|----------|-------|
| Resolution | 1080x1920 (9:16 vertical) |
| Frame Rate | 30 FPS |
| Duration | 60 seconds |
| Video Codec | H.264 |
| Audio Codec | AAC |
| Watermark | Bottom-right, 30% opacity |

### Video Structure

| Segment | Time | Content |
|---------|------|---------|
| Hook | 0-3s | Explosive intro with logo |
| Headline | 3-8s | News title |
| Content | 8-50s | Main points with subtitles |
| Impact | 50-55s | Key data highlight |
| Outro | 55-60s | CTA and branding |

---

## Configuration

### Theme Customization

Edit `remotion-app/src/theme.ts` to customize colors:

```typescript
export const theme = {
  colors: {
    primary: '#00f0ff',      // Cyan - main color
    secondary: '#ff0099',    // Magenta - secondary
    accent: '#cc00ff',       // Purple - accent
    gold: '#ffd700',         // Gold - impact
    red: '#ff3366',          // Red - alerts
    darkBg: '#0a0a0f',       // Main background
  },
  fonts: {
    main: 'Arial, sans-serif',
    title: 'Arial Black, sans-serif',
  },
};
```

### Highlight Keywords

Keywords highlighted in subtitles (defined in `theme.ts`):

```typescript
export const HIGHLIGHT_KEYWORDS = [
  'OpenAI', 'Claude', 'GPT', 'Gemini', 'IA', 'AI',
  'ChatGPT', 'Anthropic', 'Google', 'Microsoft',
  // Add more keywords here
];
```

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

## Color Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Cyan Primary | `#00f0ff` | Main color |
| Magenta Secondary | `#ff0099` | Accents |
| Purple Accent | `#cc00ff` | Gradients |
| Dark Background | `#0a0a0f` | Background |
| Gold | `#ffd700` | Impact highlights |
| Red | `#ff3366` | Alerts |

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Contact

- **Repository:** https://github.com/victorpalafox-hub/SintaxisIA
- **Issues:** https://github.com/victorpalafox-hub/SintaxisIA/issues

---

Built with Remotion + Node.js + TypeScript + Playwright
