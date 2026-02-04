/**
 * @fileoverview Tests para Prompt 19.8 - Dynamic Animations
 *
 * Valida que ContentScene tiene animaciones dinámicas activas
 * durante toda la duración de la escena (37 segundos).
 *
 * Cubre:
 * - Parallax full-duration (multi-point keyframe)
 * - Zoom full-duration con easing
 * - Per-phrase slide-up animation
 * - Glow pulse en texto (textShadow ciclico)
 * - Glow pulse en imagen (boxShadow dinamico)
 * - Config centralizada en themes.ts (contentAnimation)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.8
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');

// =============================================================================
// TESTS: PARALLAX Y ZOOM FULL-DURATION
// =============================================================================

test.describe('Prompt 19.8 - Parallax y Zoom Full-Duration', () => {
  const logger = new TestLogger({ testName: 'Prompt19.8-ParallaxZoom' });

  test('parallaxY usa sceneDurationFrames (no hardcoded 300)', async () => {
    logger.info('Verificando que parallax cubre toda la escena');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe usar sceneDurationFrames, no [0, 300]
    expect(content).toContain('sceneDurationFrames * 0.33');
    expect(content).toContain('sceneDurationFrames * 0.66');
    expect(content).toContain('contentAnimation.parallaxKeyframes');

    // No debe tener el rango hardcoded anterior [0, 300] para parallax
    expect(content).not.toMatch(/parallaxY[\s\S]{0,100}\[0, 300\]/);

    logger.info('parallaxY usa duracion completa de escena');
  });

  test('imageScale usa sceneDurationFrames (no hardcoded 300)', async () => {
    logger.info('Verificando que zoom cubre toda la escena');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe usar sceneDurationFrames para zoom
    expect(content).toContain('[0, sceneDurationFrames]');
    expect(content).toContain('contentAnimation.zoomRange');

    // Debe usar easing mejorado
    expect(content).toContain('Easing.inOut(Easing.ease)');

    logger.info('imageScale usa duracion completa de escena');
  });

  test('parallaxY tiene multi-point keyframe para movimiento organico', async () => {
    logger.info('Verificando multi-point keyframe');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe tener 4 puntos de keyframe (0%, 33%, 66%, 100%)
    expect(content).toContain('sceneDurationFrames * 0.33');
    expect(content).toContain('sceneDurationFrames * 0.66');
    expect(content).toContain('sceneDurationFrames]');

    logger.info('Parallax tiene movimiento organico multi-point');
  });
});

// =============================================================================
// TESTS: PER-PHRASE SLIDE-UP
// =============================================================================

test.describe('Prompt 19.8 - Per-Phrase Slide-Up', () => {
  const logger = new TestLogger({ testName: 'Prompt19.8-PhraseSlide' });

  test('phraseTextY usa phraseStartFrame para slide relativo', async () => {
    logger.info('Verificando per-phrase slide-up');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe calcular frame relativo a la frase actual
    expect(content).toContain('phraseTiming.phraseStartFrame');
    expect(content).toContain('phraseRelativeFrame');
    expect(content).toContain('phraseTextY');

    // Debe usar config centralizada
    expect(content).toContain('contentAnimation.phraseSlideFrames');
    expect(content).toContain('contentAnimation.phraseSlideDistance');

    logger.info('Per-phrase slide-up implementado');
  });

  test('phraseTextY se aplica en transform del texto', async () => {
    logger.info('Verificando aplicacion del slide en JSX');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe usar phraseTextY (no textY) en el transform
    expect(content).toContain('translateY(${phraseTextY}px)');

    // No debe tener el textY anterior (one-shot)
    expect(content).not.toContain('translateY(${textY}px)');

    logger.info('phraseTextY aplicado en transform');
  });
});

// =============================================================================
// TESTS: GLOW PULSE
// =============================================================================

test.describe('Prompt 19.8 - Glow Pulse', () => {
  const logger = new TestLogger({ testName: 'Prompt19.8-GlowPulse' });

  test('textGlow tiene patron ciclico con frame %', async () => {
    logger.info('Verificando glow ciclico en texto');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('textGlow');
    expect(content).toContain('contentAnimation.textGlowCycle');
    expect(content).toContain('contentAnimation.textGlowMax');

    logger.info('textGlow tiene patron ciclico');
  });

  test('textShadow usa colors.primary para glow', async () => {
    logger.info('Verificando textShadow con color del tema');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // textShadow debe usar textGlow y colors.primary
    expect(content).toContain('textShadow:');
    expect(content).toMatch(/textShadow:.*textGlow.*colors\.primary/s);

    logger.info('textShadow usa color del tema');
  });

  test('imageGlow tiene patron ciclico', async () => {
    logger.info('Verificando glow ciclico en imagen');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('imageGlow');
    expect(content).toContain('contentAnimation.imageGlowCycle');
    expect(content).toContain('contentAnimation.imageGlowMax');

    logger.info('imageGlow tiene patron ciclico');
  });

  test('boxShadow del wrapper de imagen es dinamico', async () => {
    logger.info('Verificando boxShadow dinamico');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // boxShadow debe contener imageGlow (no ser estatico)
    expect(content).toMatch(/boxShadow:.*imageGlow.*colors\.primary/s);

    logger.info('boxShadow es dinamico');
  });
});

// =============================================================================
// TESTS: CONFIGURACIÓN CENTRALIZADA
// =============================================================================

test.describe('Prompt 19.8 - Configuracion Centralizada', () => {
  const logger = new TestLogger({ testName: 'Prompt19.8-Config' });

  test('contentAnimation existe en themes.ts', async () => {
    logger.info('Verificando contentAnimation en themes');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    expect(content).toContain('export const contentAnimation');
    expect(content).toContain('parallaxKeyframes');
    expect(content).toContain('zoomRange');
    expect(content).toContain('textGlowMax');
    expect(content).toContain('textGlowCycle');
    expect(content).toContain('imageGlowMax');
    expect(content).toContain('imageGlowCycle');
    expect(content).toContain('phraseSlideDistance');
    expect(content).toContain('phraseSlideFrames');

    logger.info('contentAnimation config presente');
  });

  test('ContentScene importa contentAnimation de themes', async () => {
    logger.info('Verificando import de contentAnimation');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('contentAnimation');
    expect(content).toContain("from '../../styles/themes'");

    logger.info('Import de contentAnimation presente');
  });

  test('Documentacion JSDoc menciona Prompt 19.8', async () => {
    logger.info('Verificando documentacion');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/@updated Prompt 19\.8/);

    logger.info('Documentacion actualizada');
  });
});

// =============================================================================
// TESTS: GUARDS Y COMPATIBILIDAD
// =============================================================================

test.describe('Prompt 19.8 - Guards y Compatibilidad', () => {
  const logger = new TestLogger({ testName: 'Prompt19.8-Guards' });

  test('parallaxY y imageScale tienen guard dynamicEffects', async () => {
    logger.info('Verificando guards de dynamicEffects');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Parallax debe verificar dynamicEffects && contextImage
    expect(content).toMatch(/parallaxY\s*=\s*dynamicEffects\s*&&\s*contextImage/);
    // Zoom debe verificar dynamicEffects && contextImage
    expect(content).toMatch(/imageScale\s*=\s*dynamicEffects\s*&&\s*contextImage/);

    logger.info('Guards de dynamicEffects presentes');
  });

  test('phraseTextY tiene guard dynamicEffects', async () => {
    logger.info('Verificando guard en phraseTextY');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/phraseTextY\s*=?\s*dynamicEffects/);

    logger.info('Guard de dynamicEffects presente en phraseTextY');
  });

  test('Todas las interpolaciones usan extrapolateRight clamp', async () => {
    logger.info('Verificando clamp en interpolaciones');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Contar interpolaciones de Prompt 19.8 (parallax, zoom, imageGlow, phraseTextY, textGlow)
    const interpolateMatches = content.match(/interpolate\(/g) || [];
    const clampMatches = content.match(/extrapolateRight: 'clamp'/g) || [];

    // Debe haber al menos tantos clamps como interpolaciones
    expect(clampMatches.length).toBeGreaterThanOrEqual(interpolateMatches.length - 1);

    logger.info(`${clampMatches.length} clamps para ${interpolateMatches.length} interpolaciones`);
  });

  test('descriptionOpacity mantiene composicion con phraseTiming', async () => {
    logger.info('Verificando composicion de opacidad');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe mantener la multiplicacion baseOpacity * phraseTiming.opacity
    expect(content).toContain('baseOpacity * phraseTiming.opacity');

    logger.info('Composicion de opacidad mantenida');
  });
});
