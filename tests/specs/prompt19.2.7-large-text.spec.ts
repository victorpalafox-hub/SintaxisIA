/**
 * @fileoverview Tests para Prompt 19.2.7 - Aumentar Tamaño de Texto
 *
 * Valida:
 * - Centralización de estilos en themes.ts (contentTextStyle)
 * - ContentScene usa valores de contentTextStyle
 * - text-splitter.ts tiene DEFAULT_MAX_CHARS = 60
 * - textAnimation.maxCharsPerPhrase = 60
 * - Regresión: texto secuencial sigue funcionando
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.2.7
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { getTestLogger } from '../utils';

// Rutas de archivos
const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const TEXT_SPLITTER_PATH = path.join(REMOTION_SRC, 'utils/text-splitter.ts');

// Logger para tests
const logger = getTestLogger();

// =============================================================================
// TESTS: CENTRALIZACIÓN EN THEMES.TS
// =============================================================================

test.describe('Prompt 19.2.7 - Centralización en themes.ts', () => {

  test('themes.ts exporta contentTextStyle', async () => {
    logger.logTestStart('themes.ts exporta contentTextStyle');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toContain('export const contentTextStyle');
    logger.logTestEnd('themes.ts exporta contentTextStyle', 'passed', 0);
  });

  test('contentTextStyle tiene fontSize = 72', async () => {
    logger.logTestStart('contentTextStyle tiene fontSize = 72');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    // Buscar fontSize: 72 dentro del bloque contentTextStyle
    const contentTextStyleMatch = content.match(/contentTextStyle\s*=\s*\{[\s\S]*?\n\};/);
    expect(contentTextStyleMatch).toBeTruthy();
    expect(contentTextStyleMatch![0]).toMatch(/fontSize:\s*72/);
    logger.logTestEnd('contentTextStyle tiene fontSize = 72', 'passed', 0);
  });

  test('contentTextStyle tiene fontWeight = 600', async () => {
    logger.logTestStart('contentTextStyle tiene fontWeight = 600');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const contentTextStyleMatch = content.match(/contentTextStyle\s*=\s*\{[\s\S]*?\n\};/);
    expect(contentTextStyleMatch).toBeTruthy();
    expect(contentTextStyleMatch![0]).toMatch(/fontWeight:\s*600/);
    logger.logTestEnd('contentTextStyle tiene fontWeight = 600', 'passed', 0);
  });

  test('contentTextStyle tiene lineHeight = 1.4', async () => {
    logger.logTestStart('contentTextStyle tiene lineHeight = 1.4');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const contentTextStyleMatch = content.match(/contentTextStyle\s*=\s*\{[\s\S]*?\n\};/);
    expect(contentTextStyleMatch).toBeTruthy();
    expect(contentTextStyleMatch![0]).toMatch(/lineHeight:\s*1\.4/);
    logger.logTestEnd('contentTextStyle tiene lineHeight = 1.4', 'passed', 0);
  });

  test('contentTextStyle tiene minHeight = 350', async () => {
    logger.logTestStart('contentTextStyle tiene minHeight = 350');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const contentTextStyleMatch = content.match(/contentTextStyle\s*=\s*\{[\s\S]*?\n\};/);
    expect(contentTextStyleMatch).toBeTruthy();
    expect(contentTextStyleMatch![0]).toMatch(/minHeight:\s*350/);
    logger.logTestEnd('contentTextStyle tiene minHeight = 350', 'passed', 0);
  });

  test('contentTextStyle tiene paddingHorizontal = 60', async () => {
    logger.logTestStart('contentTextStyle tiene paddingHorizontal = 60');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const contentTextStyleMatch = content.match(/contentTextStyle\s*=\s*\{[\s\S]*?\n\};/);
    expect(contentTextStyleMatch).toBeTruthy();
    expect(contentTextStyleMatch![0]).toMatch(/paddingHorizontal:\s*60/);
    logger.logTestEnd('contentTextStyle tiene paddingHorizontal = 60', 'passed', 0);
  });

  test('textAnimation.maxCharsPerPhrase = 48 (actualizado Prompt 44)', async () => {
    logger.logTestStart('textAnimation.maxCharsPerPhrase = 48');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const textAnimationMatch = content.match(/textAnimation\s*=\s*\{[\s\S]*?\n\};/);
    expect(textAnimationMatch).toBeTruthy();
    expect(textAnimationMatch![0]).toMatch(/maxCharsPerPhrase:\s*48/);
    logger.logTestEnd('textAnimation.maxCharsPerPhrase = 48', 'passed', 0);
  });

});

// =============================================================================
// TESTS: CONTENTSCENE USA VALORES CENTRALIZADOS
// =============================================================================

test.describe('Prompt 19.2.7 - ContentScene Centralización', () => {

  test('ContentScene importa contentTextStyle', async () => {
    logger.logTestStart('ContentScene importa contentTextStyle');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('contentTextStyle');
    expect(content).toMatch(/import\s*\{[^}]*contentTextStyle[^}]*\}\s*from/);
    logger.logTestEnd('ContentScene importa contentTextStyle', 'passed', 0);
  });

  test('ContentScene usa blockStyle.fontSize (Prompt 33: dynamic per weight)', async () => {
    logger.logTestStart('ContentScene usa blockStyle.fontSize');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('blockStyle.fontSize');
    logger.logTestEnd('ContentScene usa blockStyle.fontSize', 'passed', 0);
  });

  test('ContentScene usa blockStyle.fontWeight (Prompt 33: dynamic per weight)', async () => {
    logger.logTestStart('ContentScene usa blockStyle.fontWeight');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('blockStyle.fontWeight');
    logger.logTestEnd('ContentScene usa blockStyle.fontWeight', 'passed', 0);
  });

  test('ContentScene usa lineHeight inline (Prompt 33: 1.3)', async () => {
    logger.logTestStart('ContentScene usa lineHeight inline');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('lineHeight: 1.3');
    logger.logTestEnd('ContentScene usa lineHeight inline', 'passed', 0);
  });

  test('ContentScene usa contentTextStyle.minHeight', async () => {
    logger.logTestStart('ContentScene usa contentTextStyle.minHeight');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('contentTextStyle.minHeight');
    logger.logTestEnd('ContentScene usa contentTextStyle.minHeight', 'passed', 0);
  });

  test('ContentScene NO tiene fontSize hardcodeado en descripción', async () => {
    logger.logTestStart('ContentScene NO tiene fontSize hardcodeado en descripción');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    // Buscar el bloque de DESCRIPCION y verificar que no tiene fontSize: número
    const descriptionBlock = content.match(/DESCRIPCION[\s\S]*?{currentBlock/);
    expect(descriptionBlock).toBeTruthy();
    // No debe tener fontSize: 32 ni fontSize: 72 hardcodeado
    expect(descriptionBlock![0]).not.toMatch(/fontSize:\s*32/);
    expect(descriptionBlock![0]).not.toMatch(/fontSize:\s*72,/);
    // Debe usar blockStyle.fontSize (Prompt 33: dynamic per weight)
    expect(content).toContain('blockStyle.fontSize');
    logger.logTestEnd('ContentScene NO tiene fontSize hardcodeado en descripción', 'passed', 0);
  });

  test('ContentScene mantiene color cyan (identidad de marca)', async () => {
    logger.logTestStart('ContentScene mantiene color cyan');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    // El color es ahora dinámico por peso del bloque (Prompt 33: blockStyle.color)
    expect(content).toContain('blockStyle.color');
    logger.logTestEnd('ContentScene mantiene color cyan', 'passed', 0);
  });

});

// =============================================================================
// TESTS: TEXT-SPLITTER SINCRONIZADO
// =============================================================================

test.describe('Prompt 19.2.7 - text-splitter.ts Sincronizado', () => {

  test('DEFAULT_MAX_CHARS = 48 (Prompt 44)', async () => {
    logger.logTestStart('DEFAULT_MAX_CHARS = 48');
    const content = fs.readFileSync(TEXT_SPLITTER_PATH, 'utf-8');
    expect(content).toMatch(/DEFAULT_MAX_CHARS\s*=\s*48/);
    logger.logTestEnd('DEFAULT_MAX_CHARS = 48', 'passed', 0);
  });

  test('DEFAULT_MIN_WORDS = 3 (sin cambio)', async () => {
    logger.logTestStart('DEFAULT_MIN_WORDS = 3');
    const content = fs.readFileSync(TEXT_SPLITTER_PATH, 'utf-8');
    expect(content).toMatch(/DEFAULT_MIN_WORDS\s*=\s*3/);
    logger.logTestEnd('DEFAULT_MIN_WORDS = 3', 'passed', 0);
  });

  test('Comentario de actualización Prompt 19.2.7', async () => {
    logger.logTestStart('Comentario de actualización Prompt 19.2.7');
    const content = fs.readFileSync(TEXT_SPLITTER_PATH, 'utf-8');
    expect(content).toContain('Prompt 19.2.7');
    logger.logTestEnd('Comentario de actualización Prompt 19.2.7', 'passed', 0);
  });

});

// =============================================================================
// TESTS: REGRESIÓN - TEXTO SECUENCIAL
// =============================================================================

test.describe('Prompt 19.2.7 - Regresión Texto Secuencial', () => {

  test('Mantiene splitIntoReadablePhrases', async () => {
    logger.logTestStart('Mantiene splitIntoReadablePhrases');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('splitIntoReadablePhrases');
    logger.logTestEnd('Mantiene splitIntoReadablePhrases', 'passed', 0);
  });

  test('Mantiene getPhraseTiming', async () => {
    logger.logTestStart('Mantiene getPhraseTiming');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('getPhraseTiming');
    logger.logTestEnd('Mantiene getPhraseTiming', 'passed', 0);
  });

  test('Mantiene currentBlock (Prompt 33: editorial blocks)', async () => {
    logger.logTestStart('Mantiene currentBlock');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('currentBlock');
    logger.logTestEnd('Mantiene currentBlock', 'passed', 0);
  });

  test('Mantiene currentOpacity (Prompt 33: blockTiming fallback)', async () => {
    logger.logTestStart('Mantiene currentOpacity');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('currentOpacity');
    logger.logTestEnd('Mantiene currentOpacity', 'passed', 0);
  });

  // Prompt 42: Fallback `|| description` eliminado — fuente única de texto
  test('NO tiene fallback a description cruda (Prompt 42)', async () => {
    logger.logTestStart('NO tiene fallback a description');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    // Prompt 42: Solo bloques editoriales renderizan texto
    expect(content).not.toMatch(/\)\)\s*\|\|\s*description/);
    expect(content).toContain('currentBlock?.lines.map');
    logger.logTestEnd('NO tiene fallback a description', 'passed', 0);
  });

});

// =============================================================================
// TESTS: VERSIÓN Y DOCUMENTACIÓN
// =============================================================================

test.describe('Prompt 19.2.7 - Documentación', () => {

  test('ContentScene versión actualizada a 2.3.0', async () => {
    logger.logTestStart('ContentScene versión actualizada a 2.3.0');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('@version 2.3.0');
    logger.logTestEnd('ContentScene versión actualizada a 2.3.0', 'passed', 0);
  });

  test('ContentScene tiene @updated Prompt 19.2.7', async () => {
    logger.logTestStart('ContentScene tiene @updated Prompt 19.2.7');
    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('@updated Prompt 19.2.7');
    logger.logTestEnd('ContentScene tiene @updated Prompt 19.2.7', 'passed', 0);
  });

  test('themes.ts tiene comentario de Prompt 19.2.7', async () => {
    logger.logTestStart('themes.ts tiene comentario de Prompt 19.2.7');
    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toContain('Prompt 19.2.7');
    logger.logTestEnd('themes.ts tiene comentario de Prompt 19.2.7', 'passed', 0);
  });

});
