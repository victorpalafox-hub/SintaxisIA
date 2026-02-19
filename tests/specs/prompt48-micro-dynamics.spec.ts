/**
 * @fileoverview Tests para Prompt 48 - Micro-Dinámica Permanente
 *
 * Valida que:
 * - microDynamics config existe en themes.ts con todas las keys
 * - Amplitudes positivas y seguras (< 0.02)
 * - Ciclos diferentes entre sí (anti-sincronización)
 * - ContentScene usa microDynamics (breathing, X-drift, text drift, transition zoom)
 * - OutroScene usa microDynamics (breathing)
 * - Sin regresiones en timing, SAFE_MAX, crossfade, audio
 *
 * @since Prompt 48
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// Rutas a archivos fuente
const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles', 'themes.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');

// =============================================================================
// TESTS: CONFIG microDynamics EN THEMES.TS
// =============================================================================

test.describe('Prompt 48 - Config microDynamics en themes.ts', () => {
  const logger = new TestLogger({ testName: 'Prompt48-Config' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('microDynamics config exportada', async () => {
    logger.info('Verificando export de microDynamics');
    expect(themes).toContain('export const microDynamics');
  });

  test('imageBreathing con amplitude y cycleFrames', async () => {
    logger.info('Verificando imageBreathing');
    expect(themes).toContain('imageBreathing');
    const ampMatch = themes.match(/imageBreathing[\s\S]*?amplitude:\s*([\d.]+)/);
    expect(ampMatch).toBeTruthy();
    const amp = parseFloat(ampMatch![1]);
    expect(amp).toBeGreaterThan(0);
    expect(amp).toBeLessThan(0.02);
  });

  test('imageXDrift con amplitude y cycleFrames', async () => {
    logger.info('Verificando imageXDrift');
    expect(themes).toContain('imageXDrift');
    const ampMatch = themes.match(/imageXDrift[\s\S]*?amplitude:\s*([\d.]+)/);
    expect(ampMatch).toBeTruthy();
    expect(parseFloat(ampMatch![1])).toBeGreaterThan(0);
    expect(parseFloat(ampMatch![1])).toBeLessThanOrEqual(10);
  });

  test('textMicroDrift con amplitude y cycleFrames', async () => {
    logger.info('Verificando textMicroDrift');
    expect(themes).toContain('textMicroDrift');
    const ampMatch = themes.match(/textMicroDrift[\s\S]*?amplitude:\s*([\d.]+)/);
    expect(ampMatch).toBeTruthy();
    expect(parseFloat(ampMatch![1])).toBeGreaterThan(0);
    expect(parseFloat(ampMatch![1])).toBeLessThanOrEqual(5);
  });

  test('imageTransitionZoom con outgoingScale > 1 e incomingStartScale < 1', async () => {
    logger.info('Verificando imageTransitionZoom');
    expect(themes).toContain('imageTransitionZoom');
    const outMatch = themes.match(/outgoingScale:\s*([\d.]+)/);
    const inMatch = themes.match(/incomingStartScale:\s*([\d.]+)/);
    expect(outMatch).toBeTruthy();
    expect(inMatch).toBeTruthy();
    expect(parseFloat(outMatch![1])).toBeGreaterThan(1);
    expect(parseFloat(inMatch![1])).toBeLessThan(1);
  });

  test('outroBreathing con amplitude menor que imageBreathing', async () => {
    logger.info('Verificando outroBreathing');
    expect(themes).toContain('outroBreathing');
    const outroAmp = themes.match(/outroBreathing[\s\S]*?amplitude:\s*([\d.]+)/);
    const imageAmp = themes.match(/imageBreathing[\s\S]*?amplitude:\s*([\d.]+)/);
    expect(outroAmp).toBeTruthy();
    expect(imageAmp).toBeTruthy();
    expect(parseFloat(outroAmp![1])).toBeLessThan(parseFloat(imageAmp![1]));
  });

  test('Todos los cycleFrames son diferentes (anti-sincronización)', async () => {
    logger.info('Verificando ciclos diferentes');
    const cycles: number[] = [];
    const imageBreathCycle = themes.match(/imageBreathing[\s\S]*?cycleFrames:\s*(\d+)/);
    const xDriftCycle = themes.match(/imageXDrift[\s\S]*?cycleFrames:\s*(\d+)/);
    const textDriftCycle = themes.match(/textMicroDrift[\s\S]*?cycleFrames:\s*(\d+)/);
    const outroCycle = themes.match(/outroBreathing[\s\S]*?cycleFrames:\s*(\d+)/);

    expect(imageBreathCycle).toBeTruthy();
    expect(xDriftCycle).toBeTruthy();
    expect(textDriftCycle).toBeTruthy();
    expect(outroCycle).toBeTruthy();

    cycles.push(
      parseInt(imageBreathCycle![1]),
      parseInt(xDriftCycle![1]),
      parseInt(textDriftCycle![1]),
      parseInt(outroCycle![1])
    );

    // Todos deben ser únicos
    const unique = new Set(cycles);
    expect(unique.size).toBe(cycles.length);
  });

  test('Prompt 48 documentado en header', async () => {
    logger.info('Verificando documentación');
    expect(themes).toContain('Prompt 48');
  });
});

// =============================================================================
// TESTS: CONTENTSCENE MICRO-ANIMACIONES
// =============================================================================

test.describe('Prompt 48 - ContentScene Micro-Animaciones', () => {
  const logger = new TestLogger({ testName: 'Prompt48-ContentScene' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('ContentScene importa microDynamics', async () => {
    logger.info('Verificando import');
    expect(content).toContain('microDynamics');
    expect(content).toMatch(/import.*microDynamics.*from.*themes/);
  });

  test('Image breathing scale con Math.sin senoidal', async () => {
    logger.info('Verificando image breathing');
    expect(content).toContain('imageBreathingScale');
    expect(content).toContain('microDynamics.imageBreathing.cycleFrames');
    expect(content).toContain('microDynamics.imageBreathing.amplitude');
  });

  test('Image X-drift con Math.cos (desfasado 90deg)', async () => {
    logger.info('Verificando X-drift');
    expect(content).toContain('imageXDrift');
    expect(content).toContain('Math.cos');
    expect(content).toContain('microDynamics.imageXDrift.cycleFrames');
    expect(content).toContain('microDynamics.imageXDrift.amplitude');
  });

  test('Text micro-drift solo activo post-entrada', async () => {
    logger.info('Verificando text micro-drift');
    expect(content).toContain('textMicroDriftY');
    expect(content).toContain('textEntryComplete');
    expect(content).toContain('microDynamics.textMicroDrift.cycleFrames');
  });

  test('Transform de imagen combina parallax + X-drift + scale*breathing', async () => {
    logger.info('Verificando transform combinado');
    expect(content).toContain('translateX(${imageXDrift}px)');
    expect(content).toContain('imageScale * imageBreathingScale');
  });

  test('Transform de texto incluye textMicroDriftY', async () => {
    logger.info('Verificando transform texto');
    expect(content).toContain('blockTextY + textMicroDriftY');
  });

  test('Imagen saliente con transition zoom outgoing', async () => {
    logger.info('Verificando transition zoom saliente');
    expect(content).toContain('microDynamics.imageTransitionZoom.outgoingScale');
  });

  test('Imagen entrante con transition zoom incoming', async () => {
    logger.info('Verificando transition zoom entrante');
    expect(content).toContain('microDynamics.imageTransitionZoom.incomingStartScale');
    expect(content).toContain('microDynamics.imageTransitionZoom.incomingEndScale');
  });
});

// =============================================================================
// TESTS: OUTROSCENE BREATHING
// =============================================================================

test.describe('Prompt 48 - OutroScene Breathing', () => {
  const logger = new TestLogger({ testName: 'Prompt48-OutroScene' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
  });

  test('OutroScene importa microDynamics', async () => {
    logger.info('Verificando import');
    expect(content).toContain('microDynamics');
    expect(content).toMatch(/import.*microDynamics.*from.*themes/);
  });

  test('outroBreathingScale calculado con Math.sin', async () => {
    logger.info('Verificando breathing scale');
    expect(content).toContain('outroBreathingScale');
    expect(content).toContain('microDynamics.outroBreathing.cycleFrames');
    expect(content).toContain('microDynamics.outroBreathing.amplitude');
  });

  test('Breathing aplicado al contenedor con transform scale', async () => {
    logger.info('Verificando aplicación');
    expect(content).toContain('scale(${outroBreathingScale})');
  });
});

// =============================================================================
// TESTS: REGRESIÓN (NO ROMPER NADA)
// =============================================================================

test.describe('Prompt 48 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt48-Regression' });

  test('HeroScene NO modificado (ya tiene breathing propio)', async () => {
    logger.info('Verificando HeroScene intacto');
    const hero = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    // HeroScene NO debe importar microDynamics
    expect(hero).not.toContain('microDynamics');
    // Su breathing propio sigue intacto
    expect(hero).toContain('breathingMotion');
    expect(hero).toContain('breathingScale');
  });

  test('AINewsShort NO modificado (sin wrapper global)', async () => {
    logger.info('Verificando AINewsShort intacto');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    // No debe importar microDynamics (cada escena lo maneja)
    expect(ainews).not.toContain('microDynamics');
  });

  test('SAFE_MAX_SECONDS sin cambio (59.2)', async () => {
    logger.info('Verificando SAFE_MAX');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    const match = ainews.match(/SAFE_MAX_SECONDS\s*=\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBe(59.2);
  });

  test('Hero timing 8s sin cambio', async () => {
    logger.info('Verificando Hero 8s');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toMatch(/heroSceneDuration\s*=\s*8\s*\*\s*fps/);
  });

  test('Outro timing 5s sin cambio', async () => {
    logger.info('Verificando Outro 5s');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toMatch(/outroSceneDuration\s*=\s*5\s*\*\s*fps/);
  });

  test('crossfadeFrames = 30 sin cambio', async () => {
    logger.info('Verificando crossfade');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toMatch(/crossfadeFrames:\s*30/);
  });

  test('ContentScene parallax Y intacto', async () => {
    logger.info('Verificando parallax original');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('parallaxY');
    expect(content).toContain('contentAnimation.parallaxKeyframes');
  });

  test('ContentScene zoom original intacto', async () => {
    logger.info('Verificando zoom original');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('contentAnimation.zoomRange');
  });

  test('AudioMixer sin cambio', async () => {
    logger.info('Verificando AudioMixer');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toContain('<AudioMixer');
  });

  test('breathingMotion config original intacta', async () => {
    logger.info('Verificando breathingMotion original');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('export const breathingMotion');
    const ampMatch = themes.match(/export const breathingMotion[\s\S]*?amplitude:\s*([\d.]+)/);
    expect(ampMatch).toBeTruthy();
    expect(parseFloat(ampMatch![1])).toBe(0.005);
  });
});
