/**
 * @fileoverview Tests para Prompt 31 - Fondo Premium "con vida"
 *
 * Valida:
 * - themes.ts: Config values boosteados (opacidades, velocidades)
 * - themes.ts: premiumBackground config nueva
 * - BackgroundDirector.tsx: Color pulse (hue-rotate), accent glow, secciones dinámicas
 * - LightSweep.tsx: Dual sweep con ángulo invertido
 * - GrainOverlay.tsx: Frecuencia variable
 * - Regresión: BackgroundDirector como primera capa, escenas transparentes
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 31
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
const BACKGROUND_DIRECTOR_PATH = path.join(REMOTION_SRC, 'components/backgrounds/BackgroundDirector.tsx');
const LIGHT_SWEEP_PATH = path.join(REMOTION_SRC, 'components/backgrounds/LightSweep.tsx');
const GRAIN_OVERLAY_PATH = path.join(REMOTION_SRC, 'components/backgrounds/GrainOverlay.tsx');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/HeroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');
const ROOT_PATH = path.join(REMOTION_SRC, 'Root.tsx');

// =============================================================================
// TESTS: CONFIG BOOST - themes.ts
// =============================================================================

test.describe('Prompt 31 - Config Boost themes.ts', () => {
  const logger = new TestLogger({ testName: 'Prompt31-ConfigBoost' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('blobPrimaryOpacity >= 0.28', async () => {
    logger.info('Verificando blobPrimaryOpacity boosteado');

    const match = content.match(/blobPrimaryOpacity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.28);
  });

  test('blobSecondaryOpacity >= 0.20', async () => {
    logger.info('Verificando blobSecondaryOpacity boosteado');

    const match = content.match(/blobSecondaryOpacity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.20);
  });

  test('grainOpacity max >= 0.09', async () => {
    logger.info('Verificando grainOpacity boosteado');

    const match = content.match(/grainOpacity:\s*\[([\d.]+),\s*([\d.]+)\]/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![2])).toBeGreaterThanOrEqual(0.09);
  });

  test('subtleGrid opacity >= 0.09', async () => {
    logger.info('Verificando subtleGrid opacity boosteado');

    const match = content.match(/export const subtleGrid[\s\S]*?opacity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.09);
  });

  test('lightSweep maxOpacity >= 0.16', async () => {
    logger.info('Verificando lightSweep maxOpacity boosteado');

    const match = content.match(/export const lightSweep[\s\S]*?maxOpacity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.16);
  });

  test('lightSweep intervalFrames <= 180', async () => {
    logger.info('Verificando lightSweep intervalFrames reducido');

    const match = content.match(/export const lightSweep[\s\S]*?intervalFrames:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBeLessThanOrEqual(180);
  });

  test('parallaxSpeed >= 0.010', async () => {
    logger.info('Verificando parallaxSpeed boosteado');

    const match = content.match(/parallaxSpeed:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.010);
  });

  test('microZoom max >= 1.04', async () => {
    logger.info('Verificando microZoom max boosteado');

    const match = content.match(/microZoom[\s\S]*?max:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(1.04);
  });
});

// =============================================================================
// TESTS: NUEVOS EFECTOS - BackgroundDirector
// =============================================================================

test.describe('Prompt 31 - BackgroundDirector Nuevos Efectos', () => {
  const logger = new TestLogger({ testName: 'Prompt31-BackgroundDirector' });
  let bgContent: string;
  let themesContent: string;

  test.beforeAll(async () => {
    bgContent = fs.readFileSync(BACKGROUND_DIRECTOR_PATH, 'utf-8');
    themesContent = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('premiumBackground config existe en themes.ts', async () => {
    logger.info('Verificando premiumBackground config');

    expect(themesContent).toContain('export const premiumBackground');
    expect(themesContent).toContain('colorPulseRange');
    expect(themesContent).toContain('accentGlowOpacity');
    expect(themesContent).toContain('accentGlowBlur');
    expect(themesContent).toContain('accentGlowSize');
    expect(themesContent).toContain('accentGlowOrbit');
  });

  test('BackgroundDirector usa hue-rotate para color pulse', async () => {
    logger.info('Verificando color pulse con hue-rotate');

    expect(bgContent).toContain('hue-rotate');
    expect(bgContent).toContain('colorShift');
    expect(bgContent).toContain('premiumBackground.colorPulseSpeed');
    expect(bgContent).toContain('premiumBackground.colorPulseRange');
  });

  test('BackgroundDirector tiene accent glow (tercer blob)', async () => {
    logger.info('Verificando accent glow spot');

    expect(bgContent).toContain('Accent glow spot');
    expect(bgContent).toContain('premiumBackground.accentGlowSize');
    expect(bgContent).toContain('premiumBackground.accentGlowBlur');
    expect(bgContent).toContain('premiumBackground.accentGlowOpacity');
  });

  test('colors.accent usado en accent glow', async () => {
    logger.info('Verificando uso de colors.accent');

    expect(bgContent).toContain('colors.accent');
  });

  test('Secciones dinámicas (no hardcoded 240/1320)', async () => {
    logger.info('Verificando secciones dinámicas');

    // No debe tener constantes hardcoded
    expect(bgContent).not.toContain('CONTENT_START = 240');
    expect(bgContent).not.toContain('OUTRO_START = 1320');

    // Debe usar fracciones dinámicas
    expect(bgContent).toContain('HERO_DURATION_FRACTION');
    expect(bgContent).toContain('OUTRO_FRACTION');
    expect(bgContent).toContain('durationInFrames * HERO_DURATION_FRACTION');
    expect(bgContent).toContain('durationInFrames * (1 - OUTRO_FRACTION)');
  });
});

// =============================================================================
// TESTS: LIGHTSWEEP MEJORADO
// =============================================================================

test.describe('Prompt 31 - LightSweep Dual', () => {
  const logger = new TestLogger({ testName: 'Prompt31-LightSweep' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(LIGHT_SWEEP_PATH, 'utf-8');
  });

  test('Segundo sweep offset renderizado', async () => {
    logger.info('Verificando segundo sweep');

    expect(content).toContain('sweepPhase2');
    expect(content).toContain('sweep2Active');
    expect(content).toContain('intervalFrames / 2');
  });

  test('Angulo invertido en segundo sweep', async () => {
    logger.info('Verificando ángulo invertido');

    expect(content).toContain('invertedAngle');
    expect(content).toContain('180 - lightSweepConfig.angle');
  });

  test('Prompt 31 documentado en header', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@updated Prompt 31');
    expect(content).toContain('Dual sweep');
  });
});

// =============================================================================
// TESTS: GRAINOVERLAY MEJORADO
// =============================================================================

test.describe('Prompt 31 - GrainOverlay Variable', () => {
  const logger = new TestLogger({ testName: 'Prompt31-GrainOverlay' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(GRAIN_OVERLAY_PATH, 'utf-8');
  });

  test('baseFrequency variable (no hardcoded 0.65)', async () => {
    logger.info('Verificando frecuencia variable');

    // Debe tener baseFreq calculado
    expect(content).toContain('baseFreq');
    expect(content).toContain('Math.sin');

    // El atributo debe usar la variable, no hardcoded
    expect(content).toContain('baseFrequency={baseFreq}');
    expect(content).not.toContain('baseFrequency={0.65}');
  });

  test('Prompt 31 documentado en header', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@updated Prompt 31');
  });
});

// =============================================================================
// TESTS: REGRESION
// =============================================================================

test.describe('Prompt 31 - Regresion', () => {
  const logger = new TestLogger({ testName: 'Prompt31-Regresion' });

  test('BackgroundDirector sigue como primera capa en AINewsShort', async () => {
    logger.info('Verificando BackgroundDirector en AINewsShort');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('<BackgroundDirector');
    // Debe aparecer antes de Sequence Hero
    const bgIndex = content.indexOf('<BackgroundDirector');
    const heroIndex = content.indexOf('name="Hero"');
    expect(bgIndex).toBeLessThan(heroIndex);
  });

  test('HeroScene no importa BackgroundDirector', async () => {
    logger.info('Verificando HeroScene sin import de BackgroundDirector');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    // No debe importar BackgroundDirector como componente
    expect(content).not.toMatch(/import.*BackgroundDirector/);
  });

  test('ContentScene no importa BackgroundDirector', async () => {
    logger.info('Verificando ContentScene sin import de BackgroundDirector');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).not.toMatch(/import.*BackgroundDirector/);
  });

  test('OutroScene no importa BackgroundDirector', async () => {
    logger.info('Verificando OutroScene sin import de BackgroundDirector');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
    expect(content).not.toMatch(/import.*BackgroundDirector/);
  });

  test('No imports de AudioMixer en BackgroundDirector', async () => {
    logger.info('Verificando que BackgroundDirector no maneja audio');

    const content = fs.readFileSync(BACKGROUND_DIRECTOR_PATH, 'utf-8');
    expect(content).not.toContain('AudioMixer');
    expect(content).not.toContain('Audio');
  });

  test('sceneTransition.crossfadeFrames sin cambio', async () => {
    logger.info('Verificando crossfade sin cambio');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toMatch(/crossfadeFrames:\s*30/);
  });

  test('calculateMetadata en Root.tsx sin cambio', async () => {
    logger.info('Verificando calculateMetadata intacto');

    const content = fs.readFileSync(ROOT_PATH, 'utf-8');
    expect(content).toContain('calculateMetadata={calculateMetadata}');
    expect(content).toContain('durationInFrames: duration * fps');
  });
});
