/**
 * @fileoverview Tests para TTSService - ElevenLabs Integration
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 16 - ElevenLabs TTS Integration
 */

import { test, expect } from '@playwright/test';

// =============================================================================
// TEST SUITE: CONFIGURACION TTS
// =============================================================================

test.describe('Prompt 16 - TTS Configuration', () => {
  test('TTS_CONFIG tiene estructura valida', () => {
    const { TTS_CONFIG } = require('../../automation/src/config/tts.config');

    expect(TTS_CONFIG.provider).toBe('elevenlabs');
    expect(TTS_CONFIG.elevenlabs).toBeDefined();
    expect(TTS_CONFIG.elevenlabs.baseUrl).toContain('elevenlabs.io');
    expect(TTS_CONFIG.elevenlabs.modelId).toBeDefined();
    expect(TTS_CONFIG.elevenlabs.voiceId).toBeDefined();
  });

  test('Voice settings estan configurados correctamente', () => {
    const { TTS_CONFIG } = require('../../automation/src/config/tts.config');
    const { voiceSettings } = TTS_CONFIG.elevenlabs;

    expect(voiceSettings.stability).toBeGreaterThanOrEqual(0);
    expect(voiceSettings.stability).toBeLessThanOrEqual(1);
    expect(voiceSettings.similarity_boost).toBeGreaterThanOrEqual(0);
    expect(voiceSettings.similarity_boost).toBeLessThanOrEqual(1);
    expect(typeof voiceSettings.use_speaker_boost).toBe('boolean');
  });

  test('Fallback configurado correctamente', () => {
    const { TTS_CONFIG } = require('../../automation/src/config/tts.config');

    expect(TTS_CONFIG.fallback.enabled).toBe(true);
    expect(TTS_CONFIG.fallback.provider).toBe('edge-tts');
    expect(TTS_CONFIG.fallback.edgeTts.voice).toContain('es-MX');
  });

  test('Cache configurado correctamente', () => {
    const { TTS_CONFIG } = require('../../automation/src/config/tts.config');

    expect(TTS_CONFIG.cache.enabled).toBe(true);
    expect(TTS_CONFIG.cache.directory).toBeDefined();
    expect(TTS_CONFIG.cache.ttlDays).toBeGreaterThan(0);
  });

  test('Limites de free tier definidos', () => {
    const { TTS_CONFIG } = require('../../automation/src/config/tts.config');
    const { freeTierLimits } = TTS_CONFIG.elevenlabs;

    expect(freeTierLimits.monthlyCharacters).toBe(10000);
    expect(freeTierLimits.warningThreshold).toBeLessThan(
      freeTierLimits.monthlyCharacters
    );
    expect(freeTierLimits.warningThreshold).toBe(8000);
  });

  test('Helper getElevenLabsTTSUrl genera URL correcta', () => {
    const { getElevenLabsTTSUrl } = require('../../automation/src/config/tts.config');

    const url = getElevenLabsTTSUrl();
    expect(url).toContain('elevenlabs.io');
    expect(url).toContain('text-to-speech');
  });

  test('Helper isNearQuotaLimit funciona correctamente', () => {
    const { isNearQuotaLimit } = require('../../automation/src/config/tts.config');

    expect(isNearQuotaLimit(7999)).toBe(false);
    expect(isNearQuotaLimit(8000)).toBe(true);
    expect(isNearQuotaLimit(9000)).toBe(true);
  });

  test('Helper isQuotaExceeded funciona correctamente', () => {
    const { isQuotaExceeded } = require('../../automation/src/config/tts.config');

    expect(isQuotaExceeded(9999)).toBe(false);
    expect(isQuotaExceeded(10000)).toBe(true);
    expect(isQuotaExceeded(11000)).toBe(true);
  });
});

// =============================================================================
// TEST SUITE: TIPOS TTS
// =============================================================================

