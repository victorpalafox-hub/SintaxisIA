/**
 * @fileoverview Test Runner Utility
 *
 * Proporciona funciones útiles para ejecutar y gestionar tests
 * de forma programática. Permite ejecutar tests con opciones
 * personalizadas, leer resultados y generar resúmenes.
 *
 * @author Sintaxis IA
 * @module tests/utils/test-runner
 *
 * @example
 * // Ejecutar tests programáticamente
 * import { runTests, generateTestSummary } from './test-runner';
 *
 * const success = await runTests({ suite: 'prompt7*', headed: true });
 * const summary = generateTestSummary();
 * console.log(`Total: ${summary.total}, Passed: ${summary.passed}`);
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ===================================
// INTERFACES
// ===================================

/**
 * Opciones para ejecutar tests
 *
 * @interface TestRunOptions
 * @property {string} [suite] - Suite específica a ejecutar (patrón de archivo)
 * @property {boolean} [headed] - Ejecutar en modo headed (navegador visible)
 * @property {boolean} [debug] - Ejecutar en modo debug
 * @property {string} [reporter] - Reporter a usar (html, json, junit, list)
 * @property {string} [grep] - Filtrar tests por nombre (patrón regex)
 * @property {number} [workers] - Número de workers paralelos
 * @property {number} [retries] - Número de reintentos para tests fallidos
 */
export interface TestRunOptions {
  suite?: string;
  headed?: boolean;
  debug?: boolean;
  reporter?: string;
  grep?: string;
  workers?: number;
  retries?: number;
}

/**
 * Estructura de resultados de test
 *
 * @interface TestResults
 * @property {TestSuite[]} suites - Array de suites ejecutadas
 * @property {number} duration - Duración total en milisegundos
 */
export interface TestResults {
  suites: TestSuite[];
  duration: number;
}

/**
 * Estructura de una suite de tests
 *
 * @interface TestSuite
 * @property {string} title - Nombre de la suite
 * @property {TestSpec[]} specs - Especificaciones de la suite
 */
export interface TestSuite {
  title: string;
  specs: TestSpec[];
}

/**
 * Estructura de una especificación de test
 *
 * @interface TestSpec
 * @property {string} title - Nombre del test
 * @property {boolean} ok - Si el test pasó
 * @property {number} duration - Duración del test
 */
export interface TestSpec {
  title: string;
  ok: boolean;
  duration: number;
}

/**
 * Resumen de ejecución de tests
 *
 * @interface TestSummary
 * @property {number} total - Total de tests
 * @property {number} passed - Tests pasados
 * @property {number} failed - Tests fallidos
 * @property {number} skipped - Tests omitidos
 * @property {number} duration - Duración total en ms
 * @property {string} durationFormatted - Duración formateada
 */
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  durationFormatted: string;
}

// ===================================
// CONSTANTES
// ===================================

/** Ruta al archivo de resultados JSON */
const RESULTS_PATH = path.join(__dirname, '../reports/results.json');

/** Suites disponibles para ejecución */
export const AVAILABLE_SUITES = {
  logger: 'prompt5-testlogger-validation.spec.ts',
  services: 'service-objects-demo.spec.ts',
  video: 'prompt7-video-generation.spec.ts',
  content: 'prompt8-content-validation.spec.ts',
} as const;

// ===================================
// FUNCIONES PRINCIPALES
// ===================================

/**
 * Ejecuta tests de Playwright con opciones personalizadas
 *
 * @description
 * Esta función spawns un proceso de Playwright con las opciones
 * especificadas. Devuelve una promesa que resuelve a true si
 * todos los tests pasan, false en caso contrario.
 *
 * @param {TestRunOptions} options - Opciones de ejecución
 * @returns {Promise<boolean>} True si todos los tests pasan
 *
 * @example
 * // Ejecutar suite específica en modo headed
 * const success = await runTests({
 *   suite: 'prompt7*',
 *   headed: true,
 *   reporter: 'list'
 * });
 *
 * @example
 * // Ejecutar tests filtrados por nombre
 * const success = await runTests({
 *   grep: 'should validate',
 *   workers: 2
 * });
 */
