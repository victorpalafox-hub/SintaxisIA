/**
 * @fileoverview Tests para Prompt 17: Video Rendering Service
 *
 * Valida:
 * - Configuración de video (resolución, fps, codec, paths)
 * - Servicio de rendering (inicialización, métodos)
 * - Generación de subtítulos sincronizados
 * - Generación de secciones del video
 * - Contrato de datos para Remotion
 * - Formateo de tamaño de archivo
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 17
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

// Importar configuración y tipos
import { VIDEO_CONFIG } from '../../automation/src/config/video.config';
import {
  formatFileSize,
  secondsToFrames,
  framesToSeconds,
  VIDEO_QUALITY_PRESETS,
} from '../../automation/src/types/video.types';

test.describe('PROMPT 17: Video Rendering Service', () => {
  let logger: TestLogger;

  test.beforeAll(async () => {
    logger = new TestLogger('prompt17-video-rendering');
    await logger.info('=== INICIANDO SUITE: Video Rendering Service ===');
  });

  test.afterAll(async () => {
    await logger.info('=== FINALIZANDO SUITE: Video Rendering Service ===');
    await logger.close();
  });

  // ==========================================
  // SUITE 1: ARCHIVOS DEL SISTEMA
  // ==========================================

  test.describe('Suite 1: Video Rendering Files', () => {
    test('video.config.ts should exist with correct exports', async () => {
      await logger.info('Validando existencia de video.config.ts');

      const configPath = path.join(
        process.cwd(),
        'automation/src/config/video.config.ts'
      );
      expect(fs.existsSync(configPath)).toBeTruthy();

      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('VIDEO_SPECS');
      expect(content).toContain('VIDEO_PATHS');
      expect(content).toContain('REMOTION_CONFIG');
      expect(content).toContain('VIDEO_SECTIONS');
      expect(content).toContain('SUBTITLE_CONFIG');

      await logger.info('✅ video.config.ts presente con exports correctos');
    });

    test('video.types.ts should exist with correct interfaces', async () => {
      await logger.info('Validando existencia de video.types.ts');

      const typesPath = path.join(
        process.cwd(),
        'automation/src/types/video.types.ts'
      );
      expect(fs.existsSync(typesPath)).toBeTruthy();

      const content = fs.readFileSync(typesPath, 'utf-8');
      expect(content).toContain('VideoRenderRequest');
      expect(content).toContain('VideoRenderResponse');
      expect(content).toContain('RemotionDataContract');
      expect(content).toContain('SubtitleWord');
      expect(content).toContain('VideoSection');

      await logger.info('✅ video.types.ts presente con interfaces correctas');
    });

    test('video-rendering.service.ts should exist', async () => {
      await logger.info('Validando existencia de video-rendering.service.ts');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      expect(fs.existsSync(servicePath)).toBeTruthy();

      const content = fs.readFileSync(servicePath, 'utf-8');
      expect(content).toContain('VideoRenderingService');
      expect(content).toContain('renderVideo');
      expect(content).toContain('verifyRemotionSetup');
      expect(content).toContain('generateSubtitles');
      expect(content).toContain('generateSections');

      await logger.info('✅ video-rendering.service.ts presente con métodos correctos');
    });
  });

  // ==========================================
  // SUITE 2: CONFIGURACIÓN DE VIDEO
  // ==========================================

  test.describe('Suite 2: Video Configuration', () => {
    test('VIDEO_SPECS should have correct resolution for Shorts', async () => {
      await logger.info('Validando resolución de video');

      expect(VIDEO_CONFIG.specs.width).toBe(1080);
      expect(VIDEO_CONFIG.specs.height).toBe(1920);
      expect(VIDEO_CONFIG.specs.aspectRatio).toBe('9:16');

      await logger.info(`   Resolución: ${VIDEO_CONFIG.specs.width}x${VIDEO_CONFIG.specs.height}`);
      await logger.info(`   Aspect Ratio: ${VIDEO_CONFIG.specs.aspectRatio}`);
      await logger.info('✅ Resolución correcta para YouTube Shorts');
    });

    test('VIDEO_SPECS should have correct FPS and codec', async () => {
      await logger.info('Validando FPS y codec');

      expect(VIDEO_CONFIG.specs.fps).toBe(30);
      expect(VIDEO_CONFIG.specs.codec).toBe('h264');
      expect(VIDEO_CONFIG.specs.audioCodec).toBe('aac');
      expect(VIDEO_CONFIG.specs.crf).toBeGreaterThanOrEqual(15);
      expect(VIDEO_CONFIG.specs.crf).toBeLessThanOrEqual(28);

      await logger.info(`   FPS: ${VIDEO_CONFIG.specs.fps}`);
      await logger.info(`   Codec: ${VIDEO_CONFIG.specs.codec}`);
      await logger.info(`   CRF: ${VIDEO_CONFIG.specs.crf}`);
      await logger.info('✅ FPS y codec correctos');
    });

    test('VIDEO_SPECS should have correct duration limits', async () => {
      await logger.info('Validando límites de duración');

      // YouTube Shorts límite: 60s, target: 50s para tener margen
      expect(VIDEO_CONFIG.specs.targetDuration).toBe(50);
      expect(VIDEO_CONFIG.specs.minDuration).toBe(30);
      expect(VIDEO_CONFIG.specs.maxDuration).toBe(58);

      await logger.info(`   Target: ${VIDEO_CONFIG.specs.targetDuration}s`);
      await logger.info(`   Min: ${VIDEO_CONFIG.specs.minDuration}s`);
      await logger.info(`   Max: ${VIDEO_CONFIG.specs.maxDuration}s`);
      await logger.info('✅ Límites de duración correctos (YouTube Shorts < 60s)');
    });

    test('REMOTION_CONFIG should have correct composition IDs', async () => {
      await logger.info('Validando IDs de composición');

      expect(VIDEO_CONFIG.remotion.compositionId).toBe('AINewsShort');
      expect(VIDEO_CONFIG.remotion.previewCompositionId).toBe('AINewsShort-Preview');

      await logger.info(`   Production: ${VIDEO_CONFIG.remotion.compositionId}`);
      await logger.info(`   Preview: ${VIDEO_CONFIG.remotion.previewCompositionId}`);
      await logger.info('✅ IDs de composición correctos (actualizados Prompt 13.2)');
    });

    test('VIDEO_PATHS should have valid paths', async () => {
      await logger.info('Validando paths de video');

      expect(VIDEO_CONFIG.paths.remotionApp).toBeDefined();
      expect(VIDEO_CONFIG.paths.outputDir).toBeDefined();
      expect(VIDEO_CONFIG.paths.tempDir).toBeDefined();
      expect(VIDEO_CONFIG.paths.publicAssets).toBeDefined();
      expect(VIDEO_CONFIG.paths.dataJson).toBeDefined();

      await logger.info(`   Remotion App: ${VIDEO_CONFIG.paths.remotionApp}`);
      await logger.info(`   Output Dir: ${VIDEO_CONFIG.paths.outputDir}`);
      await logger.info('✅ Paths configurados correctamente');
    });
  });

  // ==========================================
  // SUITE 3: VIDEO SECTIONS
  // ==========================================

  test.describe('Suite 3: Video Sections Configuration', () => {
    test('should have all 5 sections defined', async () => {
      await logger.info('Validando secciones del video');

      const expectedSections = ['hook', 'headline', 'main', 'impact', 'outro'];

      for (const section of expectedSections) {
        expect(VIDEO_CONFIG.sections).toHaveProperty(section);
        await logger.info(`   ✓ ${section}`);
      }

      await logger.info('✅ Todas las secciones definidas');
    });

    test('sections should have valid frame ranges', async () => {
      await logger.info('Validando rangos de frames');

      const sections = Object.values(VIDEO_CONFIG.sections);

      sections.forEach(section => {
        expect(section.startFrame).toBeGreaterThanOrEqual(0);
        expect(section.endFrame).toBeGreaterThan(section.startFrame);
        expect(section.durationSeconds).toBeGreaterThan(0);
      });

      await logger.info('✅ Rangos de frames válidos');
    });

    test('sections should cover total video duration', async () => {
      await logger.info('Validando cobertura de duración');

      const sections = VIDEO_CONFIG.sections;
      const lastSection = sections.outro;
      const totalFrames = lastSection.endFrame;
      const totalSeconds = totalFrames / VIDEO_CONFIG.specs.fps;

      // Las secciones deben estar dentro del rango permitido (min-max)
      expect(totalSeconds).toBeGreaterThanOrEqual(VIDEO_CONFIG.specs.minDuration);
      expect(totalSeconds).toBeLessThanOrEqual(VIDEO_CONFIG.specs.maxDuration);

      await logger.info(`   Total frames: ${totalFrames}`);
      await logger.info(`   Total seconds: ${totalSeconds}`);
      await logger.info('✅ Secciones cubren duración dentro del rango permitido');
    });
  });

  // ==========================================
  // SUITE 4: UTILITY FUNCTIONS
  // ==========================================

  test.describe('Suite 4: Utility Functions', () => {
    test('formatFileSize should format bytes correctly', async () => {
      await logger.info('Validando formatFileSize()');

      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(15728640)).toBe('15 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');

      await logger.info('   0 → "0 Bytes" ✓');
      await logger.info('   1024 → "1 KB" ✓');
      await logger.info('   1048576 → "1 MB" ✓');
      await logger.info('✅ formatFileSize() funciona correctamente');
    });

    test('secondsToFrames should calculate frames correctly', async () => {
      await logger.info('Validando secondsToFrames()');

      expect(secondsToFrames(1, 30)).toBe(30);
      expect(secondsToFrames(10, 30)).toBe(300);
      expect(secondsToFrames(50, 30)).toBe(1500);
      expect(secondsToFrames(1, 60)).toBe(60);

      await logger.info('   1s @ 30fps = 30 frames ✓');
      await logger.info('   50s @ 30fps = 1500 frames ✓');
      await logger.info('✅ secondsToFrames() funciona correctamente');
    });

    test('framesToSeconds should calculate seconds correctly', async () => {
      await logger.info('Validando framesToSeconds()');

      expect(framesToSeconds(30, 30)).toBe(1);
      expect(framesToSeconds(300, 30)).toBe(10);
      expect(framesToSeconds(1500, 30)).toBe(50);
      expect(framesToSeconds(60, 60)).toBe(1);

      await logger.info('   30 frames @ 30fps = 1s ✓');
      await logger.info('   1500 frames @ 30fps = 50s ✓');
      await logger.info('✅ framesToSeconds() funciona correctamente');
    });

    test('VIDEO_QUALITY_PRESETS should have valid CRF values', async () => {
      await logger.info('Validando VIDEO_QUALITY_PRESETS');

      expect(VIDEO_QUALITY_PRESETS.low.crf).toBe(28);
      expect(VIDEO_QUALITY_PRESETS.medium.crf).toBe(23);
      expect(VIDEO_QUALITY_PRESETS.high.crf).toBe(18);
      expect(VIDEO_QUALITY_PRESETS.ultra.crf).toBe(15);

      await logger.info('   low: CRF 28 ✓');
      await logger.info('   medium: CRF 23 ✓');
      await logger.info('   high: CRF 18 ✓');
      await logger.info('   ultra: CRF 15 ✓');
      await logger.info('✅ Presets de calidad correctos');
    });
  });

  // ==========================================
  // SUITE 5: SUBTITLE CONFIGURATION
  // ==========================================

  test.describe('Suite 5: Subtitle Configuration', () => {
    test('SUBTITLE_CONFIG should have valid settings', async () => {
      await logger.info('Validando configuración de subtítulos');

      expect(VIDEO_CONFIG.subtitles.wordsPerSecond).toBeGreaterThan(0);
      expect(VIDEO_CONFIG.subtitles.wordsPerSecond).toBeLessThan(5);
      expect(VIDEO_CONFIG.subtitles.fontSize).toBeGreaterThanOrEqual(24);
      expect(VIDEO_CONFIG.subtitles.minFramesPerWord).toBeGreaterThan(0);
      expect(VIDEO_CONFIG.subtitles.maxFramesPerWord).toBeGreaterThan(
        VIDEO_CONFIG.subtitles.minFramesPerWord
      );

      await logger.info(`   Words/sec: ${VIDEO_CONFIG.subtitles.wordsPerSecond}`);
      await logger.info(`   Font size: ${VIDEO_CONFIG.subtitles.fontSize}px`);
      await logger.info(`   Min frames/word: ${VIDEO_CONFIG.subtitles.minFramesPerWord}`);
      await logger.info(`   Max frames/word: ${VIDEO_CONFIG.subtitles.maxFramesPerWord}`);
      await logger.info('✅ Configuración de subtítulos válida');
    });
  });

  // ==========================================
  // SUITE 6: SERVICE IMPORT VALIDATION
  // ==========================================

  test.describe('Suite 6: Service Import Validation', () => {
    test('videoRenderingService should be importable', async () => {
      await logger.info('Validando import del servicio');

      // Importar dinámicamente para evitar errores si el archivo no existe
      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );

      expect(fs.existsSync(servicePath)).toBeTruthy();

      const content = fs.readFileSync(servicePath, 'utf-8');

      // Verificar exports
      expect(content).toContain('export const videoRenderingService');
      expect(content).toContain('export default videoRenderingService');

      await logger.info('✅ Servicio exportable correctamente');
    });

    test('service should have renderVideo method', async () => {
      await logger.info('Validando método renderVideo');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('async renderVideo(');
      expect(content).toContain('VideoRenderRequest');
      expect(content).toContain('VideoRenderResponse');

      await logger.info('✅ Método renderVideo presente');
    });

    test('service should have verifyRemotionSetup method', async () => {
      await logger.info('Validando método verifyRemotionSetup');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('verifyRemotionSetup');
      expect(content).toContain('SetupVerificationResult');

      await logger.info('✅ Método verifyRemotionSetup presente');
    });

    test('service should have subtitle generation method', async () => {
      await logger.info('Validando método generateSubtitles');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('generateSubtitles');
      expect(content).toContain('SubtitleWord[]');

      await logger.info('✅ Método generateSubtitles presente');
    });

    test('service should have section generation method', async () => {
      await logger.info('Validando método generateSections');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('generateSections');
      expect(content).toContain('VideoSection[]');

      await logger.info('✅ Método generateSections presente');
    });
  });

  // ==========================================
  // SUITE 7: REMOTION INTEGRATION
  // ==========================================

  test.describe('Suite 7: Remotion Integration', () => {
    test('service should handle Remotion CLI execution', async () => {
      await logger.info('Validando integración con Remotion CLI');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('remotion');
      expect(content).toContain('render');
      expect(content).toContain('--codec');
      expect(content).toContain('--crf');

      await logger.info('✅ Integración con Remotion CLI configurada');
    });

    test('service should generate data.json for Remotion', async () => {
      await logger.info('Validando generación de data.json');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('writeDataJson');
      expect(content).toContain('RemotionDataContract');
      expect(content).toContain('data.json');

      await logger.info('✅ Generación de data.json implementada');
    });

    test('service should handle asset preparation', async () => {
      await logger.info('Validando preparación de assets');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('prepareAssets');
      expect(content).toContain('audioPath');
      expect(content).toContain('heroImage');
      expect(content).toContain('downloadFile');

      await logger.info('✅ Preparación de assets implementada');
    });
  });

  // ==========================================
  // SUITE 8: ERROR HANDLING
  // ==========================================

  test.describe('Suite 8: Error Handling', () => {
    test('service should have retry logic', async () => {
      await logger.info('Validando lógica de reintentos');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('retries');
      expect(content).toContain('maxRetries');
      expect(content).toContain('attempts');
      expect(content).toContain('retryDelay');

      await logger.info('✅ Lógica de reintentos implementada');
    });

    test('service should handle timeout', async () => {
      await logger.info('Validando manejo de timeout');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('timeout');
      expect(content).toContain('setTimeout');
      expect(content).toContain('clearTimeout');

      await logger.info('✅ Manejo de timeout implementado');
    });

    test('service should return error response on failure', async () => {
      await logger.info('Validando respuesta de error');

      const servicePath = path.join(
        process.cwd(),
        'automation/src/services/video-rendering.service.ts'
      );
      const content = fs.readFileSync(servicePath, 'utf-8');

      expect(content).toContain('success: false');
      expect(content).toContain('error:');
      expect(content).toContain('errorMessage');

      await logger.info('✅ Respuesta de error implementada');
    });
  });
});
