/**
 * @fileoverview Tests para Prompt 19.7 - Audio Sync con Whisper
 *
 * Valida la funcionalidad de sincronización de audio usando
 * timestamps de Whisper (OpenAI) para mostrar texto sincronizado
 * con el audio de narración.
 *
 * Cubre:
 * - WhisperService: existe, tiene métodos correctos, es opcional
 * - Tipos: WordTimestamp, PhraseTimestamp, AudioSync
 * - TTSService: integración con Whisper
 * - VideoRenderingService: audioSync en props.json
 * - phrase-timing.ts: soporte para timestamps reales
 * - ContentScene: prop audioSync
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.7
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
const TYPES_PATH = path.join(AUTOMATION_SRC, 'types');

// =============================================================================
// TESTS: WHISPER SERVICE
// =============================================================================

test.describe('Prompt 19.7 - WhisperService', () => {
  const logger = new TestLogger({ testName: 'Prompt19.7-Whisper' });

  test('WhisperService archivo existe', async () => {
    logger.info('Verificando existencia de whisper.service.ts');

    const servicePath = path.join(SERVICES_PATH, 'whisper.service.ts');
    expect(fs.existsSync(servicePath)).toBe(true);

    logger.info('WhisperService existe');
  });

  test('WhisperService tiene método transcribe()', async () => {
    logger.info('Verificando método transcribe()');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'whisper.service.ts'),
      'utf-8'
    );

    expect(content).toContain('async transcribe(audioPath: string)');
    expect(content).toContain('WordTimestamp[]');

    logger.info('Método transcribe() presente');
  });

  test('WhisperService tiene método groupIntoPhrases()', async () => {
    logger.info('Verificando método groupIntoPhrases()');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'whisper.service.ts'),
      'utf-8'
    );

    expect(content).toContain('groupIntoPhrases(wordTimestamps');
    expect(content).toContain('PhraseTimestamp[]');

    logger.info('Método groupIntoPhrases() presente');
  });

  test('WhisperService tiene método isAvailable()', async () => {
    logger.info('Verificando método isAvailable()');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'whisper.service.ts'),
      'utf-8'
    );

    expect(content).toContain('isAvailable()');
    expect(content).toContain('return this.client !== null');

    logger.info('Método isAvailable() presente');
  });

  test('WhisperService verifica OPENAI_API_KEY', async () => {
    logger.info('Verificando que WhisperService es opcional');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'whisper.service.ts'),
      'utf-8'
    );

    expect(content).toContain('OPENAI_API_KEY');
    expect(content).toContain('timestamps deshabilitados');

    logger.info('WhisperService es opcional (verifica API key)');
  });

  test('WhisperService usa modelo whisper-1', async () => {
    logger.info('Verificando modelo de Whisper');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'whisper.service.ts'),
      'utf-8'
    );

    expect(content).toContain("WHISPER_MODEL = 'whisper-1'");

    logger.info('Modelo whisper-1 configurado');
  });

  test('WhisperService tiene singleton export', async () => {
    logger.info('Verificando singleton export');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'whisper.service.ts'),
      'utf-8'
    );

    expect(content).toContain('export const whisperService = new WhisperService()');

    logger.info('Singleton export presente');
  });
});

// =============================================================================
// TESTS: TIPOS DE TIMESTAMPS
// =============================================================================

test.describe('Prompt 19.7 - Tipos de Timestamps', () => {
  const logger = new TestLogger({ testName: 'Prompt19.7-Types' });

  test('WordTimestamp interface existe en tts.types.ts', async () => {
    logger.info('Verificando WordTimestamp');

    const content = fs.readFileSync(
      path.join(TYPES_PATH, 'tts.types.ts'),
      'utf-8'
    );

    expect(content).toContain('export interface WordTimestamp');
    expect(content).toContain('word: string');
    expect(content).toContain('startSeconds: number');
    expect(content).toContain('endSeconds: number');

    logger.info('WordTimestamp interface correcta');
  });

  test('PhraseTimestamp interface existe en tts.types.ts', async () => {
    logger.info('Verificando PhraseTimestamp');

    const content = fs.readFileSync(
      path.join(TYPES_PATH, 'tts.types.ts'),
      'utf-8'
    );

    expect(content).toContain('export interface PhraseTimestamp');
    expect(content).toContain('text: string');
    expect(content).toContain('words: WordTimestamp[]');

    logger.info('PhraseTimestamp interface correcta');
  });

  test('TTSResponseWithTimestamps interface existe', async () => {
    logger.info('Verificando TTSResponseWithTimestamps');

    const content = fs.readFileSync(
      path.join(TYPES_PATH, 'tts.types.ts'),
      'utf-8'
    );

    expect(content).toContain('export interface TTSResponseWithTimestamps');
    expect(content).toContain('wordTimestamps?: WordTimestamp[]');
    expect(content).toContain('phraseTimestamps?: PhraseTimestamp[]');

    logger.info('TTSResponseWithTimestamps interface correcta');
  });

  test('Tipos tienen JSDoc con @since Prompt 19.7', async () => {
    logger.info('Verificando documentación JSDoc');

    const content = fs.readFileSync(
      path.join(TYPES_PATH, 'tts.types.ts'),
      'utf-8'
    );

    expect(content).toContain('@since Prompt 19.7');

    logger.info('Documentación JSDoc presente');
  });
});

// =============================================================================
// TESTS: TTS SERVICE INTEGRATION
// =============================================================================

test.describe('Prompt 19.7 - TTSService Integration', () => {
  const logger = new TestLogger({ testName: 'Prompt19.7-TTS' });

  test('TTSService importa whisperService', async () => {
    logger.info('Verificando import de whisperService');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'tts.service.ts'),
      'utf-8'
    );

    expect(content).toContain("import { whisperService } from './whisper.service'");

    logger.info('Import de whisperService presente');
  });

  test('TTSService importa tipos de timestamps', async () => {
    logger.info('Verificando imports de tipos');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'tts.service.ts'),
      'utf-8'
    );

    expect(content).toContain('WordTimestamp');
    expect(content).toContain('PhraseTimestamp');

    logger.info('Tipos de timestamps importados');
  });

  test('TTSService tiene método addWhisperTimestamps()', async () => {
    logger.info('Verificando método addWhisperTimestamps()');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'tts.service.ts'),
      'utf-8'
    );

    expect(content).toContain('addWhisperTimestamps');
    expect(content).toContain('whisperService.isAvailable()');
    expect(content).toContain('whisperService.transcribe');

    logger.info('Método addWhisperTimestamps() presente');
  });

  test('TTSService llama a Whisper después de generar audio', async () => {
    logger.info('Verificando integración en flujo de generación');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'tts.service.ts'),
      'utf-8'
    );

    // Debe llamar addWhisperTimestamps después de generar con ElevenLabs
    expect(content).toContain('await this.addWhisperTimestamps(response)');

    // Debe retornar timestamps
    expect(content).toContain('wordTimestamps');
    expect(content).toContain('phraseTimestamps');

    logger.info('Whisper integrado en flujo de generación');
  });
});

// =============================================================================
// TESTS: VIDEO RENDERING SERVICE
// =============================================================================

test.describe('Prompt 19.7 - VideoRenderingService', () => {
  const logger = new TestLogger({ testName: 'Prompt19.7-VideoRendering' });

  test('VideoRenderRequest tiene phraseTimestamps opcional', async () => {
    logger.info('Verificando VideoRenderRequest');

    const content = fs.readFileSync(
      path.join(TYPES_PATH, 'video.types.ts'),
      'utf-8'
    );

    expect(content).toContain('phraseTimestamps?: PhraseTimestamp[]');

    logger.info('VideoRenderRequest tiene campo phraseTimestamps');
  });

  test('generateVideoProps incluye audioSync', async () => {
    logger.info('Verificando audioSync en generateVideoProps');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'video-rendering.service.ts'),
      'utf-8'
    );

    expect(content).toContain('audioSync');
    expect(content).toContain('phraseTimestamps');
    expect(content).toContain('audioDuration');

    logger.info('audioSync incluido en generateVideoProps');
  });

  test('generateVideoProps tiene @updated Prompt 19.7', async () => {
    logger.info('Verificando documentación JSDoc');

    const content = fs.readFileSync(
      path.join(SERVICES_PATH, 'video-rendering.service.ts'),
      'utf-8'
    );

    expect(content).toContain('@updated Prompt 19.7');

    logger.info('Documentación actualizada');
  });
});

// =============================================================================
// TESTS: PHRASE-TIMING.TS
// =============================================================================

test.describe('Prompt 19.7 - phrase-timing.ts', () => {
  const logger = new TestLogger({ testName: 'Prompt19.7-PhraseTiming' });

  test('TimingConfig tiene phraseTimestamps opcional', async () => {
    logger.info('Verificando TimingConfig');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'utils/phrase-timing.ts'),
      'utf-8'
    );

    expect(content).toContain('phraseTimestamps?: PhraseTimestamp[]');
    expect(content).toContain('fps?: number');

    logger.info('TimingConfig tiene campos de Prompt 19.7');
  });

  test('getPhraseTiming usa timestamps reales cuando disponibles', async () => {
    logger.info('Verificando uso de timestamps reales');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'utils/phrase-timing.ts'),
      'utf-8'
    );

    expect(content).toContain('if (phraseTimestamps && phraseTimestamps.length > 0)');
    // Prompt 25: ahora incluye offset para compensar inicio de escena
    expect(content).toContain('currentFrame / fps');

    logger.info('Timestamps reales se usan cuando disponibles');
  });

  test('getPhraseTiming tiene fallback a distribución uniforme', async () => {
    logger.info('Verificando fallback');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'utils/phrase-timing.ts'),
      'utf-8'
    );

    // Debe tener comentario indicando fallback
    expect(content).toContain('Fallback');
    expect(content).toContain('framesPerPhrase = totalFrames / phraseCount');

    logger.info('Fallback a distribución uniforme presente');
  });

  test('findPhraseIndexByTime función existe', async () => {
    logger.info('Verificando función findPhraseIndexByTime');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'utils/phrase-timing.ts'),
      'utf-8'
    );

    expect(content).toContain('function findPhraseIndexByTime');
    expect(content).toContain('timestamps: PhraseTimestamp[]');

    logger.info('Función findPhraseIndexByTime presente');
  });

  test('phrase-timing.ts tiene @updated Prompt 19.7', async () => {
    logger.info('Verificando documentación');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'utils/phrase-timing.ts'),
      'utf-8'
    );

    expect(content).toContain('@updated Prompt 19.7');

    logger.info('Documentación actualizada');
  });
});

// =============================================================================
// TESTS: CONTENTSCENE INTEGRATION
// =============================================================================

test.describe('Prompt 19.7 - ContentScene Integration', () => {
  const logger = new TestLogger({ testName: 'Prompt19.7-ContentScene' });

  test('ContentSceneProps tiene audioSync opcional', async () => {
    logger.info('Verificando ContentSceneProps');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'types/video.types.ts'),
      'utf-8'
    );

    expect(content).toContain('audioSync?: AudioSync');

    logger.info('ContentSceneProps tiene audioSync');
  });

  test('AudioSync interface existe', async () => {
    logger.info('Verificando AudioSync interface');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'types/video.types.ts'),
      'utf-8'
    );

    expect(content).toContain('export interface AudioSync');
    expect(content).toContain('phraseTimestamps: PhraseTimestamp[]');
    expect(content).toContain('audioDuration: number');

    logger.info('AudioSync interface correcta');
  });

  test('ContentScene acepta audioSync como prop', async () => {
    logger.info('Verificando prop audioSync en ContentScene');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx'),
      'utf-8'
    );

    // Verifica que audioSync se usa en la desestructuración de props
    expect(content).toContain('audioSync,');
    // El tipo AudioSync viene de ContentSceneProps (importado de types)
    expect(content).toContain('ContentSceneProps');

    logger.info('ContentScene acepta audioSync');
  });

  test('ContentScene pasa phraseTimestamps a getPhraseTiming', async () => {
    logger.info('Verificando paso de timestamps');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx'),
      'utf-8'
    );

    expect(content).toContain('phraseTimestamps: audioSync?.phraseTimestamps');

    logger.info('Timestamps se pasan a getPhraseTiming');
  });
});

// =============================================================================
// TESTS: EXPORTS
// =============================================================================

test.describe('Prompt 19.7 - Exports', () => {
  const logger = new TestLogger({ testName: 'Prompt19.7-Exports' });

  test('PhraseTimestamp exportado desde utils/index.ts', async () => {
    logger.info('Verificando export de PhraseTimestamp');

    const content = fs.readFileSync(
      path.join(REMOTION_SRC, 'utils/index.ts'),
      'utf-8'
    );

    expect(content).toContain('type PhraseTimestamp');

    logger.info('PhraseTimestamp exportado');
  });
});

// =============================================================================
// TESTS: ENV CONFIG
// =============================================================================

test.describe('Prompt 19.7 - Environment Config', () => {
  const logger = new TestLogger({ testName: 'Prompt19.7-Env' });

  test('.env.example incluye OPENAI_API_KEY', async () => {
    logger.info('Verificando .env.example');

    const envPath = path.join(__dirname, '../../.env.example');
    const content = fs.readFileSync(envPath, 'utf-8');

    expect(content).toContain('OPENAI_API_KEY');
    expect(content).toContain('Whisper');
    expect(content).toContain('Prompt 19.7');

    logger.info('.env.example incluye OPENAI_API_KEY');
  });
});
