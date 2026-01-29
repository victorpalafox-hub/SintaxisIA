/**
 * @fileoverview Configuración de Playwright Test
 *
 * Este archivo configura el ejecutor de tests de Playwright
 * para el proyecto Sintaxis IA.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Dónde están los tests
  testDir: './tests/specs',

  // Patrón para encontrar archivos de test
  testMatch: '**/*.spec.ts',

  // Timeouts
  timeout: 120000, // 2 minutos por test (para generación de videos)

  // Timeout para expect assertions
  expect: {
    timeout: 5000,
  },

  // Reintentos
  retries: process.env.CI ? 2 : 0, // Sin reintentos en desarrollo

  // Workers (ejecución paralela)
  // 4 workers en local para velocidad, 1 en CI para estabilidad
  workers: process.env.CI ? 1 : 4,

  // Fallar el build si se dejó test.only en el código
  forbidOnly: !!process.env.CI,

  // Reporter (reportes múltiples para diferentes propósitos)
  reporter: [
    ['html', { outputFolder: 'tests/reports/html', open: 'never' }],
    ['json', { outputFile: 'tests/reports/results.json' }],
    ['junit', { outputFile: 'tests/reports/junit.xml' }],
    ['list'], // Output en consola
  ],

  // Configuración general
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Directorio para artefactos de test
  outputDir: 'tests/test-results',
});