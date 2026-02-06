/**
 * @fileoverview Tests para Prompt 28 - Imágenes Editoriales + Crossfade Real
 *
 * Valida:
 * - imageAnimation: width 920, height 520, borderRadius 24
 * - ContentScene: imagen grande con dimensiones de imageAnimation
 * - ContentScene: crossfade real con imagen previa (previousUrl)
 * - ContentScene: usa imageAnimation.crossfadeFrames (no hardcoded /20)
 * - scene-segmenter: acepta newsTitle para queries relevantes
 * - scene-segmenter: empresa incluida en queries de conceptos visuales
 * - Regresión: dimensiones, crossfade, import, ProgressBar sin cambio
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 28
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');

const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const SEGMENTER_PATH = path.join(AUTOMATION_SRC, 'services/scene-segmenter.service.ts');
const ORCHESTRATOR_PATH = path.join(AUTOMATION_SRC, 'orchestrator.ts');

// =============================================================================
// TESTS: imageAnimation CONFIG
// =============================================================================

test.describe('Prompt 28 - imageAnimation Config', () => {
  const logger = new TestLogger({ testName: 'Prompt28-Config' });

  test('imageAnimation.width = 920', async () => {
    await logger.info('Verificando width');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const block = content.match(/export const imageAnimation\s*=\s*\{[\s\S]*?\};/);
    expect(block).toBeTruthy();
    const match = block![0].match(/width:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(920);

    await logger.info('width = 920');
  });

  test('imageAnimation.height = 520', async () => {
    await logger.info('Verificando height');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const block = content.match(/export const imageAnimation\s*=\s*\{[\s\S]*?\};/);
    expect(block).toBeTruthy();
    const match = block![0].match(/height:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(520);

    await logger.info('height = 520');
  });

  test('imageAnimation.borderRadius = 24', async () => {
    await logger.info('Verificando borderRadius');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const block = content.match(/export const imageAnimation\s*=\s*\{[\s\S]*?\};/);
    expect(block).toBeTruthy();
    const match = block![0].match(/borderRadius:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(24);

    await logger.info('borderRadius = 24');
  });

  test('imageAnimation mantiene fadeInFrames, fadeOutFrames, crossfadeFrames', async () => {
    await logger.info('Verificando props originales');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const block = content.match(/export const imageAnimation\s*=\s*\{[\s\S]*?\};/);
    expect(block).toBeTruthy();
    expect(block![0]).toContain('fadeInFrames');
    expect(block![0]).toContain('fadeOutFrames');
    expect(block![0]).toContain('crossfadeFrames');

    await logger.info('Props originales presentes');
  });
});

// =============================================================================
// TESTS: ContentScene IMÁGENES GRANDES
// =============================================================================

test.describe('Prompt 28 - ContentScene Imágenes Editoriales', () => {
  const logger = new TestLogger({ testName: 'Prompt28-ContentScene' });

  test('ContentScene usa imageAnimation.width para SafeImage', async () => {
    await logger.info('Verificando dimensiones de SafeImage');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe usar imageAnimation.width, no hardcoded 600
    expect(content).toContain('imageAnimation.width');
    expect(content).not.toMatch(/width:\s*600/);

    await logger.info('imageAnimation.width usado');
  });

  test('ContentScene usa imageAnimation.height para SafeImage', async () => {
    await logger.info('Verificando height');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('imageAnimation.height');
    expect(content).not.toMatch(/height:\s*400/);

    await logger.info('imageAnimation.height usado');
  });

  test('ContentScene usa imageAnimation.borderRadius', async () => {
    await logger.info('Verificando borderRadius');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('imageAnimation.borderRadius');
    // No debe tener borderRadius: 16 hardcodeado
    expect(content).not.toMatch(/borderRadius:\s*16[^0-9]/);

    await logger.info('imageAnimation.borderRadius usado');
  });

  test('ContentScene tiene @updated Prompt 28', async () => {
    await logger.info('Verificando documentacion');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain('@updated Prompt 28');

    await logger.info('Documentacion actualizada');
  });
});

// =============================================================================
// TESTS: CROSSFADE REAL
// =============================================================================

test.describe('Prompt 28 - Crossfade Real', () => {
  const logger = new TestLogger({ testName: 'Prompt28-Crossfade' });

  test('getImageWithTransition retorna previousUrl', async () => {
    await logger.info('Verificando previousUrl en return');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('previousUrl');

    await logger.info('previousUrl presente');
  });

  test('ContentScene renderiza imagen previa con fade-out', async () => {
    await logger.info('Verificando render de imagen previa');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe tener lógica para mostrar previousImage con (1 - transitionProgress)
    expect(content).toContain('previousImage');
    expect(content).toContain('1 - transitionProgress');

    await logger.info('Imagen previa con fade-out');
  });

  test('ContentScene usa imageAnimation.crossfadeFrames (no hardcoded /20)', async () => {
    await logger.info('Verificando uso de crossfadeFrames');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('imageAnimation.crossfadeFrames');
    // No debe tener el patrón hardcoded / 20
    expect(content).not.toMatch(/segmentFrame\s*\/\s*20/);

    await logger.info('crossfadeFrames de config usado');
  });

  test('Crossfade muestra AMBAS imágenes durante transición', async () => {
    await logger.info('Verificando crossfade dual');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    // Debe haber dos bloques de SafeImage en la zona de imagen
    // Uno para previousImage y otro para contextImage (actual)
    const safeImageMatches = content.match(/<SafeImage/g);
    expect(safeImageMatches).toBeTruthy();
    // Al menos 2 SafeImage (previa + actual)
    expect(safeImageMatches!.length).toBeGreaterThanOrEqual(2);

    await logger.info('Ambas imágenes renderizadas');
  });
});

// =============================================================================
// TESTS: SCENE SEGMENTER - QUERIES RELEVANTES
// =============================================================================

test.describe('Prompt 28 - Scene Segmenter Queries', () => {
  const logger = new TestLogger({ testName: 'Prompt28-Segmenter' });

  test('segmentScript acepta newsTitle como parámetro', async () => {
    await logger.info('Verificando newsTitle param');

    const content = fs.readFileSync(SEGMENTER_PATH, 'utf-8');

    expect(content).toMatch(/segmentScript\([^)]*newsTitle\?:\s*string/s);

    await logger.info('newsTitle aceptado');
  });

  test('generateSearchQuery acepta newsTitle', async () => {
    await logger.info('Verificando generateSearchQuery con newsTitle');

    const content = fs.readFileSync(SEGMENTER_PATH, 'utf-8');

    expect(content).toMatch(/generateSearchQuery\([^)]*newsTitle\?:\s*string/s);

    await logger.info('generateSearchQuery acepta newsTitle');
  });

  test('Conceptos visuales incluyen empresa para relevancia', async () => {
    await logger.info('Verificando empresa en conceptos visuales');

    const content = fs.readFileSync(SEGMENTER_PATH, 'utf-8');

    // Después de extraer un concepto visual, debe agregar company
    expect(content).toMatch(/company\s*\?\s*`\$\{company\}\s+\$\{concept\}`/);

    await logger.info('Empresa agregada a conceptos visuales');
  });

  test('Keywords del título se extraen para queries', async () => {
    await logger.info('Verificando extracción de keywords del título');

    const content = fs.readFileSync(SEGMENTER_PATH, 'utf-8');

    // Debe usar extractKeywords con newsTitle
    expect(content).toMatch(/extractKeywords\(newsTitle/);

    await logger.info('Keywords del título extraídas');
  });

  test('scene-segmenter tiene @updated Prompt 28', async () => {
    await logger.info('Verificando documentacion');

    const content = fs.readFileSync(SEGMENTER_PATH, 'utf-8');
    expect(content).toContain('Prompt 28');

    await logger.info('Documentacion actualizada');
  });
});

// =============================================================================
// TESTS: ORCHESTRATOR INTEGRACIÓN
// =============================================================================

test.describe('Prompt 28 - Orchestrator Integration', () => {
  const logger = new TestLogger({ testName: 'Prompt28-Orchestrator' });

  test('orchestrator pasa news.title a segmentScript', async () => {
    await logger.info('Verificando paso de título');

    const content = fs.readFileSync(ORCHESTRATOR_PATH, 'utf-8');

    expect(content).toContain('news.title');
    // Debe estar en la llamada a segmentScript
    expect(content).toMatch(/segmentScript\([^)]*news\.title/s);

    await logger.info('news.title pasado a segmentScript');
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 28 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt28-Regression' });

  test('ContentScene sigue importando imageAnimation de themes', async () => {
    await logger.info('Verificando import');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toMatch(/import\s*{[^}]*imageAnimation[^}]*}\s*from/);

    await logger.info('Import correcto');
  });

  test('ContentScene sigue teniendo ProgressBar', async () => {
    await logger.info('Verificando ProgressBar');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('<ProgressBar');

    await logger.info('ProgressBar presente');
  });

  test('ContentScene sigue teniendo parallax y zoom', async () => {
    await logger.info('Verificando parallax/zoom');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('parallaxY');
    expect(content).toContain('imageScale');

    await logger.info('Parallax y zoom presentes');
  });

  test('imageAnimation mantiene crossfadeFrames = 20', async () => {
    await logger.info('Verificando crossfadeFrames');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    const block = content.match(/export const imageAnimation\s*=\s*\{[\s\S]*?\};/);
    expect(block).toBeTruthy();
    const match = block![0].match(/crossfadeFrames:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(20);

    await logger.info('crossfadeFrames = 20 sin cambio');
  });

  test('Segmento 0 sigue usando __LOGO__ para logos', async () => {
    await logger.info('Verificando __LOGO__');

    const content = fs.readFileSync(SEGMENTER_PATH, 'utf-8');

    expect(content).toContain('__LOGO__');
    expect(content).toMatch(/segmentIndex === 0 && company/);

    await logger.info('__LOGO__ sin cambio');
  });

  test('MAX_IMAGE_SEGMENTS sigue siendo 3', async () => {
    await logger.info('Verificando MAX_IMAGE_SEGMENTS');

    const content = fs.readFileSync(SEGMENTER_PATH, 'utf-8');

    expect(content).toMatch(/MAX_IMAGE_SEGMENTS\s*=\s*3/);

    await logger.info('MAX_IMAGE_SEGMENTS = 3');
  });

  test('editorialShadow.imageElevation sigue aplicada', async () => {
    await logger.info('Verificando sombra editorial');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');

    expect(content).toContain('editorialShadow.imageElevation');

    await logger.info('Sombra editorial presente');
  });
});
