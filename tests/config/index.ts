// ===================================
// TEST CONFIG - Exportaciones principales
// ===================================

export {
  LOG_LEVELS,
  LOG_LEVEL_PRIORITIES,
  LOG_LEVEL_COLORS,
  LOG_PATHS,
  LOG_RETENTION,
  TIMESTAMP_CONFIG,
  LOG_CATEGORIES,
  TEST_STATUS,
  CONSOLE_CONFIG,
  type LogLevel,
  type LogCategory,
  type TestStatus,
} from './test-constants';

export {
  GEMINI_CONFIG,
  VIDEO_CONFIG,
  MOCK_DELAYS,
  VALIDATION_THRESHOLDS,
  MOCK_VALIDATION_VALUES,
  REMOTION_CONFIG,
  CONTENT_VALIDATION,
  CONTENT_VALIDATION_DELAYS,
  // Configuración centralizada de timeouts
  TIMEOUTS,
  getTimeout,
  isShortTimeout,
  logTimeoutConfig,
  type TimeoutType,
} from './service-constants';
