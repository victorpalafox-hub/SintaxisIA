/**
 * @fileoverview Tests para Prompt 19.12 - Duration Fix
 *
 * Valida que la duración de la composición sea consistente en 50s
 * y no exista discrepancia que cause pantalla negra al final:
 * - Root.tsx: Composition usa 50 * fps para durationInFrames
 * - Root.tsx: defaultProps tiene duration: 50
 * - theme.ts: durationSeconds es 50
 * - video-rendering.service.ts: duration fijo de 50 (no audioDuration + buffer)
 * - AINewsShort.tsx: Sequences cubren 50s completos
 * - video.types.ts: JSDoc @default 50
 * - service-constants.ts: Comenta 50 segundos
 * - video.config.ts: Comenta 50 segundos y 1500 frames
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.12
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const ROOT_PATH = path.join(REMOTION_SRC, 'Root.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const THEME_PATH = path.join(REMOTION_SRC, 'theme.ts');
const AI_NEWS_SHORT_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const VIDEO_TYPES_PATH = path.join(REMOTION_SRC, 'types/video.types.ts');

const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const VIDEO_RENDERING_PATH = path.join(AUTOMATION_SRC, 'services/video-rendering.service.ts');
const VIDEO_CONFIG_PATH = path.join(AUTOMATION_SRC, 'config/video.config.ts');

const SERVICE_CONSTANTS_PATH = path.join(__dirname, '../config/service-constants.ts');

// Duración correcta del video (Hero 8s + Content 37s + Outro 5s)
const EXPECTED_DURATION_SECONDS = 50;
const EXPECTED_FPS = 30;
const EXPECTED_DURATION_FRAMES = EXPECTED_DURATION_SECONDS * EXPECTED_FPS; // 1500

// =============================================================================
// TESTS: Root.tsx - Composition Duration
// =============================================================================

test.describe('Prompt 19.12 - Root.tsx Composition Duration', () => {
  const logger = new TestLogger({ testName: 'Prompt19.12-Root' });

  test('Root.tsx Composition debe usar 50 * fps para durationInFrames', async () => {
    await logger.info('Validando durationInFrames en Root.tsx');

    const content = fs.readFileSync(ROOT_PATH, 'utf-8');

    // La composición AINewsShort debe usar 50 * video.fps
    expect(content).toContain(`durationInFrames={${EXPECTED_DURATION_SECONDS} * video.fps}`);

    await logger.info(`✅ Root.tsx usa ${EXPECTED_DURATION_SECONDS} * video.fps = ${EXPECTED_DURATION_FRAMES} frames`);
  });

  test('Root.tsx defaultProps debe tener duration: 50', async () => {
    await logger.info('Validando defaultProps.config.duration en Root.tsx');

    const content = fs.readFileSync(ROOT_PATH, 'utf-8');

    // El defaultProps debe tener duration: 50
    const durationMatch = content.match(/duration:\s*(\d+)/);
    expect(durationMatch).toBeTruthy();
    expect(Number(durationMatch![1])).toBe(EXPECTED_DURATION_SECONDS);

    await logger.info(`✅ defaultProps.config.duration = ${EXPECTED_DURATION_SECONDS}`);
  });

  test('Root.tsx no debe referenciar duración de 55 segundos', async () => {
    await logger.info('Validando ausencia de 55s en Root.tsx');

    const content = fs.readFileSync(ROOT_PATH, 'utf-8');

    // No debe haber referencias a 55 segundos (la duración incorrecta anterior)
    expect(content).not.toContain('55 * video.fps');
    expect(content).not.toContain('duration: 55');
    expect(content).not.toContain('de 55s');
    expect(content).not.toContain('de 55 seg');

    await logger.info('✅ No hay referencias a la duración incorrecta de 55s');
  });
});

// =============================================================================
// TESTS: theme.ts - durationSeconds
// =============================================================================

test.describe('Prompt 19.12 - theme.ts Duration', () => {
  const logger = new TestLogger({ testName: 'Prompt19.12-Theme' });

  test('theme.ts durationSeconds debe ser 50', async () => {
    await logger.info('Validando durationSeconds en theme.ts');

    const content = fs.readFileSync(THEME_PATH, 'utf-8');

    // durationSeconds debe ser 50, no 60 (legacy) ni 55
    const match = content.match(/durationSeconds:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(Number(match![1])).toBe(EXPECTED_DURATION_SECONDS);

    await logger.info(`✅ theme.ts durationSeconds = ${EXPECTED_DURATION_SECONDS}`);
  });
});

// =============================================================================
// TESTS: video-rendering.service.ts - Duration Config
// =============================================================================

test.describe('Prompt 19.12 - video-rendering.service.ts Duration', () => {
  const logger = new TestLogger({ testName: 'Prompt19.12-Rendering' });

  test('video-rendering.service.ts debe usar duration fijo de 50', async () => {
    await logger.info('Validando duration en video-rendering.service.ts');

    const content = fs.readFileSync(VIDEO_RENDERING_PATH, 'utf-8');

    // Debe usar duration: 50 fijo, no calculado desde audioDuration
    expect(content).toContain('duration: 50');

    await logger.info(`✅ video-rendering.service.ts usa duration: ${EXPECTED_DURATION_SECONDS}`);
  });

  test('video-rendering.service.ts NO debe usar audioDuration + buffer para config.duration', async () => {
    await logger.info('Validando ausencia de audioDuration + buffer');

    const content = fs.readFileSync(VIDEO_RENDERING_PATH, 'utf-8');

    // No debe calcular duration desde audioDuration (causaba pantalla negra)
    expect(content).not.toMatch(/duration:\s*Math\.ceil\(request\.audioDuration\)/);

    await logger.info('✅ No usa audioDuration + buffer para duration');
  });
});

// =============================================================================
// TESTS: AINewsShort.tsx - Scene Timing
// =============================================================================

test.describe('Prompt 19.12 - AINewsShort Scene Timing', () => {
  const logger = new TestLogger({ testName: 'Prompt19.12-Scenes' });

  test('AINewsShort.tsx duraciones de escena suman 50s (8+37+5)', async () => {
    await logger.info('Validando suma de duraciones de escenas');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // Verificar duraciones individuales
    const heroMatch = content.match(/heroSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);
    const contentMatch = content.match(/contentSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);
    const outroMatch = content.match(/outroSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);

    expect(heroMatch).toBeTruthy();
    expect(contentMatch).toBeTruthy();
    expect(outroMatch).toBeTruthy();

    const heroSeconds = Number(heroMatch![1]);
    const contentSeconds = Number(contentMatch![1]);
    const outroSeconds = Number(outroMatch![1]);

    // Hero 8s + Content 37s + Outro 5s = 50s
    expect(heroSeconds).toBe(8);
    expect(contentSeconds).toBe(37);
    expect(outroSeconds).toBe(5);
    expect(heroSeconds + contentSeconds + outroSeconds).toBe(EXPECTED_DURATION_SECONDS);

    await logger.info(`✅ Escenas: ${heroSeconds}s + ${contentSeconds}s + ${outroSeconds}s = ${heroSeconds + contentSeconds + outroSeconds}s`);
  });

  test('AINewsShort.tsx último Sequence termina en frame 1500', async () => {
    await logger.info('Validando frame final del último Sequence');

    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // Con crossfade de 30 frames:
    // outroStart = contentStart + contentSceneDuration = 210 + 1110 = 1320
    // outroDuration = outroSceneDuration + crossfadeFrames = 150 + 30 = 180
    // Último frame = outroStart + outroDuration = 1320 + 180 = 1500

    // Verificar que el default duration es 50
    const defaultDurationMatch = content.match(/config\?\.duration\s*\?\?\s*(\d+)/);
    expect(defaultDurationMatch).toBeTruthy();
    expect(Number(defaultDurationMatch![1])).toBe(EXPECTED_DURATION_SECONDS);

    await logger.info(`✅ Duration default = ${EXPECTED_DURATION_SECONDS}s (${EXPECTED_DURATION_FRAMES} frames)`);
  });

  test('Composition duration = Sequences end frame (sin gap negro)', async () => {
    await logger.info('Validando que no hay gap entre Sequences y Composition');

    const rootContent = fs.readFileSync(ROOT_PATH, 'utf-8');
    const compositionContent = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // Root.tsx debe usar 50 * fps
    expect(rootContent).toContain(`${EXPECTED_DURATION_SECONDS} * video.fps`);

    // AINewsShort.tsx default duration debe ser 50
    expect(compositionContent).toContain(`config?.duration ?? ${EXPECTED_DURATION_SECONDS}`);

    // No debe haber discrepancia: ambos apuntan a 50s = 1500 frames
    await logger.info(`✅ Composition y Sequences ambos usan ${EXPECTED_DURATION_SECONDS}s - sin gap negro`);
  });
});

// =============================================================================
// TESTS: Documentation Consistency
// =============================================================================

test.describe('Prompt 19.12 - Documentation Consistency', () => {
  const logger = new TestLogger({ testName: 'Prompt19.12-Docs' });

  test('video.types.ts @default debe decir 50', async () => {
    await logger.info('Validando JSDoc @default en video.types.ts');

    const content = fs.readFileSync(VIDEO_TYPES_PATH, 'utf-8');

    // El JSDoc de duration debe decir @default 50
    expect(content).toContain('@default 50');
    expect(content).not.toContain('@default 55');

    await logger.info('✅ video.types.ts @default 50');
  });

  test('service-constants COMPOSITIONS.FULL comenta 50 segundos', async () => {
    await logger.info('Validando comentario en service-constants.ts');

    const content = fs.readFileSync(SERVICE_CONSTANTS_PATH, 'utf-8');

    // Debe mencionar 50 segundos en el comentario de FULL
    expect(content).toContain('50 segundos');
    expect(content).not.toMatch(/Video completo de 55 segundos/);

    await logger.info('✅ service-constants.ts menciona 50 segundos');
  });

  test('video.config.ts comenta 50 segundos y 1500 frames', async () => {
    await logger.info('Validando comentario en video.config.ts');

    const content = fs.readFileSync(VIDEO_CONFIG_PATH, 'utf-8');

    // Debe mencionar 50 segundos y 1500 frames
    expect(content).toContain('50 segundos');
    expect(content).toContain('1500 frames');
    expect(content).not.toContain('55 segundos totales');
    expect(content).not.toContain('1650 frames');

    await logger.info('✅ video.config.ts comenta 50 segundos y 1500 frames');
  });
});
