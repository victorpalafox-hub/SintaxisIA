/**
 * @fileoverview Gemini Service Object - API wrapper for Gemini interactions
 *
 * This module provides a service object that encapsulates all interactions
 * with the Google Gemini API for testing purposes. It extends BaseServiceObject
 * to inherit logging and timing capabilities.
 *
 * @description
 * The GeminiServiceObject is designed to:
 * - Wrap Gemini API calls with consistent logging
 * - Provide typed interfaces for requests and responses
 * - Enable easy mocking for unit tests
 * - Track performance metrics (tokens, duration)
 * - Support parallel request execution for load testing
 *
 * CURRENT STATUS: MOCK IMPLEMENTATION
 * This version uses simulated responses for development and testing.
 * Real API integration will be implemented in a future prompt.
 *
 * @example
 * // Basic usage
 * const gemini = new GeminiServiceObject();
 *
 * // Generate a single script
 * const result = await gemini.generateScript(
 *   'Create a 30-second video script about AI trends'
 * );
 * console.log(result.script);
 *
 * // Generate multiple scripts in parallel
 * const results = await gemini.generateMultiple([
 *   'Script about ChatGPT',
 *   'Script about Claude AI',
 *   'Script about Gemini'
 * ]);
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

import { BaseServiceObject } from '../base/BaseServiceObject';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Options for script generation
 *
 * These options control how Gemini generates content.
 * All options are optional and have sensible defaults.
 *
 * @interface GenerateOptions
 *
 * @property {number} [maxTokens=500] - Maximum tokens in the response
 *   Higher values allow longer scripts but cost more
 *
 * @property {number} [temperature=0.7] - Creativity level (0.0 to 1.0)
 *   Lower = more focused/deterministic
 *   Higher = more creative/random
 *
 * @property {number} [topP=0.9] - Nucleus sampling parameter
 *   Controls diversity of token selection
 */
export interface GenerateOptions {
  /** Maximum number of tokens in the generated response */
  maxTokens?: number;
  /** Temperature for response creativity (0.0-1.0) */
  temperature?: number;
  /** Top-p sampling parameter for token selection */
  topP?: number;
}

/**
 * Result from script generation
 *
 * Contains the generated script along with metadata
 * about the generation process.
 *
 * @interface ScriptResult
 *
 * @property {string} script - The generated script text
 * @property {number} tokensUsed - Total tokens consumed (prompt + completion)
 * @property {number} duration - Generation time in milliseconds
 * @property {string} timestamp - ISO timestamp of generation
 */
export interface ScriptResult {
  /** The generated script text */
  script: string;
  /** Total tokens used (prompt + completion) */
  tokensUsed: number;
  /** Generation duration in milliseconds */
  duration: number;
  /** ISO timestamp when script was generated */
  timestamp: string;
}

/**
 * Internal structure for Gemini API request body
 *
 * @internal
 */
interface GeminiRequestBody {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    maxOutputTokens: number;
    temperature: number;
    topP: number;
  };
}

/**
 * Internal structure for simulated API response
 *
 * @internal
 */
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// ============================================================================
// MOCK DATA - Sample scripts for realistic simulation
// ============================================================================

/**
 * Sample scripts for mock responses
 * These provide realistic content during testing
 */
const MOCK_SCRIPTS = [
  `La inteligencia artificial está transformando el mundo tal como lo conocemos.

Desde asistentes virtuales hasta diagnósticos médicos, la IA está en todas partes.

Las empresas tecnológicas compiten por desarrollar modelos cada vez más avanzados.

OpenAI, Google, Anthropic y Meta lideran esta carrera tecnológica.

¿Estás preparado para el futuro de la inteligencia artificial?

Síguenos para más contenido sobre tecnología y IA.`,

  `¡Increíble avance en inteligencia artificial!

Los nuevos modelos de lenguaje pueden razonar como nunca antes.

GPT-4, Claude y Gemini están redefiniendo lo que es posible.

Pueden escribir código, analizar imágenes y resolver problemas complejos.

El futuro ya está aquí, y es más inteligente de lo que imaginábamos.

¡Activa las notificaciones para no perderte nada!`,

  `La IA generativa está revolucionando la creación de contenido.

Texto, imágenes, música y video: todo puede ser creado por máquinas.

Los creadores tienen nuevas herramientas poderosas a su disposición.

Pero también surgen preguntas sobre ética y autenticidad.

El debate sobre el futuro del trabajo continúa.

¿Qué opinas? Déjalo en los comentarios.`,
];

