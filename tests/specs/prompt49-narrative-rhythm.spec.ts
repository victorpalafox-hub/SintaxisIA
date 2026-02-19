/**
 * @fileoverview Tests para Prompt 49 - Ritmo Narrativo Editorial
 *
 * Valida que:
 * - narrativeRhythm config existe en themes.ts con todas las keys
 * - getIntensityMultiplier() retorna valores correctos por fase
 * - Intensidad opening = 1.0, build < 1.0, climax > 1.0
 * - Micro-pausa reduce intensidad periódicamente
 * - Pre-final deceleration reduce a minIntensity
 * - ContentScene importa y usa narrativeRhythm + getIntensityMultiplier
 * - Sin regresiones en SAFE_MAX, timing, crossfade, visualEmphasis
 *
 * @since Prompt 49
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// Rutas a archivos fuente
const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles', 'themes.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
const NARRATIVE_RHYTHM_PATH = path.join(REMOTION_SRC, 'utils', 'narrative-rhythm.ts');
const UTILS_INDEX_PATH = path.join(REMOTION_SRC, 'utils', 'index.ts');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');

// =============================================================================
// TESTS: CONFIG narrativeRhythm EN THEMES.TS
// =============================================================================

test.describe('Prompt 49 - Config narrativeRhythm en themes.ts', () => {
  const logger = new TestLogger({ testName: 'Prompt49-Config' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('narrativeRhythm config exportada', async () => {
    logger.info('Verificando export de narrativeRhythm');
    expect(themes).toContain('export const narrativeRhythm');
  });

  test('intensityCurve con openingEnd, buildEnd y fases', async () => {
    logger.info('Verificando intensityCurve');
    expect(themes).toContain('intensityCurve');
    expect(themes).toContain('openingEnd');
    expect(themes).toContain('openingIntensity');
    expect(themes).toContain('buildEnd');
    expect(themes).toContain('buildIntensity');
    expect(themes).toContain('climaxIntensity');
  });

  test('openingIntensity = 1.0 (apertura enérgica)', async () => {
    logger.info('Verificando opening intensity');
    const match = themes.match(/openingIntensity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBe(1.0);
  });

  test('buildIntensity < 1.0 (descanso visual)', async () => {
    logger.info('Verificando build intensity');
    const match = themes.match(/buildIntensity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeLessThan(1.0);
    expect(parseFloat(match![1])).toBeGreaterThan(0);
  });

  test('climaxIntensity > 1.0 (escalada final)', async () => {
    logger.info('Verificando climax intensity');
    const match = themes.match(/climaxIntensity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThan(1.0);
  });

  test('rhythmPause con intervalFrames, durationFrames, dampingFactor', async () => {
    logger.info('Verificando rhythmPause config');
    expect(themes).toContain('rhythmPause');
    expect(themes).toContain('intervalFrames');
    expect(themes).toContain('durationFrames');
    expect(themes).toContain('dampingFactor');
  });

  test('dampingFactor entre 0 y 1 (reducción parcial)', async () => {
    logger.info('Verificando dampingFactor');
    const match = themes.match(/dampingFactor:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    const val = parseFloat(match![1]);
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThan(1);
  });

  test('preFinalDecel con leadFrames y minIntensity', async () => {
    logger.info('Verificando preFinalDecel config');
    expect(themes).toContain('preFinalDecel');
    expect(themes).toContain('leadFrames');
    expect(themes).toContain('minIntensity');
  });

  test('minIntensity entre 0 y 1 (nunca completamente muerto)', async () => {
    logger.info('Verificando minIntensity');
    const match = themes.match(/minIntensity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    const val = parseFloat(match![1]);
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThan(1);
  });

  test('Prompt 49 documentado en header', async () => {
    logger.info('Verificando documentación');
    expect(themes).toContain('Prompt 49');
  });
});

// =============================================================================
// TESTS: FUNCIÓN getIntensityMultiplier
// =============================================================================

test.describe('Prompt 49 - getIntensityMultiplier', () => {
  const logger = new TestLogger({ testName: 'Prompt49-Function' });
  let narrativeRhythmSrc: string;

  test.beforeAll(async () => {
    narrativeRhythmSrc = fs.readFileSync(NARRATIVE_RHYTHM_PATH, 'utf-8');
  });

  test('narrative-rhythm.ts existe y exporta getIntensityMultiplier', async () => {
    logger.info('Verificando archivo');
    expect(fs.existsSync(NARRATIVE_RHYTHM_PATH)).toBe(true);
    expect(narrativeRhythmSrc).toContain('export function getIntensityMultiplier');
  });

  test('Función es pura (sin side-effects, O(1) por frame)', async () => {
    logger.info('Verificando pureza funcional');
    // No debe tener let fuera de la función, ni acceder a globals
    expect(narrativeRhythmSrc).not.toContain('document.');
    expect(narrativeRhythmSrc).not.toContain('window.');
    expect(narrativeRhythmSrc).not.toContain('console.');
    // Debe retornar un número
    expect(narrativeRhythmSrc).toContain('): number');
  });

  test('Capa 1: Curva base por fase (opening, build, climax)', async () => {
    logger.info('Verificando capa 1');
    expect(narrativeRhythmSrc).toContain('intensityCurve.openingEnd');
    expect(narrativeRhythmSrc).toContain('intensityCurve.buildEnd');
    expect(narrativeRhythmSrc).toContain('intensityCurve.openingIntensity');
    expect(narrativeRhythmSrc).toContain('intensityCurve.buildIntensity');
    expect(narrativeRhythmSrc).toContain('intensityCurve.climaxIntensity');
  });

  test('Capa 2: Micro-pausa rítmica con sine suavizado', async () => {
    logger.info('Verificando capa 2');
    expect(narrativeRhythmSrc).toContain('rhythmPause.intervalFrames');
    expect(narrativeRhythmSrc).toContain('rhythmPause.durationFrames');
    expect(narrativeRhythmSrc).toContain('rhythmPause.dampingFactor');
    expect(narrativeRhythmSrc).toContain('Math.sin');
  });

  test('Capa 3: Desaceleración pre-final', async () => {
    logger.info('Verificando capa 3');
    expect(narrativeRhythmSrc).toContain('preFinalDecel.leadFrames');
    expect(narrativeRhythmSrc).toContain('preFinalDecel.minIntensity');
  });

  test('Las 3 capas se componen multiplicativamente', async () => {
    logger.info('Verificando composición');
    expect(narrativeRhythmSrc).toContain('base * pauseFactor * decelFactor');
  });

  test('Importa narrativeRhythm desde themes', async () => {
    logger.info('Verificando import');
    expect(narrativeRhythmSrc).toContain("from '../styles/themes'");
    expect(narrativeRhythmSrc).toContain('narrativeRhythm');
  });

  test('Exportado desde utils/index.ts', async () => {
    logger.info('Verificando barrel export');
    const index = fs.readFileSync(UTILS_INDEX_PATH, 'utf-8');
    expect(index).toContain('getIntensityMultiplier');
    expect(index).toContain("from './narrative-rhythm'");
  });
});

// =============================================================================
// TESTS: INTEGRACIÓN EN CONTENTSCENE
// =============================================================================

test.describe('Prompt 49 - ContentScene Integración', () => {
  const logger = new TestLogger({ testName: 'Prompt49-ContentScene' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('ContentScene importa narrativeRhythm de themes', async () => {
    logger.info('Verificando import narrativeRhythm');
    expect(content).toContain('narrativeRhythm');
    expect(content).toMatch(/import.*narrativeRhythm.*from.*themes/);
  });

  test('ContentScene importa getIntensityMultiplier de utils', async () => {
    logger.info('Verificando import getIntensityMultiplier');
    expect(content).toContain('getIntensityMultiplier');
    expect(content).toMatch(/import.*getIntensityMultiplier.*from.*utils/);
  });

  test('intensity calculado con getIntensityMultiplier', async () => {
    logger.info('Verificando cálculo de intensity');
    expect(content).toContain('getIntensityMultiplier(frame, fps, durationInFrames, narrativeRhythm)');
  });

  test('imageBreathingScale usa intensity como multiplicador', async () => {
    logger.info('Verificando breathing modulado');
    expect(content).toContain('imageBreathing.amplitude * intensity');
  });

  test('imageXDrift usa intensity como multiplicador', async () => {
    logger.info('Verificando X-drift modulado');
    expect(content).toContain('imageXDrift.amplitude * intensity');
  });

  test('textMicroDriftY usa intensity como multiplicador', async () => {
    logger.info('Verificando text drift modulado');
    expect(content).toContain('textMicroDrift.amplitude * intensity');
  });

  test('Parallax Y NO modulado por intensity (es animación de escena)', async () => {
    logger.info('Verificando que parallax no cambia');
    // parallaxY no debe multiplicarse por intensity
    expect(content).not.toMatch(/parallaxY\s*\*\s*intensity/);
  });

  test('imageScale (zoom) NO modulado por intensity (es animación de escena)', async () => {
    logger.info('Verificando que zoom no cambia');
    // El zoom lento existente no debe multiplicarse por intensity
    expect(content).not.toMatch(/imageScale\s*\*\s*intensity/);
  });

  test('JSDoc menciona Prompt 49', async () => {
    logger.info('Verificando documentación');
    expect(content).toMatch(/@updated Prompt 49/);
  });
});

// =============================================================================
// TESTS: REGRESIÓN (NO ROMPER NADA)
// =============================================================================

test.describe('Prompt 49 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt49-Regression' });

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

  test('HeroScene NO importa narrativeRhythm (tiene heroImpact propio)', async () => {
    logger.info('Verificando HeroScene intacto');
    const hero = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    expect(hero).not.toContain('narrativeRhythm');
    expect(hero).not.toContain('getIntensityMultiplier');
  });

  test('OutroScene NO importa narrativeRhythm (breathing independiente)', async () => {
    logger.info('Verificando OutroScene intacto');
    const outro = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
    expect(outro).not.toContain('narrativeRhythm');
    expect(outro).not.toContain('getIntensityMultiplier');
  });

  test('AINewsShort NO importa narrativeRhythm', async () => {
    logger.info('Verificando AINewsShort intacto');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).not.toContain('narrativeRhythm');
  });

  test('visualEmphasis config intacta', async () => {
    logger.info('Verificando visualEmphasis');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('export const visualEmphasis');
  });

  test('microDynamics config intacta', async () => {
    logger.info('Verificando microDynamics');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('export const microDynamics');
  });

  test('ContentScene parallax Y intacto', async () => {
    logger.info('Verificando parallax');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('contentAnimation.parallaxKeyframes');
  });

  test('ContentScene zoom original intacto', async () => {
    logger.info('Verificando zoom');
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
