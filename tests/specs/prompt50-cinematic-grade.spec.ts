/**
 * @fileoverview Tests para Prompt 50 - Polish Cinematográfico Premium
 *
 * Valida que:
 * - cinematicGrade config existe en themes.ts con valores seguros
 * - AINewsShort.tsx aplica filter CSS global (contrast, saturate, brightness)
 * - OutroScene CTA mejorado (fontWeight 600, letterSpacing, textShadow)
 * - Sin regresiones en SAFE_MAX, timing, crossfade, micro-dinámicas
 *
 * @since Prompt 50
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// Rutas a archivos fuente
const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles', 'themes.ts');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
const BG_DIRECTOR_PATH = path.join(REMOTION_SRC, 'components', 'backgrounds', 'BackgroundDirector.tsx');

// =============================================================================
// TESTS: CONFIG cinematicGrade EN THEMES.TS
// =============================================================================

test.describe('Prompt 50 - Config cinematicGrade en themes.ts', () => {
  const logger = new TestLogger({ testName: 'Prompt50-Config' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('cinematicGrade config exportada', async () => {
    logger.info('Verificando export de cinematicGrade');
    expect(themes).toContain('export const cinematicGrade');
  });

  test('contrast > 1.0 y <= 1.15 (sutil)', async () => {
    logger.info('Verificando contrast');
    const match = themes.match(/cinematicGrade[\s\S]*?contrast:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    const val = parseFloat(match![1]);
    expect(val).toBeGreaterThan(1.0);
    expect(val).toBeLessThanOrEqual(1.15);
  });

  test('saturate > 1.0 y <= 1.10 (sutil)', async () => {
    logger.info('Verificando saturate');
    const match = themes.match(/cinematicGrade[\s\S]*?saturate:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    const val = parseFloat(match![1]);
    expect(val).toBeGreaterThan(1.0);
    expect(val).toBeLessThanOrEqual(1.10);
  });

  test('brightness < 1.0 y >= 0.95 (profundidad sin oscurecer)', async () => {
    logger.info('Verificando brightness');
    const match = themes.match(/cinematicGrade[\s\S]*?brightness:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    const val = parseFloat(match![1]);
    expect(val).toBeLessThan(1.0);
    expect(val).toBeGreaterThanOrEqual(0.95);
  });

  test('Prompt 50 documentado', async () => {
    logger.info('Verificando documentación');
    expect(themes).toContain('Prompt 50');
  });
});

// =============================================================================
// TESTS: FILTER EN AINEWSSHORT.TSX
// =============================================================================

test.describe('Prompt 50 - Filter global en AINewsShort', () => {
  const logger = new TestLogger({ testName: 'Prompt50-Filter' });
  let ainews: string;

  test.beforeAll(async () => {
    ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('AINewsShort importa cinematicGrade', async () => {
    logger.info('Verificando import');
    expect(ainews).toContain('cinematicGrade');
    expect(ainews).toMatch(/import.*cinematicGrade.*from.*themes/);
  });

  test('Filter CSS contiene contrast', async () => {
    logger.info('Verificando contrast en filter');
    expect(ainews).toContain('cinematicGrade.contrast');
  });

  test('Filter CSS contiene saturate', async () => {
    logger.info('Verificando saturate en filter');
    expect(ainews).toContain('cinematicGrade.saturate');
  });

  test('Filter CSS contiene brightness', async () => {
    logger.info('Verificando brightness en filter');
    expect(ainews).toContain('cinematicGrade.brightness');
  });

  test('Filter aplicado con template literal (no hardcoded)', async () => {
    logger.info('Verificando que usa config centralizada');
    expect(ainews).toMatch(/filter:.*contrast\(\$\{cinematicGrade\.contrast\}\)/);
  });

  test('JSDoc menciona Prompt 50', async () => {
    logger.info('Verificando documentación');
    expect(ainews).toMatch(/@updated Prompt 50/);
  });
});

// =============================================================================
// TESTS: CTA MEJORADO EN OUTROSCENE
// =============================================================================

test.describe('Prompt 50 - CTA Premium en OutroScene', () => {
  const logger = new TestLogger({ testName: 'Prompt50-CTA' });
  let outro: string;

  test.beforeAll(async () => {
    outro = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
  });

  test('CTA fontWeight >= 600 (semi-bold)', async () => {
    logger.info('Verificando fontWeight');
    // Buscar el bloque del CTA (Síguenos...)
    const ctaBlock = outro.match(/Síguenos[\s\S]*?<\/div>/);
    expect(ctaBlock).toBeTruthy();
    // El fontWeight 600 debe estar en el style del CTA
    expect(outro).toContain('fontWeight: 600');
  });

  test('CTA letterSpacing definido', async () => {
    logger.info('Verificando letterSpacing');
    // Debe tener letterSpacing en el estilo del CTA
    // Buscar letterSpacing cerca del texto CTA
    const ctaSection = outro.match(/fontWeight: 600[\s\S]*?Síguenos/);
    expect(ctaSection).toBeTruthy();
    expect(ctaSection![0]).toContain('letterSpacing');
  });

  test('CTA textShadow con editorialShadow.textDepth', async () => {
    logger.info('Verificando textShadow');
    // El CTA debe usar la sombra editorial centralizada
    const ctaSection = outro.match(/fontWeight: 600[\s\S]*?Síguenos/);
    expect(ctaSection).toBeTruthy();
    expect(ctaSection![0]).toContain('editorialShadow.textDepth');
  });

  test('JSDoc menciona Prompt 50', async () => {
    logger.info('Verificando documentación');
    expect(outro).toMatch(/@updated Prompt 50/);
  });
});

// =============================================================================
// TESTS: REGRESIÓN (NO ROMPER NADA)
// =============================================================================

test.describe('Prompt 50 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt50-Regression' });

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

  test('AudioMixer sin cambio', async () => {
    logger.info('Verificando AudioMixer');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toContain('<AudioMixer');
  });

  test('microDynamics config intacta', async () => {
    logger.info('Verificando microDynamics');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('export const microDynamics');
  });

  test('narrativeRhythm config intacta', async () => {
    logger.info('Verificando narrativeRhythm');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('export const narrativeRhythm');
  });

  test('BackgroundDirector sin cambios (vignette intacta)', async () => {
    logger.info('Verificando BackgroundDirector');
    const bg = fs.readFileSync(BG_DIRECTOR_PATH, 'utf-8');
    expect(bg).toContain('radial-gradient');
    expect(bg).toContain('vignetteStrength');
    // No debe importar cinematicGrade
    expect(bg).not.toContain('cinematicGrade');
  });

  test('ContentScene NO importa cinematicGrade (filter es global)', async () => {
    logger.info('Verificando ContentScene');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).not.toContain('cinematicGrade');
  });

  test('HeroScene NO importa cinematicGrade (filter es global)', async () => {
    logger.info('Verificando HeroScene');
    const hero = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    expect(hero).not.toContain('cinematicGrade');
  });

  test('breathingMotion config original intacta', async () => {
    logger.info('Verificando breathingMotion original');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('export const breathingMotion');
    const ampMatch = themes.match(/export const breathingMotion[\s\S]*?amplitude:\s*([\d.]+)/);
    expect(ampMatch).toBeTruthy();
    expect(parseFloat(ampMatch![1])).toBe(0.005);
  });

  test('editorialShadow.textDepth sin cambio', async () => {
    logger.info('Verificando editorialShadow');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain("textDepth: '0px 2px 8px rgba(0,0,0,0.45)'");
  });
});
