/**
 * @fileoverview Tests de sincronización de configuraciones
 * @description Valida que los valores de timeout en tests/ coincidan con los esperados
 * @prompt Validación de sincronización de configs entre automation/ y tests/
 *
 * IMPORTANTE: Este test valida que tests/config/service-constants.ts tenga
 * los valores correctos que DEBEN coincidir con automation/src/config/timeouts.config.ts
 *
 * Si este test falla, significa que los valores están desincronizados y deben actualizarse.
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import { TIMEOUTS, isShortTimeout, isCI } from '../config/service-constants';

/**
 * Valores ESPERADOS de timeout (deben coincidir con automation/src/config/timeouts.config.ts)
 * Si cambias valores en automation/, actualiza estos valores también.
 */
const EXPECTED_TIMEOUT_VALUES = {
  videoRender: { default: 30000, ci: 120000 },
  videoValidation: { default: 10000, ci: 30000 },
  fileOperation: { default: 5000, ci: 15000 },
  apiCall: { default: 15000, ci: 60000 },
  test: { default: 30000, ci: 120000 },
  build: { default: 60000, ci: 180000 },
  imageFetch: { default: 5000, ci: 15000 },
  tts: { default: 60000, ci: 120000 },
  shortTimeoutThreshold: { default: 500, ci: 500 },
} as const;

test.describe('Configuration Sync Validation', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger('ConfigSync');
    logger.info('Iniciando validación de sincronización de configuraciones');
  });

  test('TIMEOUTS values should match expected values from automation config', async () => {
    logger.info('Validando valores de TIMEOUTS contra valores esperados');

    const expectedKeys = Object.keys(EXPECTED_TIMEOUT_VALUES);
    const actualKeys = Object.keys(TIMEOUTS);

    // Verificar que todas las keys esperadas existen
    for (const key of expectedKeys) {
      expect(actualKeys).toContain(key);
      logger.info(`✅ Key existe: ${key}`);
    }

    // Verificar cada valor
    for (const [key, expected] of Object.entries(EXPECTED_TIMEOUT_VALUES)) {
      const actual = TIMEOUTS[key as keyof typeof TIMEOUTS];

      expect(actual).toBeDefined();
      expect(typeof actual).toBe('object');

      if ('default' in actual) {
        expect(actual.default).toBe(expected.default);
        logger.info(`✅ ${key}.default: ${actual.default} === ${expected.default}`);
      }

      if ('ci' in actual) {
        expect(actual.ci).toBe(expected.ci);
        logger.info(`✅ ${key}.ci: ${actual.ci} === ${expected.ci}`);
      }
    }

    logger.info('Todos los valores de TIMEOUTS coinciden con los esperados');
  });

  test('shortTimeoutThreshold should be 500ms', async () => {
    logger.info('Validando shortTimeoutThreshold');

    const threshold = TIMEOUTS.shortTimeoutThreshold.value;
    expect(threshold).toBe(500);
    logger.info(`✅ shortTimeoutThreshold.value: ${threshold}`);

    // Verificar que isShortTimeout funciona correctamente
    expect(isShortTimeout(100)).toBe(true);  // 100 < 500
    expect(isShortTimeout(499)).toBe(true);  // 499 < 500
    expect(isShortTimeout(500)).toBe(false); // 500 >= 500
    expect(isShortTimeout(1000)).toBe(false); // 1000 >= 500

    logger.info('✅ isShortTimeout funciona correctamente');
  });

  test('isCI function should detect CI environment correctly', async () => {
    logger.info('Validando detección de entorno CI');

    const ciDetected = isCI();
    const expectedCI = process.env.CI === 'true' ||
                       process.env.GITHUB_ACTIONS === 'true' ||
                       process.env.NODE_ENV === 'ci' ||
                       process.env.NODE_ENV === 'test';

    expect(ciDetected).toBe(expectedCI);
    logger.info(`✅ isCI(): ${ciDetected} (expected: ${expectedCI})`);
    logger.info(`   CI env: ${process.env.CI}`);
    logger.info(`   GITHUB_ACTIONS env: ${process.env.GITHUB_ACTIONS}`);
    logger.info(`   NODE_ENV: ${process.env.NODE_ENV}`);
  });

  test('TIMEOUTS.value should return correct value based on environment', async () => {
    logger.info('Validando que TIMEOUTS.*.value retorna valor correcto según entorno');

    const ciDetected = isCI();

    for (const [key, expected] of Object.entries(EXPECTED_TIMEOUT_VALUES)) {
      const timeout = TIMEOUTS[key as keyof typeof TIMEOUTS];

      if ('value' in timeout) {
        const expectedValue = ciDetected ? expected.ci : expected.default;
        expect(timeout.value).toBe(expectedValue);
        logger.info(`✅ ${key}.value: ${timeout.value} (CI=${ciDetected}, expected=${expectedValue})`);
      }
    }

    logger.info('Todos los valores dinámicos son correctos según el entorno');
  });
});

/**
 * Test de documentación - imprime instrucciones si hay desincronización
 */
test.describe('Configuration Sync Documentation', () => {
  test('should provide sync instructions in test output', async () => {
    const logger = new TestLogger('ConfigSyncDocs');

    logger.info('='.repeat(70));
    logger.info('INSTRUCCIONES DE SINCRONIZACIÓN DE CONFIGURACIONES');
    logger.info('='.repeat(70));
    logger.info('');
    logger.info('Si los tests de este archivo fallan, significa que los valores');
    logger.info('de timeout están desincronizados entre:');
    logger.info('');
    logger.info('  FUENTE (producción): automation/src/config/timeouts.config.ts');
    logger.info('  COPIA (tests):       tests/config/service-constants.ts');
    logger.info('');
    logger.info('Para sincronizar:');
    logger.info('1. Revisa los valores en automation/src/config/timeouts.config.ts');
    logger.info('2. Actualiza tests/config/service-constants.ts con los mismos valores');
    logger.info('3. Actualiza EXPECTED_TIMEOUT_VALUES en este archivo');
    logger.info('4. Ejecuta: npx playwright test tests/specs/config-sync.spec.ts');
    logger.info('');
    logger.info('='.repeat(70));

    // Este test siempre pasa - solo es para documentación
    expect(true).toBe(true);
  });
});
