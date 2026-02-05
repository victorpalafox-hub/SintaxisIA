/**
 * @fileoverview Tests para Prompt 19.9 - OutroScene Mejorado
 *
 * Valida las mejoras incrementales al OutroScene existente:
 * - Fade-out suave al final de la escena
 * - Glow cíclico full-duration (patrón Prompt 19.8)
 * - Configuración centralizada en outroAnimation (themes.ts)
 * - Easing en animaciones de entrada y CTA
 * - textShadow dinámico en brand name
 * - Mantiene compatibilidad con Prompt 19.4
 *
 * Complementa los 16 tests de prompt19.4-outro-duration.spec.ts.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.9
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');

// =============================================================================
// TESTS: FADE-OUT FINAL
// =============================================================================

test.describe('Prompt 19.9 - Fade-Out Final', () => {
  const logger = new TestLogger({ testName: 'Prompt19.9-FadeOut' });

  test('OutroScene tiene fadeOut interpolation', async () => {
    logger.info('Verificando fade-out al final de escena');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Debe tener variable fadeOut
    expect(content).toContain('const fadeOut = interpolate(');
    // Debe usar durationInFrames para calcular punto de inicio
    expect(content).toContain('durationInFrames - outroAnimation.fadeOutFrames');

    logger.info('Fade-out presente');
  });

  test('finalOpacity combina fade-in y fade-out', async () => {
    logger.info('Verificando composición de opacidad');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Debe multiplicar sceneOpacity * fadeOut
    expect(content).toContain('const finalOpacity = sceneOpacity * fadeOut');
    // Debe usar finalOpacity en el render (no sceneOpacity)
    expect(content).toContain('opacity: finalOpacity');

    logger.info('finalOpacity correctamente compuesto');
  });

  test('fadeOut tiene extrapolateLeft y extrapolateRight clamp', async () => {
    logger.info('Verificando clamp en fadeOut');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // fadeOut debe tener ambos clamps para evitar valores fuera de rango
    expect(content).toMatch(/fadeOut[\s\S]*?extrapolateLeft: 'clamp'[\s\S]*?extrapolateRight: 'clamp'/);

    logger.info('fadeOut tiene clamp bilateral');
  });
});

// =============================================================================
// TESTS: GLOW CÍCLICO
// =============================================================================

test.describe('Prompt 19.9 - Glow Cíclico Full-Duration', () => {
  const logger = new TestLogger({ testName: 'Prompt19.9-Glow' });

  test('glowIntensity usa frame % para ciclo continuo', async () => {
    logger.info('Verificando glow cíclico');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Debe usar patrón cíclico (frame % cycle) en lugar de keyframes lineales
    expect(content).toContain('frame % outroAnimation.glowCycle');
    expect(content).toContain('outroAnimation.glowMax');

    logger.info('Glow usa patrón cíclico');
  });

  test('glowIntensity NO tiene keyframes hardcoded [0, 30, 60, 90, 120]', async () => {
    logger.info('Verificando que no hay keyframes hardcoded');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // No debe tener el patrón anterior hardcoded
    expect(content).not.toMatch(/glowIntensity[\s\S]{0,200}\[0, 30, 60, 90, 120\]/);

    logger.info('Sin keyframes hardcoded');
  });
});

// =============================================================================
// TESTS: CONFIGURACIÓN CENTRALIZADA
// =============================================================================

test.describe('Prompt 19.9 - Configuración Centralizada', () => {
  const logger = new TestLogger({ testName: 'Prompt19.9-Config' });

  test('outroAnimation existe en themes.ts', async () => {
    logger.info('Verificando outroAnimation en themes');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    expect(content).toContain('export const outroAnimation');
    expect(content).toContain('springDamping');
    expect(content).toContain('springStiffness');
    expect(content).toContain('glowMax');
    expect(content).toContain('glowCycle');
    expect(content).toContain('fadeOutFrames');
    expect(content).toContain('ctaDelayFrames');
    expect(content).toContain('ctaFadeDuration');

    logger.info('outroAnimation config completa');
  });

  test('OutroScene importa outroAnimation de themes', async () => {
    logger.info('Verificando import de outroAnimation');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toContain('outroAnimation');
    expect(content).toContain("from '../../styles/themes'");

    logger.info('Import de outroAnimation presente');
  });
});

// =============================================================================
// TESTS: EASING Y SPRING
// =============================================================================

test.describe('Prompt 19.9 - Easing y Spring', () => {
  const logger = new TestLogger({ testName: 'Prompt19.9-Easing' });

  test('Easing importado en OutroScene', async () => {
    logger.info('Verificando import de Easing');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toContain('Easing,');
    // Debe usar Easing.bezier en sceneOpacity
    expect(content).toContain('Easing.bezier(0.16, 1, 0.3, 1)');
    // Debe usar Easing.inOut en CTA
    expect(content).toContain('Easing.inOut(Easing.ease)');

    logger.info('Easing importado y usado');
  });

  test('spring() sigue presente (no reemplazado por Easing)', async () => {
    logger.info('Verificando que spring() se mantiene');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // spring() debe seguir para el logo (consistente con HeroScene)
    expect(content).toContain('spring({');
    expect(content).toContain('outroAnimation.springDamping');
    expect(content).toContain('outroAnimation.springStiffness');

    logger.info('spring() mantenido para logo');
  });
});

// =============================================================================
// TESTS: TEXTSHADOW Y COMPATIBILIDAD
// =============================================================================

test.describe('Prompt 19.9 - TextShadow y Compatibilidad', () => {
  const logger = new TestLogger({ testName: 'Prompt19.9-TextShadow' });

  test('textShadow aplicado al brand name', async () => {
    logger.info('Verificando textShadow en brand name');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Debe tener textShadow con glowIntensity y colors.primary
    expect(content).toMatch(/textShadow:.*glowIntensity.*colors\.primary/s);

    logger.info('textShadow presente en brand name');
  });

  test('Mantiene hashtags prop (compatibilidad Prompt 19.4)', async () => {
    logger.info('Verificando compatibilidad con hashtags');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Debe seguir recibiendo hashtags como prop
    expect(content).toContain('hashtags,');
    // Debe tener la nota de que no se renderizan
    expect(content).toContain('HASHTAGS NO SE RENDERIZAN');

    logger.info('Hashtags prop mantenido');
  });

  test('Documentacion JSDoc menciona Prompt 19.9', async () => {
    logger.info('Verificando documentación');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/@updated Prompt 19\.9/);

    logger.info('Documentación actualizada');
  });

  test('durationInFrames obtenido de useVideoConfig (Prompt 19.11 crossfade)', async () => {
    logger.info('Verificando durationInFrames de useVideoConfig');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Prompt 19.11: OutroScene usa useVideoConfig() en vez de hardcoded 5 * fps
    expect(content).toContain('const { durationInFrames } = useVideoConfig()');

    logger.info('durationInFrames de useVideoConfig');
  });
});
