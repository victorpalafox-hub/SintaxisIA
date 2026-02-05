/**
 * @fileoverview Tests para Prompt 19.11 - Smooth Transitions / Crossfade
 *
 * Valida las transiciones suaves (crossfade) entre escenas:
 * - sceneTransition config centralizada en themes.ts
 * - AINewsShort.tsx: Sequences con overlap de 30 frames
 * - HeroScene: fade-out con sceneTransition.crossfadeFrames
 * - ContentScene: fade-out con useVideoConfig + sceneTransition
 * - OutroScene: useVideoConfig en vez de hardcoded, fade-in sincronizado
 * - Total video sigue siendo 1500 frames (50s)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.11
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
const AI_NEWS_SHORT_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/HeroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');

// =============================================================================
// TESTS: sceneTransition CONFIG
// =============================================================================

test.describe('Prompt 19.11 - sceneTransition Config', () => {
  const logger = new TestLogger({ testName: 'Prompt19.11-Config' });

  test('sceneTransition existe en themes.ts', async () => {
    logger.info('Verificando sceneTransition en themes');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    expect(content).toContain('export const sceneTransition');
    expect(content).toContain('crossfadeFrames');

    logger.info('sceneTransition config presente');
  });

  test('sceneTransition.crossfadeFrames = 30', async () => {
    logger.info('Verificando valor de crossfadeFrames');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/sceneTransition\s*=\s*\{[^}]*crossfadeFrames:\s*(\d+)/s);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(30);

    logger.info('crossfadeFrames = 30');
  });
});

// =============================================================================
// TESTS: AINewsShort.tsx SEQUENCE OVERLAP
// =============================================================================

test.describe('Prompt 19.11 - AINewsShort Crossfade Timing', () => {
  const logger = new TestLogger({ testName: 'Prompt19.11-Composition' });

  test('importa sceneTransition de themes', async () => {
    logger.info('Verificando import de sceneTransition');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('sceneTransition');
    expect(content).toContain("from '../styles/themes'");

    logger.info('Import de sceneTransition presente');
  });

  test('crossfadeFrames se extrae de sceneTransition', async () => {
    logger.info('Verificando crossfadeFrames variable');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('sceneTransition.crossfadeFrames');

    logger.info('crossfadeFrames usa sceneTransition');
  });

  test('contentStart = heroSceneDuration - crossfadeFrames', async () => {
    logger.info('Verificando contentStart con overlap');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toMatch(/contentStart\s*=\s*heroSceneDuration\s*-\s*crossfadeFrames/);

    logger.info('contentStart tiene crossfade overlap');
  });

  test('outroStart = contentStart + contentSceneDuration', async () => {
    logger.info('Verificando outroStart con overlap');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toMatch(/outroStart\s*=\s*contentStart\s*\+\s*contentSceneDuration/);

    logger.info('outroStart calculado correctamente');
  });

  test('contentDuration = contentSceneDuration + crossfadeFrames', async () => {
    logger.info('Verificando contentDuration extendida');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toMatch(/contentDuration\s*=\s*contentSceneDuration\s*\+\s*crossfadeFrames/);

    logger.info('contentDuration extendida para crossfade');
  });

  test('outroDuration = outroSceneDuration + crossfadeFrames', async () => {
    logger.info('Verificando outroDuration extendida');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toMatch(/outroDuration\s*=\s*outroSceneDuration\s*\+\s*crossfadeFrames/);

    logger.info('outroDuration extendida para crossfade');
  });

  test('base durations sin cambios (8 + 37 + 5 = 50)', async () => {
    logger.info('Verificando duraciones base sin cambios');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    const heroMatch = content.match(/heroSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);
    const contentMatch = content.match(/contentSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);
    const outroMatch = content.match(/outroSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);

    expect(heroMatch).toBeTruthy();
    expect(contentMatch).toBeTruthy();
    expect(outroMatch).toBeTruthy();

    const total = parseInt(heroMatch![1]) + parseInt(contentMatch![1]) + parseInt(outroMatch![1]);
    expect(total).toBe(50);

    logger.info('Duraciones base correctas: 8 + 37 + 5 = 50');
  });

  test('Hero Sequence usa heroDuration', async () => {
    logger.info('Verificando Hero Sequence');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // Buscar que el Sequence Hero use heroDuration
    const heroSection = content.match(/name="Hero"[\s\S]*?<\/Sequence>/);
    expect(heroSection).toBeTruthy();
    expect(content).toContain('durationInFrames={heroDuration}');

    logger.info('Hero Sequence usa heroDuration');
  });

  test('Content Sequence usa contentDuration', async () => {
    logger.info('Verificando Content Sequence');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('durationInFrames={contentDuration}');

    logger.info('Content Sequence usa contentDuration');
  });

  test('Outro Sequence usa outroDuration', async () => {
    logger.info('Verificando Outro Sequence');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('durationInFrames={outroDuration}');

    logger.info('Outro Sequence usa outroDuration');
  });
});

// =============================================================================
// TESTS: HEROSCENE FADE-OUT
// =============================================================================

test.describe('Prompt 19.11 - HeroScene Fade-Out', () => {
  const logger = new TestLogger({ testName: 'Prompt19.11-Hero' });

  test('HeroScene importa sceneTransition', async () => {
    logger.info('Verificando import');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('sceneTransition');
    expect(content).toContain("from '../../styles/themes'");

    logger.info('Import presente');
  });

  test('HeroScene tiene fadeOut interpolation', async () => {
    logger.info('Verificando fade-out');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('const fadeOut = interpolate(');
    expect(content).toContain('durationInFrames - sceneTransition.crossfadeFrames');

    logger.info('Fade-out presente');
  });

  test('HeroScene aplica fadeOut en opacity del root', async () => {
    logger.info('Verificando opacity en render');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('opacity: fadeOut');

    logger.info('fadeOut aplicado al root');
  });

  test('HeroScene fadeOut tiene clamp bilateral', async () => {
    logger.info('Verificando clamp');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    // Buscar que fadeOut tenga ambos clamps
    const fadeOutSection = content.match(/const fadeOut = interpolate\([\s\S]*?\);/);
    expect(fadeOutSection).toBeTruthy();
    expect(fadeOutSection![0]).toContain("extrapolateLeft: 'clamp'");
    expect(fadeOutSection![0]).toContain("extrapolateRight: 'clamp'");

    logger.info('Clamp bilateral presente');
  });
});

// =============================================================================
// TESTS: CONTENTSCENE FADE-OUT
// =============================================================================

test.describe('Prompt 19.11 - ContentScene Fade-Out', () => {
  const logger = new TestLogger({ testName: 'Prompt19.11-Content' });

  test('ContentScene importa useVideoConfig', async () => {
    logger.info('Verificando import de useVideoConfig');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('useVideoConfig');

    logger.info('useVideoConfig importado');
  });

  test('ContentScene importa sceneTransition', async () => {
    logger.info('Verificando import de sceneTransition');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('sceneTransition');
    expect(content).toContain("from '../../styles/themes'");

    logger.info('sceneTransition importado');
  });

  test('ContentScene usa useVideoConfig().durationInFrames', async () => {
    logger.info('Verificando destructuring de durationInFrames');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/const\s*\{\s*durationInFrames\s*\}\s*=\s*useVideoConfig\(\)/);

    logger.info('durationInFrames de useVideoConfig');
  });

  test('ContentScene tiene fadeOut interpolation', async () => {
    logger.info('Verificando fade-out');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('const fadeOut = interpolate(');
    expect(content).toContain('durationInFrames - sceneTransition.crossfadeFrames');

    logger.info('Fade-out presente');
  });

  test('ContentScene tiene finalOpacity = sceneOpacity * fadeOut', async () => {
    logger.info('Verificando composicion de opacidad');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('const finalOpacity = sceneOpacity * fadeOut');

    logger.info('finalOpacity correctamente compuesto');
  });

  test('ContentScene usa finalOpacity en render (no sceneOpacity)', async () => {
    logger.info('Verificando opacity en render');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('opacity: finalOpacity');

    logger.info('finalOpacity en render');
  });

  test('sceneDurationFrames usa durationInFrames real del Sequence', async () => {
    logger.info('Verificando que sceneDurationFrames usa durationInFrames');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Prompt 25: reemplazó 37*fps hardcodeado por durationInFrames
    expect(content).toMatch(/sceneDurationFrames\s*=\s*durationInFrames/);

    logger.info('sceneDurationFrames usa durationInFrames');
  });
});

// =============================================================================
// TESTS: OUTROSCENE CROSSFADE
// =============================================================================

test.describe('Prompt 19.11 - OutroScene Crossfade', () => {
  const logger = new TestLogger({ testName: 'Prompt19.11-Outro' });

  test('OutroScene importa sceneTransition', async () => {
    logger.info('Verificando import de sceneTransition');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toContain('sceneTransition');
    expect(content).toContain("from '../../styles/themes'");

    logger.info('sceneTransition importado');
  });

  test('OutroScene usa useVideoConfig para durationInFrames', async () => {
    logger.info('Verificando useVideoConfig');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/const\s*\{\s*durationInFrames\s*\}\s*=\s*useVideoConfig\(\)/);

    logger.info('durationInFrames de useVideoConfig');
  });

  test('OutroScene NO tiene hardcoded "5 * fps" para durationInFrames', async () => {
    logger.info('Verificando que no hay hardcoded');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // No debe existir la linea vieja: const durationInFrames = 5 * fps
    expect(content).not.toContain('const durationInFrames = 5 * fps');

    logger.info('Sin hardcoded durationInFrames');
  });

  test('OutroScene fade-in usa sceneTransition.crossfadeFrames', async () => {
    logger.info('Verificando fade-in sincronizado');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toContain('sceneTransition.crossfadeFrames');

    logger.info('Fade-in sincronizado con crossfadeFrames');
  });

  test('OutroScene fade-in NO tiene hardcoded [0, 20]', async () => {
    logger.info('Verificando que no hay hardcoded fade-in 20');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    // La interpolacion de sceneOpacity no debe tener [0, 20] hardcoded
    const sceneOpacityMatch = content.match(/const sceneOpacity = interpolate\([\s\S]*?\);/);
    expect(sceneOpacityMatch).toBeTruthy();
    expect(sceneOpacityMatch![0]).not.toMatch(/\[0,\s*20\]/);

    logger.info('Sin hardcoded fade-in 20');
  });
});

// =============================================================================
// TESTS: DOCUMENTACION
// =============================================================================

test.describe('Prompt 19.11 - Documentacion', () => {
  const logger = new TestLogger({ testName: 'Prompt19.11-Docs' });

  test('AINewsShort.tsx tiene @updated Prompt 19.11', async () => {
    logger.info('Verificando documentacion AINewsShort');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toMatch(/@updated Prompt 19\.11/);

    logger.info('Documentacion actualizada');
  });

  test('HeroScene.tsx tiene @updated Prompt 19.11', async () => {
    logger.info('Verificando documentacion HeroScene');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/@updated Prompt 19\.11/);

    logger.info('Documentacion actualizada');
  });

  test('ContentScene.tsx tiene @updated Prompt 19.11', async () => {
    logger.info('Verificando documentacion ContentScene');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/@updated Prompt 19\.11/);

    logger.info('Documentacion actualizada');
  });

  test('OutroScene.tsx tiene @updated Prompt 19.11', async () => {
    logger.info('Verificando documentacion OutroScene');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/@updated Prompt 19\.11/);

    logger.info('Documentacion actualizada');
  });
});

// =============================================================================
// TESTS: REGRESION
// =============================================================================

test.describe('Prompt 19.11 - Regresion', () => {
  const logger = new TestLogger({ testName: 'Prompt19.11-Regression' });

  test('HeroScene sigue teniendo imageOpacity fade-in', async () => {
    logger.info('Verificando fade-in de imagen');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('imageOpacity');
    expect(content).toMatch(/imageOpacity[\s\S]*?\[0,\s*20\]/);

    logger.info('imageOpacity fade-in sin cambios');
  });

  test('ContentScene sigue teniendo sceneOpacity fade-in', async () => {
    logger.info('Verificando fade-in de escena');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('sceneOpacity');
    expect(content).toMatch(/sceneOpacity[\s\S]*?\[0,\s*30\]/);

    logger.info('sceneOpacity fade-in sin cambios');
  });

  test('OutroScene sigue teniendo fadeOut al final', async () => {
    logger.info('Verificando fade-out final');

    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');

    expect(content).toContain('const fadeOut = interpolate(');
    expect(content).toContain('finalOpacity');

    logger.info('fadeOut final sin cambios');
  });

  test('AudioMixer sigue presente en AINewsShort', async () => {
    logger.info('Verificando AudioMixer');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('<AudioMixer');

    logger.info('AudioMixer presente');
  });

  test('3 Sequences siguen presentes', async () => {
    logger.info('Verificando 3 Sequences');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    const matches = content.match(/<Sequence/g);
    expect(matches).toBeTruthy();
    expect(matches!.length).toBe(3);

    logger.info('3 Sequences presentes');
  });
});
