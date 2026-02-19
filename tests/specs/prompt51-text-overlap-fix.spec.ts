/**
 * @fileoverview Tests para Prompt 51 - Fix Empalme Texto HeroScene + TitleCard
 *
 * Valida que:
 * - titleDelayedIn usa titleCardFadeStart (no [2, 10])
 * - Título Hero invisible durante frames 0-74 (TitleCard visible)
 * - Crossfade suave frames 75-95 (TitleCard sale, Hero entra)
 * - Título Hero completamente visible desde frame 95
 * - Sin regresiones en timing, SAFE_MAX, titleEarlyOut
 *
 * @since Prompt 51
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// Rutas a archivos fuente
const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
const TITLE_CARD_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'TitleCardScene.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles', 'themes.ts');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');

// =============================================================================
// TESTS: FIX EMPALME TEXTO
// =============================================================================

test.describe('Prompt 51 - Fix empalme titleDelayedIn', () => {
  const logger = new TestLogger({ testName: 'Prompt51-Overlap' });
  let hero: string;

  test.beforeAll(async () => {
    hero = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
  });

  test('titleDelayedIn usa titleCardFadeStart (no hardcoded [2, 10])', async () => {
    logger.info('Verificando rango de titleDelayedIn');
    expect(hero).toContain('[titleCardFadeStart, titleCardFadeStart + 20]');
    // No debe usar [2, 10] como rango de interpolación para titleDelayedIn
    expect(hero).not.toMatch(/titleDelayedIn\s*=\s*interpolate[\s\S]{0,50}\[2,\s*10\]/);
  });

  test('titleTranslateY usa titleCardFadeStart (sincronizado con titleDelayedIn)', async () => {
    logger.info('Verificando rango de titleTranslateY');
    // titleTranslateY debe usar el mismo rango que titleDelayedIn
    const matches = hero.match(/\[titleCardFadeStart, titleCardFadeStart \+ 20\]/g);
    expect(matches).toBeTruthy();
    expect(matches!.length).toBeGreaterThanOrEqual(2); // titleDelayedIn + titleTranslateY
  });

  test('titleCardFadeStart calculado desde titleCard config', async () => {
    logger.info('Verificando cálculo de titleCardFadeStart');
    expect(hero).toContain('titleCard.durationFrames');
    expect(hero).toContain('titleCard.fadeOutFrames');
    expect(hero).toContain('titleCardEnd - titleCard.fadeOutFrames');
  });

  test('titleDelayedIn sigue usando interpolate con clamp', async () => {
    logger.info('Verificando interpolate con clamp');
    expect(hero).toMatch(/titleDelayedIn\s*=\s*interpolate/);
    expect(hero).toContain("extrapolateLeft: 'clamp'");
    expect(hero).toContain("extrapolateRight: 'clamp'");
  });

  test('titleTranslateY sigue con rango [-20, 0]', async () => {
    logger.info('Verificando slide -20 → 0');
    expect(hero).toContain('[-20, 0]');
  });

  test('titleEarlyOut sin cambios (frames [195, 210])', async () => {
    logger.info('Verificando titleEarlyOut intacto');
    expect(hero).toContain('titleEarlyOut');
    expect(hero).toContain('durationInFrames - sceneTransition.crossfadeFrames - 15');
  });

  test('Opacidad compuesta sin cambios (titleOpacity * titleDelayedIn * titleEarlyOut)', async () => {
    logger.info('Verificando composición de opacidad');
    expect(hero).toContain('titleOpacity * titleDelayedIn * titleEarlyOut');
  });

  test('JSDoc menciona Prompt 51', async () => {
    logger.info('Verificando documentación');
    expect(hero).toMatch(/@updated Prompt 51/);
  });
});

// =============================================================================
// TESTS: VALIDACIONES MATEMÁTICAS DEL CROSSFADE
// =============================================================================

test.describe('Prompt 51 - Validaciones matemáticas crossfade', () => {
  const logger = new TestLogger({ testName: 'Prompt51-Math' });

  // titleCard config values (from themes.ts)
  const titleCardDuration = 90;
  const titleCardFadeOut = 15;
  const titleCardFadeStart = titleCardDuration - titleCardFadeOut; // 75

  const interpolate = (
    value: number,
    inputRange: [number, number],
    outputRange: [number, number]
  ): number => {
    const t = Math.max(0, Math.min(1, (value - inputRange[0]) / (inputRange[1] - inputRange[0])));
    return outputRange[0] + t * (outputRange[1] - outputRange[0]);
  };

  test('Frame 0-74: título Hero invisible (titleDelayedIn = 0)', async () => {
    logger.info('Verificando invisibilidad frames 0-74');
    for (const f of [0, 10, 30, 50, 74]) {
      const opacity = interpolate(f, [titleCardFadeStart, titleCardFadeStart + 20], [0, 1]);
      expect(opacity).toBe(0);
    }
  });

  test('Frame 75: inicio del crossfade (titleDelayedIn = 0)', async () => {
    logger.info('Verificando frame 75');
    const opacity = interpolate(75, [titleCardFadeStart, titleCardFadeStart + 20], [0, 1]);
    expect(opacity).toBe(0);
  });

  test('Frame 85: mitad del crossfade (titleDelayedIn ≈ 0.5)', async () => {
    logger.info('Verificando frame 85');
    const opacity = interpolate(85, [titleCardFadeStart, titleCardFadeStart + 20], [0, 1]);
    expect(opacity).toBeCloseTo(0.5, 2);
  });

  test('Frame 95: crossfade completo (titleDelayedIn = 1)', async () => {
    logger.info('Verificando frame 95');
    const opacity = interpolate(95, [titleCardFadeStart, titleCardFadeStart + 20], [0, 1]);
    expect(opacity).toBe(1);
  });

  test('Frame 200: título Hero sigue visible (titleDelayedIn clamped a 1)', async () => {
    logger.info('Verificando frame 200');
    const opacity = interpolate(200, [titleCardFadeStart, titleCardFadeStart + 20], [0, 1]);
    expect(opacity).toBe(1);
  });

  test('TitleCard fade-out (frames 75-90) se solapa con Hero fade-in (75-95)', async () => {
    logger.info('Verificando solapamiento suave');
    // En frame 82 (mitad del fade-out de TitleCard):
    const titleCardOpacity = interpolate(82, [75, 90], [1, 0]);
    const heroOpacity = interpolate(82, [75, 95], [0, 1]);

    // Ambos deben tener opacidad parcial (crossfade)
    expect(titleCardOpacity).toBeGreaterThan(0);
    expect(titleCardOpacity).toBeLessThan(1);
    expect(heroOpacity).toBeGreaterThan(0);
    expect(heroOpacity).toBeLessThan(1);
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 51 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt51-Regression' });

  test('TitleCardScene.tsx NO modificado', async () => {
    logger.info('Verificando TitleCardScene intacto');
    const titleCard = fs.readFileSync(TITLE_CARD_PATH, 'utf-8');
    // No debe contener Prompt 51
    expect(titleCard).not.toContain('Prompt 51');
  });

  test('titleCard config en themes.ts sin cambio', async () => {
    logger.info('Verificando titleCard config');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    // Buscar titleCard específicamente (no cualquier durationFrames)
    const titleCardSection = themes.match(/export const titleCard[\s\S]*?durationFrames:\s*(\d+)/);
    const fadeOutMatch = themes.match(/export const titleCard[\s\S]*?fadeOutFrames:\s*(\d+)/);
    expect(titleCardSection).toBeTruthy();
    expect(fadeOutMatch).toBeTruthy();
    expect(parseInt(titleCardSection![1])).toBe(90);
    expect(parseInt(fadeOutMatch![1])).toBe(15);
  });

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

  test('AINewsShort.tsx NO modificado', async () => {
    logger.info('Verificando AINewsShort');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).not.toContain('Prompt 51');
  });

  test('breathingMotion config intacta', async () => {
    logger.info('Verificando breathingMotion');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const ampMatch = themes.match(/export const breathingMotion[\s\S]*?amplitude:\s*([\d.]+)/);
    expect(ampMatch).toBeTruthy();
    expect(parseFloat(ampMatch![1])).toBe(0.005);
  });
});
