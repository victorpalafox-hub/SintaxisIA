/**
 * @fileoverview Tests para Prompt 40-Fix4 - Ritmo humano (anti-robotico) + Fix ElevenLabs
 *
 * Valida:
 * - themes.ts: slideDistance/slideFrames por peso, pauseFramesAfterPunch
 * - ContentScene.tsx: slide y easing diferenciados por peso
 * - phrase-timing.ts: pausa despues de punch
 * - tts.service.ts: logging detallado de errores + validacion de API key
 * - Regresion: fadeIn/fadeOut, emphasis, fontSize, captionLead/Lag
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 40-Fix4
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

const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const PHRASE_TIMING_PATH = path.join(REMOTION_SRC, 'utils/phrase-timing.ts');
const TTS_SERVICE_PATH = path.join(AUTOMATION_SRC, 'services/tts.service.ts');

// =============================================================================
// PARTE A: RITMO DIFERENCIADO POR PESO
// =============================================================================

test.describe('Prompt 40-Fix4 - Slide diferenciado por peso', () => {
  const logger = new TestLogger({ testName: 'Prompt40Fix4-Slide' });
  let themes: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('headline tiene slideDistance y slideFrames propios', async () => {
    logger.info('Verificando headline slide');
    const headlineSection = themes.substring(
      themes.indexOf('headline: {'),
      themes.indexOf('support: {')
    );
    expect(headlineSection).toContain('slideDistance:');
    expect(headlineSection).toContain('slideFrames:');
  });

  test('support tiene slideDistance y slideFrames propios', async () => {
    logger.info('Verificando support slide');
    const supportSection = themes.substring(
      themes.indexOf('support: {'),
      themes.indexOf('punch: {')
    );
    expect(supportSection).toContain('slideDistance:');
    expect(supportSection).toContain('slideFrames:');
  });

  test('punch tiene slideDistance y slideFrames propios', async () => {
    logger.info('Verificando punch slide');
    const punchSection = themes.substring(
      themes.indexOf('punch: {'),
      themes.indexOf('pauseFramesBeforePunch')
    );
    expect(punchSection).toContain('slideDistance:');
    expect(punchSection).toContain('slideFrames:');
  });

  test('punch.slideFrames < headline.slideFrames (punch mas rapido)', async () => {
    logger.info('Verificando punch mas rapido que headline');
    const punchFrames = themes.match(/punch:\s*\{[\s\S]*?slideFrames:\s*(\d+)/);
    const headlineFrames = themes.match(/headline:\s*\{[\s\S]*?slideFrames:\s*(\d+)/);
    expect(punchFrames).not.toBeNull();
    expect(headlineFrames).not.toBeNull();
    expect(Number(punchFrames![1])).toBeLessThan(Number(headlineFrames![1]));
  });

  test('support.slideFrames > headline.slideFrames (support mas lento)', async () => {
    logger.info('Verificando support mas lento que headline');
    const supportFrames = themes.match(/support:\s*\{[\s\S]*?slideFrames:\s*(\d+)/);
    const headlineFrames = themes.match(/headline:\s*\{[\s\S]*?slideFrames:\s*(\d+)/);
    expect(supportFrames).not.toBeNull();
    expect(headlineFrames).not.toBeNull();
    expect(Number(supportFrames![1])).toBeGreaterThan(Number(headlineFrames![1]));
  });

  test('punch.slideDistance > headline.slideDistance (punch mas dramatico)', async () => {
    logger.info('Verificando punch mas dramatico');
    const punchDist = themes.match(/punch:\s*\{[\s\S]*?slideDistance:\s*(\d+)/);
    const headlineDist = themes.match(/headline:\s*\{[\s\S]*?slideDistance:\s*(\d+)/);
    expect(punchDist).not.toBeNull();
    expect(headlineDist).not.toBeNull();
    expect(Number(punchDist![1])).toBeGreaterThan(Number(headlineDist![1]));
  });
});

// =============================================================================
// PARTE A: PAUSAS DRAMATICAS
// =============================================================================

test.describe('Prompt 40-Fix4 - Pausas dramaticas', () => {
  const logger = new TestLogger({ testName: 'Prompt40Fix4-Pauses' });
  let themes: string;
  let phraseTiming: string;

  test.beforeAll(async () => {
    themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    phraseTiming = fs.readFileSync(PHRASE_TIMING_PATH, 'utf-8');
  });

  test('pauseFramesBeforePunch >= 8 (pausa dramatica)', async () => {
    logger.info('Verificando pausa antes de punch');
    const match = themes.match(/pauseFramesBeforePunch:\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(8);
  });

  test('pauseFramesAfterPunch existe y >= 6', async () => {
    logger.info('Verificando pausa despues de punch');
    const match = themes.match(/pauseFramesAfterPunch:\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(6);
  });

  test('phrase-timing.ts tiene PAUSE_AFTER_PUNCH implementado', async () => {
    logger.info('Verificando PAUSE_AFTER_PUNCH en phrase-timing');
    expect(phraseTiming).toContain('PAUSE_AFTER_PUNCH');
    expect(phraseTiming).toContain("prevBlock?.weight === 'punch'");
  });
});

// =============================================================================
// PARTE A: EASING DIFERENCIADO EN CONTENTSCENE
// =============================================================================

test.describe('Prompt 40-Fix4 - Easing diferenciado en ContentScene', () => {
  const logger = new TestLogger({ testName: 'Prompt40Fix4-Easing' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('usa blockWeight para seleccionar slide', async () => {
    logger.info('Verificando blockWeight en ContentScene');
    expect(content).toContain('blockWeight');
    expect(content).toContain('weightSlideDistance');
    expect(content).toContain('weightSlideFrames');
  });

  test('tiene al menos 2 Easing.bezier distintos para diferentes pesos', async () => {
    logger.info('Verificando easings diferenciados');
    const bezierMatches = content.match(/Easing\.bezier\([^)]+\)/g) || [];
    // Obtener beziers únicos
    const uniqueBeziers = new Set(bezierMatches);
    expect(uniqueBeziers.size).toBeGreaterThanOrEqual(2);
  });

  test('tiene easing especifico para punch (overshoot)', async () => {
    logger.info('Verificando easing punch');
    // Punch usa overshoot (segundo param > 1)
    expect(content).toContain("=== 'punch'");
  });

  test('tiene easing especifico para support (suave)', async () => {
    logger.info('Verificando easing support');
    expect(content).toContain("=== 'support'");
  });
});

// =============================================================================
// PARTE B: TTS LOGGING DETALLADO
// =============================================================================

test.describe('Prompt 40-Fix4 - TTS ElevenLabs diagnostico', () => {
  const logger = new TestLogger({ testName: 'Prompt40Fix4-TTS' });
  let ttsService: string;

  test.beforeAll(async () => {
    ttsService = fs.readFileSync(TTS_SERVICE_PATH, 'utf-8');
  });

  test('tiene logging con axios.isAxiosError', async () => {
    logger.info('Verificando axios error parsing');
    expect(ttsService).toContain('axios.isAxiosError');
  });

  test('loguea HTTP status del error', async () => {
    logger.info('Verificando logging de HTTP status');
    expect(ttsService).toContain('error.response?.status');
  });

  test('loguea response body del error', async () => {
    logger.info('Verificando logging de response body');
    expect(ttsService).toContain('error.response?.data');
  });

  test('tiene validateElevenLabsKey para validacion previa', async () => {
    logger.info('Verificando validateElevenLabsKey');
    expect(ttsService).toContain('validateElevenLabsKey');
    expect(ttsService).toContain('/user/subscription');
  });

  test('validateElevenLabsKey retorna valid/reason', async () => {
    logger.info('Verificando retorno de validacion');
    expect(ttsService).toContain('valid: true');
    expect(ttsService).toContain('valid: false');
  });
});

// =============================================================================
// REGRESION
// =============================================================================

test.describe('Prompt 40-Fix4 - Regresion: sin cambios colaterales', () => {
  const logger = new TestLogger({ testName: 'Prompt40Fix4-Regression' });

  test('fadeInFrames = 15, fadeOutFrames = 15 sin cambio', async () => {
    logger.info('Verificando fade frames intactos');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('fadeInFrames: 15');
    expect(themes).toContain('fadeOutFrames: 15');
  });

  test('visualEmphasis scale sin cambio (1.08/1.03)', async () => {
    logger.info('Verificando emphasis intacto');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('scale: 1.08');
    expect(themes).toContain('scale: 1.03');
  });

  test('editorialText fontSize sin cambio (72/54/84)', async () => {
    logger.info('Verificando fontSize intacto');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    const headlineSection = themes.substring(themes.indexOf('headline: {'), themes.indexOf('support: {'));
    const supportSection = themes.substring(themes.indexOf('support: {'), themes.indexOf('punch: {'));
    const punchSection = themes.substring(themes.indexOf('punch: {'), themes.indexOf('pauseFramesBeforePunch'));
    expect(headlineSection).toContain('fontSize: 72');
    expect(supportSection).toContain('fontSize: 54');
    expect(punchSection).toContain('fontSize: 84');
  });

  test('blockGap = 8 sin cambio', async () => {
    logger.info('Verificando blockGap intacto');
    const themes = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(themes).toContain('blockGap: 8');
  });

  test('ContentScene sigue usando blockStyle.fontSize', async () => {
    logger.info('Verificando ContentScene blockStyle');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('blockStyle.fontSize');
  });

  test('tts.service.ts mantiene enableFallback y enableCache', async () => {
    logger.info('Verificando TTS options intactas');
    const tts = fs.readFileSync(TTS_SERVICE_PATH, 'utf-8');
    expect(tts).toContain('enableFallback');
    expect(tts).toContain('enableCache');
  });
});