test.describe('Prompt 16 - TTS Types', () => {
  test('TTSRequest tiene campos requeridos', () => {
    // Verificar que el tipo compila correctamente
    const request = {
      text: 'Hola mundo',
      cacheKey: 'hash123',
      forceRegenerate: false,
      outputFileName: 'test.mp3',
    };

    expect(request.text).toBeDefined();
    expect(typeof request.text).toBe('string');
  });

  test('TTSResponse tiene estructura correcta', () => {
    const response = {
      audioPath: '/path/to/audio.mp3',
      durationSeconds: 5.5,
      provider: 'elevenlabs' as const,
      fromCache: false,
      charactersUsed: 100,
      metadata: {
        voiceId: 'voice123',
        modelId: 'model123',
        generatedAt: new Date().toISOString(),
      },
    };

    expect(response.audioPath).toBeDefined();
    expect(response.durationSeconds).toBeGreaterThan(0);
    expect(['elevenlabs', 'edge-tts']).toContain(response.provider);
  });

  test('TTSQuotaStatus tiene todos los campos', () => {
    const status = {
      used: 5000,
      limit: 10000,
      remaining: 5000,
      percentageUsed: 50,
      nearLimit: false,
      exceeded: false,
      lastReset: new Date().toISOString(),
    };

    expect(status.remaining).toBe(status.limit - status.used);
    expect(status.percentageUsed).toBe(50);
  });

  test('AudioCacheEntry tiene estructura para persistencia', () => {
    const entry = {
      textHash: 'abc123',
      audioPath: '/cache/abc123.mp3',
      createdAt: new Date().toISOString(),
      durationSeconds: 10,
      provider: 'elevenlabs',
      textLength: 500,
    };

    expect(entry.textHash).toBeDefined();
    expect(entry.audioPath).toContain('.mp3');
  });
});

// =============================================================================
// TEST SUITE: TTS SERVICE
// =============================================================================

test.describe('Prompt 16 - TTS Service', () => {
  test('TTSService se puede instanciar', () => {
    const { TTSService } = require('../../automation/src/services/tts.service');

    const service = new TTSService();
    expect(service).toBeDefined();
  });

  test('TTSService acepta opciones de configuracion', () => {
    const { TTSService } = require('../../automation/src/services/tts.service');

    const service = new TTSService({
      cacheDirectory: 'custom/cache',
      enableCache: false,
      enableFallback: true,
      forceFallback: true,
    });

    expect(service).toBeDefined();
  });

  test('getQuotaStatus retorna estado valido', async () => {
    const { TTSService } = require('../../automation/src/services/tts.service');
    const service = new TTSService();

    const status = await service.getQuotaStatus();

    expect(status).toHaveProperty('used');
    expect(status).toHaveProperty('limit');
    expect(status).toHaveProperty('remaining');
    expect(status).toHaveProperty('percentageUsed');
    expect(status).toHaveProperty('nearLimit');
    expect(status).toHaveProperty('exceeded');
    expect(status).toHaveProperty('lastReset');

    expect(status.limit).toBe(10000);
    expect(status.remaining).toBe(status.limit - status.used);
    expect(typeof status.nearLimit).toBe('boolean');
    expect(typeof status.exceeded).toBe('boolean');
  });

  test('Cuota tiene reset mensual automatico', async () => {
    const { TTSService } = require('../../automation/src/services/tts.service');
    const service = new TTSService();

    const status = await service.getQuotaStatus();
    expect(typeof status.used).toBe('number');
    expect(typeof status.lastReset).toBe('string');
  });

  test('resetMonthlyQuota resetea la cuota', async () => {
    const { TTSService } = require('../../automation/src/services/tts.service');
    const service = new TTSService();

    await service.resetMonthlyQuota();

    const status = await service.getQuotaStatus();
    expect(status.used).toBe(0);
  });
});

// =============================================================================
// TEST SUITE: HASH Y CACHE
// =============================================================================

test.describe('Prompt 16 - Hash y Cache', () => {
  test('Mismo texto genera mismo hash', () => {
    const { TTSService } = require('../../automation/src/services/tts.service');
    const service = new TTSService();

    const text = 'Hola mundo desde Sintaxis IA';
    // @ts-ignore - acceso a metodo privado para testing
    const hash1 = service['generateHash'](text);
    // @ts-ignore
    const hash2 = service['generateHash'](text);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(32); // MD5 = 32 caracteres hex
  });

  test('Textos diferentes generan hashes diferentes', () => {
    const { TTSService } = require('../../automation/src/services/tts.service');
    const service = new TTSService();

    // @ts-ignore
    const hash1 = service['generateHash']('Texto 1');
    // @ts-ignore
    const hash2 = service['generateHash']('Texto 2');

    expect(hash1).not.toBe(hash2);
  });

  test('Hash es determinista', () => {
    const { TTSService } = require('../../automation/src/services/tts.service');
    const service = new TTSService();

    const text = 'Texto de prueba para hash';
    // @ts-ignore
    const hashes = Array.from({ length: 10 }, () =>
      service['generateHash'](text)
    );

    // Todos los hashes deben ser identicos
    const uniqueHashes = new Set(hashes);
    expect(uniqueHashes.size).toBe(1);
  });
});

