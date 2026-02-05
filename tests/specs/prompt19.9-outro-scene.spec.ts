/**
 * @fileoverview Tests para Prompt 19.9 - OutroScene Mejorado
 *
 * Valida las mejoras incrementales al OutroScene existente:
 * - Fade-out suave al final de la escena
 * - Editorial Shadows (Prompt 20 migration: glow cíclico reemplazado por editorialShadow)
 * - Configuración centralizada en outroAnimation (themes.ts)
 * - Easing en animaciones de entrada y CTA
 * - textShadow dinámico en brand name (ahora editorialShadow.textDepth)
 * - Mantiene compatibilidad con Prompt 19.4
 *
 * Complementa los 16 tests de prompt19.4-outro-duration.spec.ts.
 *
 * @author Sintaxis IA
 * @version 1.1.0
 * @since Prompt 19.9
 * @updated Prompt 20 - Migración de glow a editorial shadows
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
// TESTS: EDITORIAL SHADOWS (Prompt 20 Migration)
// =============================================================================

test.describe('Prompt 19.9 - Editorial Shadows', () => {
  const logger = new TestLogger({ testName: 'Prompt19.9-EditorialShadows' });

  test('OutroScene NO contiene glowIntensity (migrado a editorial)', async () => {
    logger.info('Verificando que glowIntensity fue removido');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // glowIntensity debe estar REMOVIDO completamente (Prompt 20)
    expect(content).not.toContain('glowIntensity');
    expect(content).not.toContain('frame % outroAnimation.glowCycle');
    expect(content).not.toContain('outroAnimation.glowMax');

    logger.info('glowIntensity removido correctamente');
  });

  test('OutroScene usa editorialShadow en lugar de glow', async () => {
    logger.info('Verificando migración a editorialShadow');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Debe importar editorialShadow
    expect(content).toContain('editorialShadow');
    // Debe usar editorialShadow.logoBrandTint para logo
    expect(content).toContain('editorialShadow.logoBrandTint(colors.primary)');
    // Debe usar editorialShadow.textDepth para brand name
    expect(content).toContain('editorialShadow.textDepth');

    logger.info('editorialShadow implementado correctamente');
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

  test('textShadow usa editorialShadow.textDepth en brand name (Prompt 20)', async () => {
    logger.info('Verificando textShadow editorial en brand name');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // Debe usar editorialShadow.textDepth (no glowIntensity)
    expect(content).toContain('textShadow: editorialShadow.textDepth');

    logger.info('textShadow editorial presente en brand name');
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
