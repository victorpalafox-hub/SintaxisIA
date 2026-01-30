/**
 * @fileoverview Video Service Object - Wrapper for video generation and validation
 *
 * This module provides a service object that encapsulates all video-related
 * operations for testing purposes. It handles video generation simulation,
 * metadata extraction, and content validation.
 *
 * @description
 * The VideoServiceObject is designed to:
 * - Simulate video generation with Remotion
 * - Extract and validate video metadata
 * - Perform content validation (text, audio, sync)
 * - Manage temporary test files
 * - Provide realistic mock data for test development
 *
 * CURRENT STATUS: MOCK IMPLEMENTATION
 * This version uses simulated operations for development.
 * Real video processing (FFmpeg, Tesseract, etc.) will be
 * implemented in future prompts.
 *
 * @example
 * // Basic usage
 * const video = new VideoServiceObject();
 *
 * // Generate a video
 * const videoPath = await video.generateVideo({
 *   script: 'AI is transforming the world...',
 *   duration: 30
 * });
 *
 * // Validate content
 * const textValidation = await video.validateTextContent(
 *   videoPath,
 *   ['AI', 'transforming', 'world']
 * );
 *
 * // Clean up when done
 * await video.cleanup();
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

import { BaseServiceObject } from '../base/BaseServiceObject';
import * as fs from 'fs';
import * as path from 'path';
import {
  VIDEO_CONFIG,
  MOCK_DELAYS,
  MOCK_VALIDATION_VALUES,
  VALIDATION_THRESHOLDS,
  REMOTION_CONFIG,
  // Configuración centralizada de timeouts
  isShortTimeout,
  TIMEOUTS,
} from '../../config/service-constants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Configuration for video generation
 *
 * @interface VideoConfig
 *
 * @property {string} script - The script/content for the video
 * @property {number} duration - Video duration in seconds
 * @property {number} [fps=30] - Frames per second
 * @property {object} [resolution] - Video resolution
 * @property {number} [resolution.width=1080] - Width in pixels
 * @property {number} [resolution.height=1920] - Height in pixels
 */
export interface VideoConfig {
  /** The script content for the video */
  script: string;
  /** Duration in seconds */
  duration: number;
  /** Frames per second (default: 30) */
  fps?: number;
  /** Video resolution */
  resolution?: {
    /** Width in pixels (default: 1080) */
    width: number;
    /** Height in pixels (default: 1920) */
    height: number;
  };
}

/**
 * Video metadata extracted from file
 *
 * @interface VideoMetadata
 */
export interface VideoMetadata {
  /** Duration in seconds */
  duration: number;
  /** Frames per second */
  fps: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Video codec (e.g., 'h264') */
  codec: string;
  /** File size in bytes */
  fileSize: number;
  /** File size formatted (e.g., '15.5 MB') */
  fileSizeMB: string;
}

/**
 * Result of text content validation
 *
 * @interface TextValidation
 */
export interface TextValidation {
  /** Whether all expected texts were found */
  allFound: boolean;
  /** List of texts that were found */
  found: string[];
  /** List of texts that were not found */
  missing: string[];
}

/**
 * Result of audio content validation
 *
 * @interface AudioValidation
 */
export interface AudioValidation {
  /** Whether audio track exists */
  hasAudio: boolean;
  /** Audio duration in seconds */
  duration?: number;
  /** Transcribed text from audio */
  transcription?: string;
}

/**
 * Result of audio-text synchronization validation
 *
 * @interface SyncValidation
 */
export interface SyncValidation {
  /** Whether sync is within acceptable threshold */
  passed: boolean;
  /** Maximum offset in milliseconds */
  maxOffset: number;
  /** Average offset in milliseconds */
  avgOffset: number;
  /** List of sync issues found */
  issues: SyncIssue[];
}

/**
 * A single synchronization issue
 *
 * @interface SyncIssue
 */
export interface SyncIssue {
  /** Timestamp in seconds where issue occurs */
  timestamp: number;
  /** Offset in milliseconds (positive = audio ahead) */
  offset: number;
  /** Severity level */
  severity: 'low' | 'medium' | 'high';
}

/**
 * Datos del script para renderizado de video
 *
 * @interface ScriptData
 */
export interface ScriptData {
  /** Titulo del video */
  title: string;
  /** Gancho inicial (hook) */
  gancho?: string;
  /** Contenido principal (array de frases) */
  contenido: string[];
  /** Mensaje de impacto */
  impacto?: string;
  /** Call to action */
  cta?: string;
  /** Tags/etiquetas */
  tags?: string[];
}

/**
 * Opciones para el renderizado de video
 *
 * @interface RenderOptions
 */
export interface RenderOptions {
  /** Composicion de Remotion a usar (default: AINewsShort-Preview para tests) */
  composition?: 'AINewsShort' | 'AINewsShort-Preview';
  /** Timeout en milisegundos */
  timeout?: number;
  /** Nombre del archivo de salida (sin extension) */
  outputName?: string;
}

