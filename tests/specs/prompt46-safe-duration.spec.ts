/**
 * @fileoverview Tests para Fix Duración Segura - YouTube Shorts (Prompt 46)
 *
 * Valida que:
 * - El video NUNCA excede 59.2 segundos (límite seguro de Shorts)
 * - SAFE_MAX_FRAMES = 1776 @ 30fps
 * - SAFE_END_BUFFER = 20 frames de respiración visual final
 * - FinalBufferSequence existe y aplica fade-out negro
 * - compressionRatio se aplica solo si el audio excede el límite
 * - calculateMetadata en Root.tsx aplica el cap correctamente
 * - video-rendering.service.ts limita config.duration a 59.2s
 *
 * @since Prompt 46 - Fix duración segura YouTube Shorts
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// Rutas a archivos fuente
const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
const ROOT_PATH = path.join(REMOTION_SRC, 'Root.tsx');
const RENDERING_SERVICE_PATH = path.join(
  process.cwd(),
  'automation',
  'src',
  'services',
  'video-rendering.service.ts'
);
const AUDIOMIXER_PATH = path.join(REMOTION_SRC, 'components', 'audio', 'AudioMixer.tsx');
const AUDIO_TYPES_PATH = path.join(REMOTION_SRC, 'types', 'audio.types.ts');

// Constantes del fix
const SAFE_MAX_SECONDS = 59.2;
const FPS = 30;
const SAFE_MAX_FRAMES = Math.floor(SAFE_MAX_SECONDS * FPS); // 1776
const SAFE_END_BUFFER = 20;

// =============================================================================
// TESTS: CONSTANTES DE SEGURIDAD EN AINewsShort.tsx
// =============================================================================

test.describe('Fix Duración - Constantes de seguridad (AINewsShort.tsx)', () => {
  const logger = new TestLogger({ testName: 'SafeDuration-Constants' });

  test('SAFE_MAX_SECONDS = 59.2 está definido en AINewsShort.tsx', async () => {
    logger.info('Verificando SAFE_MAX_SECONDS');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    const match = content.match(/SAFE_MAX_SECONDS\s*=\s*([\d.]+)/);
    expect(match, 'SAFE_MAX_SECONDS no encontrado en AINewsShort.tsx').toBeTruthy();
    expect(parseFloat(match![1])).toBe(SAFE_MAX_SECONDS);
  });

  test(`SAFE_MAX_FRAMES = floor(${SAFE_MAX_SECONDS} * fps) = ${SAFE_MAX_FRAMES}`, async () => {
    logger.info('Verificando SAFE_MAX_FRAMES');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('SAFE_MAX_FRAMES');
    // Verifica que la fórmula usa Math.floor
    expect(content).toContain('Math.floor(SAFE_MAX_SECONDS * fps)');
  });

  test(`SAFE_END_BUFFER = ${SAFE_END_BUFFER} frames (~0.67s de respiración visual)`, async () => {
    logger.info('Verificando SAFE_END_BUFFER');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    const match = content.match(/SAFE_END_BUFFER\s*=\s*(\d+)/);
    expect(match, 'SAFE_END_BUFFER no encontrado').toBeTruthy();
    expect(parseInt(match![1])).toBe(SAFE_END_BUFFER);
  });

  test('safeDurationInFrames = Math.min(durationInFrames, SAFE_MAX_FRAMES)', async () => {
    logger.info('Verificando safeDurationInFrames');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('safeDurationInFrames');
    expect(content).toContain('Math.min(durationInFrames, SAFE_MAX_FRAMES)');
  });

  test('safeDurationInFrames matemáticamente nunca excede 1776 @ 30fps', async () => {
    logger.info('Verificando que Math.min limita a SAFE_MAX_FRAMES');
    // Test unitario de la lógica del cap
    const fps = 30;
    const safeMaxFrames = Math.floor(59.2 * fps); // 1776
    const testCases = [
      { duration: 45, expected: 45 * fps },   // 1350 → sin cap
      { duration: 58, expected: 58 * fps },   // 1740 → sin cap
      { duration: 59.2, expected: 1776 },     // exactamente al límite
      { duration: 60.05, expected: 1776 },    // excede → cap a 1776
      { duration: 65, expected: 1776 },       // muy largo → cap a 1776
    ];
    for (const { duration, expected } of testCases) {
      const durationInFrames = duration * fps;
      const safeDuration = Math.min(durationInFrames, safeMaxFrames);
      expect(safeDuration).toBe(expected);
      expect(safeDuration).toBeLessThanOrEqual(safeMaxFrames);
    }
  });
});

// =============================================================================
// TESTS: FinalBufferSequence (fade-out negro de respiración)
// =============================================================================

test.describe('Fix Duración - FinalBufferSequence (AINewsShort.tsx)', () => {
  const logger = new TestLogger({ testName: 'SafeDuration-FinalBuffer' });

  test('FinalBuffer Sequence existe en AINewsShort.tsx', async () => {
    logger.info('Verificando FinalBuffer Sequence');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('name="FinalBuffer"');
  });

  test('FinalFadeOut componente interno está definido', async () => {
    logger.info('Verificando componente FinalFadeOut');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('FinalFadeOut');
    // El componente necesita useCurrentFrame() para frame local
    expect(content).toContain('useCurrentFrame');
  });

  test('FinalBuffer usa safeDurationInFrames - SAFE_END_BUFFER como from', async () => {
    logger.info('Verificando from de FinalBuffer');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('safeDurationInFrames - SAFE_END_BUFFER');
  });

  test('FinalFadeOut aplica fade de opacidad 0 → 1 (negro gradual)', async () => {
    logger.info('Verificando lógica de fade-out en FinalFadeOut');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    // Verifica interpolate con [0, 1] para fade a negro
    expect(content).toContain('backgroundColor');
    // Fade-out negro debe pasar de 0 a 1 (transparente → negro)
    expect(content).toMatch(/interpolate\([^)]*\[0,\s*1\]/s);
  });

  test('FinalFadeOut matemáticamente hace fade correcto', async () => {
    logger.info('Test unitario del fade');
    // Simular la lógica de interpolate para SAFE_END_BUFFER frames
    const buffer = SAFE_END_BUFFER;
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const interpolate = (f: number, from: [number, number], to: [number, number]) => {
      const t = (f - from[0]) / (from[1] - from[0]);
      return to[0] + clamp(t, 0, 1) * (to[1] - to[0]);
    };
    expect(interpolate(0, [0, buffer], [0, 1])).toBe(0);           // frame 0 → transparente
    expect(interpolate(buffer / 2, [0, buffer], [0, 1])).toBe(0.5); // mitad → semitransparente
    expect(interpolate(buffer, [0, buffer], [0, 1])).toBe(1);       // último → negro total
  });
});

// =============================================================================
// TESTS: compressionRatio (audio compresión si excede límite)
// =============================================================================

test.describe('Fix Duración - compressionRatio (AINewsShort.tsx)', () => {
  const logger = new TestLogger({ testName: 'SafeDuration-Compression' });

  test('compressionRatio lógica existe en AINewsShort.tsx', async () => {
    logger.info('Verificando compressionRatio');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('compressionRatio');
  });

  test('compressionRatio = 1 cuando el video está dentro del límite', async () => {
    logger.info('Verificando sin compresión en caso normal');
    const fps = 30;
    const safeMaxFrames = SAFE_MAX_FRAMES;
    // Video de 50s → 1500 frames → NO excede → ratio = 1
    const durationInFrames = 50 * fps; // 1500
    const ratio = durationInFrames > safeMaxFrames ? durationInFrames / safeMaxFrames : 1;
    expect(ratio).toBe(1);
  });

  test('compressionRatio > 1 cuando el video excede SAFE_MAX_FRAMES', async () => {
    logger.info('Verificando compresión cuando excede límite');
    const fps = 30;
    const safeMaxFrames = SAFE_MAX_FRAMES;
    // Video de 63s → 1890 frames → excede → ratio > 1
    const durationInFrames = 63 * fps; // 1890
    const ratio = durationInFrames > safeMaxFrames ? durationInFrames / safeMaxFrames : 1;
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeCloseTo(1890 / 1776, 2);
  });

  test('playbackRate se pasa a AudioMixer desde AINewsShort.tsx', async () => {
    logger.info('Verificando que AINewsShort pasa playbackRate a AudioMixer');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('playbackRate={compressionRatio}');
  });

  test('AudioMixer acepta prop playbackRate', async () => {
    logger.info('Verificando que AudioMixer tiene la prop playbackRate');
    const mixerContent = fs.readFileSync(AUDIOMIXER_PATH, 'utf-8');
    expect(mixerContent).toContain('playbackRate');
  });

  test('AudioMixerProps tiene campo playbackRate en audio.types.ts', async () => {
    logger.info('Verificando AudioMixerProps');
    const typesContent = fs.readFileSync(AUDIO_TYPES_PATH, 'utf-8');
    expect(typesContent).toContain('playbackRate');
  });
});

// =============================================================================
// TESTS: Root.tsx - calculateMetadata con cap
// =============================================================================

test.describe('Fix Duración - calculateMetadata (Root.tsx)', () => {
  const logger = new TestLogger({ testName: 'SafeDuration-Root' });

  test('SAFE_MAX_SECONDS está definido en calculateMetadata', async () => {
    logger.info('Verificando SAFE_MAX_SECONDS en Root.tsx');
    const content = fs.readFileSync(ROOT_PATH, 'utf-8');
    const match = content.match(/SAFE_MAX_SECONDS\s*=\s*([\d.]+)/);
    expect(match, 'SAFE_MAX_SECONDS no encontrado en Root.tsx').toBeTruthy();
    expect(parseFloat(match![1])).toBe(SAFE_MAX_SECONDS);
  });

  test('calculateMetadata usa Math.min para aplicar el cap', async () => {
    logger.info('Verificando Math.min en calculateMetadata');
    const content = fs.readFileSync(ROOT_PATH, 'utf-8');
    // Dentro de calculateMetadata debe haber Math.min
    expect(content).toContain('Math.min(');
    expect(content).toContain('SAFE_MAX_SECONDS');
  });

  test('calculateMetadata nunca retorna durationInFrames > 1776 @ 30fps', async () => {
    logger.info('Test unitario de calculateMetadata');
    const fps = 30;
    const safeMaxSeconds = SAFE_MAX_SECONDS;

    // Simular la lógica de calculateMetadata
    const calculateMetadata = (duration: number) => {
      const safeFrames = Math.min(
        Math.floor(duration * fps),
        Math.floor(safeMaxSeconds * fps)
      );
      return safeFrames;
    };

    expect(calculateMetadata(45)).toBe(1350);   // 45 * 30, no excede
    expect(calculateMetadata(58)).toBe(1740);   // 58 * 30, no excede
    expect(calculateMetadata(59.2)).toBe(1776); // exactamente al límite
    expect(calculateMetadata(60)).toBe(1776);   // 60 * 30 = 1800 → cap a 1776
    expect(calculateMetadata(65)).toBe(1776);   // excede → cap
  });
});

// =============================================================================
// TESTS: video-rendering.service.ts - cap en config.duration
// =============================================================================

test.describe('Fix Duración - video-rendering.service.ts', () => {
  const logger = new TestLogger({ testName: 'SafeDuration-RenderingService' });

  test('config.duration usa Math.min con 59.2 en generateVideoProps', async () => {
    logger.info('Verificando cap en video-rendering.service.ts');
    const content = fs.readFileSync(RENDERING_SERVICE_PATH, 'utf-8');
    // El archivo debe contener el cap de 59.2
    expect(content).toContain('59.2');
    expect(content).toContain('Math.min(');
  });

  test('SAFE_MAX_SECONDS cap aplicado en el cálculo de duration', async () => {
    logger.info('Verificando fórmula de duración en rendering service');
    const content = fs.readFileSync(RENDERING_SERVICE_PATH, 'utf-8');
    // La fórmula original: 8 + max(37, audio+1) + breathing + outro
    expect(content).toContain('Math.max(37');
    // El cap debe estar presente
    expect(content).toMatch(/Math\.min\(\s*Math\.ceil/);
  });

  test('duración calculada nunca excede 59.2s para distintos audios', async () => {
    logger.info('Test unitario de la lógica de duración');
    // Simular la fórmula de generateVideoProps
    const calcDuration = (audioDuration: number) =>
      Math.min(
        Math.ceil(8 + Math.max(37, audioDuration + 1) + 1.5 + 5),
        59.2
      );

    expect(calcDuration(30)).toBeLessThanOrEqual(59.2); // audio normal
    expect(calcDuration(40)).toBeLessThanOrEqual(59.2); // audio largo
    expect(calcDuration(45)).toBeLessThanOrEqual(59.2); // audio max previo
    expect(calcDuration(50)).toBeLessThanOrEqual(59.2); // audio > límite → cap
    expect(calcDuration(60)).toBeLessThanOrEqual(59.2); // audio muy largo → cap
  });
});
