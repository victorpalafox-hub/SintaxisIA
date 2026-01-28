/**
 * @fileoverview Base Service Object - Parent class for all service objects
 *
 * This module provides the foundational class that all service objects extend.
 * It implements the Service Object Pattern (POM adapted for APIs/services),
 * providing common functionality like logging, timing, and error handling.
 *
 * @description
 * The BaseServiceObject is designed to:
 * - Provide consistent logging across all service objects
 * - Measure execution time for performance tracking
 * - Standardize error handling and reporting
 * - Reduce code duplication in service implementations
 *
 * @example
 * // Creating a custom service object
 * class MyApiService extends BaseServiceObject {
 *   constructor() {
 *     super('MyApiService');
 *   }
 *
 *   async fetchData(): Promise<any> {
 *     const { result, duration } = await this.executeWithTiming(
 *       'fetchData',
 *       async () => {
 *         // Your API call here
 *         return await fetch('/api/data');
 *       }
 *     );
 *     return result;
 *   }
 * }
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

import { TestLogger } from '../../utils/TestLogger';

/**
 * Result type for timed operations
 *
 * @template T - The type of the result returned by the timed operation
 *
 * @property {T} result - The result of the executed action
 * @property {number} duration - Execution time in milliseconds
 */
export interface TimedResult<T> {
  /** The result returned by the executed action */
  result: T;
  /** Execution time in milliseconds */
  duration: number;
}

/**
 * Base Service Object - Abstract parent class for all service objects
 *
 * This class provides the foundation for the Service Object Pattern,
 * offering common functionality that all service objects need:
 * - Structured logging with automatic service name prefixing
 * - Execution timing for performance monitoring
 * - Standardized error handling and reporting
 *
 * @abstract
 * @class BaseServiceObject
 *
 * @example
 * // Extending BaseServiceObject
 * class PaymentService extends BaseServiceObject {
 *   constructor() {
 *     super('PaymentService');
 *   }
 *
 *   async processPayment(amount: number): Promise<PaymentResult> {
 *     this.logInfo(`Processing payment of $${amount}`);
 *
 *     const { result, duration } = await this.executeWithTiming(
 *       'processPayment',
 *       async () => {
 *         // Payment processing logic
 *         return { success: true, transactionId: '12345' };
 *       }
 *     );
 *
 *     this.logInfo(`Payment processed in ${duration}ms`);
 *     return result;
 *   }
 * }
 */
export abstract class BaseServiceObject {
  /**
   * Logger instance for this service object
   *
   * The logger is automatically configured with the service name
   * and provides structured logging capabilities.
   *
   * @protected
   * @readonly
   */
  protected readonly logger: TestLogger;

  /**
   * Name of this service for logging and identification
   *
   * This name is used as a prefix in all log messages
   * to easily identify which service generated the log.
   *
   * @protected
   * @readonly
   */
  protected readonly serviceName: string;

  /**
   * Creates an instance of BaseServiceObject
   *
   * Initializes the logger and sets the service name for identification.
   * Child classes should call super(serviceName) in their constructor.
   *
   * @param {string} serviceName - Unique identifier for this service
   *   Used in log messages and for debugging purposes.
   *   Should be descriptive (e.g., 'GeminiService', 'VideoService')
   *
   * @example
   * class MyService extends BaseServiceObject {
   *   constructor() {
   *     super('MyService'); // Sets serviceName to 'MyService'
   *   }
   * }
   */
  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = new TestLogger({ testName: serviceName });

