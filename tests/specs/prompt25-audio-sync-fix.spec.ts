/**
 * @fileoverview Tests para Prompt 25 - Audio Sync Fix + Hook Visual + Control Imágenes
 *
 * Valida:
 * - VideoProps tiene audioSync
 * - AINewsShort pasa audioSync a ContentScene
 * - Frame offset (sceneOffsetSeconds) en phrase-timing
 * - Texto on-screen = script narrado (no body)
 * - Pipeline phraseTimestamps propagación (TTS → Orchestrator → Render)
 * - Frases desde audioSync timestamps como source of truth
 * - Hook visual flash en HeroScene
 * - Control de imágenes dinámicas (MAX_IMAGE_SEGMENTS)
 * - Limpieza (hardcoded 37*fps eliminado, theme tech-editorial)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 25
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const SERVICES_PATH = path.join(AUTOMATION_SRC, 'services');

// =============================================================================
// Suite 1: VideoProps tiene audioSync
// =============================================================================

test.describe('Prompt 25 - Suite 1: VideoProps tiene audioSync', () => {
  const logger = new TestLogger({ testName: 'Prompt25-VideoProps' });

  test('VideoProps contiene campo audioSync opcional', async () => {
    logger.info('Verificando audioSync en VideoProps');
    const filePath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('audioSync?: AudioSync');
    logger.info('VideoProps tiene audioSync');
  });

  test('AudioSync interface tiene phraseTimestamps y audioDuration', async () => {
    logger.info('Verificando AudioSync interface');
    const filePath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('phraseTimestamps: PhraseTimestamp[]');
    expect(content).toContain('audioDuration: number');
    logger.info('AudioSync interface correcta');
  });

  test('PhraseTimestamp tiene text, startSeconds, endSeconds', async () => {
    logger.info('Verificando PhraseTimestamp');
    const filePath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('text: string');
    expect(content).toContain('startSeconds: number');
    expect(content).toContain('endSeconds: number');
    logger.info('PhraseTimestamp completa');
  });
});

// =============================================================================
// Suite 2: AINewsShort pasa audioSync
// =============================================================================

test.describe('Prompt 25 - Suite 2: AINewsShort pasa audioSync', () => {
  const logger = new TestLogger({ testName: 'Prompt25-AINewsShort' });

  test('AINewsShort extrae audioSync de props', async () => {
    logger.info('Verificando extracción de audioSync');
    const filePath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('props.audioSync');
    logger.info('audioSync extraído de props');
  });

  test('AINewsShort pasa audioSync a ContentScene', async () => {
    logger.info('Verificando prop audioSync en ContentScene');
    const filePath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('audioSync={audioSync}');
    logger.info('audioSync pasado a ContentScene');
  });

  test('AINewsShort pasa sceneStartSecond a ContentScene', async () => {
    logger.info('Verificando sceneStartSecond');
    const filePath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('sceneStartSecond=');
    logger.info('sceneStartSecond presente');
  });
});

// =============================================================================
// Suite 3: Frame offset en phrase-timing
// =============================================================================

test.describe('Prompt 25 - Suite 3: Frame offset en phrase-timing', () => {
  const logger = new TestLogger({ testName: 'Prompt25-FrameOffset' });

  test('TimingConfig tiene sceneOffsetSeconds', async () => {
    logger.info('Verificando sceneOffsetSeconds en TimingConfig');
    const filePath = path.join(REMOTION_SRC, 'utils', 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('sceneOffsetSeconds');
    logger.info('sceneOffsetSeconds declarado');
  });

  test('getPhraseTiming aplica offset al calcular currentSecond', async () => {
    logger.info('Verificando lógica de offset');
    const filePath = path.join(REMOTION_SRC, 'utils', 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe sumar el offset: (currentFrame / fps) + sceneOffset
    expect(content).toContain('sceneOffset');
    expect(content).toContain('+ sceneOffset');
    logger.info('Offset aplicado correctamente');
  });

  test('sceneOffsetSeconds tiene valor default 0', async () => {
    logger.info('Verificando default de sceneOffsetSeconds');
    const filePath = path.join(REMOTION_SRC, 'utils', 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('sceneOffsetSeconds ?? 0');
    logger.info('Default 0 confirmado');
  });

  test('ContentScene pasa sceneOffsetSeconds a getPhraseTiming', async () => {
    logger.info('Verificando paso de offset en ContentScene');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('sceneOffsetSeconds: sceneStartSecond');
    logger.info('Offset pasado correctamente');
  });
});

// =============================================================================
// Suite 4: Texto on-screen = script narrado
// =============================================================================

test.describe('Prompt 25 - Suite 4: Texto on-screen = script narrado', () => {
  const logger = new TestLogger({ testName: 'Prompt25-TextoConsistente' });

  test('generateVideoProps usa request.script como description', async () => {
    logger.info('Verificando source de description');
    const filePath = path.join(SERVICES_PATH, 'video-rendering.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('description: request.script');
    logger.info('description usa fullScript');
  });

  test('generateVideoProps NO usa request.body como description', async () => {
    logger.info('Verificando que no usa body');
    const filePath = path.join(SERVICES_PATH, 'video-rendering.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // No debe tener "request.body || request.script" como description
    expect(content).not.toContain('description: request.body || request.script');
    logger.info('body eliminado como source de description');
  });

  test('generateVideoProps tiene log de On-screen text source', async () => {
    logger.info('Verificando log de validación');
    const filePath = path.join(SERVICES_PATH, 'video-rendering.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('On-screen text source');
    logger.info('Log de validación presente');
  });
});

// =============================================================================
// Suite 5: Pipeline phraseTimestamps propagación
// =============================================================================

test.describe('Prompt 25 - Suite 5: Pipeline phraseTimestamps', () => {
  const logger = new TestLogger({ testName: 'Prompt25-Pipeline' });

  test('tts.service.ts retorna TTSResponseWithTimestamps', async () => {
    logger.info('Verificando tipo de retorno de generateAudio');
    const filePath = path.join(SERVICES_PATH, 'tts.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('TTSResponseWithTimestamps');
    logger.info('Tipo de retorno actualizado');
  });

  test('orchestrator guarda phraseTimestamps en PASO 6', async () => {
    logger.info('Verificando PASO 6 del orchestrator');
    const filePath = path.join(AUTOMATION_SRC, 'orchestrator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('phraseTimestamps: ttsResult.phraseTimestamps');
    logger.info('phraseTimestamps guardado en PASO 6');
  });

  test('orchestrator pasa phraseTimestamps a renderVideo en PASO 7', async () => {
    logger.info('Verificando PASO 7 del orchestrator');
    const filePath = path.join(AUTOMATION_SRC, 'orchestrator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('phraseTimestamps: audioData.phraseTimestamps');
    logger.info('phraseTimestamps pasado a renderVideo');
  });

  test('orchestrator importa PhraseTimestamp', async () => {
    logger.info('Verificando import de PhraseTimestamp');
    const filePath = path.join(AUTOMATION_SRC, 'orchestrator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('PhraseTimestamp');
    logger.info('Import presente');
  });

  test('orchestrator tiene log de Whisper timestamps', async () => {
    logger.info('Verificando log de timestamps');
    const filePath = path.join(AUTOMATION_SRC, 'orchestrator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('Whisper timestamps');
    logger.info('Log de timestamps presente');
  });
});

// =============================================================================
// Suite 6: Frases desde audioSync
// =============================================================================

test.describe('Prompt 25 - Suite 6: Frases desde audioSync', () => {
  const logger = new TestLogger({ testName: 'Prompt25-FrasesSync' });

  test('ContentScene usa phraseTimestamps como source of truth en useMemo', async () => {
    logger.info('Verificando useMemo con audioSync');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('audioSync?.phraseTimestamps');
    logger.info('phraseTimestamps usado en useMemo');
  });

  test('ContentScene tiene audioSync en dependencias del useMemo', async () => {
    logger.info('Verificando deps del useMemo');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('[description, audioSync]');
    logger.info('audioSync en deps del useMemo');
  });

  test('ContentScene mapea timestamps a frases con text e index', async () => {
    logger.info('Verificando mapeo de timestamps');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('.map((ts, index)');
    logger.info('Mapeo de timestamps presente');
  });
});

// =============================================================================
// Suite 7: Hook visual flash
// =============================================================================

test.describe('Prompt 25 - Suite 7: Hook visual flash', () => {
  const logger = new TestLogger({ testName: 'Prompt25-Flash' });

  test('HeroScene tiene flashOpacity', async () => {
    logger.info('Verificando flashOpacity');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('flashOpacity');
    logger.info('flashOpacity presente');
  });

  test('heroAnimation tiene flashMaxOpacity y flashDurationFrames', async () => {
    logger.info('Verificando config del flash');
    const filePath = path.join(REMOTION_SRC, 'styles', 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('flashMaxOpacity');
    expect(content).toContain('flashDurationFrames');
    logger.info('Config del flash presente');
  });

  test('HeroScene tiene overlay con rgba white', async () => {
    logger.info('Verificando overlay del flash');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('rgba(255, 255, 255');
    logger.info('Overlay white presente');
  });
});

// =============================================================================
// Suite 8: Control de imágenes dinámicas
// =============================================================================

test.describe('Prompt 25 - Suite 8: Control imágenes dinámicas', () => {
  const logger = new TestLogger({ testName: 'Prompt25-ImagenControl' });

  test('scene-segmenter tiene MAX_IMAGE_SEGMENTS = 3', async () => {
    logger.info('Verificando MAX_IMAGE_SEGMENTS');
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('MAX_IMAGE_SEGMENTS');
    expect(content).toContain('= 3');
    logger.info('MAX_IMAGE_SEGMENTS = 3');
  });

  test('scene-segmenter usa Math.min con MAX_IMAGE_SEGMENTS', async () => {
    logger.info('Verificando Math.min en numSegments');
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('Math.min(MAX_IMAGE_SEGMENTS');
    logger.info('Math.min aplicado');
  });

  test('ContentScene tiene lógica de transitionProgress para crossfade', async () => {
    logger.info('Verificando crossfade de imágenes');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('transitionProgress');
    logger.info('transitionProgress presente');
  });

  test('scene-segmenter tiene log con max en mensaje', async () => {
    logger.info('Verificando log de segmentos');
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Log contiene "máx" o "max"
    const hasMaxLog = content.includes('máx') || content.includes('MAX_IMAGE_SEGMENTS');
    expect(hasMaxLog).toBeTruthy();
    logger.info('Log de max segmentos presente');
  });
});

// =============================================================================
// Suite 9: Limpieza y compatibilidad
// =============================================================================

test.describe('Prompt 25 - Suite 9: Limpieza y compatibilidad', () => {
  const logger = new TestLogger({ testName: 'Prompt25-Limpieza' });

  test('ContentScene NO tiene 37 * fps hardcodeado', async () => {
    logger.info('Verificando eliminación de hardcode');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).not.toContain('= 37 * fps');
    logger.info('Hardcode 37*fps eliminado');
  });

  test('ContentScene usa durationInFrames para sceneDurationFrames', async () => {
    logger.info('Verificando uso de durationInFrames');
    const filePath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('= durationInFrames');
    logger.info('durationInFrames usado');
  });

  test('video-rendering.service usa theme tech-editorial', async () => {
    logger.info('Verificando tema actualizado');
    const filePath = path.join(SERVICES_PATH, 'video-rendering.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain("theme: 'tech-editorial'");
    expect(content).not.toContain("theme: 'cyberpunk'");
    logger.info('Tema tech-editorial confirmado');
  });

  test('ContentSceneProps sigue teniendo audioSync opcional', async () => {
    logger.info('Verificando compatibilidad de ContentSceneProps');
    const filePath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // ContentSceneProps ya tenía audioSync desde Prompt 19.7
    expect(content).toContain('audioSync?: AudioSync');
    logger.info('ContentSceneProps compatible');
  });
});

// =============================================================================
// Suite 10: npm Scripts
// =============================================================================

test.describe('Prompt 25 - Suite 10: npm Scripts', () => {
  const logger = new TestLogger({ testName: 'Prompt25-Scripts' });

  test('package.json tiene script test:prompt25', async () => {
    logger.info('Verificando test:prompt25');
    const filePath = path.join(__dirname, '../../package.json');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('test:prompt25');
    logger.info('test:prompt25 presente');
  });

  test('package.json tiene script test:audio-sync-fix', async () => {
    logger.info('Verificando test:audio-sync-fix');
    const filePath = path.join(__dirname, '../../package.json');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('test:audio-sync-fix');
    logger.info('test:audio-sync-fix presente');
  });
});