/**
 * Resultado del renderizado de video
 *
 * @interface VideoRenderResult
 */
export interface VideoRenderResult {
  /** Si el renderizado fue exitoso */
  success: boolean;
  /** Ruta al archivo de video generado */
  outputPath: string;
  /** Duracion del renderizado en milisegundos */
  renderDuration: number;
  /** Metadatos del video (si disponible) */
  metadata?: VideoMetadata;
  /** Mensaje de error si fallo */
  error?: string;
}

/**
 * Resultado de la validacion completa del archivo de video
 *
 * @interface VideoFileValidation
 */
export interface VideoFileValidation {
  /** Si todas las validaciones pasaron */
  isValid: boolean;
  /** Si el archivo existe y es legible */
  fileExists: boolean;
  /** Si el formato es MP4 */
  isMP4: boolean;
  /** Si la resolucion es correcta (1080x1920) */
  hasCorrectResolution: boolean;
  /** Si la duracion esta en rango (25-60s) */
  hasDurationInRange: boolean;
  /** Si el codec es H.264 */
  hasH264Codec: boolean;
  /** Si tiene audio */
  hasAudio: boolean;
  /** Si el tamaño es razonable (<50MB) */
  hasReasonableSize: boolean;
  /** Metadatos extraidos */
  metadata?: VideoMetadata;
  /** Lista de errores encontrados */
  errors: string[];
  /** Lista de advertencias */
  warnings: string[];
}

// ============================================================================
// VIDEO SERVICE OBJECT
// ============================================================================

/**
 * Video Service Object - Encapsulates video generation and validation
 *
 * This service object provides a clean, typed interface for all
 * video-related operations in the test framework. It handles:
 * - Video generation simulation (mock Remotion rendering)
 * - Metadata extraction (mock FFprobe)
 * - Text validation (mock OCR/Tesseract)
 * - Audio validation (mock FFmpeg/STT)
 * - Sync validation (mock audio-text alignment)
 * - Temporary file management
 *
 * CURRENT STATUS: Mock implementation for testing framework development.
 * Real video processing will be integrated in future prompts.
 *
 * @extends BaseServiceObject
 *
 * @example
 * // Complete video generation and validation workflow
 * const video = new VideoServiceObject();
 *
 * try {
 *   // Generate video
 *   const videoPath = await video.generateVideo({
 *     script: 'La IA está revolucionando todo...',
 *     duration: 30,
 *     fps: 30,
 *     resolution: { width: 1080, height: 1920 }
 *   });
 *
 *   // Get metadata
 *   const metadata = await video.getMetadata(videoPath);
 *   console.log(`Video: ${metadata.duration}s, ${metadata.fileSizeMB}`);
 *
 *   // Validate text appears in video
 *   const textCheck = await video.validateTextContent(videoPath, [
 *     'IA', 'revolucionando'
 *   ]);
 *   expect(textCheck.allFound).toBe(true);
 *
 *   // Validate audio
 *   const audioCheck = await video.validateAudioContent(videoPath);
 *   expect(audioCheck.hasAudio).toBe(true);
 *
 *   // Validate sync
 *   const syncCheck = await video.validateSync(videoPath);
 *   expect(syncCheck.passed).toBe(true);
 *
 * } finally {
 *   // Always cleanup
 *   await video.cleanup();
 * }
 */
export class VideoServiceObject extends BaseServiceObject {
  /**
   * Directory for temporary video files
   * @private
   */
  private tempDir: string;

  /**
   * List of generated video files for cleanup tracking
   * @private
   */
  private generatedFiles: string[] = [];

  /**
   * Default video configuration
   * @private
   */
  private defaultConfig: Required<Omit<VideoConfig, 'script' | 'duration'>> & {
    script: string;
    duration: number;
  };

  /**
   * Creates an instance of VideoServiceObject
   *
   * Initializes the service and creates the temp directory
   * if it doesn't exist.
   *
   * @example
   * const video = new VideoServiceObject();
   */
  constructor() {
    super('VideoService');

    // Set up temp directory path
    this.tempDir = path.join(process.cwd(), 'tests', 'temp');

    // Create temp directory if it doesn't exist
    this.ensureTempDir();

    // Set default configuration
    this.defaultConfig = {
      script: '',
      duration: VIDEO_CONFIG.DEFAULT_DURATION,
      fps: VIDEO_CONFIG.DEFAULT_FPS,
      resolution: {
        width: VIDEO_CONFIG.DEFAULT_RESOLUTION.WIDTH,
        height: VIDEO_CONFIG.DEFAULT_RESOLUTION.HEIGHT,
      },
    };

    this.logInfo('VideoServiceObject initialized', {
      tempDir: this.tempDir,
    });
  }

