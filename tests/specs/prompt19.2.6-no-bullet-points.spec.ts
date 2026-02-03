/**
 * @fileoverview Tests para Prompt 19.2.6 - Eliminar Bullet Points
 *
 * Valida la funcionalidad de:
 * - ContentScene NO renderiza bullet points
 * - Layout ajustado con minHeight aumentado
 * - video-rendering.service genera details vacío
 * - Texto secuencial (Prompt 19.2) sigue funcionando
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.2.6
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONSTANTES DE RUTAS
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const CONTENT_SCENE_PATH = path.join(
  REMOTION_SRC,
  'components/scenes/ContentScene.tsx'
);
const VIDEO_RENDERING_SERVICE_PATH = path.join(
  __dirname,
  '../../automation/src/services/video-rendering.service.ts'
);

// =============================================================================
// TESTS: CONTENTSCENE - BULLET POINTS ELIMINADOS
// =============================================================================

test.describe('Prompt 19.2.6 - ContentScene Sin Bullet Points', () => {

  test('ContentScene.tsx existe', async () => {
    const exists = fs.existsSync(CONTENT_SCENE_PATH);
    expect(exists).toBe(true);
  });

  test('NO contiene details.map (renderizado de bullet points)', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).not.toContain('details.map');
  });

  test('NO contiene bulletOpacity (animación de bullet points)', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).not.toContain('bulletOpacity');
  });

  test('NO contiene bloque activo de BULLET POINTS', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // El comentario explicativo puede existir, pero no el renderizado activo
    const hasActiveBulletBlock = content.match(
      /{\s*\/\*\s*BULLET POINTS[^*]*\*\/\s*}\s*{details/
    );
    expect(hasActiveBulletBlock).toBeNull();
  });

  test('Contiene comentario explicativo de eliminación', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('BULLET POINTS eliminados en Prompt 19.2.6');
  });

  test('Mantiene versión actualizada (2.2.0)', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('@version 2.2.0');
  });

});

// =============================================================================
// TESTS: TEXTO SECUENCIAL SIGUE FUNCIONANDO (REGRESIÓN)
// =============================================================================

test.describe('Prompt 19.2.6 - Texto Secuencial (Regresión)', () => {

  test('Mantiene currentPhrase', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('currentPhrase');
  });

  test('Mantiene splitIntoReadablePhrases', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('splitIntoReadablePhrases');
  });

  test('Mantiene getPhraseTiming', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('getPhraseTiming');
  });

  test('Mantiene import de textAnimation', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('textAnimation');
  });

  test('Mantiene renderizado de frase actual', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // El componente debe renderizar currentPhrase.text
    expect(content).toContain('currentPhrase?.text');
  });

});

// =============================================================================
// TESTS: LAYOUT AJUSTADO
// =============================================================================

test.describe('Prompt 19.2.6 - Layout Ajustado', () => {

  test('minHeight aumentado a 150 o más', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Buscar minHeight con valor >= 150
    const minHeightMatch = content.match(/minHeight:\s*(\d+)/);
    expect(minHeightMatch).not.toBeNull();

    const minHeightValue = parseInt(minHeightMatch![1]);
    expect(minHeightValue).toBeGreaterThanOrEqual(150);
  });

  test('marginBottom agregado para compensar espacio', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe tener marginBottom
    expect(content).toContain('marginBottom');
  });

  test('Comentario de Prompt 19.2.6 en minHeight', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('Aumentado a 150 en Prompt 19.2.6');
  });

});

// =============================================================================
// TESTS: VIDEO-RENDERING.SERVICE - DETAILS VACÍO
// =============================================================================

test.describe('Prompt 19.2.6 - VideoRenderingService', () => {

  test('video-rendering.service.ts existe', async () => {
    const exists = fs.existsSync(VIDEO_RENDERING_SERVICE_PATH);
    expect(exists).toBe(true);
  });

  test('NO extrae details del script (código muerto eliminado)', async () => {
    const content = fs.readFileSync(VIDEO_RENDERING_SERVICE_PATH, 'utf-8');

    // No debe tener el patrón de extracción activo
    const hasActiveExtraction = content.match(
      /const details = request\.script\s*\n\s*\.split/
    );
    expect(hasActiveExtraction).toBeNull();
  });

  test('Genera details como array vacío', async () => {
    const content = fs.readFileSync(VIDEO_RENDERING_SERVICE_PATH, 'utf-8');

    expect(content).toContain('details: []');
  });

  test('Contiene comentario de eliminación', async () => {
    const content = fs.readFileSync(VIDEO_RENDERING_SERVICE_PATH, 'utf-8');

    expect(content).toContain('Bullet points eliminados en Prompt 19.2.6');
  });

});

// =============================================================================
// TESTS: ANTI-PATTERNS EVITADOS
// =============================================================================

test.describe('Prompt 19.2.6 - Anti-Patterns Evitados', () => {

  test('NO combina details con description', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).not.toContain('details.join');
    expect(content).not.toContain('fullDescription');
  });

  test('NO usa interpolate para bulletOpacity', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // No debe haber animación de bullet points
    expect(content).not.toMatch(/interpolate\([^)]*\[50 \+ index/);
  });

  test('Mantiene prop details en interface (compatibilidad)', async () => {
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // El componente puede recibir details aunque no lo renderice
    expect(content).toContain('details');
  });

});
