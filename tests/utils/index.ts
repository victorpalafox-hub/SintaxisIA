// ===================================
// TEST UTILS - Exportaciones principales
// ===================================

export {
  TestLogger,
  getTestLogger,
  resetTestLogger,
  type ApiRequestData,
  type ApiResponseData,
  type VideoGenerationData,
  type ValidationData,
  type TestExecutionSummary,
  type TestLoggerOptions,
} from './TestLogger';

export {
  timestampFormat,
  consoleFormat,
  jsonFileFormat,
  combinedConsoleFormat,
  combinedJsonFormat,
  formatBytes,
  formatDuration,
  sanitizeSensitiveData,
} from './log-formatter';
