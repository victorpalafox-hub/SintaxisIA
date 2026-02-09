/**
 * @fileoverview Tests para Prompt 36 - Polish final de color (Editorial Premium)
 *
 * Valida:
 * - themes.ts: colores premium, sombras sutiles, glows eliminados, accent unificado
 * - ContentScene.tsx: overlay editorial en imagenes, shadow condicional por peso
 * - SafeImage.tsx: placeholder con nuevo accent
 * - Regresion: editorialText estructura intacta, visualEmphasis sin cambios
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 36
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
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const SAFE_IMAGE_PATH = path.join(REMOTION_SRC, 'components/elements/SafeImage.tsx');

// =============================================================================
// TESTS: COLORES DEL TEMA EDITORIAL PREMIUM
// =============================================================================

test.describe('Prompt 36 - Colores del tema Tech Editorial', () => {
  const logger = new TestLogger({ testName: 'Prompt36-Colors' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('text.primary es #F5F7FA (blanco premium)', async () => {
    logger.info('Verificando blanco premium editorial');
    expect(themes).toContain("primary: '#F5F7FA'");
  });

  test('text.secondary es #C9CED6 (gris claro legible)', async () => {
    logger.info('Verificando gris secundario claro');
    expect(themes).toContain("secondary: '#C9CED6'");
  });

  test('text.muted es #9AA1AC (gris editorial medio)', async () => {
    logger.info('Verificando gris muted editorial');
    expect(themes).toContain("muted: '#9AA1AC'");
  });

  test('background.dark es #0B0D10 (base editorial)', async () => {
    logger.info('Verificando fondo base editorial');
    expect(themes).toContain("dark: '#0B0D10'");
  });

  test('background.darker es #12151C (elevado editorial)', async () => {
    logger.info('Verificando fondo elevado editorial');
    expect(themes).toContain("darker: '#12151C'");
  });

  test('colors.primary es #4DA3FF (azul editorial premium)', async () => {
    logger.info('Verificando primary color');
    expect(themes).toContain("primary: '#4DA3FF'");
  });

  test('colors.accent unificado con primary (#4DA3FF)', async () => {
    logger.info('Verificando accent unificado');
    expect(themes).toContain("accent: '#4DA3FF'");
  });
});

// =============================================================================
// TESTS: OVERLAYS ACTUALIZADOS
// =============================================================================

test.describe('Prompt 36 - Overlays con nuevo accent', () => {
  const logger = new TestLogger({ testName: 'Prompt36-Overlays' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('overlay.light usa #4DA3FF08', async () => {
    logger.info('Verificando overlay light');
    expect(themes).toContain("light: '#4DA3FF08'");
  });

  test('overlay.medium usa #4DA3FF15', async () => {
    logger.info('Verificando overlay medium');
    expect(themes).toContain("medium: '#4DA3FF15'");
  });

  test('overlay.strong usa #4DA3FF25', async () => {
    logger.info('Verificando overlay strong');
    expect(themes).toContain("strong: '#4DA3FF25'");
  });
});

// =============================================================================
// TESTS: ELIMINACION DE GLOWS
// =============================================================================

test.describe('Prompt 36 - Eliminacion total de glows', () => {
  const logger = new TestLogger({ testName: 'Prompt36-Glows' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('contentAnimation.textGlowMax = 0', async () => {
    logger.info('Verificando glow texto eliminado');
    expect(themes).toContain('textGlowMax: 0');
  });

  test('contentAnimation.imageGlowMax = 0', async () => {
    logger.info('Verificando glow imagen eliminado');
    expect(themes).toContain('imageGlowMax: 0');
  });

  test('outroAnimation.glowMax = 0', async () => {
    logger.info('Verificando glow outro eliminado');
    expect(themes).toContain('glowMax: 0');
  });

  test('heroAnimation.glowValues = [0, 0, 0, 0]', async () => {
    logger.info('Verificando glow hero eliminado');
    expect(themes).toContain('glowValues: [0, 0, 0, 0]');
  });

  test('heroAnimation.imageGlowMultiplier = 0', async () => {
    logger.info('Verificando multiplicador glow eliminado');
    expect(themes).toContain('imageGlowMultiplier: 0');
  });
});

// =============================================================================
// TESTS: SOMBRAS EDITORIALES SUTILES
// =============================================================================

test.describe('Prompt 36 - Sombras editoriales sutiles', () => {
  const logger = new TestLogger({ testName: 'Prompt36-Shadows' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('textDepth usa rgba(0,0,0,0.45) sutil', async () => {
    logger.info('Verificando sombra texto sutil');
    expect(themes).toContain('rgba(0,0,0,0.45)');
  });

  test('imageElevation usa 12px 40px rgba(0,0,0,0.35)', async () => {
    logger.info('Verificando sombra imagen editorial');
    expect(themes).toContain('0px 12px 40px rgba(0,0,0,0.35)');
  });
});

// =============================================================================
// TESTS: EDITORIAL TEXT COLORS
// =============================================================================

test.describe('Prompt 36 - Editorial text colors premium', () => {
  const logger = new TestLogger({ testName: 'Prompt36-EditorialText' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('headline.color es #F5F7FA (blanco premium, no puro)', async () => {
    logger.info('Verificando headline color premium');
    // editorialText headline color
    const headlineSection = themes.substring(
      themes.indexOf('headline: {'),
      themes.indexOf('support: {')
    );
    expect(headlineSection).toContain("color: '#F5F7FA'");
  });

  test('support.color es #C9CED6 (gris claro, no rgba)', async () => {
    logger.info('Verificando support color legible');
    const supportSection = themes.substring(
      themes.indexOf('support: {'),
      themes.indexOf('punch: {')
    );
    expect(supportSection).toContain("color: '#C9CED6'");
  });

  test('punch.color es #4DA3FF (accent unificado)', async () => {
    logger.info('Verificando punch color accent');
    const punchSection = themes.substring(
      themes.indexOf('punch: {'),
      themes.indexOf('pauseFramesBeforePunch')
    );
    expect(punchSection).toContain("color: '#4DA3FF'");
  });
});

// =============================================================================
// TESTS: CONTENT SCENE - OVERLAY EDITORIAL EN IMAGENES
// =============================================================================

test.describe('Prompt 36 - ContentScene overlay editorial', () => {
  const logger = new TestLogger({ testName: 'Prompt36-ContentOverlay' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('tiene gradient overlay editorial en imagenes', async () => {
    logger.info('Verificando gradient overlay en ContentScene');
    expect(content).toContain('linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.55))');
  });

  test('gradient overlay aparece al menos 2 veces (current + previous)', async () => {
    logger.info('Verificando overlay en ambas imagenes');
    const matches = content.match(/linear-gradient\(to bottom, rgba\(0,0,0,0\.25\), rgba\(0,0,0,0\.55\)\)/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
});

// =============================================================================
// TESTS: CONTENT SCENE - SHADOW CONDICIONAL
// =============================================================================

test.describe('Prompt 36 - ContentScene shadow condicional', () => {
  const logger = new TestLogger({ testName: 'Prompt36-ConditionalShadow' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('shadow condicional por peso (support sin shadow)', async () => {
    logger.info('Verificando shadow condicional');
    expect(content).toContain("weight !== 'support'");
  });

  test('usa editorialShadow.textDepth solo para headline/punch', async () => {
    logger.info('Verificando textDepth condicional');
    expect(content).toContain('editorialShadow.textDepth');
    expect(content).toContain("'none'");
  });
});

// =============================================================================
// TESTS: SAFE IMAGE PLACEHOLDER
// =============================================================================

test.describe('Prompt 36 - SafeImage placeholder actualizado', () => {
  const logger = new TestLogger({ testName: 'Prompt36-SafeImage' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');
  });

  test('placeholder usa #4DA3FF (nuevo accent)', async () => {
    logger.info('Verificando placeholder color');
    expect(content).toContain('background=4DA3FF');
  });

  test('placeholder NO usa #4A9EFF (viejo accent)', async () => {
    logger.info('Verificando viejo accent eliminado');
    expect(content).not.toContain('background=4A9EFF');
  });
});

// =============================================================================
// TESTS: REGRESION - ESTRUCTURA INTACTA
// =============================================================================

test.describe('Prompt 36 - Regresion: estructuras intactas', () => {
  const logger = new TestLogger({ testName: 'Prompt36-Regression' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('editorialText tiene 3 pesos (headline, support, punch)', async () => {
    logger.info('Verificando jerarquia editorial intacta');
    expect(themes).toContain('headline: {');
    expect(themes).toContain('support: {');
    expect(themes).toContain('punch: {');
  });

  test('visualEmphasis tiene hard y soft sin cambios', async () => {
    logger.info('Verificando visual emphasis intacto');
    expect(themes).toContain('scale: 1.08');
    expect(themes).toContain('scale: 1.03');
    expect(themes).toContain('bgDimOpacity: 0.35');
    expect(themes).toContain('bgDimOpacity: 0.15');
  });

  test('textAnimation sin cambios (fadeIn/fadeOut 15 frames)', async () => {
    logger.info('Verificando text animation intacta');
    expect(themes).toContain('fadeInFrames: 15');
    expect(themes).toContain('fadeOutFrames: 15');
    expect(themes).toContain('maxCharsPerPhrase: 60');
  });

  test('contentAnimation.parallaxKeyframes sin cambios', async () => {
    logger.info('Verificando parallax intacto');
    expect(themes).toContain('parallaxKeyframes: [0, -15, -8, -20]');
  });
});
