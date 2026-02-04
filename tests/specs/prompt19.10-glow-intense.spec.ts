/**
 * @fileoverview Tests para Prompt 19.10 - Glow Intenso
 *
 * Valida la intensificación del glow cyberpunk en todas las escenas:
 * - heroAnimation config centralizada en themes.ts
 * - HeroScene: multi-layer textShadow/boxShadow, config centralizada
 * - ContentScene: textGlowMax/imageGlowMax aumentados, multi-layer, alpha
 * - OutroScene: glowMax aumentado, multi-layer boxShadow, brand name
 *
 * Complementa tests de Prompt 19.8 (ContentScene) y 19.9 (OutroScene).
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.10
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

  test('contentAnimation.textGlowMax >= 15', async () => {
    logger.info('Verificando textGlowMax intensificado');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/textGlowMax:\s*(\d+)/);
    expect(match).toBeTruthy();
    const value = parseInt(match![1]);
    expect(value).toBeGreaterThanOrEqual(15);

    logger.info(`textGlowMax: ${value}`);
  });

  test('contentAnimation.imageGlowMax >= 12', async () => {
    logger.info('Verificando imageGlowMax intensificado');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/imageGlowMax:\s*(\d+)/);
    expect(match).toBeTruthy();
    const value = parseInt(match![1]);
    expect(value).toBeGreaterThanOrEqual(12);

    logger.info(`imageGlowMax: ${value}`);
  });

  test('outroAnimation.glowMax >= 60', async () => {
    logger.info('Verificando outroAnimation.glowMax intensificado');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/glowMax:\s*(\d+)/);
    expect(match).toBeTruthy();
    const value = parseInt(match![1]);
    expect(value).toBeGreaterThanOrEqual(60);

    logger.info(`outroAnimation.glowMax: ${value}`);
  });
});

// =============================================================================
// TESTS: HEROSCENE
// =============================================================================

test.describe('Prompt 19.10 - HeroScene Glow', () => {
  const logger = new TestLogger({ testName: 'Prompt19.10-Hero' });

  test('HeroScene importa heroAnimation de themes', async () => {
    logger.info('Verificando import de heroAnimation');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('heroAnimation');
    expect(content).toContain("from '../../styles/themes'");

    logger.info('Import de heroAnimation presente');
  });

  test('HeroScene usa heroAnimation.glowKeyframes (no hardcoded)', async () => {
    logger.info('Verificando config centralizada de glow');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('heroAnimation.glowKeyframes');
    expect(content).toContain('heroAnimation.glowValues');

    logger.info('Glow usa config centralizada');
  });

  test('HeroScene textShadow tiene 3+ capas de glow', async () => {
    logger.info('Verificando multi-layer textShadow');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    // Contar capas de glow en textShadow del título (glowIntensity aparece 3+ veces)
    const titleSection = content.match(/textShadow:[\s\S]*?`,/);
    expect(titleSection).toBeTruthy();

    const glowLayers = (titleSection![0].match(/glowIntensity/g) || []).length;
    expect(glowLayers).toBeGreaterThanOrEqual(3);

    logger.info(`HeroScene textShadow tiene ${glowLayers} capas de glow`);
  });

  test('HeroScene boxShadow imagen tiene 2+ capas de glow', async () => {
    logger.info('Verificando multi-layer boxShadow');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    // boxShadow de imagen debe tener al menos 2 capas de glow
    const boxSection = content.match(/boxShadow:[\s\S]*?`,/);
    expect(boxSection).toBeTruthy();

    const glowLayers = (boxSection![0].match(/glowIntensity/g) || []).length;
    expect(glowLayers).toBeGreaterThanOrEqual(2);

    logger.info(`HeroScene boxShadow tiene ${glowLayers} capas de glow`);
  });
});

// =============================================================================
// TESTS: CONTENTSCENE
// =============================================================================

test.describe('Prompt 19.10 - ContentScene Glow', () => {
  const logger = new TestLogger({ testName: 'Prompt19.10-Content' });

  test('ContentScene textShadow tiene 2+ capas de glow', async () => {
    logger.info('Verificando multi-layer textShadow');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // textShadow debe tener textGlow al menos 2 veces (multi-layer)
    const textShadowMatch = content.match(/textShadow:.*textGlow.*textGlow/s);
    expect(textShadowMatch).toBeTruthy();

    logger.info('ContentScene textShadow tiene multi-layer');
  });

  test('ContentScene imageGlow alpha es 50 (no 30)', async () => {
    logger.info('Verificando alpha de imageGlow');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // boxShadow debe tener colors.primary seguido de 50 (alpha hex)
    expect(content).toMatch(/imageGlow.*colors\.primary\}50/s);

    logger.info('imageGlow alpha actualizado a 50');
  });
});

// =============================================================================
// TESTS: OUTROSCENE
// =============================================================================

test.describe('Prompt 19.10 - OutroScene Glow', () => {
  const logger = new TestLogger({ testName: 'Prompt19.10-Outro' });

  test('OutroScene logo boxShadow tiene 2+ capas de glow', async () => {
    logger.info('Verificando multi-layer logo boxShadow');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // boxShadow del logo debe tener glowIntensity al menos 2 veces
    const boxSection = content.match(/boxShadow:[\s\S]*?`,/);
    expect(boxSection).toBeTruthy();

    const glowLayers = (boxSection![0].match(/glowIntensity/g) || []).length;
    expect(glowLayers).toBeGreaterThanOrEqual(2);

    logger.info(`OutroScene logo boxShadow tiene ${glowLayers} capas`);
  });

  test('OutroScene brand name multiplicador >= 0.7', async () => {
    logger.info('Verificando multiplicador de brand name');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Debe tener glowIntensity * 0.7 (no 0.5)
    expect(content).toContain('glowIntensity * 0.7');

    logger.info('Brand name multiplicador actualizado');
  });

  test('Documentacion JSDoc menciona Prompt 19.10', async () => {
    logger.info('Verificando documentación');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/@updated Prompt 19\.10/);

    logger.info('Documentación actualizada');
  });
});
