# CLAUDE.md - Project Context & Working Memory

**Last Updated:** 2026-01-27 18:15 CST

**Auto-Update Status:** This file is automatically maintained by Claude Code

---

## PROJECT IDENTITY

**Project:** Sintaxis IA - Videos Short
**Type:** AI-powered automated video generation with testing framework
**Phase:** Building test automation infrastructure (Prompts #4-9)
**User Profile:** QA Manual transitioning to QA Automation
**Code Style:** TypeScript, heavily commented, educational approach

---

## CURRENT STATE AND PROGRESS

### Completed

**Prompt #4: EnvironmentManager**
- Multi-environment configuration management system
- Files: `src/config/EnvironmentManager.ts`, `AppConfig.ts`, `index.ts`
- Features: Cascading env loading, built-in validators, type-safe access
- Status: Fully functional, committed

**Prompt #5: TestLogger + Playwright Infrastructure**
- Structured logging with Winston and test framework setup
- Files: `tests/utils/TestLogger.ts`, `log-formatter.ts`, `tests/config/test-constants.ts`
- Files: `tests/specs/example.spec.ts`, `playwright.config.ts`
- Features: Daily log rotation, API/Video/Validation logging, credential sanitization
- Test Results: 4/4 passing
- Scripts Added: test, test:ui, test:example, test:report, test:headed, test:debug
- Status: Fully functional, committed

**Prompt #6: Service Objects**
- Base architecture for Service Object Pattern (POM for APIs)
- Files Created:
  - `tests/page-objects/base/BaseServiceObject.ts` - Parent class with logging/timing
  - `tests/page-objects/services/GeminiServiceObject.ts` - Gemini API wrapper (mock)
  - `tests/page-objects/services/VideoServiceObject.ts` - Video service wrapper (mock)
  - `tests/page-objects/index.ts` - Central exports
  - `tests/temp/.gitkeep` - Temp directory for videos
- Features:
  - `BaseServiceObject`: executeWithTiming(), logInfo/Debug/Warn/Error(), formatDuration()
  - `GeminiServiceObject`: generateScript(), generateMultiple(), validateApiKey()
  - `VideoServiceObject`: generateVideo(), getMetadata(), validateTextContent(), validateAudioContent(), validateSync(), cleanup()
- Mock implementations with realistic delays (1000-2000ms)
- Comprehensive JSDoc on all public methods
- TypeScript compiles without errors
- All tests passing (4/4)
- Auto-review passing (8/8)
- Status: Fully functional, ready for commit

---

### Pending (Prompts #7-9)

**Prompt #7: Real Gemini API Integration**
- Replace mocks in GeminiServiceObject with actual API calls
- Test real Gemini API endpoints
- Error handling for rate limits, timeouts, auth errors
- Create API-specific test suite in `tests/specs/api/`

**Prompt #8: Real Video Generation**
- Integrate Remotion for actual video rendering
- Use FFprobe for real metadata extraction
- Test video generation pipeline
- Create video-specific test suite in `tests/specs/video/`

**Prompt #9: Content Validation**
- Implement OCR with Tesseract.js for text validation
- Implement Speech-to-Text for audio validation
- Implement audio-text synchronization checking
- Create content validation test suite in `tests/specs/content/`
- Create E2E pipeline tests in `tests/specs/e2e/`

---

## PROJECT STRUCTURE

```
sintaxis-ia/
├── automation/                       # Content generation pipeline
│   ├── src/                          # Automation source code
│   │   ├── codeValidator.ts          # Auto-review system
│   │   ├── watcher.ts                # File change monitor
│   │   └── ...                       # Other automation files
│   └── package.json
│
├── remotion-app/                     # Video rendering application
│   ├── src/
│   │   ├── Video.tsx                 # Main composition
│   │   ├── theme.ts                  # Centralized theme
│   │   └── components/               # Video components
│   └── package.json
│
├── src/                              # Shared Production Code
│   └── config/
│       ├── EnvironmentManager.ts     # Env loader with validators
│       ├── AppConfig.ts              # Typed config access
│       └── index.ts                  # Exports
│
├── tests/                            # Test Automation Suite
│   ├── config/
│   │   ├── test-constants.ts         # Test constants
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── TestLogger.ts             # Structured logger
│   │   ├── log-formatter.ts          # Winston formatters
│   │   └── index.ts
│   │
│   ├── page-objects/                 # Service Objects
│   │   ├── base/
│   │   │   └── BaseServiceObject.ts  # Parent class
│   │   ├── services/
│   │   │   ├── GeminiServiceObject.ts   # Gemini wrapper (mock)
│   │   │   └── VideoServiceObject.ts    # Video wrapper (mock)
│   │   └── index.ts                  # Exports
│   │
│   ├── specs/
│   │   ├── example.spec.ts           # Example tests (4 tests)
│   │   ├── api/                      # API tests (Prompt #7)
│   │   ├── video/                    # Video tests (Prompt #8)
│   │   ├── content/                  # Validation tests (Prompt #9)
│   │   └── e2e/                      # E2E tests (Prompt #9)
│   │
│   ├── logs/                         # Auto-generated logs (gitignored)
│   ├── reports/                      # HTML reports (gitignored)
│   └── temp/                         # Temp video files (gitignored)
│
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── playwright.config.ts              # Playwright configuration
├── package.json                      # Root package with scripts
├── README.md                         # Project documentation
├── CLAUDE.md                         # This file (auto-maintained)
└── tsconfig.json                     # TypeScript config
```

---

## KEY TECHNOLOGIES

| Technology | Purpose | Status |
|------------|---------|--------|
| TypeScript | Type-safe development | Configured |
| Playwright | Test automation framework | Installed & configured |
| Winston | Structured logging | Integrated in tests |
| Node.js | Runtime environment | Active |
| Gemini API | AI script generation | Mock ready |
| Remotion | Video rendering | Pending integration |
| FFmpeg | Video processing | Pending integration |
| Tesseract.js | OCR for text validation | Pending integration |

---

## CODING STANDARDS

### TypeScript Style
- Use strict typing (no `any`)
- Comprehensive JSDoc on all public methods
- Include usage examples in comments

### Service Object Pattern
```typescript
// All service interactions through Service Objects
import { GeminiServiceObject, VideoServiceObject } from './page-objects';

const gemini = new GeminiServiceObject();
const result = await gemini.generateScript('prompt');
```

### Test Organization
- Use beforeEach/afterEach for setup/teardown
- Follow AAA pattern (Arrange, Act, Assert)
- Use TestLogger for all logging

### Logging Philosophy
- Log ALL API requests/responses
- Log ALL video generation phases
- Log ALL validations
- Sanitize sensitive data automatically

---

## COMMON COMMANDS

```bash
# Testing
npm test                  # Run all tests
npm run test:ui           # Playwright UI
npm run test:example      # Run example suite
npm run test:report       # View HTML report

# Validation
npm run validate          # Run code auto-review (6 categories)
npm run check             # TypeScript type checking

# Git
git status
git add .
git commit -m "feat: Description"
git push origin main
```

---

## NEXT IMMEDIATE TASK

**Task:** Commit Prompt #6 changes, then proceed to Prompt #7

**Files to Commit:**
- `tests/page-objects/base/BaseServiceObject.ts`
- `tests/page-objects/services/GeminiServiceObject.ts`
- `tests/page-objects/services/VideoServiceObject.ts`
- `tests/page-objects/index.ts`
- `tests/temp/.gitkeep`
- `.gitignore` (updated with tests/temp rules)
- `CLAUDE.md` (this file)

**Prompt #7 Will:**
- Replace mock implementations with real Gemini API calls
- Add proper error handling
- Create `tests/specs/api/gemini.spec.ts`

---

## SERVICE OBJECTS REFERENCE

### BaseServiceObject
```typescript
// Parent class for all service objects
protected logger: TestLogger;
protected serviceName: string;

protected executeWithTiming<T>(actionName: string, action: () => Promise<T>): Promise<TimedResult<T>>
protected logInfo/logDebug/logWarn/logError(message: string, context?: any): void
protected formatDuration(ms: number): string
```

### GeminiServiceObject
```typescript
// Methods available
async generateScript(prompt: string, options?: GenerateOptions): Promise<ScriptResult>
async generateMultiple(prompts: string[], options?: GenerateOptions): Promise<ScriptResult[]>
async validateApiKey(): Promise<boolean>

// Types
interface GenerateOptions { maxTokens?: number; temperature?: number; topP?: number; }
interface ScriptResult { script: string; tokensUsed: number; duration: number; timestamp: string; }
```

### VideoServiceObject
```typescript
// Methods available
async generateVideo(config: VideoConfig): Promise<string>
async getMetadata(videoPath: string): Promise<VideoMetadata>
async validateTextContent(videoPath: string, expectedTexts: string[]): Promise<TextValidation>
async validateAudioContent(videoPath: string): Promise<AudioValidation>
async validateSync(videoPath: string): Promise<SyncValidation>
async cleanup(): Promise<void>

// Key types
interface VideoConfig { script: string; duration: number; fps?: number; resolution?: {...} }
interface VideoMetadata { duration: number; fps: number; width: number; height: number; codec: string; fileSize: number; }
```

---

## IMPORTANT CONTEXT FOR CLAUDE CODE

### When Starting New Session
1. Read this CLAUDE.md first
2. Check "Current State and Progress" section
3. Review "Next Immediate Task"
4. Continue from where previous session left off

### Auto-Update Rules
After completing ANY significant action, update this file:
- Move items from "Pending" to "Completed"
- Add new files to structure overview
- Update "Next Immediate Task"
- Add timestamp to "Last Updated"

### File Placement Rules
| Content Type | Location |
|-------------|----------|
| New tests | `tests/specs/[category]/` |
| Service Objects | `tests/page-objects/services/` |
| Test utilities | `tests/utils/` |
| Production services | `src/services/` |
| Configuration | `src/config/` or `tests/config/` |

---

## GIT STATUS

**Current Branch:** main
**Last Commit:** `44a6e54` - docs: Add comprehensive project documentation

**Pending Changes:**
- Service Objects (Prompt #6) - Ready to commit

---

## ARCHITECTURAL DECISIONS

- **Service Objects:** Encapsulate service interactions, separate from test logic
- **Separate tests/ from src/:** Clear separation of production vs test code
- **Winston for Logging:** Structured JSON logs, automatic rotation
- **Multi-Environment:** Ready for dev/staging/prod from the start
- **Mock First:** Start with mocks, replace with real implementations gradually

---

**[Claude Code: Remember to update this file after completing tasks]**
