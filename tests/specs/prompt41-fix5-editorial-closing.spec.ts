/**
 * @fileoverview Tests para Prompt 41 - Fix 5: Cierre editorial real
 *
 * Valida:
 * - AINewsShort.tsx: breathing room >= 45f, narración termina en outroStart
 * - AudioMixer.tsx: VOICE_FADEOUT_FRAMES >= 45
 * - themes.ts: ctaDelayFrames >= 45
 * - OutroScene.tsx: usa outroAnimation.ctaDelayFrames
 * - Regresión: fadeOut, crossfade, musicBed, hero/outro duración, ContentScene
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 41
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');

const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const AUDIO_MIXER_PATH = path.join(REMOTION_SRC, 'components/audio/AudioMixer.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');

// =============================================================================
// TESTS: BREATHING ROOM Y NARRATION TIMING
// =============================================================================

test.describe('Prompt 41 - Breathing Room y Narration Timing', () => {
  const logger = new TestLogger({ testName: 'Prompt41-Timing' });
  let ainews: string;

  test.beforeAll(async () => {
    ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('BREATHING_ROOM_FRAMES >= 45 (1.5s)', async () => {
    logger.info('Verificando breathing room');
    const match = ainews.match(/BREATHING_ROOM_FRAMES\s*=\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(45);
  });

  test('Narration Sequence usa outroStart - contentStart (Prompt 44)', async () => {
    logger.info('Verificando narración termina antes de outro');
    // Prompt 44: durationInFrames cambió de outroStart a outroStart - contentStart
    expect(ainews).toContain('durationInFrames={outroStart - contentStart}');
    expect(ainews).toContain('name="Narration"');
  });

  test('outroStart calculado con BREATHING_ROOM_FRAMES', async () => {
    logger.info('Verificando cálculo de outroStart');
    expect(ainews).toContain('contentStart + contentSceneDuration + BREATHING_ROOM_FRAMES');
  });

  test('Prompt 41 documentado en header', async () => {
    logger.info('Verificando documentación');
    expect(ainews).toContain('@updated Prompt 41');
  });
});

// =============================================================================
// TESTS: AUDIO FADE-OUT
// =============================================================================

test.describe('Prompt 41 - Voice Fade-Out Natural', () => {
  const logger = new TestLogger({ testName: 'Prompt41-Audio' });
  let audioMixer: string;

  test.beforeAll(async () => {
    audioMixer = fs.readFileSync(AUDIO_MIXER_PATH, 'utf-8');
  });

  test('VOICE_FADEOUT_FRAMES >= 45 (1.5s)', async () => {
    logger.info('Verificando fade-out duration');
    const match = audioMixer.match(/VOICE_FADEOUT_FRAMES\s*=\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(45);
  });

  test('Fade-out usa durationInFrames - VOICE_FADEOUT_FRAMES', async () => {
    logger.info('Verificando fórmula de fade-out');
    expect(audioMixer).toContain('durationInFrames - VOICE_FADEOUT_FRAMES');
  });

  test('Voice renderizada con staticFile', async () => {
    logger.info('Verificando staticFile');
    expect(audioMixer).toContain('staticFile(normalizeAudioPath(voice.src))');
  });
});

// =============================================================================
// TESTS: OUTRO PACING
// =============================================================================

test.describe('Prompt 41 - Outro Pacing', () => {
  const logger = new TestLogger({ testName: 'Prompt41-Outro' });
  let themes: string;
  let outroScene: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    outroScene = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
  });

  test('ctaDelayFrames >= 45 (1.5s)', async () => {
    logger.info('Verificando CTA delay');
    const match = themes.match(/ctaDelayFrames:\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(45);
  });

  test('OutroScene usa outroAnimation.ctaDelayFrames', async () => {
    logger.info('Verificando OutroScene usa config');
    expect(outroScene).toContain('outroAnimation.ctaDelayFrames');
  });

  test('OutroScene tiene fade-out al final', async () => {
    logger.info('Verificando fade-out');
    expect(outroScene).toContain('outroAnimation.fadeOutFrames');
  });

  test('OutroScene tiene crossfade desde ContentScene', async () => {
    logger.info('Verificando crossfade');
    expect(outroScene).toContain('sceneTransition.crossfadeFrames');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 41 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt41-Regresion' });

  test('outroAnimation.fadeOutFrames = 45 (Prompt 45 micro-polish)', async () => {
    logger.info('Verificando fadeOutFrames gradual');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toMatch(/fadeOutFrames:\s*45/);
  });

  test('crossfadeFrames = 30 sin cambio', async () => {
    logger.info('Verificando crossfade intacto');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toMatch(/crossfadeFrames:\s*30/);
  });

  test('musicBed.fadeOutFrames = 60 sin cambio', async () => {
    logger.info('Verificando music fade intacto');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    // musicBed section has its own fadeOutFrames
    const musicSection = themes.substring(
      themes.indexOf('export const musicBed'),
      themes.indexOf('}', themes.indexOf('export const musicBed')) + 1
    );
    expect(musicSection).toContain('fadeOutFrames: 60');
  });

  test('heroSceneDuration = 8 * fps sin cambio', async () => {
    logger.info('Verificando hero timing');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toContain('heroSceneDuration = 8 * fps');
  });

  test('outroSceneDuration = 5 * fps sin cambio', async () => {
    logger.info('Verificando outro timing');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toContain('outroSceneDuration = 5 * fps');
  });

  test('ContentScene buildEditorialBlocks sin cambio', async () => {
    logger.info('Verificando editorial blocks');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('buildEditorialBlocks(audioSync.phraseTimestamps, fps)');
  });

  test('ContentScene baseOpacity * currentOpacity sin cambio', async () => {
    logger.info('Verificando composición de opacidad');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('baseOpacity * currentOpacity');
  });

  test('AudioMixer voice renderizado con Audio component', async () => {
    logger.info('Verificando Audio component');
    const audioMixer = fs.readFileSync(AUDIO_MIXER_PATH, 'utf-8');
    expect(audioMixer).toContain('<Audio');
    expect(audioMixer).toContain('voice.src');
  });

  test('Narration Sequence empieza en contentStart (Prompt 44)', async () => {
    logger.info('Verificando voz desde contentStart');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    // Prompt 44: Narration alineada con texto editorial
    expect(ainews).toMatch(/Sequence\s+from=\{contentStart\}[\s\S]*?name="Narration"/);
  });

  test('BackgroundMusic sin cambio', async () => {
    logger.info('Verificando background music');
    const ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(ainews).toContain('name="BackgroundMusic"');
    expect(ainews).toContain('musicBed.contentVolume');
  });
});
