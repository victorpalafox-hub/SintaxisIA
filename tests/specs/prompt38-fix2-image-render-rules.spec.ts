/**
 * @fileoverview Tests para Prompt 38-Fix2 - Regla dura de imagenes (render)
 *
 * Valida:
 * - ContentScene.tsx: No reutiliza imagen previa cuando actual es null
 * - SafeImage.tsx: Sin generatePlaceholder ni UI Avatars, retorna null en error
 * - Regresion: crossfade, SafeImage preload, Hero/Outro sin cambio
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 38-Fix2
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');

const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const SAFE_IMAGE_PATH = path.join(REMOTION_SRC, 'components/elements/SafeImage.tsx');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');

// =============================================================================
// TESTS: CONTENTSCENE — NO REUTILIZAR IMAGEN PREVIA
// =============================================================================

test.describe('Prompt 38-Fix2 - ContentScene No Reuse', () => {
  const logger = new TestLogger({ testName: 'Prompt38Fix2-ContentScene' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
  });

  test('Container de imagen NO usa || previousImage (no reutiliza previa)', async () => {
    logger.info('Verificando que no hay fallback a imagen previa');

    // No debe existir `(contextImage || previousImage) &&`
    expect(content).not.toMatch(/\(contextImage\s*\|\|\s*previousImage\)/);
  });

  test('Container solo renderiza cuando contextImage existe', async () => {
    logger.info('Verificando condicion de render');

    // Debe usar solo `{contextImage && (`
    expect(content).toContain('{contextImage && (');
  });

  test('Crossfade previa→actual sigue funcionando dentro del container', async () => {
    logger.info('Verificando crossfade interno');

    // previousImage sigue existiendo dentro del container para crossfade
    expect(content).toContain('previousImage && transitionProgress < 1');
  });

  test('transitionProgress se calcula con imageAnimation.crossfadeFrames', async () => {
    logger.info('Verificando crossfade frames');

    expect(content).toContain('imageAnimation.crossfadeFrames');
  });

  test('imageUrl null se convierte a undefined (Prompt 35)', async () => {
    logger.info('Verificando conversion null → undefined');

    expect(content).toContain('imageUrl ?? undefined');
  });

  test('Documentacion menciona Prompt 38-Fix2', async () => {
    logger.info('Verificando documentacion');

    expect(content).toContain('Prompt 38-Fix2');
  });
});

// =============================================================================
// TESTS: SAFEIMAGE — SIN PLACEHOLDER GENERICO
// =============================================================================

test.describe('Prompt 38-Fix2 - SafeImage Sin Placeholder', () => {
  const logger = new TestLogger({ testName: 'Prompt38Fix2-SafeImage' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');
  });

  test('No contiene funcion generatePlaceholder', async () => {
    logger.info('Verificando eliminacion de generatePlaceholder');

    expect(content).not.toContain('function generatePlaceholder');
  });

  test('No contiene URL de ui-avatars.com', async () => {
    logger.info('Verificando eliminacion de UI Avatars');

    expect(content).not.toContain('ui-avatars.com');
  });

  test('Tiene estado hasError para tracking de fallos', async () => {
    logger.info('Verificando estado hasError');

    expect(content).toContain('hasError');
    expect(content).toContain('setHasError');
  });

  test('Retorna null cuando hasError && !fallbackSrc', async () => {
    logger.info('Verificando return null en error');

    expect(content).toContain('hasError && !fallbackSrc');
    expect(content).toMatch(/if\s*\(hasError\s*&&\s*!fallbackSrc\)\s*\{[\s\S]*?return null/);
  });

  test('continueRender se llama incluso sin fallback (no bloquea Remotion)', async () => {
    logger.info('Verificando continueRender en onerror');

    // El bloque onerror sin fallback debe llamar continueRender
    expect(content).toContain('continueRender(handle)');
  });

  test('fallbackSrc sigue siendo optional prop', async () => {
    logger.info('Verificando prop fallbackSrc');

    expect(content).toContain('fallbackSrc?: string');
  });

  test('Sigue usando delayRender/continueRender de Remotion', async () => {
    logger.info('Verificando imports de Remotion');

    expect(content).toContain('delayRender');
    expect(content).toContain('continueRender');
    expect(content).toMatch(/import.*delayRender.*from\s*'remotion'/);
  });

  test('Documentacion menciona Prompt 38-Fix2', async () => {
    logger.info('Verificando documentacion');

    expect(content).toContain('Prompt 38-Fix2');
  });
});

// =============================================================================
// TESTS: REGRESION
// =============================================================================

test.describe('Prompt 38-Fix2 - Regresion', () => {
  const logger = new TestLogger({ testName: 'Prompt38Fix2-Regresion' });

  test('ContentScene sigue importando SafeImage', async () => {
    logger.info('Verificando import SafeImage');

    const content = fs.readFileSync(CONTENT_SCENE_PATH, 'utf-8');
    expect(content).toContain("import { SafeImage }");
  });

  test('SafeImage sigue usando Img de Remotion', async () => {
    logger.info('Verificando Img component');

    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');
    expect(content).toContain('<Img');
    expect(content).toMatch(/import.*Img.*from\s*'remotion'/);
  });

  test('Hero timing sin cambio (8s)', async () => {
    logger.info('Verificando Hero');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('heroSceneDuration = 8 * fps');
  });

  test('Outro timing sin cambio (5s)', async () => {
    logger.info('Verificando Outro');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('outroSceneDuration = 5 * fps');
  });

  test('Crossfade 30 frames sin cambio', async () => {
    logger.info('Verificando crossfade');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toMatch(/crossfadeFrames:\s*30/);
  });

  test('AudioMixer sin cambio', async () => {
    logger.info('Verificando AudioMixer');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('<AudioMixer');
    expect(content).toContain('voice={audio.voice}');
  });

  // Prompt 41: Narration duration cambió de durationInFrames a outroStart
  test('Narration desde frame 0, termina en outroStart (Prompt 37-Fix1 + Prompt 41)', async () => {
    logger.info('Verificando Narration');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toMatch(/Sequence\s+from=\{0\}\s+durationInFrames=\{outroStart\}\s+name="Narration"/);
  });

  test('imageAnimation config sin cambio', async () => {
    logger.info('Verificando imageAnimation');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toContain('imageAnimation');
    expect(content).toContain('crossfadeFrames');
  });
});
