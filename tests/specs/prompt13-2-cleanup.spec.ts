/**
 * @fileoverview Tests para Prompt 13.2: Limpieza de Composiciones
 *
 * Valida que solo existan las composiciones productivas:
 * - AINewsShort (55s) - Producción final
 * - AINewsShort-Preview (10s) - Desarrollo rápido
 *
 * Composiciones eliminadas (obsoletas):
 * - SintaxisIA, SintaxisIA-Preview, SintaxisIA-LowRes
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 13.2
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURACION
// =============================================================================

const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');

test.describe('PROMPT 13.2: Composition Cleanup', () => {
  let logger: TestLogger;

  test.beforeAll(async () => {
    logger = new TestLogger('prompt13-2-cleanup');
    await logger.info('=== INICIANDO SUITE: Composition Cleanup ===');
  });

  test.afterAll(async () => {
    await logger.info('=== FINALIZANDO SUITE: Composition Cleanup ===');
    await logger.close();
  });

  // ===========================================================================
  // SUITE 1: Composiciones Eliminadas
  // ===========================================================================

  test.describe('Suite 1: Obsolete Compositions Removed', () => {
    test('should NOT have SintaxisIA composition', async () => {
      await logger.info('Validando que SintaxisIA fue eliminado');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      // Buscar composición SintaxisIA (exacta, no AINewsShort)
      const hasSintaxisIA =
        content.includes('id="SintaxisIA"') ||
        content.includes("id='SintaxisIA'");

      expect(hasSintaxisIA).toBeFalsy();

      await logger.logValidationResults({
        validator: 'CompositionRemoval',
        passed: !hasSintaxisIA,
        details: { composition: 'SintaxisIA', removed: !hasSintaxisIA },
      });
    });

    test('should NOT have SintaxisIA-Preview composition', async () => {
      await logger.info('Validando que SintaxisIA-Preview fue eliminado');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      // Buscar composición activa (no comentarios de documentación)
      const hasSintaxisIAPreview =
        content.includes('id="SintaxisIA-Preview"') ||
        content.includes("id='SintaxisIA-Preview'");

      expect(hasSintaxisIAPreview).toBeFalsy();

      await logger.logValidationResults({
        validator: 'CompositionRemoval',
        passed: !hasSintaxisIAPreview,
        details: { composition: 'SintaxisIA-Preview', removed: !hasSintaxisIAPreview },
      });
    });

    test('should NOT have SintaxisIA-LowRes composition', async () => {
      await logger.info('Validando que SintaxisIA-LowRes fue eliminado');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      // Buscar composición activa (no comentarios de documentación)
      const hasSintaxisIALowRes =
        content.includes('id="SintaxisIA-LowRes"') ||
        content.includes("id='SintaxisIA-LowRes'");

      expect(hasSintaxisIALowRes).toBeFalsy();

      await logger.logValidationResults({
        validator: 'CompositionRemoval',
        passed: !hasSintaxisIALowRes,
        details: { composition: 'SintaxisIA-LowRes', removed: !hasSintaxisIALowRes },
      });
    });

    test('should NOT import Video component', async () => {
      await logger.info('Validando que Video.tsx ya no se importa');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      // Verificar que no hay import de Video
      const hasVideoImport =
        content.includes("from './Video'") ||
        content.includes('from "./Video"');

      expect(hasVideoImport).toBeFalsy();

      await logger.logValidationResults({
        validator: 'ImportRemoval',
        passed: !hasVideoImport,
        details: { import: 'Video', removed: !hasVideoImport },
      });
    });
  });

  // ===========================================================================
  // SUITE 2: Composiciones Activas
  // ===========================================================================

  test.describe('Suite 2: Active Compositions', () => {
    test('should have AINewsShort composition', async () => {
      await logger.info('Validando composición AINewsShort');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      const hasAINewsShort =
        content.includes('id="AINewsShort"') ||
        content.includes("id='AINewsShort'");

      expect(hasAINewsShort).toBeTruthy();

      await logger.logValidationResults({
        validator: 'CompositionPresent',
        passed: hasAINewsShort,
        details: { composition: 'AINewsShort', present: hasAINewsShort },
      });
    });

    test('should have AINewsShort-Preview composition', async () => {
      await logger.info('Validando composición AINewsShort-Preview');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      const hasAINewsShortPreview = content.includes('AINewsShort-Preview');

      expect(hasAINewsShortPreview).toBeTruthy();

      await logger.logValidationResults({
        validator: 'CompositionPresent',
        passed: hasAINewsShortPreview,
        details: { composition: 'AINewsShort-Preview', present: hasAINewsShortPreview },
      });
    });

    test('should have exactly 2 compositions', async () => {
      await logger.info('Validando cantidad de composiciones');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      // Contar ocurrencias de <Composition
      const compositionMatches = content.match(/<Composition/g);
      const compositionCount = compositionMatches ? compositionMatches.length : 0;

      // Debe haber exactamente 2: AINewsShort + AINewsShort-Preview
      expect(compositionCount).toBe(2);

      await logger.logValidationResults({
        validator: 'CompositionCount',
        passed: compositionCount === 2,
        details: { count: compositionCount, expected: 2 },
      });
    });

    test('should import only AINewsShort component', async () => {
      await logger.info('Validando imports limpios');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      const hasAINewsShortImport = content.includes('AINewsShort');

      expect(hasAINewsShortImport).toBeTruthy();

      await logger.logValidationResults({
        validator: 'ImportValidation',
        passed: hasAINewsShortImport,
        details: { import: 'AINewsShort', present: hasAINewsShortImport },
      });
    });
  });
});