  /**
   * Generates a video from the provided configuration
   *
   * Simulates the Remotion video generation process with
   * progress logging at each phase:
   * - 0%: Initializing
   * - 25%: Rendering frames
   * - 50%: Applying effects
   * - 75%: Encoding video
   * - 100%: Complete
   *
   * CURRENT: Creates a placeholder .mp4 file for testing.
   * FUTURE: Will integrate with actual Remotion rendering.
   *
   * @param {VideoConfig} config - Video generation configuration
   *   Required: script, duration
   *   Optional: fps (default 30), resolution (default 1080x1920)
   *
   * @returns {Promise<string>} Absolute path to the generated video file
   *
   * @throws {Error} If generation fails
   *
   * @example
   * // Basic generation
   * const videoPath = await video.generateVideo({
   *   script: 'Hello, AI world!',
   *   duration: 15
   * });
   *
   * @example
   * // With full configuration
   * const videoPath = await video.generateVideo({
   *   script: 'La inteligencia artificial...',
   *   duration: 60,
   *   fps: 30,
   *   resolution: { width: 1080, height: 1920 }
   * });
   */
  async generateVideo(config: VideoConfig): Promise<string> {
    // Merge with defaults
    const fullConfig = {
      ...this.defaultConfig,
      ...config,
      resolution: {
        ...this.defaultConfig.resolution,
        ...config.resolution,
      },
    };

    // Generate unique video ID
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const videoPath = path.join(this.tempDir, `${videoId}.mp4`);

    this.logInfo('Starting video generation', {
      videoId,
      duration: fullConfig.duration,
      fps: fullConfig.fps,
      resolution: `${fullConfig.resolution.width}x${fullConfig.resolution.height}`,
    });

    // Log video generation start
    this.getLogger().logVideoGeneration({
      videoId,
      title: `Generated Video - ${videoId}`,
      status: 'started',
      resolution: fullConfig.resolution,
      durationSeconds: fullConfig.duration,
      fps: fullConfig.fps,
    });

    // Execute generation with timing
    const { duration: totalDuration } = await this.executeWithTiming(
      'generateVideo',
      async () => {
        // Simulate rendering phases using configured delays
        const phases = MOCK_DELAYS.VIDEO_RENDER_PHASES;
        await this.simulateRenderingPhase('Initializing', 0, phases.INITIALIZE);
        await this.simulateRenderingPhase('Rendering frames', 25, phases.RENDER_FRAMES);
        await this.simulateRenderingPhase('Applying effects', 50, phases.APPLY_EFFECTS);
        await this.simulateRenderingPhase('Encoding video', 75, phases.ENCODE_VIDEO);
        await this.simulateRenderingPhase('Finalizing', 90, phases.FINALIZE);

        // Create placeholder video file
        // In real implementation, this would be the Remotion output
        await this.createPlaceholderVideo(videoPath, fullConfig);

        return videoPath;
      }
    );

    // Track file for cleanup
    this.generatedFiles.push(videoPath);

    // Calculate mock file size based on duration and resolution
    const fileSize = this.estimateFileSize(fullConfig);

    // Log completion
    this.getLogger().logVideoGeneration({
      videoId,
      title: `Generated Video - ${videoId}`,
      status: 'completed',
      resolution: fullConfig.resolution,
      durationSeconds: fullConfig.duration,
      fps: fullConfig.fps,
      fileSize,
      outputPath: videoPath,
      progress: 100,
    });

    this.logInfo('Video generation completed', {
      videoId,
      path: videoPath,
      totalDuration: `${totalDuration}ms`,
      fileSize: this.formatFileSize(fileSize),
    });

    return videoPath;
  }

  /**
   * Extracts metadata from a video file
   *
   * Returns information about the video including duration,
   * resolution, codec, and file size.
   *
   * CURRENT: Returns mock metadata based on expected values.
   * FUTURE: Will use FFprobe for actual extraction.
   *
   * @param {string} videoPath - Path to the video file
   *
   * @returns {Promise<VideoMetadata>} Video metadata object
   *
   * @example
   * const metadata = await video.getMetadata('/path/to/video.mp4');
   * console.log(`Duration: ${metadata.duration}s`);
   * console.log(`Resolution: ${metadata.width}x${metadata.height}`);
   * console.log(`Size: ${metadata.fileSizeMB}`);
   */
  async getMetadata(videoPath: string): Promise<VideoMetadata> {
    this.logInfo('Extracting video metadata', { videoPath });

    const { result, duration } = await this.executeWithTiming(
      'getMetadata',
      async () => {
        // Simulate FFprobe delay
        await this.simulateDelay(MOCK_DELAYS.METADATA_EXTRACTION);

        // Check if file exists
        if (!fs.existsSync(videoPath)) {
          throw new Error(`Video file not found: ${videoPath}`);
        }

        // Get actual file size
        const stats = fs.statSync(videoPath);
        const fileSize = stats.size;

        // Return mock metadata
        // In real implementation, would parse FFprobe output
        const metadata: VideoMetadata = {
          duration: VIDEO_CONFIG.DEFAULT_DURATION,
          fps: VIDEO_CONFIG.DEFAULT_FPS,
          width: VIDEO_CONFIG.DEFAULT_RESOLUTION.WIDTH,
          height: VIDEO_CONFIG.DEFAULT_RESOLUTION.HEIGHT,
          codec: VIDEO_CONFIG.DEFAULT_CODEC,
          fileSize,
          fileSizeMB: this.formatFileSize(fileSize),
        };

        return metadata;
      }
    );

    this.logDebug('Metadata extracted', {
      ...result,
      extractionTime: `${duration}ms`,
    });

    return result;
  }

