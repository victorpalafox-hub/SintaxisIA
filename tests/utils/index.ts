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

export {
  runTests,
  readTestResults,
  hasTestResults,
  generateTestSummary,
  getFailedTests,
  printSummary,
  AVAILABLE_SUITES,
  type TestRunOptions,
  type TestResults,
  type TestSuite,
  type TestSpec,
  type TestSummary,
} from './test-runner';