export async function runTests(options: TestRunOptions = {}): Promise<boolean> {
  // Construir argumentos del comando
  const args = ['playwright', 'test'];

  // Agregar suite si se especifica
  if (options.suite) {
    args.push(`tests/specs/${options.suite}`);
  }

  // Agregar flags opcionales
  if (options.headed) {
    args.push('--headed');
  }

  if (options.debug) {
    args.push('--debug');
  }

  if (options.reporter) {
    args.push(`--reporter=${options.reporter}`);
  }

  if (options.grep) {
    args.push(`--grep=${options.grep}`);
  }

  if (options.workers !== undefined) {
    args.push(`--workers=${options.workers}`);
  }

  if (options.retries !== undefined) {
    args.push(`--retries=${options.retries}`);
  }

  // Ejecutar comando y devolver resultado
  return new Promise((resolve) => {
    const proc = spawn('npx', args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '../..'),
    });

    proc.on('close', (code) => {
      resolve(code === 0);
    });

    proc.on('error', (error) => {
      console.error('Error ejecutando tests:', error.message);
      resolve(false);
    });
  });
}

/**
 * Lee resultados de tests desde el archivo JSON
 *
 * @description
 * Lee y parsea el archivo results.json generado por el reporter
 * JSON de Playwright. Lanza error si el archivo no existe.
 *
 * @returns {TestResults} Objeto con resultados de tests
 * @throws {Error} Si el archivo de resultados no existe
 *
 * @example
 * try {
 *   const results = readTestResults();
 *   console.log(`Duración total: ${results.duration}ms`);
 * } catch (error) {
 *   console.log('Ejecuta los tests primero');
 * }
 */
export function readTestResults(): TestResults {
  if (!fs.existsSync(RESULTS_PATH)) {
    throw new Error(
      'No se encontraron resultados de tests. Ejecuta los tests primero con: npm test'
    );
  }

  const data = fs.readFileSync(RESULTS_PATH, 'utf-8');
  return JSON.parse(data) as TestResults;
}

/**
 * Verifica si existen resultados de tests
 *
 * @returns {boolean} True si existe el archivo de resultados
 */
export function hasTestResults(): boolean {
  return fs.existsSync(RESULTS_PATH);
}

/**
 * Genera un resumen de los resultados de tests
 *
 * @description
 * Procesa los resultados JSON y genera un resumen con
 * conteos de tests pasados, fallidos y duración total.
 *
 * @returns {TestSummary} Resumen de la ejecución
 * @throws {Error} Si no existen resultados de tests
 *
 * @example
 * const summary = generateTestSummary();
 * console.log(`
 *   Total: ${summary.total}
 *   Passed: ${summary.passed}
 *   Failed: ${summary.failed}
 *   Duration: ${summary.durationFormatted}
 * `);
 */
export function generateTestSummary(): TestSummary {
  const results = readTestResults();

  let total = 0;
  let passed = 0;
  let failed = 0;

  // Contar tests de todas las suites
  for (const suite of results.suites) {
    for (const spec of suite.specs) {
      total++;
      if (spec.ok) {
        passed++;
      } else {
        failed++;
      }
    }
  }

  const skipped = total - passed - failed;

  return {
    total,
    passed,
    failed,
    skipped,
    duration: results.duration,
    durationFormatted: formatDuration(results.duration),
  };
}

/**
 * Obtiene tests fallidos de los resultados
 *
 * @returns {Array<{suite: string, test: string}>} Lista de tests fallidos
 */
export function getFailedTests(): Array<{ suite: string; test: string }> {
  const results = readTestResults();
  const failed: Array<{ suite: string; test: string }> = [];

  for (const suite of results.suites) {
    for (const spec of suite.specs) {
      if (!spec.ok) {
        failed.push({
          suite: suite.title,
          test: spec.title,
        });
      }
    }
  }

  return failed;
}

/**
 * Imprime un resumen formateado en consola
 *
 * @description
 * Muestra un resumen visual de los resultados con colores
 * y formato legible.
 */
export function printSummary(): void {
  if (!hasTestResults()) {
    console.log('No hay resultados de tests disponibles.');
    console.log('Ejecuta: npm test');
    return;
  }

  const summary = generateTestSummary();
  const passRate = ((summary.passed / summary.total) * 100).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total:    ${summary.total}`);
  console.log(`Passed:   ${summary.passed} (${passRate}%)`);
  console.log(`Failed:   ${summary.failed}`);
  console.log(`Skipped:  ${summary.skipped}`);
  console.log(`Duration: ${summary.durationFormatted}`);
  console.log('='.repeat(60));

  if (summary.failed > 0) {
    console.log('\nFailed tests:');
    const failedTests = getFailedTests();
    for (const test of failedTests) {
      console.log(`  - ${test.suite} > ${test.test}`);
    }
  }

  console.log('');
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

/**
 * Formatea duración en milisegundos a formato legible
 *
 * @param {number} ms - Milisegundos
 * @returns {string} Duración formateada (ej: "1m 30s")
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

// ===================================
// EJECUCIÓN DIRECTA
// ===================================

// Si se ejecuta directamente, mostrar resumen
if (require.main === module) {
  printSummary();
}
