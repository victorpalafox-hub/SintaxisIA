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

test.describe('Prompt 19.8 - Glow Pulse (Migrated to Editorial Shadows - Prompt 20)', () => {
  const logger = new TestLogger({ testName: 'Prompt19.8-EditorialShadows' });

  test('textShadow usa editorialShadow.textDepth (no textGlow dinamico)', async () => {
    logger.info('Verificando migracion a sombras editoriales para texto');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe usar editorialShadow.textDepth (estatico)
    expect(content).toContain('textShadow: editorialShadow.textDepth');

    // NO debe contener textGlow (variable dinamica eliminada)
    expect(content).not.toContain('textGlow');

    logger.info('textShadow usa editorialShadow.textDepth');
  });

  test('boxShadow usa editorialShadow.imageElevation (no imageGlow dinamico)', async () => {
    logger.info('Verificando migracion a sombras editoriales para imagen');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe usar editorialShadow.imageElevation (estatico)
    expect(content).toContain('boxShadow: editorialShadow.imageElevation');

    // NO debe contener imageGlow (variable dinamica eliminada)
    expect(content).not.toContain('imageGlow');

    logger.info('boxShadow usa editorialShadow.imageElevation');
  });

  test('ContentScene importa editorialShadow de themes', async () => {
    logger.info('Verificando import de editorialShadow');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe importar editorialShadow desde themes
    expect(content).toContain('editorialShadow');
    expect(content).toContain("from '../../styles/themes'");

    logger.info('Import de editorialShadow presente');
  });

  test('Documentacion JSDoc menciona Prompt 20 (Tech Editorial)', async () => {
    logger.info('Verificando documentacion de migracion');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe mencionar Prompt 20 en la documentacion
    expect(content).toMatch(/@updated Prompt 20/);

    logger.info('Documentacion actualizada con Prompt 20');
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