  /**
   * Validates that expected texts appear in the video
   *
   * Uses OCR to extract text from video frames and checks
   * if all expected texts are present.
   *
   * CURRENT: Returns mock validation (all texts found).
   * FUTURE: Will use Tesseract.js for actual OCR.
   *
   * @param {string} videoPath - Path to the video file
   * @param {string[]} expectedTexts - Array of texts to look for
   *
   * @returns {Promise<TextValidation>} Validation result with found/missing lists
   *
   * @example
   * const result = await video.validateTextContent(videoPath, [
   *   'Inteligencia Artificial',
   *   'OpenAI',
   *   'Futuro'
   * ]);
   *
   * if (!result.allFound) {
   *   console.log('Missing texts:', result.missing);
   * }
   */
  async validateTextContent(
    videoPath: string,
    expectedTexts: string[]
  ): Promise<TextValidation> {
    this.logInfo('Validating text content', {
      videoPath,
      expectedCount: expectedTexts.length,
    });

    const { result, duration } = await this.executeWithTiming(
      'validateTextContent',
      async () => {
        // Simulate OCR processing time (longer for more texts)
        const processingTime = MOCK_DELAYS.OCR_VALIDATION_BASE +
          expectedTexts.length * MOCK_DELAYS.OCR_VALIDATION_PER_TEXT;
        await this.simulateDelay(processingTime);

        // MOCK: Assume all texts are found
        // In real implementation, would use Tesseract.js
        const validation: TextValidation = {
          allFound: true,
          found: [...expectedTexts],
          missing: [],
        };

        return validation;
      }
    );

    // Log validation results
    this.getLogger().logValidationResults({
      validatorName: 'TextOCRValidator',
      target: videoPath,
      passed: result.allFound,
      errors: result.missing.length > 0 ? result.missing.map(t => `Missing text: ${t}`) : undefined,
      details: {
        type: 'text',
        expected: expectedTexts,
        actual: result.found,
        matchRate: (result.found.length / expectedTexts.length) * 100,
      },
    });

    this.logInfo('Text validation completed', {
      allFound: result.allFound,
      foundCount: result.found.length,
      missingCount: result.missing.length,
      duration: `${duration}ms`,
    });

    return result;
  }

  /**
   * Validates audio content in the video
   *
   * Checks for audio presence and optionally transcribes
   * the audio content.
   *
   * CURRENT: Returns mock validation (audio present).
   * FUTURE: Will use FFmpeg + Speech-to-Text.
   *
   * @param {string} videoPath - Path to the video file
   *
   * @returns {Promise<AudioValidation>} Audio validation result
   *
   * @example
   * const result = await video.validateAudioContent(videoPath);
   *
   * if (result.hasAudio) {
   *   console.log(`Audio duration: ${result.duration}s`);
   *   console.log(`Transcription: ${result.transcription}`);
   * }
   */
  async validateAudioContent(videoPath: string): Promise<AudioValidation> {
    this.logInfo('Validating audio content', { videoPath });

    const { result, duration } = await this.executeWithTiming(
      'validateAudioContent',
      async () => {
        // Simulate audio analysis time
        await this.simulateDelay(MOCK_DELAYS.AUDIO_VALIDATION);

        // MOCK: Return positive audio validation
        // In real implementation, would use FFmpeg + STT
        const validation: AudioValidation = {
          hasAudio: true,
          duration: MOCK_VALIDATION_VALUES.AUDIO_DURATION,
          transcription: MOCK_VALIDATION_VALUES.AUDIO_TRANSCRIPTION,
        };

        return validation;
      }
    );

    // Log validation results
    this.getLogger().logValidationResults({
      validatorName: 'AudioSTTValidator',
      target: videoPath,
      passed: result.hasAudio,
      errors: result.hasAudio ? undefined : ['No audio track found'],
      details: {
        type: 'audio',
        hasAudio: result.hasAudio,
        duration: result.duration,
        transcriptionLength: result.transcription?.length || 0,
      },
    });

    this.logInfo('Audio validation completed', {
      hasAudio: result.hasAudio,
      duration: result.duration,
      validationTime: `${duration}ms`,
    });

    return result;
  }

