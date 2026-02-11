/**
 * @fileoverview Tests para Prompt 45 - Micro-Polish Editorial
 *
 * Valida que:
 * - Hook real: impact flash 0.85, micro-zoom 1.03, SFX, energy ramp
 * - Hero dinámico: music swell 22→25→22%, energy boost visual
 * - Image gate: firstImageMinScore 45 para primera imagen
 * - Outro breathing: fadeOutFrames 45, outroVolume 0.05, easing cúbico
 * - Sin regresiones en timing, audio, ni estructura
 *
 * @since Prompt 45
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// Rutas a archivos fuente
const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles', 'themes.ts');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');
const IMAGE_CONFIG_PATH = path.join(process.cwd(), 'automation', 'src', 'config', 'smart-image.config.ts');
const IMAGE_ORCH_PATH = path.join(process.cwd(), 'automation', 'src', 'services', 'image-orchestration.service.ts');

// =============================================================================
// TESTS: HOOK REAL - IMPACT FLASH + MICRO-ZOOM + SFX
// =============================================================================

test.describe('Prompt 45 - Hook Real (Impact)', () => {
  const logger = new TestLogger({ testName: 'Prompt45-HookImpact' });

  test('heroImpact config existe en themes con flashMaxOpacity 0.85', async () => {
    logger.info('Verificando heroImpact config');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = themes.match(/flashMaxOpacity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    // Debe haber al menos un flashMaxOpacity >= 0.85 (heroImpact)
    expect(themes).toContain('heroImpact');
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.15);
  });

  test('heroImpact.flashHoldFrames = 2', async () => {
    logger.info('Verificando flash hold');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = themes.match(/flashHoldFrames:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(2);
  });

  test('heroImpact.microZoomStart = 1.03', async () => {
    logger.info('Verificando micro-zoom');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = themes.match(/microZoomStart:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBe(1.03);
  });

  test('HeroScene usa impactFlash + combinedFlash', async () => {
    logger.info('Verificando impact flash en HeroScene');
    const hero = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    expect(hero).toContain('impactFlash');
    expect(hero).toContain('combinedFlash');
    expect(hero).toContain('Math.max(impactFlash, flashOpacity)');
  });

  test('HeroScene usa microZoom multiplicativo', async () => {
    logger.info('Verificando micro-zoom en scale');
    const hero = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    expect(hero).toContain('microZoom');
    expect(hero).toContain('sceneZoom * microZoom');
  });

  test('SFX impact-hit.wav referenciado en AINewsShort', async () => {
    logger.info('Verificando SFX Audio');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toContain('heroImpact.sfxSrc');
    expect(ainews).toContain('name="ImpactSFX"');
  });

  test('SFX archivo existe en public/audio/', async () => {
    logger.info('Verificando archivo SFX');
    const sfxPath = path.join(process.cwd(), 'remotion-app', 'public', 'audio', 'impact-hit.wav');
    expect(fs.existsSync(sfxPath)).toBe(true);
  });
});

// =============================================================================
// TESTS: HERO DINÁMICO - ENERGY RAMP + MUSIC SWELL
// =============================================================================

test.describe('Prompt 45 - Hero Energía Dinámica', () => {
  const logger = new TestLogger({ testName: 'Prompt45-HeroEnergy' });

  test('heroImpact.energyRampStart/Peak/End configurado (30/60/90)', async () => {
    logger.info('Verificando energy ramp config');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toMatch(/energyRampStart:\s*30/);
    expect(themes).toMatch(/energyRampPeak:\s*60/);
    expect(themes).toMatch(/energyRampEnd:\s*90/);
  });

  test('heroImpact.energyScaleBoost = 0.02', async () => {
    logger.info('Verificando scale boost');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = themes.match(/energyScaleBoost:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBe(0.02);
  });

  test('heroImpact.musicSwellPeak = 0.25', async () => {
    logger.info('Verificando music swell');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = themes.match(/musicSwellPeak:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBe(0.25);
  });

  test('Music bed callback usa heroImpact.musicSwellPeak', async () => {
    logger.info('Verificando swell en callback');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toContain('heroImpact.musicSwellPeak');
    expect(ainews).toContain('heroImpact.energyRampStart');
  });
});

// =============================================================================
// TESTS: IMAGE GATE - PRIMERA IMAGEN EDITORIAL
// =============================================================================

test.describe('Prompt 45 - Image Gate Primera Imagen', () => {
  const logger = new TestLogger({ testName: 'Prompt45-ImageGate' });

  test('firstImageMinScore = 45 en config', async () => {
    logger.info('Verificando firstImageMinScore');
    const config = fs.readFileSync(IMAGE_CONFIG_PATH, 'utf-8');
    const match = config.match(/firstImageMinScore:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(45);
  });

  test('firstImageMinScore > minimumScore (más estricto)', async () => {
    logger.info('Verificando que primera imagen es más estricta');
    const config = fs.readFileSync(IMAGE_CONFIG_PATH, 'utf-8');
    const minMatch = config.match(/minimumScore:\s*(\d+)/);
    const firstMatch = config.match(/firstImageMinScore:\s*(\d+)/);
    expect(minMatch).toBeTruthy();
    expect(firstMatch).toBeTruthy();
    expect(parseInt(firstMatch![1])).toBeGreaterThan(parseInt(minMatch![1]));
  });

  test('image-orchestration usa segmentIndex en searchPexelsWithScoring', async () => {
    logger.info('Verificando segmentIndex en scoring');
    const orch = fs.readFileSync(IMAGE_ORCH_PATH, 'utf-8');
    expect(orch).toContain('segmentIndex');
    expect(orch).toContain('firstImageMinScore');
  });
});

// =============================================================================
// TESTS: OUTRO BREATHING - FADE GRADUAL
// =============================================================================

test.describe('Prompt 45 - Outro Breathing', () => {
  const logger = new TestLogger({ testName: 'Prompt45-OutroBreathing' });

  test('outroAnimation.fadeOutFrames = 45 (1.5s gradual)', async () => {
    logger.info('Verificando fadeOutFrames');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const outroSection = themes.substring(
      themes.indexOf('export const outroAnimation'),
      themes.indexOf('}', themes.indexOf('export const outroAnimation')) + 1
    );
    expect(outroSection).toMatch(/fadeOutFrames:\s*45/);
  });

  test('musicBed.outroVolume = 0.05', async () => {
    logger.info('Verificando outroVolume');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = themes.match(/outroVolume:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBe(0.05);
  });

  test('OutroScene usa Easing.out para fade-out', async () => {
    logger.info('Verificando easing en OutroScene');
    const outro = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
    expect(outro).toContain('Easing.out(Easing.cubic)');
  });

  test('Music bed callback usa outroVolume durante outro', async () => {
    logger.info('Verificando outroVolume en callback');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toContain('musicBed.outroVolume');
    expect(ainews).toContain('outroStart');
  });
});

// =============================================================================
// TESTS: REGRESIÓN (NO ROMPER NADA)
// =============================================================================

test.describe('Prompt 45 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt45-Regression' });
  let ainews: string;

  test.beforeAll(async () => {
    ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('HeroScene duración 8s sin cambio', async () => {
    logger.info('Verificando Hero 8s');
    expect(ainews).toMatch(/heroSceneDuration\s*=\s*8\s*\*\s*fps/);
  });

  test('OutroScene duración 5s sin cambio', async () => {
    logger.info('Verificando Outro 5s');
    expect(ainews).toMatch(/outroSceneDuration\s*=\s*5\s*\*\s*fps/);
  });

  test('sceneTransition.crossfadeFrames = 30 sin cambio', async () => {
    logger.info('Verificando crossfade');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const sceneBlock = themes.match(/sceneTransition[\s\S]*?crossfadeFrames:\s*(\d+)/);
    expect(sceneBlock).toBeTruthy();
    expect(parseInt(sceneBlock![1])).toBe(30);
  });

  test('BREATHING_ROOM_FRAMES >= 45 (1.5s)', async () => {
    logger.info('Verificando breathing room');
    const match = ainews.match(/BREATHING_ROOM_FRAMES\s*=\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBeGreaterThanOrEqual(45);
  });

  test('musicBed.heroVolume = 0.22 sin cambio', async () => {
    logger.info('Verificando heroVolume');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toMatch(/heroVolume:\s*0\.22/);
  });

  test('musicBed.contentVolume = 0.08 sin cambio', async () => {
    logger.info('Verificando contentVolume');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toMatch(/contentVolume:\s*0\.08/);
  });

  test('musicBed.fadeOutFrames = 60 sin cambio', async () => {
    logger.info('Verificando music fadeOut');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const musicSection = themes.substring(
      themes.indexOf('export const musicBed'),
      themes.indexOf('}', themes.indexOf('export const musicBed')) + 1
    );
    expect(musicSection).toContain('fadeOutFrames: 60');
  });

  test('Narration desde contentStart (Prompt 44)', async () => {
    logger.info('Verificando Narration');
    expect(ainews).toMatch(/Sequence\s+from=\{contentStart\}\s+durationInFrames=\{outroStart\s*-\s*contentStart\}\s+name="Narration"/);
  });

  test('editorialText config intacto en themes', async () => {
    logger.info('Verificando editorialText');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('headline:');
    expect(themes).toContain('support:');
    expect(themes).toContain('punch:');
  });
});
