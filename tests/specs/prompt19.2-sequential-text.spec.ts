/**
 * @fileoverview Tests para Prompt 19.2 - Texto Secuencial en Escenas
 *
 * Valida la funcionalidad de:
 * - text-splitter.ts: división de texto en frases legibles
 * - phrase-timing.ts: cálculo de timing y transiciones
 * - ContentScene: integración de texto secuencial
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.2
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONSTANTES DE RUTAS
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const UTILS_PATH = path.join(REMOTION_SRC, 'utils');
const COMPONENTS_PATH = path.join(REMOTION_SRC, 'components/scenes');
const STYLES_PATH = path.join(REMOTION_SRC, 'styles');

// =============================================================================
// MOCKS Y FIXTURES
// =============================================================================

/**
 * Texto de prueba típico de una descripción de noticia
 */
const MOCK_DESCRIPTION = 'Google DeepMind presenta Project Genie 2, una IA revolucionaria. ' +
  'Esta tecnología permite crear mundos de videojuegos completos a partir de una sola imagen. ' +
  'Los desarrolladores podrán generar entornos 3D interactivos sin necesidad de programar. ' +
  'Estará disponible para el público en 2026.';

/**
 * Texto corto (no debería dividirse mucho)
 */
const SHORT_DESCRIPTION = 'Google presenta una nueva IA.';

/**
 * Texto muy largo sin puntuación
 */
const NO_PUNCTUATION = 'Esta es una oración muy larga que no tiene puntos ni comas ' +
  'y debería ser dividida de alguna manera inteligente para que el usuario pueda leerla ' +
  'sin problemas en el video de YouTube Shorts que estamos generando';

// =============================================================================
// TESTS: ARCHIVOS Y ESTRUCTURA
// =============================================================================

test.describe('Prompt 19.2 - Archivos y Estructura', () => {

  test('text-splitter.ts existe', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const exists = fs.existsSync(filePath);
    expect(exists).toBe(true);
  });

  test('phrase-timing.ts existe', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const exists = fs.existsSync(filePath);
    expect(exists).toBe(true);
  });

  test('utils/index.ts exporta utilidades', async () => {
    const filePath = path.join(UTILS_PATH, 'index.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('splitIntoReadablePhrases');
    expect(content).toContain('getPhraseTiming');
    expect(content).toContain('Phrase');
    expect(content).toContain('PhraseTiming');
  });

  test('ContentScene.tsx importa utilidades de texto', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain("splitIntoReadablePhrases, getPhraseTiming");
    expect(content).toContain('textAnimation');
  });

  test('themes.ts contiene configuración textAnimation', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('textAnimation');
    expect(content).toContain('fadeInFrames');
    expect(content).toContain('fadeOutFrames');
    expect(content).toContain('maxCharsPerPhrase');
    expect(content).toContain('minWordsPerPhrase');
  });

});

// =============================================================================
// TESTS: TEXT SPLITTER
// =============================================================================

test.describe('Prompt 19.2 - Text Splitter', () => {

  test('exporta función splitIntoReadablePhrases', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export function splitIntoReadablePhrases');
  });

  test('exporta interfaces SplitOptions y Phrase', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export interface SplitOptions');
    expect(content).toContain('export interface Phrase');
  });

  test('SplitOptions tiene maxCharsPerPhrase y minWordsPerPhrase', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('maxCharsPerPhrase');
    expect(content).toContain('minWordsPerPhrase');
  });

  test('Phrase tiene text, index, charCount, wordCount', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/text:\s*string/);
    expect(content).toMatch(/index:\s*number/);
    expect(content).toMatch(/charCount:\s*number/);
    expect(content).toMatch(/wordCount:\s*number/);
  });

  test('tiene lógica para dividir por oraciones', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('splitBySentences');
    expect(content).toMatch(/[.!?]/);
  });

  test('tiene lógica para dividir por comas', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('splitByCommas');
  });

  test('tiene conectores en español', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('SPANISH_CONNECTORS');
    expect(content).toContain('pero');
    expect(content).toContain('aunque');
    expect(content).toContain('porque');
  });

  test('tiene función para combinar frases cortas', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('combineS');  // combineSHortPhrases
  });

  test('tiene función countWords', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('countWords');
  });

});

// =============================================================================
// TESTS: PHRASE TIMING
// =============================================================================

test.describe('Prompt 19.2 - Phrase Timing', () => {

  test('exporta función getPhraseTiming', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export function getPhraseTiming');
  });

  test('exporta interfaces PhraseTiming y TimingConfig', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export interface PhraseTiming');
    expect(content).toContain('export interface TimingConfig');
  });

  test('PhraseTiming tiene currentPhraseIndex y opacity', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/currentPhraseIndex:\s*number/);
    expect(content).toMatch(/opacity:\s*number/);
    expect(content).toMatch(/isTransitioning:\s*boolean/);
  });

  test('TimingConfig tiene fadeInFrames y fadeOutFrames', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('fadeInFrames');
    expect(content).toContain('fadeOutFrames');
  });

  test('usa interpolate de Remotion', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain("import { interpolate } from 'remotion'");
    expect(content).toContain('interpolate(');
  });

  test('calcula framesPerPhrase', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('framesPerPhrase');
  });

  test('tiene defaults de 15 frames para fades', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/DEFAULT_FADE_IN_FRAMES\s*=\s*15/);
    expect(content).toMatch(/DEFAULT_FADE_OUT_FRAMES\s*=\s*15/);
  });

  test('maneja phraseCount <= 0', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('phraseCount <= 0');
  });

  test('exporta función de debug opcional', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('getPhraseTimingDebug');
  });

});

