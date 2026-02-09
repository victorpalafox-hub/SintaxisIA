/**
 * @fileoverview Tests para Prompt 39-Fix3 - Jerarquia tipografica fija (anti-amateur)
 *
 * Valida:
 * - themes.ts: 3 niveles globales (headline 72, support 54, punch 84)
 * - HeroScene: usa editorialText.headline (no hardcoded)
 * - OutroScene: usa editorialText niveles (no hardcoded)
 * - Regresion: ContentScene, TitleCard, emphasis, audio sin cambios
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 39-Fix3
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
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const TITLE_CARD_PATH = path.join(REMOTION_SRC, 'components/scenes/TitleCardScene.tsx');

// =============================================================================
// TESTS: NIVELES TIPOGRAFICOS EN THEMES.TS
// =============================================================================

test.describe('Prompt 39-Fix3 - Niveles tipograficos globales', () => {
  const logger = new TestLogger({ testName: 'Prompt39Fix3-Levels' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('headline.fontSize = 72 (apertura, titulos)', async () => {
    logger.info('Verificando headline fontSize');
    // Extraer seccion headline
    const headlineSection = themes.substring(
      themes.indexOf('headline: {'),
      themes.indexOf('support: {')
    );
    expect(headlineSection).toContain('fontSize: 72');
  });

  test('support.fontSize = 54 (contexto, explicacion)', async () => {
    logger.info('Verificando support fontSize');
    const supportSection = themes.substring(
      themes.indexOf('support: {'),
      themes.indexOf('punch: {')
    );
    expect(supportSection).toContain('fontSize: 54');
  });

  test('punch.fontSize = 84 (impacto, remate)', async () => {
    logger.info('Verificando punch fontSize');
    const punchSection = themes.substring(
      themes.indexOf('punch: {'),
      themes.indexOf('pauseFramesBeforePunch')
    );
    expect(punchSection).toContain('fontSize: 84');
  });

  test('spread punch-support >= 25px (claramente distinguible)', async () => {
    logger.info('Verificando spread minimo');
    // Extraer valores numericos
    const punchMatch = themes.match(/punch:\s*\{[^}]*fontSize:\s*(\d+)/);
    const supportMatch = themes.match(/support:\s*\{[^}]*fontSize:\s*(\d+)/);
    expect(punchMatch).not.toBeNull();
    expect(supportMatch).not.toBeNull();
    const spread = Number(punchMatch![1]) - Number(supportMatch![1]);
    expect(spread).toBeGreaterThanOrEqual(25);
  });

  test('spread headline-support >= 15px (notablemente diferente)', async () => {
    logger.info('Verificando spread headline-support');
    const headlineMatch = themes.match(/headline:\s*\{[^}]*fontSize:\s*(\d+)/);
    const supportMatch = themes.match(/support:\s*\{[^}]*fontSize:\s*(\d+)/);
    expect(headlineMatch).not.toBeNull();
    expect(supportMatch).not.toBeNull();
    const spread = Number(headlineMatch![1]) - Number(supportMatch![1]);
    expect(spread).toBeGreaterThanOrEqual(15);
  });
});

// =============================================================================
// TESTS: HEROSCENE USA EDITORIAL TEXT
// =============================================================================

test.describe('Prompt 39-Fix3 - HeroScene usa editorialText', () => {
  const logger = new TestLogger({ testName: 'Prompt39Fix3-Hero' });
  let heroContent: string;

  test.beforeAll(async () => {
    heroContent = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
  });

  test('importa editorialText de themes', async () => {
    logger.info('Verificando import editorialText en HeroScene');
    expect(heroContent).toContain('editorialText');
    expect(heroContent).toContain("from '../../styles/themes'");
  });

  test('titulo usa editorialText.headline.fontSize (no hardcoded)', async () => {
    logger.info('Verificando fontSize via editorialText');
    expect(heroContent).toContain('editorialText.headline.fontSize');
  });

  test('titulo usa editorialText.headline.fontWeight (no hardcoded)', async () => {
    logger.info('Verificando fontWeight via editorialText');
    expect(heroContent).toContain('editorialText.headline.fontWeight');
  });
});

// =============================================================================
// TESTS: OUTROSCENE USA EDITORIAL TEXT
// =============================================================================

test.describe('Prompt 39-Fix3 - OutroScene usa editorialText', () => {
  const logger = new TestLogger({ testName: 'Prompt39Fix3-Outro' });
  let outroContent: string;

  test.beforeAll(async () => {
    outroContent = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
  });

  test('importa editorialText de themes', async () => {
    logger.info('Verificando import editorialText en OutroScene');
    expect(outroContent).toContain('editorialText');
    expect(outroContent).toContain("from '../../styles/themes'");
  });

  test('logo usa editorialText.headline.fontSize', async () => {
    logger.info('Verificando logo fontSize via editorialText');
    expect(outroContent).toContain('editorialText.headline.fontSize');
  });

  test('nombre usa editorialText.support.fontSize', async () => {
    logger.info('Verificando nombre fontSize via editorialText');
    expect(outroContent).toContain('editorialText.support.fontSize');
  });

  test('CTA mantiene 28px (metadata, no editorial)', async () => {
    logger.info('Verificando CTA fontSize intacto');
    expect(outroContent).toContain('fontSize: 28');
  });
});

// =============================================================================
// TESTS: REGRESION
// =============================================================================

test.describe('Prompt 39-Fix3 - Regresion: sin cambios colaterales', () => {
  const logger = new TestLogger({ testName: 'Prompt39Fix3-Regression' });

  test('ContentScene sigue usando blockStyle.fontSize', async () => {
    logger.info('Verificando ContentScene sin cambios');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('blockStyle.fontSize');
  });

  test('TitleCard mantiene titleCard.title.fontSize (overlay, no editorial)', async () => {
    logger.info('Verificando TitleCard sin cambios');
    const content = fs.readFileSync(TITLE_CARD_PATH, 'utf-8');
    expect(content).toContain('titleCard.title.fontSize');
  });

  test('visualEmphasis scale sin cambios', async () => {
    logger.info('Verificando emphasis intacto');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('scale: 1.08');
    expect(themes).toContain('scale: 1.03');
  });

  test('textAnimation fadeIn/fadeOut sin cambios', async () => {
    logger.info('Verificando text animation intacta');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('fadeInFrames: 15');
    expect(themes).toContain('fadeOutFrames: 15');
  });

  test('editorialText tiene 3 pesos intactos', async () => {
    logger.info('Verificando 3 pesos editoriales');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('headline: {');
    expect(themes).toContain('support: {');
    expect(themes).toContain('punch: {');
  });

  test('editorialText fontWeights sin cambios (700/500/800)', async () => {
    logger.info('Verificando fontWeights intactos');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const editorial = themes.substring(
      themes.indexOf('export const editorialText'),
      themes.indexOf('pauseFramesBeforePunch')
    );
    expect(editorial).toContain('fontWeight: 700');
    expect(editorial).toContain('fontWeight: 500');
    expect(editorial).toContain('fontWeight: 800');
  });
});
