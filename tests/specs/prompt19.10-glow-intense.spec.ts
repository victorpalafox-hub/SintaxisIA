/**
 * @fileoverview Tests para Prompt 20 - Editorial Shadows
 *
 * Valida la migración de glow cyberpunk a sombras editoriales profesionales:
 * - editorialShadow config centralizada en themes.ts
 * - HeroScene: textDepth + imageElevation (no glowIntensity)
 * - ContentScene: textDepth + imageElevation (no textGlow/imageGlow)
 * - OutroScene: logoBrandTint + textDepth (no glowIntensity)
 *
 * Complementa tests de Prompt 19.8 (ContentScene) y 19.9 (OutroScene).
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 20
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/HeroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');

// =============================================================================
// TESTS: CONFIGURACIÓN CENTRALIZADA
// =============================================================================

test.describe('Prompt 19.10 - heroAnimation Config', () => {
  const logger = new TestLogger({ testName: 'Prompt19.10-Config' });

  test('heroAnimation existe en themes.ts con campos correctos', async () => {
    logger.info('Verificando heroAnimation en themes');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    expect(content).toContain('export const heroAnimation');
    expect(content).toContain('springDamping');
    expect(content).toContain('springStiffness');
    expect(content).toContain('springMass');
    expect(content).toContain('glowKeyframes');
    expect(content).toContain('glowValues');
    expect(content).toContain('imageGlowMultiplier');

    logger.info('heroAnimation config completa');
  });

  test('contentAnimation.textGlowMax = 0 (Prompt 36: glows eliminados)', async () => {
    logger.info('Verificando textGlowMax eliminado (Prompt 36 editorial premium)');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/textGlowMax:\s*(\d+)/);
    expect(match).toBeTruthy();
    const value = parseInt(match![1]);
    expect(value).toBe(0);

    logger.info(`textGlowMax: ${value}`);
  });

  test('contentAnimation.imageGlowMax = 0 (Prompt 36: glows eliminados)', async () => {
    logger.info('Verificando imageGlowMax eliminado (Prompt 36 editorial premium)');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/imageGlowMax:\s*(\d+)/);
    expect(match).toBeTruthy();
    const value = parseInt(match![1]);
    expect(value).toBe(0);

    logger.info(`imageGlowMax: ${value}`);
  });

  test('outroAnimation.glowMax = 0 (Prompt 36: glows eliminados)', async () => {
    logger.info('Verificando outroAnimation.glowMax eliminado (Prompt 36 editorial premium)');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/glowMax:\s*(\d+)/);
    expect(match).toBeTruthy();
    const value = parseInt(match![1]);
    expect(value).toBe(0);

    logger.info(`outroAnimation.glowMax: ${value}`);
  });
});

// =============================================================================
// TESTS: HEROSCENE
// =============================================================================

test.describe('Prompt 20 - HeroScene Editorial Shadows', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Hero' });

  test('HeroScene importa heroAnimation de themes', async () => {
    logger.info('Verificando import de heroAnimation');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('heroAnimation');
    expect(content).toContain("from '../../styles/themes'");

    logger.info('Import de heroAnimation presente');
  });

  test('HeroScene usa editorialShadow.imageElevation para imagen (no glow)', async () => {
    logger.info('Verificando imageElevation en lugar de glow');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('editorialShadow.imageElevation');
    expect(content).not.toContain('heroAnimation.glowKeyframes');
    expect(content).not.toContain('heroAnimation.glowValues');

    logger.info('HeroScene usa imageElevation editorial');
  });

  test('HeroScene usa editorialShadow.textDepth para texto (no multi-layer glow)', async () => {
    logger.info('Verificando textDepth en textShadow');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('editorialShadow.textDepth');

    // No debe usar glowIntensity
    const titleSection = content.match(/textShadow:[\s\S]*?`,/);
    if (titleSection) {
      expect(titleSection[0]).not.toContain('glowIntensity');
    }

    logger.info('HeroScene textShadow usa textDepth editorial');
  });

  test('HeroScene NO contiene glowIntensity', async () => {
    logger.info('Verificando ausencia de glowIntensity');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).not.toContain('glowIntensity');

    logger.info('glowIntensity eliminado de HeroScene');
  });
});

// =============================================================================
// TESTS: CONTENTSCENE
// =============================================================================

test.describe('Prompt 20 - ContentScene Editorial Shadows', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Content' });

  test('ContentScene usa editorialShadow.textDepth para texto', async () => {
    logger.info('Verificando textDepth en textShadow');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('editorialShadow.textDepth');
    expect(content).not.toContain('textGlow');

    logger.info('ContentScene textShadow usa textDepth editorial');
  });

  test('ContentScene usa editorialShadow.imageElevation para imagen', async () => {
    logger.info('Verificando imageElevation en boxShadow');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('editorialShadow.imageElevation');
    expect(content).not.toContain('imageGlow');

    logger.info('ContentScene boxShadow usa imageElevation editorial');
  });
});

// =============================================================================
// TESTS: OUTROSCENE
// =============================================================================

test.describe('Prompt 20 - OutroScene Editorial Shadows', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Outro' });

  test('OutroScene usa editorialShadow.logoBrandTint para logo', async () => {
    logger.info('Verificando logoBrandTint en logo');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toContain('editorialShadow.logoBrandTint');

    logger.info('OutroScene logo usa logoBrandTint editorial');
  });

  test('OutroScene usa editorialShadow.textDepth para brand name', async () => {
    logger.info('Verificando textDepth en brand name');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toContain('editorialShadow.textDepth');

    logger.info('OutroScene brand name usa textDepth editorial');
  });

  test('OutroScene NO contiene glowIntensity', async () => {
    logger.info('Verificando ausencia de glowIntensity');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).not.toContain('glowIntensity');

    logger.info('glowIntensity eliminado de OutroScene');
  });
});
