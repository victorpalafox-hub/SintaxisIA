/**
 * @fileoverview Tests para Prompt 13.1: SafeImage Component
 *
 * Valida el componente SafeImage que maneja errores de CORS
 * y proporciona fallback automatico para imagenes externas.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 13.1
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURACION
// =============================================================================

const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');

test.describe('PROMPT 13.1: SafeImage Component', () => {
  let logger: TestLogger;

  test.beforeAll(async () => {
    logger = new TestLogger('prompt13-1-safeimage');
    await logger.info('=== INICIANDO SUITE: SafeImage Component ===');
  });

  test.afterAll(async () => {
    await logger.info('=== FINALIZANDO SUITE: SafeImage Component ===');
    await logger.close();
  });

  // ===========================================================================
  // SUITE 1: Componente SafeImage
  // ===========================================================================

  test.describe('Suite 1: SafeImage Component', () => {
    test('should have SafeImage component file', async () => {
      await logger.info('Validando existencia de SafeImage.tsx');

      const safeImagePath = path.join(
        REMOTION_SRC,
        'components',
        'elements',
        'SafeImage.tsx'
      );

      const exists = fs.existsSync(safeImagePath);
      expect(exists).toBeTruthy();

      await logger.logValidationResults({
        validator: 'FileExistence',
        passed: exists,
        details: { file: 'SafeImage.tsx', path: safeImagePath },
      });
    });

    test('should export SafeImage component', async () => {
      await logger.info('Validando export de SafeImage');

      const safeImagePath = path.join(
        REMOTION_SRC,
        'components',
        'elements',
        'SafeImage.tsx'
      );

      const content = fs.readFileSync(safeImagePath, 'utf-8');

      const hasExport = content.includes('export const SafeImage');
      expect(hasExport).toBeTruthy();

      await logger.logValidationResults({
        validator: 'ComponentExport',
        passed: hasExport,
        details: { component: 'SafeImage' },
      });
    });

    test('should have onError handler for fallback', async () => {
      await logger.info('Validando manejo de errores con onError');

      const safeImagePath = path.join(
        REMOTION_SRC,
        'components',
        'elements',
        'SafeImage.tsx'
      );

      const content = fs.readFileSync(safeImagePath, 'utf-8');

      // Prompt 19.3.2: Acepta ambos patrones (onError en JSX o img.onerror en useEffect)
      const hasOnError = content.includes('onError') || content.includes('img.onerror');
      // Prompt 19.3.2: handleError o complete() como función de manejo
      const hasErrorHandler = content.includes('handleError') || content.includes('complete(false');
      const hasFallbackSrc = content.includes('fallbackSrc');

      expect(hasOnError).toBeTruthy();
      expect(hasErrorHandler).toBeTruthy();
      expect(hasFallbackSrc).toBeTruthy();

      await logger.logValidationResults({
        validator: 'ErrorHandling',
        passed: hasOnError && hasErrorHandler && hasFallbackSrc,
        details: { hasOnError, hasErrorHandler, hasFallbackSrc },
      });
    });

    test('should have generatePlaceholder function', async () => {
      await logger.info('Validando funcion generatePlaceholder');

      const safeImagePath = path.join(
        REMOTION_SRC,
        'components',
        'elements',
        'SafeImage.tsx'
      );

      const content = fs.readFileSync(safeImagePath, 'utf-8');

      const hasGeneratePlaceholder = content.includes('generatePlaceholder');
      const hasUiAvatars = content.includes('ui-avatars.com');

      expect(hasGeneratePlaceholder).toBeTruthy();
      expect(hasUiAvatars).toBeTruthy();

      await logger.logValidationResults({
        validator: 'PlaceholderGeneration',
        passed: hasGeneratePlaceholder && hasUiAvatars,
        details: { hasGeneratePlaceholder, hasUiAvatars },
      });
    });
  });

  // ===========================================================================
  // SUITE 2: Integracion con Escenas
  // ===========================================================================

  test.describe('Suite 2: Scene Integration', () => {
    test('HeroScene should use SafeImage', async () => {
      await logger.info('Validando uso de SafeImage en HeroScene');

      const heroPath = path.join(
        REMOTION_SRC,
        'components',
        'scenes',
        'HeroScene.tsx'
      );

      const content = fs.readFileSync(heroPath, 'utf-8');

      const hasSafeImageImport = content.includes('SafeImage');
      const usesSafeImage = content.includes('<SafeImage');

      // Verificar que NO usa <Img directamente (excepto en imports de remotion)
      const imgUsageCount = (content.match(/<Img\s/g) || []).length;

      expect(hasSafeImageImport).toBeTruthy();
      expect(usesSafeImage).toBeTruthy();
      expect(imgUsageCount).toBe(0);

      await logger.logValidationResults({
        validator: 'HeroSceneIntegration',
        passed: hasSafeImageImport && usesSafeImage && imgUsageCount === 0,
        details: { hasSafeImageImport, usesSafeImage, directImgUsage: imgUsageCount },
      });
    });

    test('ContentScene should use SafeImage', async () => {
      await logger.info('Validando uso de SafeImage en ContentScene');

      const contentPath = path.join(
        REMOTION_SRC,
        'components',
        'scenes',
        'ContentScene.tsx'
      );

      const content = fs.readFileSync(contentPath, 'utf-8');

      const hasSafeImageImport = content.includes('SafeImage');
      const usesSafeImage = content.includes('<SafeImage');

      // Verificar que NO usa <Img directamente
      const imgUsageCount = (content.match(/<Img\s/g) || []).length;

      expect(hasSafeImageImport).toBeTruthy();
      expect(usesSafeImage).toBeTruthy();
      expect(imgUsageCount).toBe(0);

      await logger.logValidationResults({
        validator: 'ContentSceneIntegration',
        passed: hasSafeImageImport && usesSafeImage && imgUsageCount === 0,
        details: { hasSafeImageImport, usesSafeImage, directImgUsage: imgUsageCount },
      });
    });

    test('SafeImage should support width and height props', async () => {
      await logger.info('Validando props width y height en SafeImage');

      const safeImagePath = path.join(
        REMOTION_SRC,
        'components',
        'elements',
        'SafeImage.tsx'
      );

      const content = fs.readFileSync(safeImagePath, 'utf-8');

      const hasWidthProp = content.includes('width?:') || content.includes('width:');
      const hasHeightProp = content.includes('height?:') || content.includes('height:');

      expect(hasWidthProp).toBeTruthy();
      expect(hasHeightProp).toBeTruthy();

      await logger.logValidationResults({
        validator: 'DimensionProps',
        passed: hasWidthProp && hasHeightProp,
        details: { hasWidthProp, hasHeightProp },
      });
    });
  });
});