// ============================================================================
// GEMINI SERVICE OBJECT
// ============================================================================

/**
 * Gemini Service Object - Encapsulates Gemini API interactions
 *
 * This service object provides a clean, typed interface for interacting
 * with the Google Gemini API. It handles:
 * - Request construction and validation
 * - Response parsing and error handling
 * - Automatic logging of all operations
 * - Performance tracking with timing metrics
 *
 * CURRENT STATUS: Mock implementation for testing framework development.
 * Real API calls will be integrated in future prompts.
 *
 * @extends BaseServiceObject
 *
 * @example
 * // Create instance
 * const gemini = new GeminiServiceObject();
 *
 * // Validate API key before use
 * const isValid = await gemini.validateApiKey();
 * if (!isValid) {
 *   throw new Error('Invalid Gemini API key');
 * }
 *
 * // Generate script with custom options
 * const result = await gemini.generateScript(
 *   'Create an engaging script about machine learning',
 *   { temperature: 0.8, maxTokens: 800 }
 * );
 *
 * console.log(`Generated in ${result.duration}ms`);
 * console.log(`Tokens used: ${result.tokensUsed}`);
 * console.log(result.script);
 */
export class GeminiServiceObject extends BaseServiceObject {
  /**
   * Gemini API key for authentication
   * @private
   */
  private apiKey: string;

  /**
   * Base URL for Gemini API
   * @private
   */
  private baseUrl: string;

  /**
   * Model name to use for generation
   * @private
   */
  private modelName: string;

  /**
   * Default generation options
   * @private
   */
  private defaultOptions: Required<GenerateOptions>;

  /**
   * Creates an instance of GeminiServiceObject
   *
   * Initializes the service with configuration from environment
   * or defaults. The API key is loaded but not validated until
   * explicitly requested or first API call.
   *
   * @example
   * const gemini = new GeminiServiceObject();
   */
  constructor() {
    super('GeminiService');

    // Load configuration from environment or use defaults
    // In production, these would come from AppConfig
    this.apiKey = process.env.GEMINI_API_KEY || 'mock-api-key';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
    this.modelName = 'gemini-pro';

    // Set default generation options
    this.defaultOptions = {
      maxTokens: 500,
      temperature: 0.7,
      topP: 0.9,
    };

    this.logInfo('GeminiServiceObject initialized', {
      baseUrl: this.baseUrl,
      model: this.modelName,
      hasApiKey: !!this.apiKey && this.apiKey !== 'mock-api-key',
    });
  }