  /**
   * Validates audio-text synchronization
   *
   * Checks if the audio narration is properly synchronized
   * with the text/subtitles in the video.
   *
   * CURRENT: Returns mock validation (no sync issues).
   * FUTURE: Will implement actual sync checking.
   *
   * @param {string} videoPath - Path to the video file
   *
   * @returns {Promise<SyncValidation>} Sync validation result
   *
   * @example
   * const result = await video.validateSync(videoPath);
   *
   * if (!result.passed) {
   *   console.log(`Max offset: ${result.maxOffset}ms`);
   *   result.issues.forEach(issue => {
   *     console.log(`Issue at ${issue.timestamp}s: ${issue.offset}ms offset`);
   *   });
   * }
   */
  async validateSync(videoPath: string): Promise<SyncValidation> {
    this.logInfo('Validating audio-text synchronization', { videoPath });

    const { result, duration } = await this.executeWithTiming(
      'validateSync',
      async () => {
        // Simulate sync analysis time
        await this.simulateDelay(MOCK_DELAYS.SYNC_VALIDATION);

        // MOCK: Return positive sync validation with minor offsets
        // In real implementation, would analyze actual timing
        const validation: SyncValidation = {
          passed: true,
          maxOffset: MOCK_VALIDATION_VALUES.MAX_SYNC_OFFSET,
          avgOffset: MOCK_VALIDATION_VALUES.AVG_SYNC_OFFSET,
          issues: [], // No issues in mock
        };

        return validation;
      }
    );

    // Log validation results
    const highSeverityIssues = result.issues.filter(i => i.severity === 'high');
    const lowMediumIssues = result.issues.filter(i => i.severity !== 'high');
    this.getLogger().logValidationResults({
      validatorName: 'AudioTextSyncValidator',
      target: videoPath,
      passed: result.passed,
      errors: highSeverityIssues.length > 0
        ? highSeverityIssues.map(i => `High sync offset at ${i.timestamp}s: ${i.offset}ms`)
        : undefined,
      warnings: lowMediumIssues.length > 0
        ? lowMediumIssues.map(i => `Sync offset at ${i.timestamp}s: ${i.offset}ms`)
        : undefined,
      details: {
        type: 'sync',
        maxOffset: result.maxOffset,
        avgOffset: result.avgOffset,
        issueCount: result.issues.length,
        threshold: VALIDATION_THRESHOLDS.SYNC_OFFSET_MS,
      },
    });

    this.logInfo('Sync validation completed', {
      passed: result.passed,
      maxOffset: `${result.maxOffset}ms`,
      avgOffset: `${result.avgOffset}ms`,
      issueCount: result.issues.length,
      validationTime: `${duration}ms`,
    });

    return result;
  }

  /**
   * Cleans up all temporary video files
   *
   * Deletes all files in the temp directory that were
   * created during testing. Should be called in afterEach
   * or afterAll hooks.
   *
   * @returns {Promise<void>}
   *
   * @example
   * // In test teardown
   * afterAll(async () => {
   *   await video.cleanup();
   * });
   */
  async cleanup(): Promise<void> {
    this.logInfo('Starting cleanup', {
      fileCount: this.generatedFiles.length,
    });

    const { duration } = await this.executeWithTiming(
      'cleanup',
      async () => {
        let deletedCount = 0;
        const errors: string[] = [];

        // Delete tracked files
        for (const filePath of this.generatedFiles) {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedCount++;
              this.logDebug(`Deleted: ${filePath}`);
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(`Failed to delete ${filePath}: ${message}`);
            this.logWarn(`Failed to delete file: ${filePath}`, { error: message });
          }
        }

        // Clear the tracking array
        this.generatedFiles = [];

        if (errors.length > 0) {
          this.logWarn('Cleanup completed with errors', {
            deleted: deletedCount,
            errors: errors.length,
          });
        }

        return { deletedCount, errors };
      }
    );

