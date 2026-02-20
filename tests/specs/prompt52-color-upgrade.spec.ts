/**
 * @fileoverview Tests para Prompt 52 - Color Upgrade: Paleta "The Verge" Editorial
 *
 * Valida que:
 * - techEditorialTheme usa paleta The Verge (#4CC2F1 azul, fondos negros profundos, blanco puro)
 * - editorialText colors alineados con nueva paleta
 * - Blobs con opacidad aumentada y blur reducido (más visibles)
 * - Accent glow más presente
 * - cinematicGrade corregido (brightness > 1.0, saturate vibrante)
 * - activeTheme sigue siendo 'Tech Editorial'
 * - Sin regresiones en estructura, animaciones ni timing
 *
 * @since Prompt 52
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles', 'themes.ts');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');
const BG_DIRECTOR_PATH = path.join(REMOTION_SRC, 'components', 'backgrounds', 'BackgroundDirector.tsx');

// =============================================================================
// TESTS: PALETA THE VERGE EN TECHEDIITORIALTHEME
// =============================================================================

test.describe('Prompt 52 - Paleta The Verge', () => {
  const logger = new TestLogger({ testName: 'Prompt52-Palette' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('colors.primary === #4CC2F1 (azul The Verge)', async () => {
    logger.info('Verificando primary');
    expect(themes).toContain("primary: '#4CC2F1'");
  });

  test('colors.secondary === #1A8FD1 (azul medio)', async () => {
    logger.info('Verificando secondary');
    expect(themes).toContain("secondary: '#1A8FD1'");
  });

  test('colors.accent === #4CC2F1 (unificado con primary)', async () => {
    logger.info('Verificando accent');
    expect(themes).toContain("accent: '#4CC2F1'");
  });

  test('background.dark === #080A0F (negro profundo)', async () => {
    logger.info('Verificando dark');
    expect(themes).toContain("dark: '#080A0F'");
  });

  test('background.darker === #04060A (negro puro azul)', async () => {
    logger.info('Verificando darker');
    expect(themes).toContain("darker: '#04060A'");
  });

  test('gradient.start === #080A0F', async () => {
    logger.info('Verificando gradient start');
    expect(themes).toContain("start: '#080A0F'");
  });

  test('gradient.middle === #0C1828', async () => {
    logger.info('Verificando gradient middle');
    expect(themes).toContain("middle: '#0C1828'");
  });

  test('gradient.end === #071220', async () => {
    logger.info('Verificando gradient end');
    expect(themes).toContain("end: '#071220'");
  });

  test('text.primary === #FFFFFF (blanco puro)', async () => {
    logger.info('Verificando text primary');
    expect(themes).toContain("primary: '#FFFFFF'");
  });

  test('text.secondary === #D4E8F5 (azul claro)', async () => {
    logger.info('Verificando text secondary');
    expect(themes).toContain("secondary: '#D4E8F5'");
  });

  test('text.muted === #8BA4B8 (azul grisáceo)', async () => {
    logger.info('Verificando text muted');
    expect(themes).toContain("muted: '#8BA4B8'");
  });

  test('overlay.light === #4CC2F110', async () => {
    logger.info('Verificando overlay light');
    expect(themes).toContain("light: '#4CC2F110'");
  });

  test('overlay.medium === #4CC2F120', async () => {
    logger.info('Verificando overlay medium');
    expect(themes).toContain("medium: '#4CC2F120'");
  });

  test('overlay.strong === #4CC2F135', async () => {
    logger.info('Verificando overlay strong');
    expect(themes).toContain("strong: '#4CC2F135'");
  });
});

// =============================================================================
// TESTS: EDITORIAL TEXT COLORS ALINEADOS
// =============================================================================

test.describe('Prompt 52 - Editorial text colors alineados', () => {
  const logger = new TestLogger({ testName: 'Prompt52-EditorialText' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('headline.color === #FFFFFF (alineado con text.primary)', async () => {
    logger.info('Verificando headline color');
    const headlineSection = themes.substring(
      themes.indexOf('headline: {'),
      themes.indexOf('support: {')
    );
    expect(headlineSection).toContain("color: '#FFFFFF'");
  });

  test('support.color === #D4E8F5 (alineado con text.secondary)', async () => {
    logger.info('Verificando support color');
    const supportSection = themes.substring(
      themes.indexOf('support: {'),
      themes.indexOf('punch: {')
    );
    expect(supportSection).toContain("color: '#D4E8F5'");
  });

  test('punch.color === #4CC2F1 (alineado con primary/accent)', async () => {
    logger.info('Verificando punch color');
    const punchSection = themes.substring(
      themes.indexOf('punch: {'),
      themes.indexOf('pauseFramesBeforePunch')
    );
    expect(punchSection).toContain("color: '#4CC2F1'");
  });
});

// =============================================================================
// TESTS: BLOBS Y ACCENT GLOW
// =============================================================================

test.describe('Prompt 52 - Blobs y accent glow', () => {
  const logger = new TestLogger({ testName: 'Prompt52-Blobs' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('blobPrimaryOpacity >= 0.60', async () => {
    logger.info('Verificando blob primary opacity');
    const match = themes.match(/blobPrimaryOpacity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.60);
  });

  test('blobSecondaryOpacity >= 0.40', async () => {
    logger.info('Verificando blob secondary opacity');
    const match = themes.match(/blobSecondaryOpacity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.40);
  });

  test('blobBlur <= 55', async () => {
    logger.info('Verificando blob blur');
    const match = themes.match(/blobBlur:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBeLessThanOrEqual(55);
  });

  test('accentGlowOpacity >= 0.35', async () => {
    logger.info('Verificando accent glow opacity');
    const match = themes.match(/accentGlowOpacity:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.35);
  });
});

// =============================================================================
// TESTS: CINEMATIC GRADE CORREGIDO
// =============================================================================

test.describe('Prompt 52 - Cinematic grade corregido', () => {
  const logger = new TestLogger({ testName: 'Prompt52-CinematicGrade' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('cinematicGrade.contrast >= 1.08', async () => {
    logger.info('Verificando contrast');
    const match = themes.match(/cinematicGrade[\s\S]*?contrast:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(1.08);
  });

  test('cinematicGrade.saturate >= 1.15 (vibrante)', async () => {
    logger.info('Verificando saturate');
    const match = themes.match(/cinematicGrade[\s\S]*?saturate:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(1.15);
  });

  test('cinematicGrade.brightness > 1.0 (corrige oscuridad)', async () => {
    logger.info('Verificando brightness');
    const match = themes.match(/cinematicGrade[\s\S]*?brightness:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThan(1.0);
  });
});

// =============================================================================
// TESTS: TEMA ACTIVO
// =============================================================================

test.describe('Prompt 52 - Tema activo sin cambio', () => {
  const logger = new TestLogger({ testName: 'Prompt52-ActiveTheme' });

  test('activeTheme sigue siendo techEditorialTheme', async () => {
    logger.info('Verificando tema activo');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('export const activeTheme = techEditorialTheme');
  });

  test('theme name es Tech Editorial', async () => {
    logger.info('Verificando nombre del tema');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain("name: 'Tech Editorial'");
  });

  test('Prompt 52 documentado en themes.ts', async () => {
    logger.info('Verificando documentación');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('Prompt 52');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 52 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt52-Regression' });

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

  test('crossfadeFrames = 30 sin cambio', async () => {
    logger.info('Verificando crossfade');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toMatch(/crossfadeFrames:\s*30/);
  });

  test('editorialShadow.textDepth sin cambio', async () => {
    logger.info('Verificando editorialShadow');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain("textDepth: '0px 2px 8px rgba(0,0,0,0.45)'");
  });

  test('spacing sin cambio (unit 8, safe zones)', async () => {
    logger.info('Verificando spacing');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('unit: 8');
    expect(themes).toContain('top: 80');
    expect(themes).toContain('bottom: 120');
    expect(themes).toContain('horizontal: 40');
  });

  test('breathingMotion config intacta', async () => {
    logger.info('Verificando breathingMotion');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const ampMatch = themes.match(/export const breathingMotion[\s\S]*?amplitude:\s*([\d.]+)/);
    expect(ampMatch).toBeTruthy();
    expect(parseFloat(ampMatch![1])).toBe(0.005);
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

  test('Archivos .tsx NO modificados (sin Prompt 52)', async () => {
    logger.info('Verificando que archivos .tsx no fueron tocados');
    const hero = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    const outro = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
    const bg = fs.readFileSync(BG_DIRECTOR_PATH, 'utf-8');

    expect(hero).not.toContain('Prompt 52');
    expect(content).not.toContain('Prompt 52');
    expect(outro).not.toContain('Prompt 52');
    expect(bg).not.toContain('Prompt 52');
  });
});