  /**
   * Generates a script from a text prompt
   *
   * Sends the prompt to Gemini API and returns the generated script
   * along with usage metrics. All operations are automatically logged.
   *
   * CURRENT: Returns mock response with simulated timing.
   * FUTURE: Will make actual API calls to Gemini.
   *
   * @param {string} prompt - The text prompt for script generation
   *   Should be clear and specific about the desired output.
   *   Example: "Create a 30-second video script about AI news"
   *
   * @param {GenerateOptions} [options] - Optional generation parameters
   *   If not provided, defaults are used:
   *   - maxTokens: 500
   *   - temperature: 0.7
   *   - topP: 0.9
   *
   * @returns {Promise<ScriptResult>} Generated script with metadata:
   *   - script: The generated text content
   *   - tokensUsed: Total tokens consumed
   *   - duration: Generation time in ms
   *   - timestamp: When the script was generated
   *
   * @throws {Error} If generation fails (API error, timeout, etc.)
   *
   * @example
   * // Basic generation
   * const result = await gemini.generateScript(
   *   'Escribe un guión sobre los últimos avances en IA'
   * );
   *
   * @example
   * // With custom options
   * const result = await gemini.generateScript(
   *   'Create a dramatic script about AI revolution',
   *   {
   *     temperature: 0.9,  // More creative
   *     maxTokens: 800     // Longer output
   *   }
   * );
   */
  async generateScript(
    prompt: string,
    options?: GenerateOptions
  ): Promise<ScriptResult> {
    // Merge provided options with defaults
    const mergedOptions: Required<GenerateOptions> = {
      ...this.defaultOptions,
      ...options,
    };

    // Build the request body
    const requestBody = this.buildRequestBody(prompt, mergedOptions);
    const requestUrl = `${this.baseUrl}/models/${this.modelName}:generateContent`;

    // Log the API request (headers sanitized automatically)
    this.getLogger().logApiRequest('Gemini', {
      url: requestUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: requestBody,
    });

    // Execute with timing
    const { result, duration } = await this.executeWithTiming(
      'generateScript',
      async () => {
        // MOCK IMPLEMENTATION
        // Simulate network latency (1000-2000ms)
        const simulatedDelay = 1000 + Math.random() * 1000;
        await this.simulateDelay(simulatedDelay);

        // Generate mock response
        const mockResponse = this.generateMockResponse(prompt);
        return mockResponse;
      }
    );

    // Parse the response
    const scriptResult = this.parseResponse(result, duration);

    // Log the API response
    this.getLogger().logApiResponse('Gemini', {
      url: requestUrl,
      statusCode: 200,
      statusText: 'OK',
      duration,
      body: {
        tokensUsed: scriptResult.tokensUsed,
        scriptLength: scriptResult.script.length,
      },
    });

    this.logInfo('Script generated successfully', {
      promptLength: prompt.length,
      scriptLength: scriptResult.script.length,
      tokensUsed: scriptResult.tokensUsed,
      duration: `${duration}ms`,
    });

    return scriptResult;
  }

  /**
   * Generates scripts for multiple prompts in parallel
   *
   * Useful for load testing or batch processing. All prompts
   * are executed concurrently using Promise.all.
   *
   * @param {string[]} prompts - Array of prompts to process
   * @param {GenerateOptions} [options] - Options applied to all generations
   *
   * @returns {Promise<ScriptResult[]>} Array of results in same order as prompts
   *
   * @throws {Error} If any generation fails (all-or-nothing behavior)
   *
   * @example
   * const prompts = [
   *   'Script about OpenAI',
   *   'Script about Google AI',
   *   'Script about Anthropic'
   * ];
   *
   * const results = await gemini.generateMultiple(prompts);
   * results.forEach((result, i) => {
   *   console.log(`Script ${i + 1}: ${result.tokensUsed} tokens`);
   * });
   */
  async generateMultiple(
    prompts: string[],
    options?: GenerateOptions
  ): Promise<ScriptResult[]> {
    this.logInfo(`Starting batch generation for ${prompts.length} prompts`);

    const { result: results, duration } = await this.executeWithTiming(
      'generateMultiple',
      async () => {
        // Execute all prompts in parallel
        const promises = prompts.map(prompt =>
          this.generateScript(prompt, options)
        );
        return Promise.all(promises);
      }
    );

    // Calculate totals for logging
    const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed, 0);

    this.logInfo('Batch generation completed', {
      promptCount: prompts.length,
      totalTokens,
      totalDuration: `${duration}ms`,
      avgDuration: `${Math.round(duration / prompts.length)}ms per script`,
    });

