/**
 * @fileoverview Tests para Prompt 19.4 - Sincronizar Duración OutroScene
 *
 * Valida:
 * - AINewsShort.tsx: outroSceneDuration = 5 * fps, duration default = 50
 * - video.config.ts: VIDEO_SECTIONS.outro sincronizado
 * - OutroScene.tsx: Documentación actualizada
 * - video.types.ts: Comentarios de timing actualizados
 * - Regresión: Hero y Content sin cambios
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.4
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { getTestLogger } from '../utils';

// Rutas de archivos
const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const AI_NEWS_SHORT_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');
const VIDEO_TYPES_PATH = path.join(REMOTION_SRC, 'types/video.types.ts');
const VIDEO_CONFIG_PATH = path.join(AUTOMATION_SRC, 'config/video.config.ts');

// Logger para tests
const logger = getTestLogger();

// =============================================================================
// TESTS: AINewsShort.tsx CONFIGURACIÓN
// =============================================================================

test.describe('Prompt 19.4 - AINewsShort.tsx Configuración', () => {

  test('outroSceneDuration = 5 * fps', async () => {
    logger.logTestStart('outroSceneDuration = 5 * fps');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');
    expect(content).toMatch(/outroSceneDuration\s*=\s*5\s*\*\s*fps/);
    logger.logTestEnd('outroSceneDuration = 5 * fps', 'passed', 0);
  });

  test('duration default = 50', async () => {
    logger.logTestStart('duration default = 50');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');
    expect(content).toMatch(/duration\s*=\s*config\?\.duration\s*\?\?\s*50/);
    logger.logTestEnd('duration default = 50', 'passed', 0);
  });

  test('outroStart = heroSceneDuration + contentSceneDuration', async () => {
    logger.logTestStart('outroStart calculation');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');
    expect(content).toMatch(/outroStart\s*=\s*heroSceneDuration\s*\+\s*contentSceneDuration/);
    logger.logTestEnd('outroStart calculation', 'passed', 0);
  });

  test('heroSceneDuration = 8 * fps (sin cambio)', async () => {
    logger.logTestStart('heroSceneDuration = 8 * fps');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');
    expect(content).toMatch(/heroSceneDuration\s*=\s*8\s*\*\s*fps/);
    logger.logTestEnd('heroSceneDuration = 8 * fps', 'passed', 0);
  });

  test('contentSceneDuration = 37 * fps (sin cambio)', async () => {
    logger.logTestStart('contentSceneDuration = 37 * fps');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');
    expect(content).toMatch(/contentSceneDuration\s*=\s*37\s*\*\s*fps/);
    logger.logTestEnd('contentSceneDuration = 37 * fps', 'passed', 0);
  });

});

// =============================================================================
// TESTS: video.config.ts SINCRONIZADO
// =============================================================================

test.describe('Prompt 19.4 - video.config.ts Sincronizado', () => {

  test('VIDEO_SECTIONS.outro.durationSeconds = 5', async () => {
    logger.logTestStart('VIDEO_SECTIONS.outro.durationSeconds = 5');
    const content = fs.readFileSync(VIDEO_CONFIG_PATH, 'utf-8');
    // Buscar durationSeconds: 5 dentro del bloque outro
    const outroBlock = content.match(/outro:\s*\{[\s\S]*?durationSeconds:\s*(\d+)/);
    expect(outroBlock).toBeTruthy();
    expect(outroBlock![1]).toBe('5');
    logger.logTestEnd('VIDEO_SECTIONS.outro.durationSeconds = 5', 'passed', 0);
  });

  test('VIDEO_SECTIONS.outro.startFrame = 1350', async () => {
    logger.logTestStart('VIDEO_SECTIONS.outro.startFrame = 1350');
    const content = fs.readFileSync(VIDEO_CONFIG_PATH, 'utf-8');
    const outroBlock = content.match(/outro:\s*\{[\s\S]*?startFrame:\s*(\d+)/);
    expect(outroBlock).toBeTruthy();
    expect(outroBlock![1]).toBe('1350');
    logger.logTestEnd('VIDEO_SECTIONS.outro.startFrame = 1350', 'passed', 0);
  });

  test('VIDEO_SECTIONS.outro.endFrame = 1500', async () => {
    logger.logTestStart('VIDEO_SECTIONS.outro.endFrame = 1500');
    const content = fs.readFileSync(VIDEO_CONFIG_PATH, 'utf-8');
    const outroBlock = content.match(/outro:\s*\{[\s\S]*?endFrame:\s*(\d+)/);
    expect(outroBlock).toBeTruthy();
    expect(outroBlock![1]).toBe('1500');
    logger.logTestEnd('VIDEO_SECTIONS.outro.endFrame = 1500', 'passed', 0);
  });

  test('Comentario Prompt 19.4 presente en video.config.ts', async () => {
    logger.logTestStart('Comentario Prompt 19.4 en video.config.ts');
    const content = fs.readFileSync(VIDEO_CONFIG_PATH, 'utf-8');
    expect(content).toContain('Prompt 19.4');
    logger.logTestEnd('Comentario Prompt 19.4 en video.config.ts', 'passed', 0);
  });

});

// =============================================================================
// TESTS: DOCUMENTACIÓN ACTUALIZADA
// =============================================================================

test.describe('Prompt 19.4 - Documentación Actualizada', () => {

  test('OutroScene.tsx versión 2.1.0', async () => {
    logger.logTestStart('OutroScene.tsx versión 2.1.0');
    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
    expect(content).toContain('@version 2.1.0');
    logger.logTestEnd('OutroScene.tsx versión 2.1.0', 'passed', 0);
  });

  test('OutroScene.tsx @updated Prompt 19.4', async () => {
    logger.logTestStart('OutroScene.tsx @updated Prompt 19.4');
    const content = fs.readFileSync(OUTRO_SCENE_PATH, 'utf-8');
    expect(content).toContain('@updated Prompt 19.4');
    logger.logTestEnd('OutroScene.tsx @updated Prompt 19.4', 'passed', 0);
  });

  test('video.types.ts timing "45-50s"', async () => {
    logger.logTestStart('video.types.ts timing 45-50s');
    const content = fs.readFileSync(VIDEO_TYPES_PATH, 'utf-8');
    expect(content).toContain('45-50s');
    logger.logTestEnd('video.types.ts timing 45-50s', 'passed', 0);
  });

  test('AINewsShort.tsx comentario "45-50s"', async () => {
    logger.logTestStart('AINewsShort.tsx comentario 45-50s');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');
    expect(content).toContain('45-50s');
    logger.logTestEnd('AINewsShort.tsx comentario 45-50s', 'passed', 0);
  });

});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 19.4 - Regresión', () => {

  test('HeroScene 8s sin cambios', async () => {
    logger.logTestStart('HeroScene 8s sin cambios');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');
    // Verificar que Hero sigue siendo 8 segundos
    expect(content).toMatch(/heroSceneDuration\s*=\s*8\s*\*\s*fps/);
    // Verificar comentario de timing
    expect(content).toMatch(/Hero:\s*0-8s/);
    logger.logTestEnd('HeroScene 8s sin cambios', 'passed', 0);
  });

  test('ContentScene 37s sin cambios', async () => {
    logger.logTestStart('ContentScene 37s sin cambios');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');
    // Verificar que Content sigue siendo 37 segundos
    expect(content).toMatch(/contentSceneDuration\s*=\s*37\s*\*\s*fps/);
    // Verificar comentario de timing
    expect(content).toMatch(/Content:\s*8-45s/);
    logger.logTestEnd('ContentScene 37s sin cambios', 'passed', 0);
  });

  test('Total duration = 50s (8 + 37 + 5)', async () => {
    logger.logTestStart('Total duration = 50s');
    const content = fs.readFileSync(AI_NEWS_SHORT_PATH, 'utf-8');

    // Extraer valores de duración
    const heroMatch = content.match(/heroSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);
    const contentMatch = content.match(/contentSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);
    const outroMatch = content.match(/outroSceneDuration\s*=\s*(\d+)\s*\*\s*fps/);

    expect(heroMatch).toBeTruthy();
    expect(contentMatch).toBeTruthy();
    expect(outroMatch).toBeTruthy();

    const hero = parseInt(heroMatch![1]);
    const contentDur = parseInt(contentMatch![1]);
    const outro = parseInt(outroMatch![1]);
    const total = hero + contentDur + outro;

    expect(total).toBe(50);  // 8 + 37 + 5 = 50

    logger.logTestEnd('Total duration = 50s', 'passed', 0);
  });

});
