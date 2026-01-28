/**
 * @fileoverview Service Objects Index - Central export for all service objects
 *
 * This module provides a single import point for all service objects
 * in the test automation framework. It follows the Service Object Pattern
 * (Page Object Model adapted for API/service testing).
 *
 * @description
 * Service Objects encapsulate interactions with external services,
 * providing:
 * - Consistent logging and error handling
 * - Type-safe interfaces
 * - Reusable test utilities
 * - Easy mocking for unit tests
 *
 * @example
 * // Import all service objects
 * import {
 *   BaseServiceObject,
 *   GeminiServiceObject,
 *   VideoServiceObject
 * } from './page-objects';
 *
 * @example
 * // Import specific service
 * import { GeminiServiceObject } from './page-objects';
 *
 * const gemini = new GeminiServiceObject();
 * const result = await gemini.generateScript('Create a video about AI');
 *
 * @example
 * // Import types
 * import type {
 *   GenerateOptions,
 *   ScriptResult,
 *   VideoConfig,
 *   VideoMetadata
 * } from './page-objects';
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

// ============================================================================
// BASE SERVICE OBJECT
// ============================================================================

/**
 * Base class for all service objects
 *
 * Provides common functionality:
 * - Structured logging (logInfo, logDebug, logWarn, logError)
 * - Execution timing (executeWithTiming)
 * - Service identification (serviceName)
 *
 * @see {@link BaseServiceObject} for detailed documentation
 */
export { BaseServiceObject, TimedResult } from './base/BaseServiceObject';

// ============================================================================
// GEMINI SERVICE OBJECT
// ============================================================================

/**
 * Service object for Gemini API interactions
 *
 * Wraps all Gemini API calls with logging and timing.
 * Currently uses mock implementation for testing.
 *
 * Methods:
 * - generateScript(prompt, options?) - Generate a single script
 * - generateMultiple(prompts, options?) - Generate multiple scripts in parallel
 * - validateApiKey() - Check if API key is valid
 *
 * @see {@link GeminiServiceObject} for detailed documentation
 */
export {
  GeminiServiceObject,
  GenerateOptions,
  ScriptResult,
} from './services/GeminiServiceObject';

// ============================================================================
// VIDEO SERVICE OBJECT
// ============================================================================

/**
 * Service object for video generation and validation
 *
 * Wraps video operations with logging and timing.
 * Currently uses mock implementation for testing.
 *
 * Methods:
 * - generateVideo(config) - Generate a video from configuration
 * - getMetadata(videoPath) - Extract video metadata
 * - validateTextContent(videoPath, expectedTexts) - OCR validation
 * - validateAudioContent(videoPath) - Audio/STT validation
 * - validateSync(videoPath) - Audio-text sync validation
 * - cleanup() - Remove temporary files
 *
 * @see {@link VideoServiceObject} for detailed documentation
 */
export {
  VideoServiceObject,
  VideoConfig,
  VideoMetadata,
  TextValidation,
  AudioValidation,
  SyncValidation,
  SyncIssue,
  ScriptData,
  RenderOptions,
  VideoRenderResult,
  VideoFileValidation,
} from './services/VideoServiceObject';

// ============================================================================
// CONTENT VALIDATION SERVICE OBJECT
// ============================================================================

/**
 * Service object for content validation
 *
 * Validates script structure, length, topics, images, and quality.
 * Currently uses mock implementation for testing.
 *
 * Methods:
 * - validateScriptStructure(script) - Validate script has all required elements
 * - validateScriptLength(script) - Validate content length for TTS
 * - validateTopicDetection(content, topic) - Validate detected topic
 * - validateImageSearch(topic, imageUrl) - Validate image URL
 * - validateContentQuality(script) - Validate content quality
 *
 * @see {@link ContentValidationServiceObject} for detailed documentation
 */
export {
  ContentValidationServiceObject,
  VideoScript,
  ScriptStructureValidation,
  ScriptLengthValidation,
  TopicValidation,
  ImageValidation,
  ContentQualityValidation,
} from './services/ContentValidationServiceObject';

// ============================================================================
// TYPE RE-EXPORTS (for convenience)
// ============================================================================

/**
 * All exported types for easy importing
 *
 * @example
 * import type {
 *   GenerateOptions,
 *   ScriptResult,
 *   VideoConfig,
 *   VideoMetadata,
 *   TextValidation,
 *   AudioValidation,
 *   SyncValidation,
 *   SyncIssue,
 *   TimedResult
 * } from './page-objects';
 */

// ============================================================================
// DEFAULT EXPORT (optional - for simpler imports)
// ============================================================================

/**
 * Default export containing all service objects
 *
 * @example
 * import ServiceObjects from './page-objects';
 *
 * const gemini = new ServiceObjects.GeminiServiceObject();
 * const video = new ServiceObjects.VideoServiceObject();
 * const contentValidator = new ServiceObjects.ContentValidationServiceObject();
 */
import { BaseServiceObject } from './base/BaseServiceObject';
import { GeminiServiceObject } from './services/GeminiServiceObject';
import { VideoServiceObject } from './services/VideoServiceObject';
import { ContentValidationServiceObject } from './services/ContentValidationServiceObject';

export default {
  BaseServiceObject,
  GeminiServiceObject,
  VideoServiceObject,
  ContentValidationServiceObject,
};