    return results;
  }

  /**
   * Validates the API key by making a test request
   *
   * Makes a minimal API call to verify the key is valid
   * and has proper permissions.
   *
   * @returns {Promise<boolean>} true if API key is valid, false otherwise
   *
   * @example
   * const gemini = new GeminiServiceObject();
   *
   * if (await gemini.validateApiKey()) {
   *   console.log('API key is valid');
   * } else {
   *   console.error('Invalid API key - check your configuration');
   * }
   */
  async validateApiKey(): Promise<boolean> {
    this.logInfo('Validating API key...');

    try {
      const { result } = await this.executeWithTiming(
        'validateApiKey',
        async () => {
          // MOCK IMPLEMENTATION
          // Simulate validation delay
          await this.simulateDelay(500);

          // In mock mode, check if key looks valid (not empty/default)
          const isValid = this.apiKey !== '' &&
                         this.apiKey !== 'mock-api-key' &&
                         this.apiKey.length > 10;

          // For testing purposes, also accept mock key
          return isValid || this.apiKey === 'mock-api-key';
        }
      );

      if (result) {
        this.logInfo('API key validation successful');
      } else {
        this.logWarn('API key validation failed - key appears invalid');
      }

      return result;

    } catch (error) {
      this.logError('API key validation error', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Builds the request body for Gemini API
   *
   * Constructs the properly formatted request body
   * according to Gemini API specifications.
   *
   * @private
   * @param {string} prompt - The user's prompt
   * @param {Required<GenerateOptions>} options - Generation options
   * @returns {GeminiRequestBody} Formatted request body
   */
  private buildRequestBody(
    prompt: string,
    options: Required<GenerateOptions>
  ): GeminiRequestBody {
    return {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature,
        topP: options.topP,
      },
    };
  }

  /**
   * Parses Gemini API response into ScriptResult
   *
   * Extracts the generated text and usage metadata
   * from the raw API response.
   *
   * @private
   * @param {GeminiResponse} response - Raw API response
   * @param {number} duration - Request duration in ms
   * @returns {ScriptResult} Parsed result with metadata
   */
  private parseResponse(
    response: GeminiResponse,
    duration: number
  ): ScriptResult {
    // Extract the generated text from response
    const script = response.candidates[0]?.content?.parts[0]?.text || '';

    // Extract token usage
    const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

    return {
      script,
      tokensUsed,
      duration,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generates a mock Gemini API response
   *
   * Creates a realistic-looking response for testing purposes.
   * Selects a random script and generates random token counts.
   *
   * @private
   * @param {string} prompt - The original prompt (used for variation)
   * @returns {GeminiResponse} Mock response object
   */
  private generateMockResponse(prompt: string): GeminiResponse {
    // Select a random script from our samples
    const scriptIndex = Math.floor(Math.random() * MOCK_SCRIPTS.length);
    const script = MOCK_SCRIPTS[scriptIndex];

    // Generate realistic token counts
    // Rough estimate: ~4 chars per token
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(script.length / 4);

    return {
      candidates: [
        {
          content: {
            parts: [{ text: script }],
          },
          finishReason: 'STOP',
        },
      ],
      usageMetadata: {
        promptTokenCount: promptTokens,
        candidatesTokenCount: completionTokens,
        totalTokenCount: promptTokens + completionTokens,
      },
    };
  }

  /**
   * Simulates network delay for mock implementation
   *
   * @private
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise<void>} Resolves after delay
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets the current model name
   *
   * @returns {string} The model name being used
   *
   * @example
   * console.log(`Using model: ${gemini.getModelName()}`);
   */
  public getModelName(): string {
    return this.modelName;
  }

  /**
   * Sets a new model name
   *
   * Allows switching between different Gemini models.
   *
   * @param {string} modelName - The model name to use
   *
   * @example
   * gemini.setModelName('gemini-pro-vision');
   */
  public setModelName(modelName: string): void {
    this.logInfo(`Changing model from ${this.modelName} to ${modelName}`);
    this.modelName = modelName;
  }
}

export default GeminiServiceObject;
