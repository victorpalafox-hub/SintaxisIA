/**
 * @fileoverview Tests para Prompt 47 - Fix Silencio Inicial (Hook Visual + Auditivo Frame 0)
 *
 * Valida que:
 * - Audio music bed arranca desde frame 0 con fade-in de máximo 5 frames
 * - musicBed.heroVolume >= 0.30 (suficiente presencia como hook)
 * - musicBed.heroFadeInFrames <= 5 (arranque inmediato)
 * - heroImpact.microZoomStart >= 1.05 (zoom más evidente)
 * - heroImpact.energyRampStart = 0 (swell desde frame 0)
 * - heroImpact.musicSwellPeak >= 0.35 (swell más enérgico)
 * - breathingMotion existe con amplitude y frequency
 * - HeroScene.tsx contiene titleTranslateY (entrada energética)
 * - HeroScene.tsx contiene breathingScale (movimiento permanente)
 * - HeroScene.tsx usa titleCardFadeStart para titleDelayedIn (Prompt 51: crossfade con TitleCard)
 * - AINewsShort.tsx contiene heroFadeInFrames en BackgroundMusic
 *
 * @since Prompt 47 - Fix silencio inicial
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles', 'themes.ts');
const HERO_PATH = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');

// =============================================================================
// TESTS: CONSTANTES EN themes.ts
// =============================================================================

test.describe('Prompt 47 - Constantes en themes.ts', () => {
  const logger = new TestLogger({ testName: 'InitialHook-Themes' });

  test('breathingMotion existe con amplitude y frequency', async () => {
    logger.info('Verificando breathingMotion en themes.ts');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toContain('breathingMotion');
    expect(content).toContain('amplitude');
    expect(content).toContain('frequency');
  });

  test('breathingMotion.amplitude = 0.005 (±0.5% imperceptible pero vivo)', async () => {
    logger.info('Verificando amplitude');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = content.match(/amplitude\s*:\s*([\d.]+)/);
    expect(match, 'amplitude no encontrado en breathingMotion').toBeTruthy();
    const value = parseFloat(match![1]);
    expect(value).toBeCloseTo(0.005, 3);
  });

  test('breathingMotion.frequency = 40 (~1.3s por ciclo @ 30fps)', async () => {
    logger.info('Verificando frequency');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = content.match(/frequency\s*:\s*(\d+)/);
    expect(match, 'frequency no encontrado en breathingMotion').toBeTruthy();
    expect(parseInt(match![1])).toBe(40);
  });

  test('musicBed.heroFadeInFrames <= 5 (arranque inmediato)', async () => {
    logger.info('Verificando heroFadeInFrames');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = content.match(/heroFadeInFrames\s*:\s*(\d+)/);
    expect(match, 'heroFadeInFrames no encontrado en musicBed').toBeTruthy();
    expect(parseInt(match![1])).toBeLessThanOrEqual(5);
  });

  test('musicBed.heroVolume >= 0.30 (suficiente presencia como hook)', async () => {
    logger.info('Verificando heroVolume');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = content.match(/heroVolume\s*:\s*([\d.]+)/);
    expect(match, 'heroVolume no encontrado en musicBed').toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.30);
  });

  test('heroImpact.microZoomStart >= 1.05 (zoom más evidente)', async () => {
    logger.info('Verificando microZoomStart');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = content.match(/microZoomStart\s*:\s*([\d.]+)/);
    expect(match, 'microZoomStart no encontrado en heroImpact').toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(1.05);
  });

  test('heroImpact.energyRampStart = 0 (swell desde frame 0)', async () => {
    logger.info('Verificando energyRampStart');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = content.match(/energyRampStart\s*:\s*(\d+)/);
    expect(match, 'energyRampStart no encontrado').toBeTruthy();
    expect(parseInt(match![1])).toBe(0);
  });

  test('heroImpact.musicSwellPeak >= 0.35 (swell más enérgico)', async () => {
    logger.info('Verificando musicSwellPeak');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const match = content.match(/musicSwellPeak\s*:\s*([\d.]+)/);
    expect(match, 'musicSwellPeak no encontrado').toBeTruthy();
    expect(parseFloat(match![1])).toBeGreaterThanOrEqual(0.35);
  });
});

// =============================================================================
// TESTS: HeroScene.tsx — Visual hook
// =============================================================================

test.describe('Prompt 47 - HeroScene.tsx visual hook', () => {
  const logger = new TestLogger({ testName: 'InitialHook-HeroScene' });

  test('HeroScene importa breathingMotion de themes', async () => {
    logger.info('Verificando import de breathingMotion');
    const content = fs.readFileSync(HERO_PATH, 'utf-8');
    expect(content).toContain('breathingMotion');
  });

  test('HeroScene contiene breathingScale con Math.sin', async () => {
    logger.info('Verificando breathingScale');
    const content = fs.readFileSync(HERO_PATH, 'utf-8');
    expect(content).toContain('breathingScale');
    expect(content).toContain('Math.sin');
  });

  test('breathingScale se aplica al transform del contenedor principal', async () => {
    logger.info('Verificando que breathingScale está en el transform');
    const content = fs.readFileSync(HERO_PATH, 'utf-8');
    // El transform usa template literal: scale(${...breathingScale...})
    expect(content).toMatch(/transform.*scale.*breathingScale/s);
  });

  test('HeroScene contiene titleTranslateY para slide energético', async () => {
    logger.info('Verificando titleTranslateY');
    const content = fs.readFileSync(HERO_PATH, 'utf-8');
    expect(content).toContain('titleTranslateY');
  });

  test('titleDelayedIn usa titleCardFadeStart (Prompt 51: crossfade con TitleCard)', async () => {
    logger.info('Verificando frames de titleDelayedIn');
    const content = fs.readFileSync(HERO_PATH, 'utf-8');
    // Prompt 51: Debe usar titleCardFadeStart para sincronizar con TitleCard fade-out
    expect(content).toContain('[titleCardFadeStart, titleCardFadeStart + 20]');
  });

  test('titleTranslateY aplica slide -20px → 0', async () => {
    logger.info('Verificando slide de titleTranslateY');
    const content = fs.readFileSync(HERO_PATH, 'utf-8');
    expect(content).toContain('[-20, 0]');
  });

  test('transform del título suma titleTranslateY al titleY', async () => {
    logger.info('Verificando transform del título');
    const content = fs.readFileSync(HERO_PATH, 'utf-8');
    expect(content).toMatch(/translateY\([^)]*titleY[^)]*titleTranslateY/);
  });
});

// =============================================================================
// TESTS: AINewsShort.tsx — Music bed fade-in
// =============================================================================

test.describe('Prompt 47 - AINewsShort.tsx music bed', () => {
  const logger = new TestLogger({ testName: 'InitialHook-AINewsShort' });

  test('BackgroundMusic sigue comenzando en from={0}', async () => {
    logger.info('Verificando que BackgroundMusic no se movió de frame 0');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    // La Sequence de BackgroundMusic debe tener from={0}
    expect(content).toContain('from={0}');
    expect(content).toContain('BackgroundMusic');
  });

  test('BackgroundMusic usa heroFadeInFrames para fade-in', async () => {
    logger.info('Verificando heroFadeInFrames en BackgroundMusic');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('heroFadeInFrames');
  });

  test('BackgroundMusic aplica fadeIn multiplicado por energySwell', async () => {
    logger.info('Verificando fadeIn * energySwell');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('fadeIn');
    expect(content).toContain('energySwell');
    expect(content).toMatch(/fadeIn\s*\*\s*energySwell/);
  });

  test('Narration sigue en from={contentStart} (no se movió)', async () => {
    logger.info('Verificando que Narration no fue movida (sync intacto)');
    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('from={contentStart}');
    expect(content).toContain('name="Narration"');
  });
});

// =============================================================================
// TESTS: VALIDACIONES MATEMÁTICAS UNITARIAS
// =============================================================================

test.describe('Prompt 47 - Validaciones matemáticas', () => {
  const logger = new TestLogger({ testName: 'InitialHook-Math' });

  const interpolate = (
    value: number,
    inputRange: [number, number],
    outputRange: [number, number]
  ): number => {
    const t = Math.max(0, Math.min(1, (value - inputRange[0]) / (inputRange[1] - inputRange[0])));
    return outputRange[0] + t * (outputRange[1] - outputRange[0]);
  };

  test('breathingScale en frame 0 = 1.000 (arranque sin distorsión)', async () => {
    logger.info('Verificando breathing en frame 0');
    const amplitude = 0.005;
    const frequency = 40;
    const scale = 1 + Math.sin(0 / frequency) * amplitude;
    expect(scale).toBe(1.0); // sin(0) = 0
  });

  test('breathingScale nunca excede 1.005 ni baja de 0.995', async () => {
    logger.info('Verificando rango de breathingScale');
    const amplitude = 0.005;
    const frequency = 40;
    for (let f = 0; f < 300; f++) {
      const scale = 1 + Math.sin(f / frequency) * amplitude;
      expect(scale).toBeLessThanOrEqual(1.005 + 0.0001);
      expect(scale).toBeGreaterThanOrEqual(0.995 - 0.0001);
    }
  });

  // Prompt 51: titleDelayedIn ahora usa [75, 95] (titleCardFadeStart = 90-15 = 75)
  test('titleDelayedIn en frame 75 = 0 (inicio de entrada, sync con TitleCard fade-out)', async () => {
    logger.info('Verificando titleDelayedIn frame 75');
    const opacity = interpolate(75, [75, 95], [0, 1]);
    expect(opacity).toBe(0);
  });

  test('titleDelayedIn en frame 95 = 1 (entrada completa)', async () => {
    logger.info('Verificando titleDelayedIn frame 95');
    const opacity = interpolate(95, [75, 95], [0, 1]);
    expect(opacity).toBe(1);
  });

  test('titleDelayedIn en frame 85 = 0.5 (mitad del crossfade)', async () => {
    logger.info('Verificando titleDelayedIn frame 85');
    const opacity = interpolate(85, [75, 95], [0, 1]);
    expect(opacity).toBeCloseTo(0.5, 2);
  });

  test('titleTranslateY en frame 75 = -20px (inicio del slide)', async () => {
    logger.info('Verificando titleTranslateY frame 75');
    const y = interpolate(75, [75, 95], [-20, 0]);
    expect(y).toBe(-20);
  });

  test('titleTranslateY en frame 95 = 0 (posición final)', async () => {
    logger.info('Verificando titleTranslateY frame 95');
    const y = interpolate(95, [75, 95], [-20, 0]);
    expect(y).toBe(0);
  });

  test('fade-in music bed en frame 0 = 0 (sin pop de audio)', async () => {
    logger.info('Verificando fadeIn frame 0');
    const heroFadeInFrames = 5;
    const fadeIn = interpolate(0, [0, heroFadeInFrames], [0, 1]);
    expect(fadeIn).toBe(0);
  });

  test('fade-in music bed en frame 5 = 1 (fade completado)', async () => {
    logger.info('Verificando fadeIn frame 5');
    const heroFadeInFrames = 5;
    const fadeIn = interpolate(5, [0, heroFadeInFrames], [0, 1]);
    expect(fadeIn).toBe(1);
  });

  test('energySwell en frame 0 = heroVolume (swell desde el inicio)', async () => {
    logger.info('Verificando energySwell frame 0 con energyRampStart=0');
    const heroVolume = 0.35;
    const musicSwellPeak = 0.40;
    const energyRampStart = 0;
    const energyRampPeak = 30;
    const energyRampEnd = 60;
    // Frame 0 = inicio del ramp → valor = heroVolume (punto inicial)
    const energySwell = interpolate(0, [energyRampStart, energyRampPeak], [heroVolume, musicSwellPeak]);
    expect(energySwell).toBeCloseTo(heroVolume, 3);
  });

  test('energySwell en frame 30 = musicSwellPeak (peak en 1 segundo)', async () => {
    logger.info('Verificando energySwell frame 30 = peak');
    const heroVolume = 0.35;
    const musicSwellPeak = 0.40;
    const swell = interpolate(30, [0, 30], [heroVolume, musicSwellPeak]);
    expect(swell).toBeCloseTo(musicSwellPeak, 3);
  });
});
