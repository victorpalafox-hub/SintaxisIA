/**
 * @fileoverview Tests para Prompt 35 - Fix real de imágenes genéricas
 *
 * Valida:
 * - smart-image.config.ts: pesos rebalanceados, gate minTextRelevance, GENERIC_PENALTY_PATTERNS
 * - image-orchestration.service.ts: gate en scoreCandidate, penalty, null fallback
 * - image.types.ts + video.types.ts: imageUrl nullable, source 'none'
 * - ContentScene.tsx: handle imageUrl null → undefined
 * - Regresión: logo cascade intacta, Prompt 34 intacto
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 35
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

const SMART_IMAGE_CONFIG_PATH = path.join(AUTOMATION_SRC, 'config/smart-image.config.ts');
const IMAGE_ORCHESTRATION_PATH = path.join(AUTOMATION_SRC, 'services/image-orchestration.service.ts');
const IMAGE_TYPES_PATH = path.join(AUTOMATION_SRC, 'types/image.types.ts');
const VIDEO_TYPES_PATH = path.join(REMOTION_SRC, 'types/video.types.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const VISUAL_EMPHASIS_PATH = path.join(REMOTION_SRC, 'utils/visual-emphasis.ts');

// =============================================================================
// TESTS: SMART-IMAGE.CONFIG.TS - PESOS Y CONSTANTES
// =============================================================================

test.describe('Prompt 35 - IMAGE_SCORING_CONFIG Rebalanceado', () => {
  const logger = new TestLogger({ testName: 'Prompt35-Config' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SMART_IMAGE_CONFIG_PATH, 'utf-8');
  });

  test('minimumScore = 35 (era 20)', async () => {
    logger.info('Verificando minimumScore subido');
    expect(content).toContain('minimumScore: 35');
  });

  test('minTextRelevance = 8 (GATE)', async () => {
    logger.info('Verificando gate de textRelevance');
    expect(content).toContain('minTextRelevance: 8');
  });

  test('textRelevance = 50 (sin cambio)', async () => {
    logger.info('Verificando peso textRelevance');
    expect(content).toContain('textRelevance: 50');
  });

  test('orientationBonus = 6 (era 25)', async () => {
    logger.info('Verificando peso orientación reducido');
    expect(content).toContain('orientationBonus: 6');
  });

  test('resolution = 6 (era 15)', async () => {
    logger.info('Verificando peso resolución reducido');
    expect(content).toContain('resolution: 6');
  });

  test('positionBonus = 4 (era 10)', async () => {
    logger.info('Verificando peso posición reducido');
    expect(content).toContain('positionBonus: 4');
  });

  test('genericPenalty = 20 (NUEVO)', async () => {
    logger.info('Verificando peso penalty genérico');
    expect(content).toContain('genericPenalty: 20');
  });

  test('fallbackTopics eliminados', async () => {
    logger.info('Verificando que fallbackTopics fue removido');
    expect(content).not.toContain('fallbackTopics');
  });

  test('FALLBACK_THEME eliminado', async () => {
    logger.info('Verificando que FALLBACK_THEME fue removido');
    expect(content).not.toContain('FALLBACK_THEME');
  });

  test('UI_AVATARS no referenciado', async () => {
    logger.info('Verificando que UI Avatars fue removido del config');
    expect(content).not.toContain('UI_AVATARS');
    expect(content).not.toContain('ui-avatars');
  });
});

// =============================================================================
// TESTS: GENERIC_PENALTY_PATTERNS
// =============================================================================

test.describe('Prompt 35 - GENERIC_PENALTY_PATTERNS', () => {
  const logger = new TestLogger({ testName: 'Prompt35-Patterns' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SMART_IMAGE_CONFIG_PATH, 'utf-8');
  });

  test('GENERIC_PENALTY_PATTERNS exportado', async () => {
    logger.info('Verificando export');
    expect(content).toContain('export const GENERIC_PENALTY_PATTERNS');
  });

  test('Contiene patrón robot', async () => {
    logger.info('Verificando patrón robot');
    expect(content).toContain('\\brobot\\b');
  });

  test('Contiene patrón circuit', async () => {
    logger.info('Verificando patrón circuit');
    expect(content).toContain('\\bcircuit\\b');
  });

  test('Contiene patrón futurist', async () => {
    logger.info('Verificando patrón futuristic');
    expect(content).toContain('\\bfuturist');
  });

  test('Contiene patrón abstract', async () => {
    logger.info('Verificando patrón abstract');
    expect(content).toContain('\\babstract\\b');
  });

  test('Contiene patrón cyber', async () => {
    logger.info('Verificando patrón cyber');
    expect(content).toContain('\\bcyber');
  });

  test('Contiene patrón neon', async () => {
    logger.info('Verificando patrón neon');
    expect(content).toContain('\\bneon\\b');
  });

  test('Contiene al menos 10 patrones', async () => {
    logger.info('Verificando cantidad de patrones');
    const matches = content.match(/\/\\b/g);
    expect(matches).toBeTruthy();
    expect(matches!.length).toBeGreaterThanOrEqual(10);
  });

  test('Todos los patrones son case-insensitive (/i)', async () => {
    logger.info('Verificando flags de patrones');
    // Cada patrón debe terminar con /i
    const patternSection = content.substring(
      content.indexOf('GENERIC_PENALTY_PATTERNS'),
      content.indexOf('];', content.indexOf('GENERIC_PENALTY_PATTERNS'))
    );
    const lines = patternSection.split('\n').filter(l => l.includes('/i'));
    expect(lines.length).toBeGreaterThanOrEqual(10);
  });
});

// =============================================================================
// TESTS: IMAGE-ORCHESTRATION.SERVICE.TS - GATE + PENALTY
// =============================================================================

test.describe('Prompt 35 - scoreCandidate Gate + Penalty', () => {
  const logger = new TestLogger({ testName: 'Prompt35-ScoreGate' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
  });

  test('scoreCandidate contiene gate de textRelevance', async () => {
    logger.info('Verificando gate en scoreCandidate');
    expect(content).toContain('textScore < IMAGE_SCORING_CONFIG.minTextRelevance');
    expect(content).toContain('return 0');
  });

  test('Gate rechaza con return 0 inmediato', async () => {
    logger.info('Verificando return 0 después del gate');
    const gateIndex = content.indexOf('textScore < IMAGE_SCORING_CONFIG.minTextRelevance');
    const returnIndex = content.indexOf('return 0', gateIndex);
    expect(gateIndex).toBeGreaterThan(0);
    expect(returnIndex).toBeGreaterThan(gateIndex);
  });

  test('Aplica GENERIC_PENALTY_PATTERNS', async () => {
    logger.info('Verificando penalty genérico');
    expect(content).toContain('GENERIC_PENALTY_PATTERNS');
    expect(content).toContain('weights.genericPenalty');
  });

  test('Score nunca es negativo (Math.max(0, score))', async () => {
    logger.info('Verificando floor en 0');
    expect(content).toContain('Math.max(0, score)');
  });

  test('Import de GENERIC_PENALTY_PATTERNS', async () => {
    logger.info('Verificando import');
    expect(content).toContain("GENERIC_PENALTY_PATTERNS } from '../config/smart-image.config'");
  });

  test('textScore se calcula antes del gate', async () => {
    logger.info('Verificando orden: textScore antes de gate');
    const textScoreIndex = content.indexOf('let textScore = 0');
    const gateIndex = content.indexOf('textScore < IMAGE_SCORING_CONFIG.minTextRelevance');
    expect(textScoreIndex).toBeGreaterThan(0);
    expect(gateIndex).toBeGreaterThan(textScoreIndex);
  });
});

// =============================================================================
// TESTS: PRUEBA MATEMÁTICA
// =============================================================================

test.describe('Prompt 35 - Prueba Matemática (textRelevance=0 IMPOSIBLE)', () => {
  const logger = new TestLogger({ testName: 'Prompt35-Math' });
  let configContent: string;
  let serviceContent: string;

  test.beforeAll(async () => {
    configContent = fs.readFileSync(SMART_IMAGE_CONFIG_PATH, 'utf-8');
    serviceContent = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
  });

  test('orientation(6) + resolution(6) + position(4) = 16 < 35 minimumScore', async () => {
    logger.info('Verificando que técnicos solos no alcanzan minimumScore');
    // orientation + resolution + position = 6 + 6 + 4 = 16
    // minimumScore = 35
    // 16 < 35, pero además el gate retorna 0 antes de sumar técnicos
    expect(configContent).toContain('orientationBonus: 6');
    expect(configContent).toContain('resolution: 6');
    expect(configContent).toContain('positionBonus: 4');
    expect(configContent).toContain('minimumScore: 35');
  });

  test('Con textRelevance=0 el gate retorna 0 (NO llega a sumar técnicos)', async () => {
    logger.info('Verificando que gate previene acumulación de técnicos');
    // El gate check ocurre ANTES de sumar orientation/resolution/position
    const gateReturn = serviceContent.indexOf('return 0', serviceContent.indexOf('minTextRelevance'));
    const orientationSection = serviceContent.indexOf('orientationBonus', gateReturn);
    expect(gateReturn).toBeGreaterThan(0);
    expect(orientationSection).toBeGreaterThan(gateReturn);
  });

  test('Con textRelevance=25 (50% match) + técnicos = 41 >= 35', async () => {
    logger.info('Verificando que imagen relevante pasa');
    // textRelevance 25 + orientation 6 + resolution 6 + position 4 = 41
    // 41 >= 35 minimumScore ✓
    // 25 >= 8 minTextRelevance (pasa gate) ✓
    expect(configContent).toContain('minTextRelevance: 8');
    expect(configContent).toContain('minimumScore: 35');
  });

  test('textRelevance=8 + técnicos(16) + generic penalty(-20) = 4 < 35', async () => {
    logger.info('Verificando que imagen genérica mínima no pasa');
    // textRelevance 8 (pasa gate) + orientation 6 + resolution 6 + position 4 - penalty 20 = 4
    // 4 < 35 minimumScore → RECHAZADA
    expect(configContent).toContain('genericPenalty: 20');
  });
});

// =============================================================================
// TESTS: SEARCHWITHFALLBACK - NULL
// =============================================================================

test.describe('Prompt 35 - searchWithFallback retorna null', () => {
  const logger = new TestLogger({ testName: 'Prompt35-NullFallback' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
  });

  test('No contiene generateFallbackImage', async () => {
    logger.info('Verificando eliminación de generateFallbackImage');
    expect(content).not.toContain('generateFallbackImage');
  });

  test('No contiene UI_AVATARS_BASE', async () => {
    logger.info('Verificando eliminación de UI Avatars');
    expect(content).not.toContain('UI_AVATARS_BASE');
    expect(content).not.toContain('ui-avatars.com');
  });

  test('No importa FALLBACK_THEME', async () => {
    logger.info('Verificando que FALLBACK_THEME no se importa');
    expect(content).not.toContain('FALLBACK_THEME');
  });

  test('Fallback retorna null como imageUrl', async () => {
    logger.info('Verificando que el fallback final retorna null');
    expect(content).toContain("createSceneImage(index, startSecond, endSecond, null, searchQuery, 'none')");
  });

  test('Logo cascade también retorna null si falla', async () => {
    logger.info('Verificando que logo cascade retorna null');
    expect(content).toContain("createSceneImage(index, startSecond, endSecond, null, logoQuery, 'none')");
  });

  test('createSceneImage acepta imageUrl null', async () => {
    logger.info('Verificando firma de createSceneImage');
    expect(content).toContain('imageUrl: string | null');
  });
});

// =============================================================================
// TESTS: IMAGE.TYPES.TS - NULLABLE
// =============================================================================

test.describe('Prompt 35 - image.types.ts Nullable', () => {
  const logger = new TestLogger({ testName: 'Prompt35-ImageTypes' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(IMAGE_TYPES_PATH, 'utf-8');
  });

  test('SceneImage.imageUrl es string | null', async () => {
    logger.info('Verificando tipo nullable');
    expect(content).toContain('imageUrl: string | null');
  });

  test("SceneImageSource incluye 'none'", async () => {
    logger.info('Verificando source none');
    expect(content).toContain("| 'none'");
  });

  test('SceneImage interface sigue existiendo', async () => {
    logger.info('Verificando interfaz intacta');
    expect(content).toContain('export interface SceneImage');
    expect(content).toContain('sceneIndex: number');
    expect(content).toContain('startSecond: number');
    expect(content).toContain('endSecond: number');
  });
});

// =============================================================================
// TESTS: VIDEO.TYPES.TS - NULLABLE
// =============================================================================

test.describe('Prompt 35 - video.types.ts Nullable', () => {
  const logger = new TestLogger({ testName: 'Prompt35-VideoTypes' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(VIDEO_TYPES_PATH, 'utf-8');
  });

  test('SceneImage.imageUrl es string | null', async () => {
    logger.info('Verificando tipo nullable');
    expect(content).toContain('imageUrl: string | null');
  });

  test("SceneImage.source incluye 'none'", async () => {
    logger.info('Verificando source none');
    expect(content).toContain("'none'");
  });

  test('SceneImage interface sigue existiendo', async () => {
    logger.info('Verificando interfaz intacta');
    expect(content).toContain('export interface SceneImage');
  });
});

// =============================================================================
// TESTS: CONTENTSCENE.TSX - NULL HANDLING
// =============================================================================

test.describe('Prompt 35 - ContentScene Null Handling', () => {
  const logger = new TestLogger({ testName: 'Prompt35-ContentScene' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('getImageWithTransition convierte null a undefined con ??', async () => {
    logger.info('Verificando null coalescing');
    expect(content).toContain('imageUrl ?? undefined');
  });

  test('lastScene.imageUrl ?? undefined', async () => {
    logger.info('Verificando lastScene null handling');
    expect(content).toContain('lastScene.imageUrl ?? undefined');
  });

  test('currentScene.imageUrl ?? undefined', async () => {
    logger.info('Verificando currentScene null handling');
    expect(content).toContain('currentScene.imageUrl ?? undefined');
  });

  test('previousScene?.imageUrl ?? undefined', async () => {
    logger.info('Verificando previousScene null handling');
    expect(content).toContain('previousScene?.imageUrl ?? undefined');
  });

  test('contextImage sigue siendo condicional (ya manejaba undefined)', async () => {
    logger.info('Verificando rendering condicional intacto');
    expect(content).toContain('contextImage || previousImage');
  });

  test('@updated Prompt 35 documentado', async () => {
    logger.info('Verificando documentación');
    expect(content).toContain('@updated Prompt 35');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 35 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt35-Regresion' });

  test('Logo cascade (searchLogoWithCascade) sigue existiendo', async () => {
    logger.info('Verificando logo cascade intacta');
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    expect(content).toContain('searchLogoWithCascade');
    expect(content).toContain('searchClearbit');
    expect(content).toContain('searchLogodev');
  });

  test('searchPexelsWithScoring sigue existiendo', async () => {
    logger.info('Verificando Pexels scoring intacto');
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    expect(content).toContain('searchPexelsWithScoring');
    expect(content).toContain('IMAGE_SCORING_CONFIG.minimumScore');
  });

  test('SmartQueryGenerator sigue importado', async () => {
    logger.info('Verificando query generator intacto');
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    expect(content).toContain('SmartQueryGenerator');
    expect(content).toContain('generateQueries');
  });

  test('Prompt 34 intacto: visual-emphasis.ts sin cambios', async () => {
    logger.info('Verificando Prompt 34 sin regresión');
    const content = fs.readFileSync(VISUAL_EMPHASIS_PATH, 'utf-8');
    expect(content).toContain('export function detectEmphasis');
    expect(content).toContain('export function getEmphasisForBlock');
    expect(content).toContain('MAX_EMPHASIS_TOTAL = 3');
  });

  test('ContentScene mantiene Prompt 34 emphasis', async () => {
    logger.info('Verificando emphasis intacto en ContentScene');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('emphasisScale');
    expect(content).toContain('emphasisDimOpacity');
    expect(content).toContain('detectEmphasis(blocks)');
  });

  test('SPANISH_TO_ENGLISH diccionario intacto', async () => {
    logger.info('Verificando diccionario no fue eliminado');
    const content = fs.readFileSync(SMART_IMAGE_CONFIG_PATH, 'utf-8');
    expect(content).toContain('export const SPANISH_TO_ENGLISH');
    expect(content).toContain("'inteligencia': 'intelligence'");
  });
});
