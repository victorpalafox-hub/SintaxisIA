/**
 * @fileoverview Tests para Prompt 44 - Corrección Editorial Integral
 *
 * Valida que:
 * - Narración alineada con contentStart (no frame 0)
 * - Music bed restaurado: hero 22%, content 8%, transición suave
 * - Frases editoriales más cortas (maxCharsPerPhrase ≤ 48)
 * - Sin regresiones en estructura de escenas
 *
 * @since Prompt 44
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// Rutas a archivos fuente
const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles', 'themes.ts');
const TEXT_SPLITTER_PATH = path.join(REMOTION_SRC, 'utils', 'text-splitter.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');
const BACKGROUND_PATH = path.join(REMOTION_SRC, 'components', 'backgrounds', 'BackgroundDirector.tsx');

// =============================================================================
// TESTS: ALINEACIÓN NARRACIÓN ↔ CONTENTSCENE
// =============================================================================

test.describe('Prompt 44 - Alineación Narración-ContentScene', () => {
  const logger = new TestLogger({ testName: 'Prompt44-NarrationAlign' });
  let ainews: string;

  test.beforeAll(async () => {
    ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('Narration Sequence usa from={contentStart} (no frame 0)', async () => {
    logger.info('Verificando Narration from={contentStart}');
    expect(ainews).toMatch(/Sequence\s+from=\{contentStart\}[\s\S]*?name="Narration"/);
  });

  test('Narration durationInFrames = outroStart - contentStart', async () => {
    logger.info('Verificando duración relativa de Narration');
    expect(ainews).toMatch(/durationInFrames=\{outroStart\s*-\s*contentStart\}[\s\S]*?name="Narration"/);
  });

  test('ContentScene sceneStartSecond={0} (audio alineado)', async () => {
    logger.info('Verificando sceneStartSecond={0}');
    expect(ainews).toContain('sceneStartSecond={0}');
  });

  test('NO existe from={0} para Narration (revertido Prompt 37-Fix1)', async () => {
    logger.info('Verificando ausencia de from={0} en Narration');
    // Asegurar que no hay Sequence from={0} con name="Narration"
    expect(ainews).not.toMatch(/Sequence\s+from=\{0\}[\s\S]{0,100}?name="Narration"/);
  });

  test('outroStart - contentStart es positivo (sanity check)', async () => {
    logger.info('Verificando cálculo positivo');
    // outroStart se calcula como contentStart + contentSceneDuration + BREATHING_ROOM_FRAMES
    // Por lo tanto outroStart - contentStart > 0 siempre
    expect(ainews).toContain('const outroStart = contentStart');
    expect(ainews).toContain('const contentStart = heroSceneDuration - crossfadeFrames');
  });
});

// =============================================================================
// TESTS: MUSIC BED CON TRANSICIONES
// =============================================================================

test.describe('Prompt 44 - Music Bed Volume Transitions', () => {
  const logger = new TestLogger({ testName: 'Prompt44-MusicBed' });
  let ainews: string;

  test.beforeAll(async () => {
    ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('BackgroundMusic volume callback usa musicBed.heroVolume', async () => {
    logger.info('Verificando heroVolume en callback');
    const musicSection = ainews.match(/BackgroundMusic[\s\S]*?<\/Sequence>/);
    expect(musicSection).toBeTruthy();
    expect(musicSection![0]).toContain('musicBed.heroVolume');
  });

  test('BackgroundMusic volume callback usa musicBed.contentVolume', async () => {
    logger.info('Verificando contentVolume en callback');
    const musicSection = ainews.match(/BackgroundMusic[\s\S]*?<\/Sequence>/);
    expect(musicSection).toBeTruthy();
    expect(musicSection![0]).toContain('musicBed.contentVolume');
  });

  test('Volume callback referencia contentStart para transición', async () => {
    logger.info('Verificando contentStart en volume callback');
    const musicSection = ainews.match(/BackgroundMusic[\s\S]*?<\/Sequence>/);
    expect(musicSection).toBeTruthy();
    expect(musicSection![0]).toContain('contentStart');
  });

  test('heroVolume (0.22) > contentVolume (0.08) en themes', async () => {
    logger.info('Verificando relación de volúmenes');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const heroMatch = themes.match(/heroVolume:\s*([\d.]+)/);
    const contentMatch = themes.match(/contentVolume:\s*([\d.]+)/);
    expect(heroMatch).toBeTruthy();
    expect(contentMatch).toBeTruthy();
    expect(parseFloat(heroMatch![1])).toBeGreaterThan(parseFloat(contentMatch![1]));
  });
});

// =============================================================================
// TESTS: FRASES EDITORIALES CORTAS
// =============================================================================

test.describe('Prompt 44 - Frases Editoriales', () => {
  const logger = new TestLogger({ testName: 'Prompt44-EditorialPhrases' });

  test('themes.ts maxCharsPerPhrase ≤ 48', async () => {
    logger.info('Verificando maxCharsPerPhrase en themes');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = themes.match(/maxCharsPerPhrase:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBeLessThanOrEqual(48);
  });

  test('text-splitter.ts DEFAULT_MAX_CHARS ≤ 48', async () => {
    logger.info('Verificando DEFAULT_MAX_CHARS en text-splitter');
    const splitter = fs.readFileSync(TEXT_SPLITTER_PATH, 'utf-8');
    const match = splitter.match(/DEFAULT_MAX_CHARS\s*=\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBeLessThanOrEqual(48);
  });

  test('DEFAULT_MAX_CHARS sincronizado con themes maxCharsPerPhrase', async () => {
    logger.info('Verificando sincronización splitter ↔ themes');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const splitter = fs.readFileSync(TEXT_SPLITTER_PATH, 'utf-8');

    const themesMatch = themes.match(/maxCharsPerPhrase:\s*(\d+)/);
    const splitterMatch = splitter.match(/DEFAULT_MAX_CHARS\s*=\s*(\d+)/);
    expect(themesMatch).toBeTruthy();
    expect(splitterMatch).toBeTruthy();
    expect(parseInt(themesMatch![1])).toBe(parseInt(splitterMatch![1]));
  });
});

// =============================================================================
// TESTS: REGRESIÓN (NO ROMPER NADA)
// =============================================================================

test.describe('Prompt 44 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt44-Regression' });
  let ainews: string;

  test.beforeAll(async () => {
    ainews = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('HeroScene duración 8s sin cambio', async () => {
    logger.info('Verificando Hero 8s');
    expect(ainews).toMatch(/heroSceneDuration\s*=\s*8\s*\*\s*fps/);
  });

  test('OutroScene duración 5s sin cambio', async () => {
    logger.info('Verificando Outro 5s');
    expect(ainews).toMatch(/outroSceneDuration\s*=\s*5\s*\*\s*fps/);
  });

  test('BREATHING_ROOM_FRAMES >= 45 (1.5s)', async () => {
    logger.info('Verificando breathing room');
    const match = ainews.match(/BREATHING_ROOM_FRAMES\s*=\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBeGreaterThanOrEqual(45);
  });

  test('sceneTransition.crossfadeFrames = 30 sin cambio', async () => {
    logger.info('Verificando crossfade de escenas');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    // sceneTransition tiene crossfadeFrames: 30 (imageAnimation tiene 20, diferente)
    const sceneBlock = themes.match(/sceneTransition[\s\S]*?crossfadeFrames:\s*(\d+)/);
    expect(sceneBlock).toBeTruthy();
    expect(parseInt(sceneBlock![1])).toBe(30);
  });

  test('BackgroundDirector presente en composición', async () => {
    logger.info('Verificando BackgroundDirector');
    expect(ainews).toContain('<BackgroundDirector');
  });

  test('editorialText config intacto en themes', async () => {
    logger.info('Verificando editorialText');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('headline:');
    expect(themes).toContain('support:');
    expect(themes).toContain('punch:');
  });

  test('TitleCard overlay sin cambio', async () => {
    logger.info('Verificando TitleCard');
    expect(ainews).toContain('name="TitleCard"');
  });
});

// =============================================================================
// TESTS: COHERENCIA AUDIO-TEXTO
// =============================================================================

test.describe('Prompt 44 - Coherencia Audio-Texto', () => {
  const logger = new TestLogger({ testName: 'Prompt44-AudioTextCoherence' });

  test('ContentScene usa buildEditorialBlocks para texto', async () => {
    logger.info('Verificando buildEditorialBlocks');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('buildEditorialBlocks');
  });

  test('ContentScene referencia phraseTimestamps para sync', async () => {
    logger.info('Verificando phraseTimestamps');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('phraseTimestamps');
  });

  test('ContentScene usa sceneOffsetSeconds para timing', async () => {
    logger.info('Verificando sceneOffsetSeconds');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('sceneOffsetSeconds');
  });
});
