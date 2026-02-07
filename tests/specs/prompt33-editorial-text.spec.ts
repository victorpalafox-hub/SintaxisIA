/**
 * @fileoverview Tests para Prompt 33 - Texto Editorial Humano
 *
 * Valida:
 * - text-editorial.ts: buildEditorialBlocks(), agrupación, clasificación de peso
 * - themes.ts: editorialText config
 * - phrase-timing.ts: getBlockTiming()
 * - ContentScene.tsx: Integración de bloques editoriales
 * - Regresión: audio, imágenes, Hero/Outro sin cambio
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 33
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');

const TEXT_EDITORIAL_PATH = path.join(REMOTION_SRC, 'utils/text-editorial.ts');
const PHRASE_TIMING_PATH = path.join(REMOTION_SRC, 'utils/phrase-timing.ts');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const UTILS_INDEX_PATH = path.join(REMOTION_SRC, 'utils/index.ts');

// =============================================================================
// TESTS: TEXT-EDITORIAL.TS
// =============================================================================

test.describe('Prompt 33 - buildEditorialBlocks', () => {
  const logger = new TestLogger({ testName: 'Prompt33-Editorial' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(TEXT_EDITORIAL_PATH, 'utf-8');
  });

  test('buildEditorialBlocks exportado', async () => {
    logger.info('Verificando export');

    expect(content).toContain('export function buildEditorialBlocks');
  });

  test('EditorialTextBlock interface exportada', async () => {
    logger.info('Verificando interface');

    expect(content).toContain('export interface EditorialTextBlock');
    expect(content).toContain('lines: string[]');
    expect(content).toContain('weight: EditorialWeight');
    expect(content).toContain('phraseIndices: number[]');
    expect(content).toContain('startSeconds: number');
    expect(content).toContain('endSeconds: number');
  });

  test('Máximo 2 líneas por bloque (MAX enforced)', async () => {
    logger.info('Verificando límite de líneas');

    // La agrupación solo une 2 frases → max 2 líneas
    expect(content).toContain('lines: [current.text.trim(), next.text.trim()]');
    // Y bloques de 1 línea
    expect(content).toContain('lines: [current.text.trim()]');
  });

  test('Gap máximo para agrupación es 0.6s', async () => {
    logger.info('Verificando MAX_GROUP_GAP_SECONDS');

    expect(content).toContain('MAX_GROUP_GAP_SECONDS = 0.6');
    expect(content).toContain('gap > MAX_GROUP_GAP_SECONDS');
  });

  test('Máximo 7 palabras por frase para agrupar', async () => {
    logger.info('Verificando MAX_WORDS_FOR_GROUPING');

    expect(content).toContain('MAX_WORDS_FOR_GROUPING = 7');
    expect(content).toContain('currentWords >= MAX_WORDS_FOR_GROUPING');
  });

  test('Máximo 90 caracteres combinados', async () => {
    logger.info('Verificando MAX_COMBINED_CHARS');

    expect(content).toContain('MAX_COMBINED_CHARS = 90');
    expect(content).toContain('combinedChars > MAX_COMBINED_CHARS');
  });

  test('Duración mínima de bloque = 18 frames', async () => {
    logger.info('Verificando MIN_BLOCK_DURATION_FRAMES');

    expect(content).toContain('MIN_BLOCK_DURATION_FRAMES = 18');
    expect(content).toContain('durationFrames < MIN_BLOCK_DURATION_FRAMES');
  });

  test('Clasifica headline (primeras frases, índice 0 o 1)', async () => {
    logger.info('Verificando clasificación headline');

    expect(content).toContain('blockIndex <= 1');
  });

  test('Clasifica headline (dígitos = versiones/modelos)', async () => {
    logger.info('Verificando detección de versiones');

    expect(content).toMatch(/\\d.*test\(firstLine\)/);
  });

  test('Clasifica punch (≤4 palabras)', async () => {
    logger.info('Verificando clasificación punch por palabras');

    expect(content).toContain('MAX_WORDS_FOR_PUNCH = 4');
    expect(content).toContain('wordCount <= MAX_WORDS_FOR_PUNCH');
  });

  test('Clasifica punch (? o ! al final)', async () => {
    logger.info('Verificando clasificación punch por puntuación');

    expect(content).toContain("endsWith('?')");
    expect(content).toContain("endsWith('!')");
  });

  test('Clasifica punch (último bloque)', async () => {
    logger.info('Verificando último bloque como punch');

    expect(content).toContain('blockIndex === totalBlocks - 1');
  });

  test('Detecta nombres propios mid-frase', async () => {
    logger.info('Verificando hasProperNounMidSentence');

    expect(content).toContain('hasProperNounMidSentence');
    expect(content).toContain('[A-ZÁÉÍÓÚÑ]');
  });

  test('Retorna array vacío para input vacío', async () => {
    logger.info('Verificando manejo de vacío');

    expect(content).toContain('if (!phrases || phrases.length === 0) return []');
  });

  test('Prompt 33 documentado en header', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@since Prompt 33');
  });
});

// =============================================================================
// TESTS: THEMES.TS - editorialText CONFIG
// =============================================================================

test.describe('Prompt 33 - editorialText Config', () => {
  const logger = new TestLogger({ testName: 'Prompt33-Config' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('editorialText exportado', async () => {
    logger.info('Verificando export');

    expect(content).toContain('export const editorialText');
  });

  test('headline config (fontSize 78, fontWeight 700)', async () => {
    logger.info('Verificando headline');

    expect(content).toMatch(/headline:[\s\S]*?fontSize:\s*78/);
    expect(content).toMatch(/headline:[\s\S]*?fontWeight:\s*700/);
  });

  test('support config (fontSize 66, fontWeight 500)', async () => {
    logger.info('Verificando support');

    expect(content).toMatch(/support:[\s\S]*?fontSize:\s*66/);
    expect(content).toMatch(/support:[\s\S]*?fontWeight:\s*500/);
  });

  test('punch config (fontSize 84, fontWeight 800, accent color)', async () => {
    logger.info('Verificando punch');

    expect(content).toMatch(/punch:[\s\S]*?fontSize:\s*84/);
    expect(content).toMatch(/punch:[\s\S]*?fontWeight:\s*800/);
    expect(content).toContain("color: '#38BDF8'");
  });

  test('pauseFramesBeforePunch = 6', async () => {
    logger.info('Verificando pausa visual');

    expect(content).toMatch(/pauseFramesBeforePunch:\s*6/);
  });

  test('slideDistance y slideFrames definidos', async () => {
    logger.info('Verificando slide config');

    expect(content).toMatch(/slideDistance:\s*20/);
    expect(content).toMatch(/slideFrames:\s*18/);
  });
});

// =============================================================================
// TESTS: PHRASE-TIMING.TS - getBlockTiming
// =============================================================================

test.describe('Prompt 33 - getBlockTiming', () => {
  const logger = new TestLogger({ testName: 'Prompt33-BlockTiming' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(PHRASE_TIMING_PATH, 'utf-8');
  });

  test('getBlockTiming exportado', async () => {
    logger.info('Verificando export');

    expect(content).toContain('export function getBlockTiming');
  });

  test('BlockTiming interface exportada', async () => {
    logger.info('Verificando interface');

    expect(content).toContain('export interface BlockTiming');
    expect(content).toContain('currentBlockIndex: number');
    expect(content).toContain('blockStartFrame: number');
    expect(content).toContain('blockEndFrame: number');
  });

  test('Aplica pausa visual antes de bloques punch', async () => {
    logger.info('Verificando pausa antes de punch');

    expect(content).toContain("block.weight === 'punch'");
    expect(content).toContain('PAUSE_BEFORE_PUNCH');
  });

  test('Usa lead/lag perceptual (200ms/150ms)', async () => {
    logger.info('Verificando lead/lag');

    expect(content).toContain('leadSeconds');
    expect(content).toContain('lagSeconds');
    expect(content).toContain('captionLeadMs');
  });

  test('getPhraseTiming() sigue intacto', async () => {
    logger.info('Verificando getPhraseTiming sin cambio');

    expect(content).toContain('export function getPhraseTiming');
    expect(content).toContain('findPhraseIndexByTime');
    expect(content).toContain('calculateOpacity');
  });

  test('Prompt 33 documentado', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@since Prompt 33');
  });
});

// =============================================================================
// TESTS: CONTENTSCENE INTEGRACIÓN
// =============================================================================

test.describe('Prompt 33 - ContentScene Integración', () => {
  const logger = new TestLogger({ testName: 'Prompt33-Integration' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('Importa buildEditorialBlocks', async () => {
    logger.info('Verificando import');

    expect(content).toContain('buildEditorialBlocks');
  });

  test('Importa getBlockTiming', async () => {
    logger.info('Verificando import');

    expect(content).toContain('getBlockTiming');
  });

  test('Importa editorialText de themes', async () => {
    logger.info('Verificando import');

    expect(content).toContain('editorialText');
    expect(content).toContain("from '../../styles/themes'");
  });

  test('Construye bloques editoriales con useMemo', async () => {
    logger.info('Verificando construcción de bloques');

    expect(content).toContain('buildEditorialBlocks(audioSync.phraseTimestamps, fps)');
  });

  test('Fallback sin Whisper: cada frase = bloque support', async () => {
    logger.info('Verificando fallback');

    expect(content).toContain("weight: 'support' as const");
  });

  test('Usa blockStyle para fontSize/fontWeight/color dinámico', async () => {
    logger.info('Verificando estilo dinámico');

    expect(content).toContain('blockStyle.fontSize');
    expect(content).toContain('blockStyle.fontWeight');
    expect(content).toContain('blockStyle.color');
  });

  test('Renderiza líneas del bloque con map', async () => {
    logger.info('Verificando render de líneas');

    expect(content).toContain('currentBlock?.lines.map');
  });

  test('Usa editorialText.slideFrames para animación', async () => {
    logger.info('Verificando slide animation');

    expect(content).toContain('editorialText.slideFrames');
    expect(content).toContain('editorialText.slideDistance');
  });

  test('Prompt 33 documentado en header', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@updated Prompt 33');
  });
});

// =============================================================================
// TESTS: UTILS INDEX EXPORTS
// =============================================================================

test.describe('Prompt 33 - Utils Index', () => {
  const logger = new TestLogger({ testName: 'Prompt33-Utils' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(UTILS_INDEX_PATH, 'utf-8');
  });

  test('Exporta buildEditorialBlocks', async () => {
    logger.info('Verificando export');

    expect(content).toContain('buildEditorialBlocks');
  });

  test('Exporta getBlockTiming', async () => {
    logger.info('Verificando export');

    expect(content).toContain('getBlockTiming');
  });

  test('Exporta EditorialTextBlock type', async () => {
    logger.info('Verificando type export');

    expect(content).toContain('EditorialTextBlock');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 33 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt33-Regresion' });

  test('Hero timing sin cambio (8s)', async () => {
    logger.info('Verificando Hero');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('heroSceneDuration = 8 * fps');
    expect(content).toContain('const heroStart = 0');
  });

  test('Outro timing sin cambio (5s)', async () => {
    logger.info('Verificando Outro');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('outroSceneDuration = 5 * fps');
  });

  test('Crossfade 30 frames sin cambio', async () => {
    logger.info('Verificando crossfade');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toMatch(/crossfadeFrames:\s*30/);
  });

  test('Narration Sequence sin cambio', async () => {
    logger.info('Verificando Narration');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toMatch(/Sequence\s+from=\{contentStart\}[\s\S]*?name="Narration"/);
  });

  test('AudioMixer sin cambio', async () => {
    logger.info('Verificando AudioMixer');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('<AudioMixer');
    expect(content).toContain('voice={audio.voice}');
  });

  test('Imágenes editoriales sin cambio en ContentScene', async () => {
    logger.info('Verificando imágenes');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('imageAnimation.width');
    expect(content).toContain('imageAnimation.height');
    expect(content).toContain('<SafeImage');
  });

  test('getPhraseTiming sigue exportado (compatibilidad)', async () => {
    logger.info('Verificando backward compat');

    const content = fs.readFileSync(UTILS_INDEX_PATH, 'utf-8');
    expect(content).toContain('getPhraseTiming');
    expect(content).toContain('PhraseTiming');
  });
});
