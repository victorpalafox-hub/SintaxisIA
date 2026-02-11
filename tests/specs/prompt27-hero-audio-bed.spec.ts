/**
 * @fileoverview Tests para Prompt 27 - Hero Audio Bed + Hook Visual
 *
 * Valida:
 * - AINewsShort.tsx: BackgroundMusic Sequence desde frame 0
 * - AINewsShort.tsx: Audio con volume callback (hero/content/fadeOut)
 * - AINewsShort.tsx: AudioMixer solo recibe voice (no music)
 * - HeroScene.tsx: Micro zoom-in escena (0.96→1.0)
 * - themes.ts: musicBed config centralizada
 * - video-rendering.service.ts: audio.music poblado en props
 * - Regresión: Narration sigue en contentStart, duraciones sin cambio
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 27
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');

const AI_NEWS_SHORT_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/HeroScene.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const VIDEO_RENDERING_PATH = path.join(AUTOMATION_SRC, 'services/video-rendering.service.ts');

// =============================================================================
// TESTS: musicBed CONFIG EN THEMES
// =============================================================================

test.describe('Prompt 27 - musicBed Config', () => {
  const logger = new TestLogger({ testName: 'Prompt27-Config' });

  test('musicBed exportado en themes.ts', async () => {
    await logger.info('Verificando export musicBed');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    expect(content).toContain('export const musicBed');

    await logger.info('musicBed exportado');
  });

  test('musicBed tiene heroVolume, contentVolume, fadeOutFrames, defaultSrc', async () => {
    await logger.info('Verificando propiedades de musicBed');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    expect(content).toContain('heroVolume');
    expect(content).toContain('contentVolume');
    expect(content).toContain('fadeOutFrames');
    expect(content).toContain('defaultSrc');

    await logger.info('Propiedades presentes');
  });

  test('musicBed.heroVolume = 0.22 (22%)', async () => {
    await logger.info('Verificando heroVolume');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/heroVolume:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBe(0.22);

    await logger.info('heroVolume = 0.22');
  });

  test('musicBed.contentVolume = 0.08 (8% ducked)', async () => {
    await logger.info('Verificando contentVolume');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    const match = content.match(/contentVolume:\s*([\d.]+)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBe(0.08);

    await logger.info('contentVolume = 0.08');
  });

  test('musicBed.fadeOutFrames = 60 (2s @ 30fps)', async () => {
    await logger.info('Verificando fadeOutFrames');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');

    // Buscar fadeOutFrames dentro del bloque musicBed
    const musicBedBlock = content.match(/export const musicBed\s*=\s*\{[\s\S]*?\};/);
    expect(musicBedBlock).toBeTruthy();
    const fadeMatch = musicBedBlock![0].match(/fadeOutFrames:\s*(\d+)/);
    expect(fadeMatch).toBeTruthy();
    expect(parseInt(fadeMatch![1])).toBe(60);

    await logger.info('fadeOutFrames = 60');
  });
});

// =============================================================================
// TESTS: AINewsShort.tsx BACKGROUND MUSIC
// =============================================================================

test.describe('Prompt 27 - AINewsShort BackgroundMusic', () => {
  const logger = new TestLogger({ testName: 'Prompt27-Composition' });

  test('importa Audio y staticFile de remotion', async () => {
    await logger.info('Verificando imports de audio');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('Audio');
    expect(content).toContain('staticFile');

    await logger.info('Imports presentes');
  });

  test('importa musicBed de themes', async () => {
    await logger.info('Verificando import de musicBed');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('musicBed');
    expect(content).toContain("from '../styles/themes'");

    await logger.info('musicBed importado');
  });

  test('BackgroundMusic Sequence desde frame 0', async () => {
    await logger.info('Verificando BackgroundMusic Sequence');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('name="BackgroundMusic"');
    // Sequence from={0}
    expect(content).toMatch(/Sequence\s+from=\{0\}[\s\S]*?name="BackgroundMusic"/);

    await logger.info('BackgroundMusic Sequence desde frame 0');
  });

  test('BackgroundMusic es condicional (audio.music?.src)', async () => {
    await logger.info('Verificando condicional');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('audio.music?.src');

    await logger.info('BackgroundMusic es condicional');
  });

  test('BackgroundMusic usa volume callback con musicBed config', async () => {
    await logger.info('Verificando volume callback');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // Prompt 44: music bed usa heroVolume para hero y contentVolume para content
    expect(content).toContain('musicBed.heroVolume');
    expect(content).toContain('musicBed.contentVolume');
    expect(content).toContain('musicBed.fadeOutFrames');
    expect(content).toContain('musicBed.fadeOutFrames');

    await logger.info('Volume callback usa musicBed config');
  });

  test('BackgroundMusic tiene loop habilitado', async () => {
    await logger.info('Verificando loop');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // Buscar loop dentro del contexto de BackgroundMusic
    const bgMusicSection = content.match(/name="BackgroundMusic"[\s\S]*?<\/Sequence>/);
    expect(bgMusicSection).toBeTruthy();
    expect(bgMusicSection![0]).toContain('loop');

    await logger.info('Loop habilitado');
  });

  test('AudioMixer solo recibe voice (no music)', async () => {
    await logger.info('Verificando AudioMixer sin music');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // AudioMixer debe tener voice pero NO music como prop
    const audioMixerSection = content.match(/<AudioMixer[\s\S]*?\/>/);
    expect(audioMixerSection).toBeTruthy();
    expect(audioMixerSection![0]).toContain('voice=');
    expect(audioMixerSection![0]).not.toContain('music=');

    await logger.info('AudioMixer solo con voice');
  });

  test('5 Sequences totales (Hero, Content, Outro, BackgroundMusic, Narration)', async () => {
    await logger.info('Verificando 5 Sequences');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    const matches = content.match(/<Sequence/g);
    expect(matches).toBeTruthy();
    // Prompt 32: +1 TitleCard Sequence = 6 total
    expect(matches!.length).toBe(6);

    await logger.info('6 Sequences presentes');
  });
});

// =============================================================================
// TESTS: HeroScene MICRO ZOOM-IN
// =============================================================================

test.describe('Prompt 27 - HeroScene Micro Zoom-in', () => {
  const logger = new TestLogger({ testName: 'Prompt27-Hero' });

  test('HeroScene tiene sceneZoom interpolation (0.96 → 1.0)', async () => {
    await logger.info('Verificando sceneZoom');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('sceneZoom');
    expect(content).toMatch(/interpolate[\s\S]*?0\.96[\s\S]*?1\.0/);

    await logger.info('sceneZoom presente');
  });

  test('sceneZoom se aplica al container interno con transform: scale', async () => {
    await logger.info('Verificando transform scale');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('scale(${sceneZoom})');

    await logger.info('sceneZoom aplicado al container');
  });

  test('HeroScene tiene @updated Prompt 27', async () => {
    await logger.info('Verificando documentacion');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('@updated Prompt 27');

    await logger.info('Documentacion actualizada');
  });
});

// =============================================================================
// TESTS: VIDEO RENDERING SERVICE
// =============================================================================

test.describe('Prompt 27 - video-rendering.service.ts', () => {
  const logger = new TestLogger({ testName: 'Prompt27-Pipeline' });

  test('generateVideoProps incluye audio.music con src', async () => {
    await logger.info('Verificando audio.music en props');

    const content = fs.readFileSync(VIDEO_RENDERING_PATH, 'utf-8');

    // Debe tener music con src
    expect(content).toMatch(/music:\s*\{[\s\S]*?src:\s*'audio\/news-bed\.wav'/);

    await logger.info('audio.music.src presente en props');
  });

  test('audio.music tiene ducking habilitado', async () => {
    await logger.info('Verificando ducking');

    const content = fs.readFileSync(VIDEO_RENDERING_PATH, 'utf-8');

    expect(content).toMatch(/music:\s*\{[\s\S]*?ducking:\s*true/);

    await logger.info('ducking habilitado');
  });
});

// =============================================================================
// TESTS: REGRESION
// =============================================================================

test.describe('Prompt 27 - Regresion', () => {
  const logger = new TestLogger({ testName: 'Prompt27-Regression' });

  test('Narration Sequence sigue en contentStart', async () => {
    await logger.info('Verificando Narration timing');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // La voz sigue empezando en contentStart (Prompt 32.1: ahora con durationInFrames)
    expect(content).toMatch(/Sequence\s+from=\{contentStart\}[\s\S]*?name="Narration"/);

    await logger.info('Narration en contentStart');
  });

  test('Hero sigue siendo 8s, Content min 37s, Outro 5s', async () => {
    await logger.info('Verificando duraciones');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toMatch(/heroSceneDuration\s*=\s*8\s*\*\s*fps/);
    expect(content).toMatch(/outroSceneDuration\s*=\s*5\s*\*\s*fps/);
    expect(content).toMatch(/contentSceneDuration\s*=\s*Math\.max\(37\s*\*\s*fps/);

    await logger.info('Duraciones sin cambio');
  });

  test('Flash de impacto sigue en HeroScene (Prompt 25)', async () => {
    await logger.info('Verificando flash');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');

    expect(content).toContain('flashOpacity');
    expect(content).toContain('flashMaxOpacity');

    await logger.info('Flash sin cambios');
  });

  test('Crossfade de 30 frames sigue activo (Prompt 19.11)', async () => {
    await logger.info('Verificando crossfade');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('sceneTransition.crossfadeFrames');

    await logger.info('Crossfade sin cambios');
  });

  test('AINewsShort tiene @updated Prompt 27', async () => {
    await logger.info('Verificando documentacion');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    expect(content).toContain('@updated Prompt 27');

    await logger.info('Documentacion actualizada');
  });
});