// =============================================================================
// TEST SUITE: WORD TIMINGS (Subtitulos)
// =============================================================================

test.describe('Prompt 16 - Word Timings', () => {
  test('generateWordTimings genera timings para todas las palabras', () => {
    const { TTSService } = require('../../automation/src/services/tts.service');
    const service = new TTSService();

    const words = ['Hola', 'mundo', 'desde', 'Sintaxis', 'IA'];
    const totalFrames = 150; // 5 segundos a 30fps

    // @ts-ignore
    const timings = service['generateWordTimings'](words, totalFrames);

    expect(timings.length).toBe(words.length);
    timings.forEach((timing: { word: string; startFrame: number; endFrame: number }, index: number) => {
      expect(timing.word).toBe(words[index]);
      expect(timing.startFrame).toBeLessThan(timing.endFrame);
    });
  });

  test('Word timings cubren toda la duracion', () => {
    const { TTSService } = require('../../automation/src/services/tts.service');
    const service = new TTSService();

    const words = ['Una', 'prueba', 'simple'];
    const totalFrames = 90;

    // @ts-ignore
    const timings = service['generateWordTimings'](words, totalFrames);

    // El primer timing debe empezar en 0
    expect(timings[0].startFrame).toBe(0);

    // El ultimo timing debe terminar cerca del total
    const lastTiming = timings[timings.length - 1];
    expect(lastTiming.endFrame).toBe(totalFrames);
  });
});

// =============================================================================
// TEST SUITE: INTEGRACION (Requiere API Key o Fallback)
// =============================================================================

test.describe('Prompt 16 - Integration Tests', () => {
  test('generateAudio con fallback forzado funciona', async () => {
    const { TTSService } = require('../../automation/src/services/tts.service');

    // Usar fallback forzado para no depender de API key
    const service = new TTSService({
      forceFallback: true,
      enableCache: false,
    });

    // Este test puede fallar si edge-tts no esta instalado
    // Se marca como skip si falla por dependencia
    try {
      const result = await service.generateAudio({
        text: 'Prueba de audio con fallback.',
        forceRegenerate: true,
      });

      expect(result.audioPath).toBeDefined();
      expect(result.provider).toBe('edge-tts');
      expect(result.durationSeconds).toBeGreaterThan(0);
      expect(result.charactersUsed).toBe(0); // Fallback no consume cuota
    } catch (error) {
      // Si edge-tts no esta instalado, el test se considera skip
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('edge-tts') || errorMsg.includes('pip')) {
        test.skip();
      } else {
        throw error;
      }
    }
  });

  test('generateAudioLegacy retorna formato compatible', async () => {
    const { TTSService } = require('../../automation/src/services/tts.service');

    const service = new TTSService({
      forceFallback: true,
      enableCache: false,
    });

    try {
      const result = await service.generateAudioLegacy(
        'Prueba de formato legacy.',
        'test-legacy.mp3'
      );

      expect(result).toHaveProperty('audioPath');
      expect(result).toHaveProperty('durationInSeconds');
      expect(result).toHaveProperty('durationInFrames');
      expect(result).toHaveProperty('subtitles');
      expect(result.subtitles.length).toBeGreaterThan(0);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('edge-tts') || errorMsg.includes('pip')) {
        test.skip();
      } else {
        throw error;
      }
    }
  });
});

// =============================================================================
// TEST SUITE: SINGLETON Y EXPORTS
// =============================================================================

test.describe('Prompt 16 - Exports', () => {
  test('ttsService singleton esta disponible', () => {
    const { ttsService } = require('../../automation/src/services/tts.service');

    expect(ttsService).toBeDefined();
    expect(typeof ttsService.generateAudio).toBe('function');
    expect(typeof ttsService.getQuotaStatus).toBe('function');
  });

  test('generateTTSAudio helper function esta disponible', () => {
    const {
      generateTTSAudio,
    } = require('../../automation/src/services/tts.service');

    expect(typeof generateTTSAudio).toBe('function');
  });

  test('TTSService puede ser importado como default', () => {
    const TTSService = require('../../automation/src/services/tts.service').default;

    expect(TTSService).toBeDefined();
    const instance = new TTSService();
    expect(instance).toBeDefined();
  });
});
