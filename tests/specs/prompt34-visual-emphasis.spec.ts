/**
 * @fileoverview Tests para Prompt 34 - Sistema de Énfasis Visual
 *
 * Valida:
 * - visual-emphasis.ts: detectEmphasis(), getEmphasisForBlock(), tipos
 * - themes.ts: visualEmphasis config (hard/soft)
 * - ContentScene.tsx: Integración de énfasis visual
 * - Regresión: Prompt 33, timing y BackgroundDirector sin cambios
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 34
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');

const VISUAL_EMPHASIS_PATH = path.join(REMOTION_SRC, 'utils/visual-emphasis.ts');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const UTILS_INDEX_PATH = path.join(REMOTION_SRC, 'utils/index.ts');
const PHRASE_TIMING_PATH = path.join(REMOTION_SRC, 'utils/phrase-timing.ts');
const TEXT_EDITORIAL_PATH = path.join(REMOTION_SRC, 'utils/text-editorial.ts');
const BACKGROUND_DIRECTOR_PATH = path.join(REMOTION_SRC, 'components/backgrounds/BackgroundDirector.tsx');

// =============================================================================
// TESTS: VISUAL-EMPHASIS.TS - DETECCIÓN
// =============================================================================

test.describe('Prompt 34 - detectEmphasis', () => {
  const logger = new TestLogger({ testName: 'Prompt34-Detection' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(VISUAL_EMPHASIS_PATH, 'utf-8');
  });

  test('detectEmphasis exportado', async () => {
    logger.info('Verificando export');
    expect(content).toContain('export function detectEmphasis');
  });

  test('getEmphasisForBlock exportado', async () => {
    logger.info('Verificando export');
    expect(content).toContain('export function getEmphasisForBlock');
  });

  test('EmphasisLevel type exportado (hard|soft|none)', async () => {
    logger.info('Verificando type');
    expect(content).toContain('export type EmphasisLevel');
    expect(content).toContain("'hard'");
    expect(content).toContain("'soft'");
    expect(content).toContain("'none'");
  });

  test('EmphasisMap interface exportada', async () => {
    logger.info('Verificando interface');
    expect(content).toContain('export interface EmphasisMap');
    expect(content).toContain('blocks: BlockEmphasis[]');
    expect(content).toContain('hardCount: number');
    expect(content).toContain('softCount: number');
  });

  test('BlockEmphasis interface exportada', async () => {
    logger.info('Verificando interface');
    expect(content).toContain('export interface BlockEmphasis');
    expect(content).toContain('blockIndex: number');
    expect(content).toContain('level: EmphasisLevel');
    expect(content).toContain('reason: string');
  });

  test('MAX_EMPHASIS_TOTAL = 3', async () => {
    logger.info('Verificando límite total');
    expect(content).toContain('MAX_EMPHASIS_TOTAL = 3');
  });

  test('MAX_HARD_TOTAL = 1', async () => {
    logger.info('Verificando límite HARD');
    expect(content).toContain('MAX_HARD_TOTAL = 1');
  });

  test('MIN_BLOCKS_FOR_EMPHASIS = 4', async () => {
    logger.info('Verificando mínimo de bloques');
    expect(content).toContain('MIN_BLOCKS_FOR_EMPHASIS = 4');
  });

  test('HARD solo en bloques punch (weight check)', async () => {
    logger.info('Verificando regla HARD');
    expect(content).toContain("block.weight === 'punch'");
  });

  test('HARD no en primer ni último bloque', async () => {
    logger.info('Verificando exclusión de extremos');
    expect(content).toContain('i > 0');
    expect(content).toContain('i < blocks.length - 1');
  });

  test('SOFT en bloque anterior al HARD (setup)', async () => {
    logger.info('Verificando regla SOFT setup');
    expect(content).toContain('selectedHard - 1');
    expect(content).toContain('setup before hard');
  });

  test('SOFT en headline de primera mitad', async () => {
    logger.info('Verificando regla SOFT headline');
    expect(content).toContain("blocks[i].weight === 'headline'");
    expect(content).toContain('headline in first half');
  });

  test('Devuelve all none si < MIN_BLOCKS_FOR_EMPHASIS bloques', async () => {
    logger.info('Verificando fallback vacío');
    expect(content).toContain('blocks.length < MIN_BLOCKS_FOR_EMPHASIS');
  });

  test('Reason string incluida en cada BlockEmphasis', async () => {
    logger.info('Verificando reason field');
    expect(content).toContain("reason: 'default'");
    expect(content).toContain("reason = 'punch in middle third'");
  });

  test('Selecciona HARD más cercano al tercio medio', async () => {
    logger.info('Verificando selección por posición');
    expect(content).toContain('totalBlocks * 0.33');
    expect(content).toContain('totalBlocks * 0.66');
    expect(content).toContain('midCenter');
  });

  test('Importa EditorialTextBlock de text-editorial', async () => {
    logger.info('Verificando import');
    expect(content).toContain("from './text-editorial'");
    expect(content).toContain('EditorialTextBlock');
  });
});

// =============================================================================
// TESTS: THEMES.TS - VISUAL EMPHASIS CONFIG
// =============================================================================

test.describe('Prompt 34 - visualEmphasis Config', () => {
  const logger = new TestLogger({ testName: 'Prompt34-Config' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('visualEmphasis exportado', async () => {
    logger.info('Verificando export');
    expect(content).toContain('export const visualEmphasis');
  });

  test('hard.scale = 1.08', async () => {
    logger.info('Verificando hard scale');
    expect(content).toMatch(/hard:[\s\S]*?scale:\s*1\.08/);
  });

  test('hard.bgDimOpacity = 0.35', async () => {
    logger.info('Verificando hard dim');
    expect(content).toMatch(/hard:[\s\S]*?bgDimOpacity:\s*0\.35/);
  });

  test('hard.letterSpacing negativo', async () => {
    logger.info('Verificando hard letterSpacing');
    expect(content).toMatch(/hard:[\s\S]*?letterSpacing:\s*-1\.5/);
  });

  test('hard.rampFrames > 0', async () => {
    logger.info('Verificando hard ramp');
    expect(content).toMatch(/hard:[\s\S]*?rampFrames:\s*10/);
  });

  test('soft.scale = 1.03', async () => {
    logger.info('Verificando soft scale');
    expect(content).toMatch(/soft:[\s\S]*?scale:\s*1\.03/);
  });

  test('soft.bgDimOpacity = 0.15', async () => {
    logger.info('Verificando soft dim');
    expect(content).toMatch(/soft:[\s\S]*?bgDimOpacity:\s*0\.15/);
  });

  test('soft.rampFrames > 0', async () => {
    logger.info('Verificando soft ramp');
    expect(content).toMatch(/soft:[\s\S]*?rampFrames:\s*8/);
  });

  test('dimZIndex definido', async () => {
    logger.info('Verificando dimZIndex');
    expect(content).toMatch(/dimZIndex:\s*1/);
  });
});

// =============================================================================
// TESTS: CONTENTSCENE.TSX - INTEGRACIÓN
// =============================================================================

test.describe('Prompt 34 - ContentScene Integración', () => {
  const logger = new TestLogger({ testName: 'Prompt34-Integration' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('Importa detectEmphasis de utils', async () => {
    logger.info('Verificando import');
    expect(content).toContain('detectEmphasis');
    expect(content).toContain("from '../../utils'");
  });

  test('Importa getEmphasisForBlock de utils', async () => {
    logger.info('Verificando import');
    expect(content).toContain('getEmphasisForBlock');
  });

  test('Importa visualEmphasis de themes', async () => {
    logger.info('Verificando import');
    expect(content).toContain('visualEmphasis');
    expect(content).toContain("from '../../styles/themes'");
  });

  test('useMemo para emphasisMap', async () => {
    logger.info('Verificando memoización');
    expect(content).toContain('detectEmphasis(blocks)');
    expect(content).toContain('emphasisMap');
  });

  test('emphasisScale calculado con interpolate', async () => {
    logger.info('Verificando scale');
    expect(content).toContain('emphasisScale');
    expect(content).toContain('emphasisConfig.scale');
  });

  test('emphasisDimOpacity calculado', async () => {
    logger.info('Verificando dim opacity');
    expect(content).toContain('emphasisDimOpacity');
    expect(content).toContain('emphasisConfig.bgDimOpacity');
  });

  test('Overlay div de dimming condicional', async () => {
    logger.info('Verificando overlay div');
    expect(content).toContain('emphasisDimOpacity > 0');
    expect(content).toContain('visualEmphasis.dimZIndex');
    expect(content).toContain("pointerEvents: 'none'");
  });

  test('Scale en transform del texto', async () => {
    logger.info('Verificando transform con scale');
    expect(content).toContain('scale(${emphasisScale})');
  });

  test('letterSpacing override condicional', async () => {
    logger.info('Verificando letterSpacing');
    expect(content).toContain('emphasisLetterSpacing ?? blockStyle.letterSpacing');
  });

  test('dynamicEffects guard respetado (emphasis solo si dynamicEffects)', async () => {
    logger.info('Verificando guard');
    expect(content).toContain('emphasisConfig && dynamicEffects');
  });

  test('emphasisRamp usa Easing.bezier', async () => {
    logger.info('Verificando easing');
    expect(content).toContain('emphasisRamp');
    expect(content).toMatch(/Easing\.bezier\(0\.33,\s*1,\s*0\.68,\s*1\)/);
  });

  test('Prompt 34 documentado en header', async () => {
    logger.info('Verificando documentación');
    expect(content).toContain('@updated Prompt 34');
  });
});

// =============================================================================
// TESTS: UTILS/INDEX.TS - EXPORTS
// =============================================================================

test.describe('Prompt 34 - Utils Index Exports', () => {
  const logger = new TestLogger({ testName: 'Prompt34-Utils' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(UTILS_INDEX_PATH, 'utf-8');
  });

  test('Exporta detectEmphasis', async () => {
    logger.info('Verificando export');
    expect(content).toContain('detectEmphasis');
  });

  test('Exporta getEmphasisForBlock', async () => {
    logger.info('Verificando export');
    expect(content).toContain('getEmphasisForBlock');
  });

  test('Exporta EmphasisLevel type', async () => {
    logger.info('Verificando type export');
    expect(content).toContain('EmphasisLevel');
  });

  test('Exporta EmphasisMap type', async () => {
    logger.info('Verificando type export');
    expect(content).toContain('EmphasisMap');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 34 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt34-Regresion' });

  test('phrase-timing.ts NO contiene emphasis', async () => {
    logger.info('Verificando que timing no fue modificado');
    const content = fs.readFileSync(PHRASE_TIMING_PATH, 'utf-8');
    expect(content).not.toContain('emphasis');
    expect(content).not.toContain('Emphasis');
  });

  test('text-editorial.ts NO contiene emphasis', async () => {
    logger.info('Verificando que editorial no fue modificado');
    const content = fs.readFileSync(TEXT_EDITORIAL_PATH, 'utf-8');
    expect(content).not.toContain('emphasis');
    expect(content).not.toContain('Emphasis');
  });

  test('BackgroundDirector.tsx NO contiene emphasis', async () => {
    logger.info('Verificando que background no fue modificado');
    const content = fs.readFileSync(BACKGROUND_DIRECTOR_PATH, 'utf-8');
    expect(content).not.toContain('emphasis');
    expect(content).not.toContain('Emphasis');
  });

  test('Prompt 33 intacto: editorialText config sin cambios', async () => {
    logger.info('Verificando editorialText');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toContain('export const editorialText');
    expect(content).toMatch(/headline:[\s\S]*?fontSize:\s*78/);
    expect(content).toMatch(/punch:[\s\S]*?fontSize:\s*84/);
    expect(content).toMatch(/pauseFramesBeforePunch:\s*6/);
  });

  test('Prompt 33 intacto: buildEditorialBlocks sin cambios', async () => {
    logger.info('Verificando buildEditorialBlocks');
    const content = fs.readFileSync(TEXT_EDITORIAL_PATH, 'utf-8');
    expect(content).toContain('export function buildEditorialBlocks');
    expect(content).toContain('MAX_GROUP_GAP_SECONDS = 0.6');
    expect(content).toContain('MAX_WORDS_FOR_PUNCH = 4');
  });

  test('ContentScene mantiene getBlockTiming', async () => {
    logger.info('Verificando block timing intacto');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('getBlockTiming(frame, blocks, sceneDurationFrames');
    expect(content).toContain('buildEditorialBlocks(audioSync.phraseTimestamps, fps)');
  });

  test('ContentScene mantiene baseOpacity * currentOpacity', async () => {
    logger.info('Verificando composición de opacidad');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('baseOpacity * currentOpacity');
  });
});
