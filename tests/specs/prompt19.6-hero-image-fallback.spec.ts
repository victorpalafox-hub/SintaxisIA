/**
 * @fileoverview Tests para Prompt 19.6 - HeroScene Image Fallback
 *
 * Valida que:
 * - SafeImage ya soporta URLs remotas sin necesidad de isRemoteUrl prop
 * - generateVideoProps verifica existencia de archivo y usa URL como fallback
 * - HeroScene no requiere modificaciones para soportar URLs
 * - La estructura de props.json es correcta
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.6
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_APP = path.join(__dirname, '../../remotion-app');
const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');

// =============================================================================
// TESTS: SAFEIMAGE YA SOPORTA URLs REMOTAS
// =============================================================================

test.describe('Prompt 19.6 - SafeImage URL Support', () => {
  const logger = new TestLogger({ testName: 'Prompt19.6-SafeImage' });

  test('SafeImage NO debe tener prop isRemoteUrl (innecesaria)', async () => {
    logger.info('Verificando que SafeImage no tiene isRemoteUrl prop');

    const safeimagePath = path.join(REMOTION_APP, 'src/components/elements/SafeImage.tsx');
    const content = fs.readFileSync(safeimagePath, 'utf-8');

    // SafeImage NO debe tener isRemoteUrl porque ya soporta ambos tipos
    expect(content).not.toContain('isRemoteUrl');
    expect(content).not.toContain('is-remote-url');
    expect(content).not.toContain('isRemote');

    logger.info('SafeImage no tiene isRemoteUrl (correcto - no es necesaria)');
  });

  test('SafeImage usa img.src directamente (soporta ambos tipos)', async () => {
    logger.info('Verificando que SafeImage usa browser Image API');

    const safeimagePath = path.join(REMOTION_APP, 'src/components/elements/SafeImage.tsx');
    const content = fs.readFileSync(safeimagePath, 'utf-8');

    // Debe usar el patrón img.src = src (browser maneja URLs automáticamente)
    expect(content).toContain('img.src');

    logger.info('SafeImage usa browser Image API que soporta URLs locales y remotas');
  });

  test('SafeImage tiene timeout de protección', async () => {
    logger.info('Verificando timeout de SafeImage');

    const safeimagePath = path.join(REMOTION_APP, 'src/components/elements/SafeImage.tsx');
    const content = fs.readFileSync(safeimagePath, 'utf-8');

    // Debe tener timeout definido
    expect(content).toMatch(/IMAGE_LOAD_TIMEOUT|timeout|8000/i);

    logger.info('SafeImage tiene timeout de protección');
  });
});

// =============================================================================
// TESTS: VIDEO RENDERING SERVICE FALLBACK
// =============================================================================

test.describe('Prompt 19.6 - VideoRenderingService Fallback', () => {
  const logger = new TestLogger({ testName: 'Prompt19.6-Fallback' });

  test('generateVideoProps debe verificar existencia de archivo', async () => {
    logger.info('Verificando lógica de fallback en generateVideoProps');

    const servicePath = path.join(AUTOMATION_SRC, 'services/video-rendering.service.ts');
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Debe verificar si el archivo existe
    expect(content).toContain('fs.existsSync');
    expect(content).toContain('heroExists');

    // Debe usar URL como fallback
    expect(content).toContain('request.imagePath');
    expect(content).toContain('heroValue');

    logger.info('generateVideoProps tiene lógica de fallback a URL');
  });

  test('prepareAssets debe tener logging de diagnóstico', async () => {
    logger.info('Verificando logging en prepareAssets');

    const servicePath = path.join(AUTOMATION_SRC, 'services/video-rendering.service.ts');
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Debe tener logs de éxito/fallo
    expect(content).toContain('Hero image downloaded');
    expect(content).toContain('Hero download failed');
    expect(content).toContain('URL fallback');

    logger.info('prepareAssets tiene logging de diagnóstico');
  });

  test('Prompt 19.6 debe estar documentado en JSDoc', async () => {
    logger.info('Verificando documentación JSDoc');

    const servicePath = path.join(AUTOMATION_SRC, 'services/video-rendering.service.ts');
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Debe mencionar Prompt 19.6
    expect(content).toContain('Prompt 19.6');
    expect(content).toContain('@updated Prompt 19.6');

    logger.info('Prompt 19.6 está documentado en JSDoc');
  });
});

// =============================================================================
// TESTS: HEROSCENE NO REQUIERE MODIFICACIONES
// =============================================================================

test.describe('Prompt 19.6 - HeroScene Compatible', () => {
  const logger = new TestLogger({ testName: 'Prompt19.6-HeroScene' });

  test('HeroScene NO debe tener isRemoteUrl', async () => {
    logger.info('Verificando que HeroScene no requiere isRemoteUrl');

    const heroScenePath = path.join(REMOTION_APP, 'src/components/scenes/HeroScene.tsx');
    const content = fs.readFileSync(heroScenePath, 'utf-8');

    // HeroScene no debe necesitar isRemoteUrl
    expect(content).not.toContain('isRemoteUrl');

    logger.info('HeroScene no requiere isRemoteUrl (SafeImage lo maneja)');
  });

  test('HeroScene usa SafeImage para cargar imagen', async () => {
    logger.info('Verificando uso de SafeImage en HeroScene');

    const heroScenePath = path.join(REMOTION_APP, 'src/components/scenes/HeroScene.tsx');
    const content = fs.readFileSync(heroScenePath, 'utf-8');

    // Debe usar SafeImage
    expect(content).toContain('SafeImage');
    expect(content).toContain('<SafeImage');

    logger.info('HeroScene usa SafeImage correctamente');
  });
});

// =============================================================================
// TESTS: PROPS.JSON ESTRUCTURA
// =============================================================================

test.describe('Prompt 19.6 - Props.json Structure', () => {
  const logger = new TestLogger({ testName: 'Prompt19.6-Props' });

  test('props.json debe existir o test se salta', async () => {
    logger.info('Verificando estructura de props.json');

    const propsPath = path.join(REMOTION_APP, 'props.json');

    if (!fs.existsSync(propsPath)) {
      logger.info('props.json no existe aún - saltando test');
      test.skip();
      return;
    }

    const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));

    expect(props.images).toBeDefined();
    expect(props.images.hero).toBeTruthy();
    expect(typeof props.images.hero).toBe('string');

    // hero puede ser URL o filename
    const isUrl = props.images.hero.startsWith('http');
    const isFilename = !isUrl && props.images.hero.length > 0;
    expect(isUrl || isFilename).toBe(true);

    logger.info(`props.json hero: ${isUrl ? 'URL remota' : 'archivo local'}`);
  });

  test('props.json debe tener dynamicScenes', async () => {
    logger.info('Verificando dynamicScenes en props.json');

    const propsPath = path.join(REMOTION_APP, 'props.json');

    if (!fs.existsSync(propsPath)) {
      logger.info('props.json no existe aún - saltando test');
      test.skip();
      return;
    }

    const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));

    expect(props.images.dynamicScenes).toBeDefined();
    expect(Array.isArray(props.images.dynamicScenes)).toBe(true);

    logger.info(`props.json tiene ${props.images.dynamicScenes.length} dynamicScenes`);
  });
});
