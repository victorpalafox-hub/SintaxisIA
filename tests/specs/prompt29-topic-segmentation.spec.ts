/**
 * @fileoverview Tests para Prompt 29 - Segmentación topic-aware de imágenes
 *
 * Valida:
 * - TRANSITION_MARKERS: marcadores de transición en español con pesos
 * - findMarkerPositions(): detección de marcadores en texto
 * - quantizeBoundary(): redondeo a segundos limpios
 * - findTopicBoundaries(): algoritmo principal de segmentación
 * - Integración con segmentScript(): topic-aware con fallback
 * - Regresión: firma, SceneSegment, __LOGO__, MAX_IMAGE_SEGMENTS
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 29
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const SERVICES_PATH = path.join(AUTOMATION_SRC, 'services');
const SCENE_SEGMENTER_PATH = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');

// =============================================================================
// TESTS: ESTRUCTURA Y CONSTANTES
// =============================================================================

test.describe('Prompt 29 - Estructura y Constantes', () => {
  const logger = new TestLogger({ testName: 'Prompt29-Estructura' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
  });

  test('TRANSITION_MARKERS está definido como array', async () => {
    logger.info('Verificando TRANSITION_MARKERS');

    expect(content).toContain('const TRANSITION_MARKERS: Array<{ pattern: RegExp; weight: number }>');
  });

  test('Marcadores fuertes tienen weight 1.0', async () => {
    logger.info('Verificando marcadores fuertes');

    expect(content).toContain('por otro lado');
    expect(content).toContain('sin embargo');
    expect(content).toContain('no obstante');
    expect(content).toMatch(/por otro lado.*weight:\s*1\.0/s);
  });

  test('Marcadores medios tienen weight 0.7', async () => {
    logger.info('Verificando marcadores medios');

    expect(content).toContain('lo interesante');
    expect(content).toContain('mientras tanto');
    expect(content).toMatch(/lo interesante.*weight:\s*0\.7/s);
  });

  test('Marcadores de conclusión tienen weight 0.8', async () => {
    logger.info('Verificando marcadores de conclusión');

    expect(content).toContain('finalmente');
    expect(content).toContain('en conclusión');
    expect(content).toMatch(/finalmente.*weight:\s*0\.8/s);
  });

  test('Marcadores débiles tienen weight 0.6', async () => {
    logger.info('Verificando marcadores débiles');

    expect(content).toContain('creo que');
    expect(content).toContain('me parece');
    expect(content).toMatch(/creo que.*weight:\s*0\.6/s);
  });

  test('MARKER_PROXIMITY_TOLERANCE = 0.15', async () => {
    logger.info('Verificando MARKER_PROXIMITY_TOLERANCE');

    expect(content).toMatch(/MARKER_PROXIMITY_TOLERANCE\s*=\s*0\.15/);
  });

  test('MIN_SEGMENT_DURATION_S = 8', async () => {
    logger.info('Verificando MIN_SEGMENT_DURATION_S');

    expect(content).toMatch(/MIN_SEGMENT_DURATION_S\s*=\s*8/);
  });

  test('MIN_CUT_SCORE = 0.3', async () => {
    logger.info('Verificando MIN_CUT_SCORE');

    expect(content).toMatch(/MIN_CUT_SCORE\s*=\s*0\.3/);
  });

  test('BOUNDARY_QUANTIZE_STEP = 1.0', async () => {
    logger.info('Verificando BOUNDARY_QUANTIZE_STEP');

    expect(content).toMatch(/BOUNDARY_QUANTIZE_STEP\s*=\s*1\.0/);
  });
});

// =============================================================================
// TESTS: MÉTODOS PRIVADOS
// =============================================================================

test.describe('Prompt 29 - Métodos Privados', () => {
  const logger = new TestLogger({ testName: 'Prompt29-Metodos' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
  });

  test('findMarkerPositions() existe con firma correcta', async () => {
    logger.info('Verificando findMarkerPositions');

    expect(content).toContain('private findMarkerPositions(fullText: string)');
    expect(content).toContain('charIndex: number; weight: number; phrase: string');
  });

  test('findMarkerPositions() ordena por charIndex', async () => {
    logger.info('Verificando ordenamiento');

    expect(content).toContain('markers.sort((a, b) => a.charIndex - b.charIndex)');
  });

  test('quantizeBoundary() existe con firma correcta', async () => {
    logger.info('Verificando quantizeBoundary');

    expect(content).toContain('private quantizeBoundary(seconds: number, min: number, max: number): number');
  });

  test('quantizeBoundary() usa BOUNDARY_QUANTIZE_STEP y clamp', async () => {
    logger.info('Verificando cuantización y clamp');

    expect(content).toContain('BOUNDARY_QUANTIZE_STEP');
    expect(content).toContain('Math.max(min, Math.min(max, quantized))');
  });

  test('findTopicBoundaries() existe con firma correcta', async () => {
    logger.info('Verificando findTopicBoundaries');

    expect(content).toContain('private findTopicBoundaries(script: GeneratedScript, totalDuration: number): [number, number] | null');
  });
});

// =============================================================================
// TESTS: ALGORITMO TOPIC-AWARE
// =============================================================================

test.describe('Prompt 29 - Algoritmo Topic-Aware', () => {
  const logger = new TestLogger({ testName: 'Prompt29-Algoritmo' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
  });

  test('Concatena hook + body + opinion + cta', async () => {
    logger.info('Verificando concatenación del script');

    expect(content).toContain('script.hook');
    expect(content).toContain('script.body');
    expect(content).toContain('script.opinion');
    expect(content).toContain('script.cta');
    // Debe concatenarlos para buscar marcadores
    expect(content).toMatch(/\[script\.hook.*script\.body.*script\.opinion.*script\.cta\].*join/s);
  });

  test('Define targets a 33% y 66% de totalDuration', async () => {
    logger.info('Verificando targets');

    expect(content).toContain('totalDuration / 3');
    expect(content).toContain('(2 * totalDuration) / 3');
  });

  test('Convierte charIndex a tiempo con interpolación lineal', async () => {
    logger.info('Verificando conversión charIndex → tiempo');

    expect(content).toContain('marker.charIndex / fullText.length');
    expect(content).toContain('* totalDuration');
  });

  test('Score = weight * (1 - distancia/tolerancia)', async () => {
    logger.info('Verificando fórmula de scoring');

    expect(content).toContain('marker.weight * (1 - dist');
    expect(content).toContain('/ tolerance');
  });

  test('Requiere ambos cortes (target1 y target2)', async () => {
    logger.info('Verificando validación de cortes');

    expect(content).toContain('!bestForTarget1 || !bestForTarget2');
    expect(content).toContain('return null');
  });

  test('Valida MIN_SEGMENT_DURATION_S en los 3 segmentos', async () => {
    logger.info('Verificando validación de duración mínima');

    expect(content).toContain('seg1 < MIN_SEGMENT_DURATION_S');
    expect(content).toContain('seg2 < MIN_SEGMENT_DURATION_S');
    expect(content).toContain('seg3 < MIN_SEGMENT_DURATION_S');
  });

  test('Retorna null si no hay marcadores', async () => {
    logger.info('Verificando fallback sin marcadores');

    expect(content).toContain('markers.length === 0');
    expect(content).toContain('No se encontraron marcadores de transición');
  });
});

// =============================================================================
// TESTS: INTEGRACIÓN CON segmentScript
// =============================================================================

test.describe('Prompt 29 - Integración segmentScript', () => {
  const logger = new TestLogger({ testName: 'Prompt29-Integracion' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
  });

  test('segmentScript llama findTopicBoundaries para 3 segmentos', async () => {
    logger.info('Verificando llamada a findTopicBoundaries');

    expect(content).toContain('this.findTopicBoundaries(script, totalDuration)');
    expect(content).toContain('numSegments === 3');
  });

  test('Topic-aware boundaries se usan cuando hay cortes válidos', async () => {
    logger.info('Verificando uso de boundaries topic-aware');

    expect(content).toContain('boundaries = [0, topicCuts[0], topicCuts[1]]');
    expect(content).toContain('Topic-aware boundaries');
  });

  test('Fallback a división uniforme cuando no hay cortes', async () => {
    logger.info('Verificando fallback uniforme');

    expect(content).toContain('Fallback: división uniforme');
    expect(content).toMatch(/boundaries = \[0, Math\.round\(d\), Math\.round\(2 \* d\)\]/);
  });

  test('Videos cortos (2 segmentos) usan división uniforme', async () => {
    logger.info('Verificando videos cortos');

    expect(content).toContain('División uniforme');
    expect(content).toContain('Array.from({ length: numSegments }');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 29 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt29-Regresion' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
  });

  test('Firma de segmentScript sin cambio de parámetros', async () => {
    logger.info('Verificando firma de segmentScript');

    expect(content).toMatch(/segmentScript\(\s*script:\s*GeneratedScript/);
    expect(content).toContain('totalDuration: number');
    expect(content).toContain('company?: string');
    expect(content).toContain('newsTitle?: string');
  });

  test('SceneSegment interface sin cambio (usa tipos existentes)', async () => {
    logger.info('Verificando SceneSegment');

    const typesPath = path.join(AUTOMATION_SRC, 'types', 'image.types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf-8');

    expect(typesContent).toContain('searchQuery: string');
    expect(typesContent).toContain('startSecond');
    expect(typesContent).toContain('endSecond');
  });

  test('__LOGO__ para segmento 0 sin cambio', async () => {
    logger.info('Verificando __LOGO__');

    expect(content).toContain('__LOGO__:${company}');
    expect(content).toContain('segmentIndex === 0 && company');
  });

  test('MAX_IMAGE_SEGMENTS sigue siendo 3', async () => {
    logger.info('Verificando MAX_IMAGE_SEGMENTS');

    expect(content).toMatch(/MAX_IMAGE_SEGMENTS\s*=\s*3/);
  });

  test('extractVisualConcepts sigue funcional', async () => {
    logger.info('Verificando extractVisualConcepts');

    expect(content).toContain('private extractVisualConcepts(text: string): string[]');
    expect(content).toContain('VISUAL_PATTERNS');
  });

  test('Prompt 29 documentado en header', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@updated Prompt 29');
    expect(content).toContain('topic-aware');
  });
});

// =============================================================================
// TESTS: DOCUMENTACIÓN
// =============================================================================

test.describe('Prompt 29 - Documentación', () => {
  const logger = new TestLogger({ testName: 'Prompt29-Docs' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
  });

  test('findMarkerPositions tiene JSDoc', async () => {
    logger.info('Verificando JSDoc findMarkerPositions');

    expect(content).toContain('@since Prompt 29');
    expect(content).toContain('marcadores de transición');
  });

  test('quantizeBoundary tiene JSDoc', async () => {
    logger.info('Verificando JSDoc quantizeBoundary');

    expect(content).toContain('segundos limpios');
    expect(content).toContain('Clamp entre min y max');
  });

  test('findTopicBoundaries tiene JSDoc', async () => {
    logger.info('Verificando JSDoc findTopicBoundaries');

    expect(content).toContain('Algoritmo principal de segmentación topic-aware');
    expect(content).toContain('@returns Tupla [cut1, cut2]');
  });

  test('TRANSITION_MARKERS tiene JSDoc', async () => {
    logger.info('Verificando JSDoc TRANSITION_MARKERS');

    expect(content).toContain('Marcadores de transición en español');
    expect(content).toContain('peso (weight)');
  });
});