    this.logDebug(`${serviceName} initialized`);
  }

  /**
   * Executes an async action with timing measurement
   *
   * This is the core method for executing any operation that needs
   * performance tracking. It:
   * 1. Logs the start of the action
   * 2. Records the start time
   * 3. Executes the provided async function
   * 4. Calculates the duration
   * 5. Logs the completion with timing
   * 6. Returns both the result and duration
   *
   * If the action throws an error, it logs the error with full details
   * and re-throws it for the caller to handle.
   *
   * @template T - The type of value returned by the action
   *
   * @param {string} actionName - Descriptive name for the action being executed
   *   This appears in log messages (e.g., 'generateScript', 'validateVideo')
   *
   * @param {() => Promise<T>} action - Async function to execute
   *   This is the actual operation to perform and measure
   *
   * @returns {Promise<TimedResult<T>>} Object containing:
   *   - result: The value returned by the action
   *   - duration: Execution time in milliseconds
   *
   * @throws {Error} Re-throws any error from the action after logging
   *
   * @example
   * // Basic usage
   * const { result, duration } = await this.executeWithTiming(
   *   'fetchUserData',
   *   async () => {
   *     const response = await fetch('/api/user/123');
   *     return response.json();
   *   }
   * );
   * console.log(`Got user in ${duration}ms:`, result);
   *
   * @example
   * // With error handling
   * try {
   *   const { result } = await this.executeWithTiming(
   *     'riskyOperation',
   *     async () => performRiskyTask()
   *   );
   * } catch (error) {
   *   // Error was already logged, handle recovery
   *   this.logWarn('Falling back to default behavior');
   * }
   */
  protected async executeWithTiming<T>(
    actionName: string,
    action: () => Promise<T>
  ): Promise<TimedResult<T>> {
    // Log the start of the action
    this.logDebug(`Starting: ${actionName}`);

    // Record start time for duration calculation
    const startTime = Date.now();

    try {
      // Execute the provided action
      const result = await action();

      // Calculate how long it took
      const duration = Date.now() - startTime;

      // Log successful completion with timing
      this.logDebug(`Completed: ${actionName}`, {
        duration,
        durationFormatted: this.formatDuration(duration),
      });

      // Return both the result and the duration
      return { result, duration };

    } catch (error) {
      // Calculate duration even for failed operations
      const duration = Date.now() - startTime;

      // Log the error with full context
      this.logError(`Failed: ${actionName}`, {
        duration,
        durationFormatted: this.formatDuration(duration),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw to let caller handle the error
      throw error;
    }
  }

  /**
   * Logs an informational message
   *
   * Use this for general information about service operations,
   * successful completions, and status updates.
   *
   * @param {string} message - The message to log
   * @param {any} [context] - Optional context object with additional data
   *   Will be included in structured logs for debugging
   *
   * @example
   * this.logInfo('User authenticated successfully');
   *
   * @example
   * this.logInfo('Processing batch', {
   *   batchId: 'batch-123',
   *   itemCount: 50
   * });
   */
  protected logInfo(message: string, context?: any): void {
    this.logger.info(`[${this.serviceName}] ${message}`, context);
  }

  /**
   * Logs a debug message
   *
   * Use this for detailed information useful during development
   * and debugging. These messages are typically filtered out
   * in production environments.
   *
   * @param {string} message - The debug message to log
   * @param {any} [context] - Optional context object with additional data
   *
   * @example
   * this.logDebug('Request payload constructed', { payload });
   *
   * @example
   * this.logDebug(`Cache hit for key: ${cacheKey}`);
   */
  protected logDebug(message: string, context?: any): void {
    this.logger.debug(`[${this.serviceName}] ${message}`, context);
  }

  /**
   * Logs a warning message
   *
   * Use this for potentially problematic situations that don't
   * prevent operation but should be noted. Examples:
   * - Deprecated API usage
   * - Slow response times
   * - Fallback behavior triggered
   * - Missing optional configuration
   *
   * @param {string} message - The warning message to log
   * @param {any} [context] - Optional context object with additional data
   *
   * @example
   * this.logWarn('API response slower than expected', {
   *   threshold: 1000,
   *   actual: 2500
   * });
   *
   * @example
   * this.logWarn('Using default configuration - no .env file found');
   */
  protected logWarn(message: string, context?: any): void {
    this.logger.warn(`[${this.serviceName}] ${message}`, context);
  }

  /**
   * Logs an error message
   *
   * Use this for error conditions that affect functionality.
   * Errors should be logged before being thrown or handled.
   *
   * @param {string} message - The error message to log
   * @param {any} [context] - Optional context object with additional data
   *   Should include error details, stack traces, and relevant state
   *
   * @example
   * this.logError('Failed to connect to database', {
   *   host: 'db.example.com',
   *   port: 5432,
   *   error: error.message
   * });
   *
   * @example
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   this.logError('Operation failed', { error });
   *   throw error;
   * }
   */
  protected logError(message: string, context?: any): void {
    this.logger.error(`[${this.serviceName}] ${message}`, context);
  }

  /**
   * Formats a duration in milliseconds to a human-readable string
   *
   * Converts milliseconds to an appropriate unit:
   * - Under 1000ms: "XXXms"
   * - 1000ms to 60000ms: "X.Xs"
   * - Over 60000ms: "Xm Xs"
   *
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration string
   *
   * @example
   * formatDuration(500)   // "500ms"
   * formatDuration(2500)  // "2.5s"
   * formatDuration(90000) // "1m 30s"
   */
  protected formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.round((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Gets the name of this service
   *
   * Useful for identifying which service object is being used
   * in logs or debugging scenarios.
   *
   * @returns {string} The service name
   *
   * @example
   * console.log(`Using service: ${service.getServiceName()}`);
   */
  public getServiceName(): string {
    return this.serviceName;
  }

  /**
   * Gets the logger instance for this service
   *
   * Allows access to the full TestLogger API for advanced
   * logging scenarios not covered by the convenience methods.
   *
   * @returns {TestLogger} The TestLogger instance
   *
   * @example
   * // Access specialized logging methods
   * this.getLogger().logApiRequest('ExternalAPI', requestData);
   */
  public getLogger(): TestLogger {
    return this.logger;
  }
}

export default BaseServiceObject;