    this.logInfo('Cleanup completed', {
      duration: `${duration}ms`,
    });
  }

  /**
   * Ensures the temp directory exists
   *
   * @private
   */
  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      this.logDebug('Created temp directory', { path: this.tempDir });
    }
  }

  /**
   * Creates a placeholder video file for testing
   *
   * @private
   */
  private async createPlaceholderVideo(
    videoPath: string,
    config: Required<VideoConfig>
  ): Promise<void> {
    // Create a small placeholder file
    // In real implementation, this would be the actual video
    const placeholderContent = Buffer.from([
      // Minimal MP4 header (ftyp box)
      0x00, 0x00, 0x00, 0x18, // box size
      0x66, 0x74, 0x79, 0x70, // 'ftyp'
      0x6D, 0x70, 0x34, 0x32, // 'mp42'
      0x00, 0x00, 0x00, 0x00, // minor version
      0x6D, 0x70, 0x34, 0x32, // compatible brand
      0x69, 0x73, 0x6F, 0x6D, // compatible brand
    ]);

    // Add padding to simulate realistic file size
    const targetSize = this.estimateFileSize(config);
    const padding = Buffer.alloc(Math.min(targetSize, 1024)); // Cap at 1KB for placeholder

    const finalContent = Buffer.concat([placeholderContent, padding]);
    fs.writeFileSync(videoPath, finalContent);
  }

  /**
   * Estimates file size based on video configuration
   *
   * @private
   */
  private estimateFileSize(config: Required<VideoConfig>): number {
    // Rough estimate: bitrate * duration
    const bytes = (VIDEO_CONFIG.ESTIMATED_BITRATE_BPS * config.duration) / 8;
    return Math.round(bytes);
  }

  /**
   * Formats file size in human-readable format
   *
   * @private
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Simulates a rendering phase with progress logging
   *
   * @private
   */
  private async simulateRenderingPhase(
    phase: string,
    progress: number,
    delayMs: number
  ): Promise<void> {
    this.logDebug(`${phase}...`, { progress: `${progress}%` });

    // Log progress update
    this.getLogger().logVideoGeneration({
      videoId: 'current',
      status: 'processing',
      progress,
    });

    await this.simulateDelay(delayMs);
  }

  /**
   * Gets the temp directory path
   *
   * @returns {string} Absolute path to temp directory
   */
  public getTempDir(): string {
    return this.tempDir;
  }

  /**
   * Gets the list of generated files
   *
   * @returns {string[]} Array of file paths
   */
  public getGeneratedFiles(): string[] {
    return [...this.generatedFiles];
  }

  // ============================================================================
  // METODOS DE RENDERIZADO REAL (Remotion CLI)
  // ============================================================================

  /**
   * Renderiza un video usando implementación MOCK
   *
   * Simula el proceso de renderizado de Remotion generando
   * un archivo MP4 placeholder con metadatos válidos.
   *
   * ESTADO: Implementación MOCK para desarrollo de tests.
   * FUTURO: Integrará con Remotion CLI real.
   *
   * @param {ScriptData} scriptData - Datos del script para el video
   * @param {RenderOptions} [options] - Opciones de renderizado
   *
   * @returns {Promise<VideoRenderResult>} Resultado del renderizado
   *
   * @example
   * const result = await video.renderVideo({
   *   title: 'Test Video',
   *   contenido: ['Linea 1', 'Linea 2']
   * });
   *
   * if (result.success) {
   *   console.log(`Video en: ${result.outputPath}`);
   * }
   */
  async renderVideo(
    scriptData: ScriptData,
    options?: RenderOptions
  ): Promise<VideoRenderResult> {
    const composition = options?.composition || REMOTION_CONFIG.COMPOSITIONS.PREVIEW;
    const timeout = options?.timeout || VALIDATION_THRESHOLDS.VIDEO_RENDER_TIMEOUT_MS;
    const outputName = options?.outputName || `test_video_${Date.now()}`;
    const outputPath = path.join(this.tempDir, `${outputName}.mp4`);

    this.logInfo('Iniciando renderizado de video (MOCK)', {
      composition,
      outputPath,
      timeout,
      scriptTitle: scriptData.title,
    });

    // Log inicio de generacion
    this.getLogger().logVideoGeneration({
      videoId: outputName,
      title: scriptData.title,
      status: 'started',
      resolution: {
        width: VIDEO_CONFIG.DEFAULT_RESOLUTION.WIDTH,
        height: VIDEO_CONFIG.DEFAULT_RESOLUTION.HEIGHT,
      },
    });

    const { result, duration } = await this.executeWithTiming(
      'renderVideo',
      async () => {
        try {
          // Verificar timeout muy corto (para test de timeout)
          // En CI/CD, delays reales pueden causar flakiness, así que
          // simplemente retornamos el error sin delay cuando timeout es "corto"
          // El umbral está configurado en TIMEOUTS.shortTimeoutThreshold (500ms por defecto)
          if (isShortTimeout(timeout)) {
            return {
              success: false,
              outputPath,
              renderDuration: 0,
              error: `Timeout de renderizado excedido (${timeout}ms)`,
            };
          }

          // MOCK: Simular fases de renderizado
          const phases = MOCK_DELAYS.VIDEO_RENDER_PHASES;
          await this.simulateRenderingPhase('Initializing', 0, phases.INITIALIZE);
          await this.simulateRenderingPhase('Rendering frames', 25, phases.RENDER_FRAMES);
          await this.simulateRenderingPhase('Applying effects', 50, phases.APPLY_EFFECTS);
          await this.simulateRenderingPhase('Encoding video', 75, phases.ENCODE_VIDEO);
          await this.simulateRenderingPhase('Finalizing', 90, phases.FINALIZE);

          // Crear archivo MP4 placeholder con header válido
          const videoConfig: Required<VideoConfig> = {
            script: scriptData.contenido.join(' '),
            duration: VIDEO_CONFIG.DEFAULT_DURATION,
            fps: VIDEO_CONFIG.DEFAULT_FPS,
            resolution: {
              width: VIDEO_CONFIG.DEFAULT_RESOLUTION.WIDTH,
              height: VIDEO_CONFIG.DEFAULT_RESOLUTION.HEIGHT,
            },
          };

          await this.createPlaceholderVideo(outputPath, videoConfig);

          // Verificar que el archivo existe
          if (!fs.existsSync(outputPath)) {
            throw new Error('El archivo de video no fue generado');
          }

          // Registrar archivo para cleanup
          this.generatedFiles.push(outputPath);

          // Obtener metadatos mock
          const metadata = await this.getMetadata(outputPath);

          return {
            success: true,
            outputPath,
            renderDuration: 0, // Se actualiza despues
            metadata,
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);

          return {
            success: false,
            outputPath,
            renderDuration: 0,
            error: errorMessage,
          };
        }
      }
    );

    // Actualizar duracion del renderizado
    result.renderDuration = duration;

    // Log resultado
    this.getLogger().logVideoGeneration({
      videoId: outputName,
      title: scriptData.title,
      status: result.success ? 'completed' : 'failed',
      outputPath: result.success ? outputPath : undefined,
      progress: result.success ? 100 : 0,
    });

    if (result.success) {
      this.logInfo('Renderizado completado exitosamente', {
        outputPath,
        duration: `${duration}ms`,
        fileSize: result.metadata?.fileSizeMB,
      });
    } else {
      this.logError('Error en renderizado', { error: result.error });
    }

    return result;
  }

  /**
   * Valida que un archivo de video cumple con las especificaciones de YouTube Shorts
   *
   * Verifica:
   * - El archivo existe y es legible
   * - Formato es MP4
   * - Resolucion es 1080x1920 (9:16)
   * - Duracion entre 25-60 segundos
   * - Codec de video es H.264
   * - Tiene pista de audio
   * - Tamaño de archivo razonable (<50MB)
   *
   * @param {string} filePath - Ruta al archivo de video
   *
   * @returns {Promise<VideoFileValidation>} Resultado de la validacion
   *
   * @example
   * const validation = await video.validateVideoFile('/path/to/video.mp4');
   *
   * if (validation.isValid) {
   *   console.log('Video cumple todas las especificaciones');
   * } else {
   *   console.log('Errores:', validation.errors);
   * }
   */
  async validateVideoFile(filePath: string): Promise<VideoFileValidation> {
    this.logInfo('Validando archivo de video', { filePath });

    const { result, duration } = await this.executeWithTiming(
      'validateVideoFile',
      async () => {
        const errors: string[] = [];
        const warnings: string[] = [];
        let metadata: VideoMetadata | undefined;

        // 1. Verificar que el archivo existe
        const fileExists = fs.existsSync(filePath);
        if (!fileExists) {
          errors.push(`El archivo no existe: ${filePath}`);
          return this.buildValidationResult(false, errors, warnings);
        }

        // 2. Verificar formato MP4 (por extension y magic bytes)
        const isMP4 = await this.checkMP4Format(filePath);
        if (!isMP4) {
          errors.push('El archivo no es un formato MP4 valido');
        }

        // 3. Obtener metadatos (ya sea mock o real)
        try {
          metadata = await this.getMetadataReal(filePath);
        } catch (error) {
          // Si falla ffprobe, usar mock
          this.logWarn('FFprobe no disponible, usando metadatos mock');
          metadata = await this.getMetadata(filePath);
        }

        // 4. Validar resolucion
        const { EXPECTED_WIDTH, EXPECTED_HEIGHT } = VALIDATION_THRESHOLDS.VIDEO_RESOLUTION;
        const hasCorrectResolution =
          metadata.width === EXPECTED_WIDTH &&
          metadata.height === EXPECTED_HEIGHT;

        if (!hasCorrectResolution) {
          errors.push(
            `Resolucion incorrecta: ${metadata.width}x${metadata.height} ` +
            `(esperado: ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT})`
          );
        }

        // 5. Validar duracion (25-60 segundos)
        const { MIN_SECONDS, MAX_SECONDS } = VALIDATION_THRESHOLDS.VIDEO_DURATION;
        const hasDurationInRange =
          metadata.duration >= MIN_SECONDS &&
          metadata.duration <= MAX_SECONDS;

        if (!hasDurationInRange) {
          if (metadata.duration < MIN_SECONDS) {
            errors.push(`Duracion muy corta: ${metadata.duration}s (minimo: ${MIN_SECONDS}s)`);
          } else {
            errors.push(`Duracion muy larga: ${metadata.duration}s (maximo: ${MAX_SECONDS}s)`);
          }
        }

        // 6. Validar codec (H.264)
        const hasH264Codec = metadata.codec.toLowerCase() === 'h264' ||
                            metadata.codec.toLowerCase() === 'avc1';
        if (!hasH264Codec) {
          errors.push(`Codec incorrecto: ${metadata.codec} (esperado: h264)`);
        }

        // 7. Validar presencia de audio
        const audioValidation = await this.validateAudioContent(filePath);
        const hasAudio = audioValidation.hasAudio;
        if (!hasAudio) {
          errors.push('El video no tiene pista de audio');
        }

        // 8. Validar tamaño de archivo
        const { MIN_BYTES, MAX_BYTES } = VALIDATION_THRESHOLDS.VIDEO_FILE_SIZE;
        const hasReasonableSize =
          metadata.fileSize >= MIN_BYTES &&
          metadata.fileSize <= MAX_BYTES;

        if (metadata.fileSize < MIN_BYTES) {
          errors.push(`Archivo muy pequeño: ${metadata.fileSizeMB} (minimo: ${MIN_BYTES / 1024}KB)`);
        } else if (metadata.fileSize > MAX_BYTES) {
          errors.push(`Archivo muy grande: ${metadata.fileSizeMB} (maximo: ${MAX_BYTES / (1024 * 1024)}MB)`);
        }

        // Determinar si es valido (sin errores)
        const isValid = errors.length === 0;

        return {
          isValid,
          fileExists,
          isMP4,
          hasCorrectResolution,
          hasDurationInRange,
          hasH264Codec,
          hasAudio,
          hasReasonableSize,
          metadata,
          errors,
          warnings,
        };
      }
    );

    // Log resultado de validacion
    this.getLogger().logValidationResults({
      validatorName: 'VideoFileValidator',
      target: filePath,
      passed: result.isValid,
      errors: result.errors.length > 0 ? result.errors : undefined,
      warnings: result.warnings.length > 0 ? result.warnings : undefined,
      details: {
        type: 'video-file',
        fileExists: result.fileExists,
        isMP4: result.isMP4,
        hasCorrectResolution: result.hasCorrectResolution,
        hasDurationInRange: result.hasDurationInRange,
        hasH264Codec: result.hasH264Codec,
        hasAudio: result.hasAudio,
        hasReasonableSize: result.hasReasonableSize,
      },
    });

    this.logInfo('Validacion de archivo completada', {
      isValid: result.isValid,
      errorCount: result.errors.length,
      validationTime: `${duration}ms`,
    });

    return result;
  }

  /**
   * Limpia todos los videos de prueba generados
   *
   * Alias para cleanup() con nombre mas descriptivo segun el prompt.
   *
   * @returns {Promise<void>}
   */
  async cleanupTestVideos(): Promise<void> {
    return this.cleanup();
  }

  // ============================================================================
  // METODOS PRIVADOS AUXILIARES
  // ============================================================================

  /**
   * Verifica si un archivo tiene formato MP4 valido
   *
   * @private
   */
  private async checkMP4Format(filePath: string): Promise<boolean> {
    try {
      // Verificar extension
      if (!filePath.toLowerCase().endsWith('.mp4')) {
        return false;
      }

      // Verificar magic bytes (ftyp box)
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 8, 4);
      fs.closeSync(fd);

      // Los bytes 4-7 deben ser 'ftyp' en un MP4 valido
      const ftyp = buffer.slice(0, 4).toString('ascii');
      return ftyp === 'ftyp';

    } catch {
      return false;
    }
  }

  /**
   * Obtiene metadatos (implementación MOCK)
   *
   * En modo mock, retorna metadatos simulados válidos.
   * FUTURO: Usará FFprobe para extracción real.
   *
   * @private
   */
  private async getMetadataReal(filePath: string): Promise<VideoMetadata> {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    // Obtener tamaño real del archivo
    const stats = fs.statSync(filePath);

    // Retornar metadatos mock con valores válidos
    return {
      duration: VIDEO_CONFIG.DEFAULT_DURATION,
      fps: VIDEO_CONFIG.DEFAULT_FPS,
      width: VIDEO_CONFIG.DEFAULT_RESOLUTION.WIDTH,
      height: VIDEO_CONFIG.DEFAULT_RESOLUTION.HEIGHT,
      codec: VIDEO_CONFIG.DEFAULT_CODEC,
      fileSize: stats.size,
      fileSizeMB: this.formatFileSize(stats.size),
    };
  }

  /**
   * Construye objeto de resultado de validacion
   *
   * @private
   */
  private buildValidationResult(
    isValid: boolean,
    errors: string[],
    warnings: string[]
  ): VideoFileValidation {
    return {
      isValid,
      fileExists: false,
      isMP4: false,
      hasCorrectResolution: false,
      hasDurationInRange: false,
      hasH264Codec: false,
      hasAudio: false,
      hasReasonableSize: false,
      errors,
      warnings,
    };
  }
}

export default VideoServiceObject;
