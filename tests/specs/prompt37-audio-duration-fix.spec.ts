/**
 * @fileoverview Tests para Prompt 37 - Fix audioDuration incorrecto
 *
 * Valida:
 * - video-rendering.service.ts: Whisper override de audioDuration, dynamicScenes ajuste
 * - tts.service.ts: Fallback bitrate correcto (48kbps, no 128kbps)
 * - AINewsShort.tsx: contentSceneDuration usa audioSync.audioDuration
 * - Regresión: Hero 8s, Outro 5s, crossfade 30 frames
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 37
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

const VIDEO_RENDERING_PATH = path.join(AUTOMATION_SRC, 'services/video-rendering.service.ts');
const TTS_SERVICE_PATH = path.join(AUTOMATION_SRC, 'services/tts.service.ts');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');

// =============================================================================
// TESTS: WHISPER OVERRIDE DE AUDIODURATION
// =============================================================================

test.describe('Prompt 37 - Whisper audioDuration Override', () => {
  const logger = new TestLogger({ testName: 'Prompt37-WhisperOverride' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(VIDEO_RENDERING_PATH, 'utf-8');
  });

  test('Extrae whisperEndSeconds del último phraseTimestamp', async () => {
    logger.info('Verificando extracción de Whisper endSeconds');

    expect(content).toContain('whisperEndSeconds');
    expect(content).toContain('phraseTimestamps[request.phraseTimestamps.length - 1].endSeconds');
  });

  test('Calcula effectiveAudioDuration cuando Whisper > TTS', async () => {
    logger.info('Verificando effectiveAudioDuration');

    expect(content).toContain('effectiveAudioDuration');
    expect(content).toContain('whisperEndSeconds > request.audioDuration');
    expect(content).toContain('Math.ceil(whisperEndSeconds) + 1');
  });

  test('Cap a MAX_AUDIO_SECONDS para YouTube Shorts (60s)', async () => {
    logger.info('Verificando cap de duración');

    expect(content).toContain('MAX_SHORT_SECONDS = 60');
    expect(content).toContain('MAX_AUDIO_SECONDS');
    expect(content).toContain('Math.min(uncappedAudioDuration, MAX_AUDIO_SECONDS)');
  });

  test('Usa effectiveAudioDuration en audioSync (no request.audioDuration)', async () => {
    logger.info('Verificando audioSync usa effectiveAudioDuration');

    expect(content).toContain('audioDuration: effectiveAudioDuration');
    // No debe usar request.audioDuration directamente en audioSync
    expect(content).not.toMatch(/audioSync[\s\S]*?audioDuration:\s*request\.audioDuration/);
  });

  test('Log de corrección cuando discrepancia > 1.5x', async () => {
    logger.info('Verificando log de corrección');

    expect(content).toContain('whisperEndSeconds > request.audioDuration * 1.5');
    expect(content).toContain('audioDuration corregido');
  });
});

// =============================================================================
// TESTS: CONFIG.DURATION CÁLCULO
// =============================================================================

test.describe('Prompt 37 - config.duration Cálculo', () => {
  const logger = new TestLogger({ testName: 'Prompt37-Duration' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(VIDEO_RENDERING_PATH, 'utf-8');
  });

  test('config.duration usa effectiveAudioDuration (no request.audioDuration)', async () => {
    logger.info('Verificando fórmula de duración');

    // Debe usar effectiveAudioDuration en la fórmula de duration
    expect(content).toContain('Math.max(37, effectiveAudioDuration + 1)');
  });

  test('Fórmula: 8 + max(37, audio+1) + 1 + 5', async () => {
    logger.info('Verificando estructura de fórmula');

    // La fórmula de duración debe incluir Hero(8) + Content + Breathing(1) + Outro(5)
    expect(content).toMatch(/duration:\s*Math\.ceil\(8\s*\+\s*Math\.max\(37,\s*effectiveAudioDuration\s*\+\s*1\)\s*\+\s*1\s*\+\s*5\)/);
  });

  test('Documentación menciona Prompt 37', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('Prompt 37');
  });
});

// =============================================================================
// TESTS: DYNAMICSCENES AJUSTE
// =============================================================================

test.describe('Prompt 37 - DynamicScenes Boundaries Ajuste', () => {
  const logger = new TestLogger({ testName: 'Prompt37-DynamicScenes' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(VIDEO_RENDERING_PATH, 'utf-8');
  });

  test('Recalcula dynamicScenes cuando audioDuration cambia', async () => {
    logger.info('Verificando recálculo de dynamicScenes');

    expect(content).toContain('adjustedDynamicScenes');
    expect(content).toContain('effectiveAudioDuration !== request.audioDuration');
  });

  test('Distribuye segmentos uniformemente por effectiveAudioDuration', async () => {
    logger.info('Verificando distribución de segmentos');

    expect(content).toContain('effectiveAudioDuration / adjustedDynamicScenes.length');
    expect(content).toContain('Math.round(i * segmentDuration)');
    expect(content).toContain('Math.round((i + 1) * segmentDuration)');
  });

  test('Usa adjustedDynamicScenes en props (no request.dynamicScenes)', async () => {
    logger.info('Verificando que props usa ajustadas');

    expect(content).toContain('dynamicScenes: adjustedDynamicScenes');
  });
});

// =============================================================================
// TESTS: TTS FALLBACK BITRATE
// =============================================================================

test.describe('Prompt 37 - TTS Fallback Bitrate', () => {
  const logger = new TestLogger({ testName: 'Prompt37-TTSFallback' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(TTS_SERVICE_PATH, 'utf-8');
  });

  test('Fallback usa estimación 48kbps (no 128kbps)', async () => {
    logger.info('Verificando bitrate fallback');

    // Debe usar 6 * 1024 (48kbps = 6KB/s), no 16 * 1024 (128kbps)
    expect(content).toContain('stats.size / (6 * 1024)');
    // No debe usar la estimación antigua de 128kbps como retorno
    expect(content).not.toMatch(/return stats\.size \/ \(16 \* 1024\)/);
  });

  test('Documenta que Edge-TTS usa ~48kbps', async () => {
    logger.info('Verificando documentación de bitrate');

    expect(content).toContain('48kbps');
    expect(content).toContain('Edge-TTS');
  });
});

// =============================================================================
// TESTS: AINEWSSHORT TIMING
// =============================================================================

test.describe('Prompt 37 - AINewsShort Timing', () => {
  const logger = new TestLogger({ testName: 'Prompt37-Timing' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('contentSceneDuration usa Math.max(37*fps, audioDurationFrames)', async () => {
    logger.info('Verificando contentSceneDuration');

    expect(content).toContain('Math.max(37 * fps, audioDurationFrames)');
  });

  test('audioDurationFrames se calcula desde audioSync.audioDuration', async () => {
    logger.info('Verificando audioDurationFrames');

    expect(content).toContain('audioSync?.audioDuration');
    expect(content).toContain('Math.ceil(audioSync.audioDuration * fps) + 30');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 37 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt37-Regresion' });

  test('Hero timing sin cambio (8s)', async () => {
    logger.info('Verificando Hero');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('heroSceneDuration = 8 * fps');
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

  // Prompt 41: BREATHING_ROOM_FRAMES 30→45
  test('Breathing room >= 30 frames sin regresión', async () => {
    logger.info('Verificando breathing room');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    const match = content.match(/BREATHING_ROOM_FRAMES\s*=\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(30);
  });

  test('AudioMixer sin cambio', async () => {
    logger.info('Verificando AudioMixer');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('<AudioMixer');
    expect(content).toContain('voice={audio.voice}');
  });

  test('sceneStartSecond={0} (Prompt 44: audio alineado)', async () => {
    logger.info('Verificando sceneStartSecond={0}');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    // Prompt 44: con narración en contentStart, offset ya no necesario
    expect(content).toContain('sceneStartSecond={0}');
  });
});

// =============================================================================
// TESTS: PROMPT 37-FIX1 — ANTI-SILENCIO (VOZ DESDE FRAME 0)
// =============================================================================

test.describe('Prompt 37-Fix1→44 - Voz desde contentStart (sync editorial)', () => {
  const logger = new TestLogger({ testName: 'Prompt37Fix1-AntiSilencio' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('Narration Sequence arranca en contentStart (Prompt 44)', async () => {
    logger.info('Verificando Narration from={contentStart}');

    // Prompt 44: voz alineada con texto editorial (revierte Prompt 37-Fix1)
    // Prompt 41: termina en outroStart
    expect(content).toMatch(/Sequence\s+from=\{contentStart\}\s+durationInFrames=\{outroStart\s*-\s*contentStart\}\s+name="Narration"/);
  });

  // Prompt 41+44: Narration termina en outroStart, empieza en contentStart
  test('Narration Sequence termina en outroStart - contentStart (Prompt 41+44)', async () => {
    logger.info('Verificando Narration outroStart - contentStart');

    expect(content).toMatch(/durationInFrames=\{outroStart\s*-\s*contentStart\}[\s\S]*?name="Narration"/);
  });

  test('Music bed SÍ usa heroVolume en callback (Prompt 44)', async () => {
    logger.info('Verificando music bed con heroVolume');

    // Prompt 44: restaurar heroVolume para hero scene (22%)
    const musicSection = content.match(/BackgroundMusic[\s\S]*?<\/Sequence>/);
    expect(musicSection).toBeTruthy();
    expect(musicSection![0]).toContain('heroVolume');
  });

  test('Music bed usa contentVolume como base (8%)', async () => {
    logger.info('Verificando music bed contentVolume');

    const musicSection = content.match(/BackgroundMusic[\s\S]*?<\/Sequence>/);
    expect(musicSection).toBeTruthy();
    expect(musicSection![0]).toContain('musicBed.contentVolume');
  });

  test('ContentScene recibe sceneStartSecond={0} (Prompt 44: audio alineado)', async () => {
    logger.info('Verificando sceneStartSecond={0}');

    // Prompt 44: con narración en contentStart, offset ya no necesario
    expect(content).toContain('sceneStartSecond={0}');
  });

  test('Documentación menciona Prompt 37-Fix1', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('Prompt 37-Fix1');
  });
});
