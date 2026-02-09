/**
 * @fileoverview Tests para Prompt 42 - Unificación de fuente de texto (Single Source of Truth)
 *
 * Valida:
 * - HeroScene.tsx: Título invisible durante TitleCard, fade-out antes de crossfade
 * - ContentScene.tsx: Sin fallback || description, solo bloques editoriales
 * - Exclusividad de texto por frame (nunca dos fuentes simultáneas)
 * - Regresión: TitleCard, OutroScene, editorial blocks, timing, AudioMixer
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 42
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');

const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/HeroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const TITLE_CARD_PATH = path.join(REMOTION_SRC, 'components/scenes/TitleCardScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');

// =============================================================================
// TESTS: HEROSCENE — EXCLUSIVIDAD CON TITLECARD
// =============================================================================

test.describe('Prompt 42 - HeroScene Exclusividad con TitleCard', () => {
  const logger = new TestLogger({ testName: 'Prompt42-HeroTitleCard' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
  });

  test('Importa titleCard de themes', async () => {
    logger.info('Verificando import de titleCard');

    expect(content).toMatch(/import\s*\{[^}]*titleCard[^}]*\}\s*from\s*'\.\.\/\.\.\/styles\/themes'/);
  });

  test('Referencia titleCard.durationFrames para exclusividad', async () => {
    logger.info('Verificando referencia a duración de TitleCard');

    expect(content).toContain('titleCard.durationFrames');
  });

  test('Referencia titleCard.fadeOutFrames para timing de transición', async () => {
    logger.info('Verificando referencia a fadeOut de TitleCard');

    expect(content).toContain('titleCard.fadeOutFrames');
  });

  test('Contiene lógica titleDelayedIn (título aparece después de TitleCard)', async () => {
    logger.info('Verificando titleDelayedIn');

    expect(content).toContain('titleDelayedIn');
    // Debe ser un interpolate con clamp
    expect(content).toMatch(/titleDelayedIn\s*=\s*interpolate/);
  });

  test('Contiene lógica titleEarlyOut (título desaparece antes de crossfade)', async () => {
    logger.info('Verificando titleEarlyOut');

    expect(content).toContain('titleEarlyOut');
    expect(content).toMatch(/titleEarlyOut\s*=\s*interpolate/);
  });

  test('Opacidad del título es composición de 3 factores', async () => {
    logger.info('Verificando opacidad compuesta');

    // Debe multiplicar los tres factores: spring, delayed-in, early-out
    expect(content).toContain('titleOpacity * titleDelayedIn * titleEarlyOut');
  });

  test('Documentación menciona Prompt 42', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('Prompt 42');
  });
});

// =============================================================================
// TESTS: HEROSCENE — FADE-OUT ANTES DE CROSSFADE
// =============================================================================

test.describe('Prompt 42 - HeroScene Fade-out Anticipado', () => {
  const logger = new TestLogger({ testName: 'Prompt42-HeroFadeOut' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
  });

  test('titleEarlyOut referencia sceneTransition.crossfadeFrames', async () => {
    logger.info('Verificando referencia a crossfade');

    expect(content).toContain('sceneTransition.crossfadeFrames');
  });

  test('Anticipación de 15 frames antes del crossfade', async () => {
    logger.info('Verificando anticipación');

    // La lógica debe restar 15 frames al crossfade start
    expect(content).toContain('crossfadeFrames - 15');
  });

  test('Título tiene opacity 0 antes de que empiece el crossfade', async () => {
    logger.info('Verificando que título desaparece a tiempo');

    // El interpolate de titleEarlyOut debe ir a 0
    expect(content).toMatch(/titleEarlyOut\s*=\s*interpolate[\s\S]*?\[\s*1\s*,\s*0\s*\]/);
  });
});

// =============================================================================
// TESTS: CONTENTSCENE — SIN FALLBACK DE TEXTO
// =============================================================================

test.describe('Prompt 42 - ContentScene Sin Fallback', () => {
  const logger = new TestLogger({ testName: 'Prompt42-ContentNoFallback' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('NO contiene || description como fallback de render', async () => {
    logger.info('Verificando eliminación de fallback');

    // No debe existir `)) || description` en el render
    expect(content).not.toMatch(/\)\)\s*\|\|\s*description/);
  });

  test('Renderiza solo currentBlock?.lines.map (sin alternativa)', async () => {
    logger.info('Verificando render exclusivo de bloques');

    expect(content).toContain('currentBlock?.lines.map');
  });

  test('Sigue usando buildEditorialBlocks como fuente de bloques', async () => {
    logger.info('Verificando buildEditorialBlocks');

    expect(content).toContain('buildEditorialBlocks(audioSync.phraseTimestamps, fps)');
  });

  test('Documentación menciona Prompt 42', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('Prompt 42');
  });
});

// =============================================================================
// TESTS: CONTENTSCENE — FUENTE ÚNICA DE TEXTO
// =============================================================================

test.describe('Prompt 42 - ContentScene Fuente Única', () => {
  const logger = new TestLogger({ testName: 'Prompt42-ContentSource' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('audioSync.phraseTimestamps es fuente primaria de texto', async () => {
    logger.info('Verificando fuente primaria');

    expect(content).toContain('audioSync?.phraseTimestamps');
    expect(content).toContain('audioSync.phraseTimestamps.map');
  });

  test('splitIntoReadablePhrases es solo fallback sin Whisper (no de render)', async () => {
    logger.info('Verificando que split es solo fallback de datos, no de render');

    // splitIntoReadablePhrases debe existir (fallback de datos)
    expect(content).toContain('splitIntoReadablePhrases(description');

    // Pero NO como fallback de render (|| description ya eliminado)
    expect(content).not.toMatch(/\)\)\s*\|\|\s*description/);
  });

  test('baseOpacity * currentOpacity sigue como composición de opacidad', async () => {
    logger.info('Verificando composición de opacidad');

    expect(content).toContain('baseOpacity * currentOpacity');
  });
});

// =============================================================================
// TESTS: TITLECARD — SIN CAMBIO
// =============================================================================

test.describe('Prompt 42 - TitleCard Sin Cambio', () => {
  const logger = new TestLogger({ testName: 'Prompt42-TitleCard' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(TITLE_CARD_PATH, 'utf-8');
  });

  test('Renderiza titleText prop', async () => {
    logger.info('Verificando titleText');

    expect(content).toContain('{titleText}');
  });

  test('Renderiza badge prop', async () => {
    logger.info('Verificando badge');

    expect(content).toContain('{badge}');
  });

  test('Renderiza @SintaxisIA branding', async () => {
    logger.info('Verificando branding');

    expect(content).toContain('@SintaxisIA');
  });

  test('Usa titleCard config de themes', async () => {
    logger.info('Verificando config');

    expect(content).toContain('titleCard.durationFrames');
    expect(content).toContain('titleCard.fadeOutFrames');
  });
});

// =============================================================================
// TESTS: OUTROSCENE — SIN CAMBIO
// =============================================================================

test.describe('Prompt 42 - OutroScene Sin Cambio', () => {
  const logger = new TestLogger({ testName: 'Prompt42-Outro' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
  });

  test('Renderiza logo text SINTAXIS IA', async () => {
    logger.info('Verificando logo');

    expect(content).toContain('SINTAXIS IA');
  });

  test('Renderiza CTA', async () => {
    logger.info('Verificando CTA');

    expect(content).toContain('Síguenos para más noticias de Inteligencia Artificial');
  });

  test('NO renderiza hashtags', async () => {
    logger.info('Verificando que hashtags no se renderizan');

    // hashtags se reciben pero no se renderizan
    expect(content).toContain('hashtags');
    // El contenido de hashtags no debe aparecer en JSX renderizado
    expect(content).toContain('NO SE RENDERIZAN');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 42 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt42-Regresion' });

  test('HeroScene usa editorialText.headline.fontSize', async () => {
    logger.info('Verificando tipografía Hero');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    expect(content).toContain('editorialText.headline.fontSize');
    expect(content).toContain('editorialText.headline.fontWeight');
  });

  test('HeroScene sigue importando SafeImage', async () => {
    logger.info('Verificando SafeImage en Hero');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    expect(content).toContain("import { SafeImage }");
    expect(content).toContain('<SafeImage');
  });

  test('HeroScene flash de impacto sin cambio', async () => {
    logger.info('Verificando flash');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    expect(content).toContain('heroAnimation.flashMaxOpacity');
    expect(content).toContain('heroAnimation.flashDurationFrames');
  });

  test('ContentScene ProgressBar sin cambio', async () => {
    logger.info('Verificando ProgressBar');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('<ProgressBar');
    expect(content).toContain('color={colors.primary}');
  });

  test('ContentScene SafeImage sin cambio', async () => {
    logger.info('Verificando SafeImage en Content');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('<SafeImage');
    expect(content).toContain('contextImage');
  });

  test('Hero timing sin cambio (8s)', async () => {
    logger.info('Verificando Hero timing');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('heroSceneDuration = 8 * fps');
  });

  test('Outro timing sin cambio (5s)', async () => {
    logger.info('Verificando Outro timing');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('outroSceneDuration = 5 * fps');
  });

  test('Crossfade 30 frames sin cambio', async () => {
    logger.info('Verificando crossfade');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toMatch(/crossfadeFrames:\s*30/);
  });

  test('AudioMixer sin cambio', async () => {
    logger.info('Verificando AudioMixer');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('<AudioMixer');
    expect(content).toContain('voice={audio.voice}');
  });

  test('Narration desde frame 0, termina en outroStart (Prompt 37-Fix1 + Prompt 41)', async () => {
    logger.info('Verificando Narration');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toMatch(/Sequence\s+from=\{0\}\s+durationInFrames=\{outroStart\}\s+name="Narration"/);
  });

  test('BREATHING_ROOM_FRAMES >= 45 (Prompt 41)', async () => {
    logger.info('Verificando breathing room');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    const match = content.match(/BREATHING_ROOM_FRAMES\s*=\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(45);
  });

  test('ContentScene buildEditorialBlocks sin cambio', async () => {
    logger.info('Verificando editorial blocks');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('buildEditorialBlocks(audioSync.phraseTimestamps, fps)');
  });

  test('ContentScene visual emphasis sin cambio', async () => {
    logger.info('Verificando visual emphasis');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('detectEmphasis(blocks)');
    expect(content).toContain('getEmphasisForBlock');
  });
});
