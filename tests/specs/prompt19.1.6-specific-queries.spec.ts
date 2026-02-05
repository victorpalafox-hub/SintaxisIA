/**
 * @fileoverview Tests para Prompt 19.1.6 - Eliminar Sufijos Genéricos en Queries
 *
 * Valida:
 * - scene-segmenter: NO tiene sufijos genéricos
 * - scene-segmenter: Genera señal __LOGO__ para segmento 0
 * - image-orchestration: Detecta __LOGO__ y usa Clearbit/Logo.dev
 * - image-orchestration: NO tiene sufijo ' technology' en query simplificada
 * - image.types: SceneImageSource incluye 'clearbit' y 'logodev'
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.1.6
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const SCENE_SEGMENTER_PATH = path.join(AUTOMATION_SRC, 'services/scene-segmenter.service.ts');
const IMAGE_ORCHESTRATION_PATH = path.join(AUTOMATION_SRC, 'services/image-orchestration.service.ts');
const IMAGE_TYPES_PATH = path.join(AUTOMATION_SRC, 'types/image.types.ts');

// =============================================================================
// GRUPO 1: Sufijos Eliminados en scene-segmenter (5 tests)
// =============================================================================

test.describe('Prompt 19.1.6 - Sufijos Eliminados en scene-segmenter', () => {

  test('NO contiene "technology innovation"', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    expect(content).not.toContain("'technology innovation'");
    expect(content).not.toContain('"technology innovation"');
  });

  test('NO contiene "digital concept"', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    expect(content).not.toContain("'digital concept'");
    expect(content).not.toContain('"digital concept"');
  });

  test('NO contiene "future tech"', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    expect(content).not.toContain("'future tech'");
    expect(content).not.toContain('"future tech"');
  });

  test('NO contiene "abstract technology"', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    expect(content).not.toContain("'abstract technology'");
    expect(content).not.toContain('"abstract technology"');
  });

  test('tiene comentario @updated Prompt 19.1.6', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    expect(content).toContain('@updated Prompt 19.1.6');
  });

});

// =============================================================================
// GRUPO 2: Segmento 0 con Señal __LOGO__ (3 tests)
// =============================================================================

test.describe('Prompt 19.1.6 - Señal __LOGO__ para Logos', () => {

  test('scene-segmenter genera señal __LOGO__ para segmento 0 con company', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    // Debe generar `__LOGO__:${company}` cuando segmentIndex === 0 && company
    expect(content).toContain('__LOGO__:');
    expect(content).toMatch(/if\s*\(\s*segmentIndex\s*===\s*0\s*&&\s*company\s*\)/);
  });

  test('image-orchestration detecta y procesa señal __LOGO__', async () => {
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    // Debe detectar searchQuery.startsWith('__LOGO__:')
    expect(content).toContain("startsWith('__LOGO__:");
    expect(content).toContain("replace('__LOGO__:");
  });

  test('image-orchestration tiene método searchLogoWithCascade', async () => {
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    // Debe tener el método privado searchLogoWithCascade
    expect(content).toContain('searchLogoWithCascade');
    expect(content).toMatch(/private\s+async\s+searchLogoWithCascade/);
  });

});

// =============================================================================
// GRUPO 3: image-orchestration Actualizado (4 tests)
// =============================================================================

test.describe('Prompt 19.1.6 - image-orchestration Actualizado', () => {

  test('NO tiene sufijo " technology" en query simplificada', async () => {
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    // Antes: keywords.slice(0, 2).join(' ') + ' technology'
    // Ahora: keywords.slice(0, 2).join(' ')  (sin sufijo)
    expect(content).not.toMatch(/keywords\.slice\(0,\s*2\)\.join\(['"]\s*['"]\)\s*\+\s*['"]\s*technology['"]/);
  });

  test('importa searchClearbit', async () => {
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    expect(content).toContain('searchClearbit');
    expect(content).toMatch(/import\s*\{[^}]*searchClearbit[^}]*\}\s*from/);
  });

  test('importa searchLogodev', async () => {
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    expect(content).toContain('searchLogodev');
    expect(content).toMatch(/import\s*\{[^}]*searchLogodev[^}]*\}\s*from/);
  });

  test('tiene versión 1.2.0', async () => {
    const content = fs.readFileSync(IMAGE_ORCHESTRATION_PATH, 'utf-8');
    expect(content).toContain('@version 1.2.0');
  });

});

// =============================================================================
// GRUPO 4: Types Actualizado (2 tests)
// =============================================================================

test.describe('Prompt 19.1.6 - Types Actualizado', () => {

  test('SceneImageSource incluye "clearbit"', async () => {
    const content = fs.readFileSync(IMAGE_TYPES_PATH, 'utf-8');
    // Debe tener 'clearbit' como opción de SceneImageSource
    expect(content).toMatch(/SceneImageSource[\s\S]*'clearbit'/);
  });

  test('SceneImageSource incluye "logodev"', async () => {
    const content = fs.readFileSync(IMAGE_TYPES_PATH, 'utf-8');
    // Debe tener 'logodev' como opción de SceneImageSource
    expect(content).toMatch(/SceneImageSource[\s\S]*'logodev'/);
  });

});

// =============================================================================
// GRUPO 5: Regresión (3 tests)
// =============================================================================

test.describe('Prompt 19.1.6 - Regresión', () => {

  test('extractKeywords existe sin cambios estructurales', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    // El método extractKeywords debe existir
    expect(content).toContain('extractKeywords');
    expect(content).toMatch(/private\s+extractKeywords\(/);
  });

  test('segmentScript existe sin cambios estructurales', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    // El método segmentScript debe existir
    expect(content).toContain('segmentScript');
    expect(content).toMatch(/segmentScript\s*\(/);
  });

  test('scene-segmenter tiene versión 1.2.0', async () => {
    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
    expect(content).toContain('@version 1.2.0');
  });

});