// =============================================================================
// TESTS: CONTENT SCENE INTEGRATION
// =============================================================================

test.describe('Prompt 19.2 - ContentScene Integration', () => {

  test('ContentScene usa useMemo para phrases', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('useMemo');
    expect(content).toContain('splitIntoReadablePhrases');
  });

  test('ContentScene llama getPhraseTiming', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('getPhraseTiming');
    expect(content).toContain('phraseTiming');
  });

  test('ContentScene muestra currentBlock (Prompt 33: editorial blocks)', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('currentBlock');
    expect(content).toMatch(/currentBlock\?.lines/);
  });

  test('ContentScene tiene sceneDurationFrames', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('sceneDurationFrames');
    expect(content).toMatch(/37\s*\*\s*fps/);
  });

  test('ContentScene usa textAnimation config', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('textAnimation.maxCharsPerPhrase');
    expect(content).toContain('textAnimation.minWordsPerPhrase');
    expect(content).toContain('textAnimation.fadeInFrames');
    expect(content).toContain('textAnimation.fadeOutFrames');
  });

  test('ContentScene combina opacity de escena y frase', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('baseOpacity');
    expect(content).toContain('currentOpacity');
    expect(content).toMatch(/baseOpacity\s*\*\s*currentOpacity/);
  });

  // Prompt 42: Fallback `|| description` eliminado — fuente única de texto
  test('ContentScene NO tiene fallback a description cruda (Prompt 42)', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Prompt 42: Solo bloques editoriales renderizan texto, sin fallback crudo
    expect(content).not.toMatch(/\)\)\s*\|\|\s*description/);
    expect(content).toContain('currentBlock?.lines.map');
  });

});

// =============================================================================
// TESTS: THEMES CONFIGURATION
// =============================================================================

test.describe('Prompt 19.2 - Themes Configuration', () => {

  test('textAnimation.fadeInFrames = 15', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/fadeInFrames:\s*15/);
  });

  test('textAnimation.fadeOutFrames = 15', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/fadeOutFrames:\s*15/);
  });

  test('textAnimation.maxCharsPerPhrase = 48 (actualizado Prompt 44)', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Actualizado de 60 a 48 en Prompt 44 para ritmo editorial
    expect(content).toMatch(/maxCharsPerPhrase:\s*48/);
  });

  test('textAnimation.minWordsPerPhrase = 3', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/minWordsPerPhrase:\s*3/);
  });

  test('textAnimation está exportado', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export const textAnimation');
  });

});

// =============================================================================
// TESTS: ANTI-PATTERNS
// =============================================================================

test.describe('Prompt 19.2 - Anti-Patterns Evitados', () => {

  test('NO usa hook custom innecesario', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // No debe haber un "useSequentialText" hook
    expect(content).not.toContain('useSequentialText');
  });

  test('NO modifica HeroScene', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'HeroScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // HeroScene no debe importar text-splitter
    expect(content).not.toContain('splitIntoReadablePhrases');
    expect(content).not.toContain('getPhraseTiming');
  });

  test('NO modifica OutroScene', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'OutroScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // OutroScene no debe importar text-splitter
    expect(content).not.toContain('splitIntoReadablePhrases');
    expect(content).not.toContain('getPhraseTiming');
  });

  test('Bullet points eliminados en Prompt 19.2.6 (actualizado)', async () => {
    const filePath = path.join(COMPONENTS_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Nota: Bullet points fueron eliminados en Prompt 19.2.6
    // Este test verifica que la eliminación no afectó el texto secuencial
    expect(content).not.toContain('details.map');
    expect(content).not.toContain('bulletOpacity');

    // Pero el texto secuencial sigue funcionando (Prompt 33: currentBlock)
    expect(content).toContain('currentBlock');
  });

});

// =============================================================================
// TESTS: TYPESCRIPT TYPES
// =============================================================================

test.describe('Prompt 19.2 - TypeScript Types', () => {

  test('text-splitter tiene JSDoc completo', async () => {
    const filePath = path.join(UTILS_PATH, 'text-splitter.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('@fileoverview');
    expect(content).toContain('@param');
    expect(content).toContain('@returns');
    expect(content).toContain('@example');
  });

  test('phrase-timing tiene JSDoc completo', async () => {
    const filePath = path.join(UTILS_PATH, 'phrase-timing.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('@fileoverview');
    expect(content).toContain('@param');
    expect(content).toContain('@returns');
    expect(content).toContain('@example');
  });

});
