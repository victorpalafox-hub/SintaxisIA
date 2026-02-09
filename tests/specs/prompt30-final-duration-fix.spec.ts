/**
 * @fileoverview Tests para Prompt 30 - Duración dinámica real + CTA después de narración
 *
 * Valida:
 * - Root.tsx: calculateMetadata para duración dinámica basada en props
 * - AINewsShort: BREATHING_ROOM_FRAMES entre narración y outro
 * - video-rendering.service: duration incluye 1s de breathing room
 * - Regresión: Hero 8s, Outro 5s, crossfade, AudioMixer, Prompt 29
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 30
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

const ROOT_PATH = path.join(REMOTION_SRC, 'Root.tsx');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const RENDERING_SERVICE_PATH = path.join(AUTOMATION_SRC, 'services/video-rendering.service.ts');
const SEGMENTER_PATH = path.join(AUTOMATION_SRC, 'services/scene-segmenter.service.ts');

// =============================================================================
// TESTS: ROOT.TSX - calculateMetadata
// =============================================================================

test.describe('Prompt 30 - Root.tsx calculateMetadata', () => {
  const logger = new TestLogger({ testName: 'Prompt30-Root' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(ROOT_PATH, 'utf-8');
  });

  test('calculateMetadata está definido como CalculateMetadataFunction', async () => {
    logger.info('Verificando calculateMetadata');

    expect(content).toContain('const calculateMetadata: CalculateMetadataFunction<Partial<VideoProps>>');
  });

  test('calculateMetadata lee config.duration de props', async () => {
    logger.info('Verificando lectura de config.duration');

    expect(content).toContain('props.config?.duration');
  });

  test('calculateMetadata lee config.fps de props', async () => {
    logger.info('Verificando lectura de config.fps');

    expect(content).toContain('props.config?.fps');
  });

  test('calculateMetadata retorna durationInFrames calculado', async () => {
    logger.info('Verificando retorno de durationInFrames');

    expect(content).toContain('durationInFrames: duration * fps');
  });

  test('Default fallback a 50s cuando no hay config', async () => {
    logger.info('Verificando fallback a 50s');

    expect(content).toMatch(/duration\s*=\s*props\.config\?\.\s*duration\s*\?\?\s*50/);
  });

  test('Composition AINewsShort usa calculateMetadata', async () => {
    logger.info('Verificando uso en Composition');

    // Buscar que la Composition tenga el prop calculateMetadata
    expect(content).toContain('calculateMetadata={calculateMetadata}');
  });

  test('Preview Composition NO usa calculateMetadata', async () => {
    logger.info('Verificando que Preview no tiene calculateMetadata');

    // La Composition de Preview debe mantener 10s fijo
    // Contar ocurrencias de calculateMetadata={calculateMetadata}
    const matches = content.match(/calculateMetadata=\{calculateMetadata\}/g);
    // Solo 1 ocurrencia (la de AINewsShort producción)
    expect(matches).toBeTruthy();
    expect(matches!.length).toBe(1);
  });

  test('CalculateMetadataFunction importado de remotion', async () => {
    logger.info('Verificando import');

    expect(content).toContain('CalculateMetadataFunction');
    expect(content).toMatch(/import.*CalculateMetadataFunction.*from\s*'remotion'/);
  });
});

// =============================================================================
// TESTS: AINEWSSHORT - BREATHING ROOM
// =============================================================================

test.describe('Prompt 30 - AINewsShort Breathing Room', () => {
  const logger = new TestLogger({ testName: 'Prompt30-AINewsShort' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('BREATHING_ROOM_FRAMES = 30 (1s @ 30fps)', async () => {
    logger.info('Verificando constante BREATHING_ROOM_FRAMES');

    expect(content).toMatch(/BREATHING_ROOM_FRAMES\s*=\s*30/);
  });

  test('outroStart incluye BREATHING_ROOM_FRAMES', async () => {
    logger.info('Verificando outroStart con breathing room');

    expect(content).toContain('+ BREATHING_ROOM_FRAMES');
    expect(content).toContain('contentSceneDuration + BREATHING_ROOM_FRAMES');
  });

  test('durationInFrames usa duration * fps', async () => {
    logger.info('Verificando durationInFrames');

    expect(content).toContain('const durationInFrames = duration * fps');
  });

  test('Background music usa durationInFrames correcto', async () => {
    logger.info('Verificando Background music duration');

    // BackgroundMusic Sequence debe usar durationInFrames
    expect(content).toContain('durationInFrames={durationInFrames}');
    expect(content).toContain('name="BackgroundMusic"');
  });

  test('Prompt 30 documentado en header', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@updated Prompt 30');
    expect(content).toContain('Breathing room');
  });
});

// =============================================================================
// TESTS: VIDEO-RENDERING.SERVICE - DURATION CALCULATION
// =============================================================================

test.describe('Prompt 30 - video-rendering.service Duration', () => {
  const logger = new TestLogger({ testName: 'Prompt30-Duration' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(RENDERING_SERVICE_PATH, 'utf-8');
  });

  test('config.duration incluye breathing room (+1)', async () => {
    logger.info('Verificando breathing room en duration');

    // La fórmula debe incluir + 1 para breathing room
    // Prompt 37: Ahora usa effectiveAudioDuration (Whisper como source of truth)
    // Math.ceil(8 + Math.max(37, effectiveAudioDuration + 1) + 1 + 5)
    expect(content).toContain('effectiveAudioDuration + 1) + 1 + 5');
  });

  test('Comentario menciona breathing room', async () => {
    logger.info('Verificando comentario');

    expect(content).toContain('breathing');
    expect(content).toContain('Prompt 30');
  });

  test('Fórmula mantiene Hero 8s base', async () => {
    logger.info('Verificando Hero en fórmula');

    expect(content).toMatch(/Math\.ceil\(8\s*\+/);
  });

  test('Fórmula mantiene Outro 5s base', async () => {
    logger.info('Verificando Outro en fórmula');

    // El + 5 al final de la fórmula
    expect(content).toContain('+ 1 + 5)');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 30 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt30-Regresion' });

  test('Hero sigue siendo 8s', async () => {
    logger.info('Verificando Hero 8s');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toMatch(/heroSceneDuration\s*=\s*8\s*\*\s*fps/);
  });

  test('Outro sigue siendo 5s', async () => {
    logger.info('Verificando Outro 5s');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toMatch(/outroSceneDuration\s*=\s*5\s*\*\s*fps/);
  });

  test('Crossfade 30 frames sigue funcionando', async () => {
    logger.info('Verificando crossfade');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('sceneTransition.crossfadeFrames');
    expect(content).toContain('crossfadeFrames');
  });

  test('AudioMixer sigue en Sequence(contentStart)', async () => {
    logger.info('Verificando AudioMixer');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    // Prompt 32.1: Narration ahora tiene durationInFrames
    expect(content).toMatch(/Sequence\s+from=\{contentStart\}[\s\S]*?name="Narration"/);
    expect(content).toContain('<AudioMixer');
  });

  test('ContentScene sceneStartSecond = contentStart / fps (Prompt 37-Fix1)', async () => {
    logger.info('Verificando sceneStartSecond');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    // Prompt 37-Fix1: offset para sincronizar texto con audio que empieza en frame 0
    expect(content).toContain('sceneStartSecond={contentStart / fps}');
  });

  test('Prompt 29 topic-segmentation sin cambio', async () => {
    logger.info('Verificando Prompt 29');

    const content = fs.readFileSync(SEGMENTER_PATH, 'utf-8');
    expect(content).toContain('TRANSITION_MARKERS');
    expect(content).toContain('findTopicBoundaries');
    expect(content).toContain('findMarkerPositions');
  });
});
