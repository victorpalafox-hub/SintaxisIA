/**
 * @fileoverview Tests para Prompt 19.3 - Image Preload & Transition Fix
 *
 * Valida la funcionalidad de:
 * - imageAnimation config en themes.ts
 * - ContentScene usa imageAnimation para transiciones
 * - SafeImage tiene preload integrado via Remotion <Img>
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.3
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONSTANTES DE RUTAS
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const STYLES_PATH = path.join(REMOTION_SRC, 'styles');
const COMPONENTS_PATH = path.join(REMOTION_SRC, 'components');
const ELEMENTS_PATH = path.join(COMPONENTS_PATH, 'elements');
const SCENES_PATH = path.join(COMPONENTS_PATH, 'scenes');

// =============================================================================
// TESTS: ARCHIVOS Y ESTRUCTURA
// =============================================================================

test.describe('Prompt 19.3 - Archivos y Estructura', () => {

  test('themes.ts existe', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const exists = fs.existsSync(filePath);
    expect(exists).toBe(true);
  });

  test('SafeImage.tsx existe en elements/', async () => {
    const filePath = path.join(ELEMENTS_PATH, 'SafeImage.tsx');
    const exists = fs.existsSync(filePath);
    expect(exists).toBe(true);
  });

  test('ContentScene.tsx existe', async () => {
    const filePath = path.join(SCENES_PATH, 'ContentScene.tsx');
    const exists = fs.existsSync(filePath);
    expect(exists).toBe(true);
  });

  test('NO existe PreloadedImage.tsx duplicado', async () => {
    // Verificar que no se creó componente duplicado
    const rootComponents = path.join(COMPONENTS_PATH, 'PreloadedImage.tsx');
    const elementsPreload = path.join(ELEMENTS_PATH, 'PreloadedImage.tsx');

    expect(fs.existsSync(rootComponents)).toBe(false);
    expect(fs.existsSync(elementsPreload)).toBe(false);
  });

});

// =============================================================================
// TESTS: THEMES CONFIGURATION
// =============================================================================

test.describe('Prompt 19.3 - Themes Configuration', () => {

  test('imageAnimation existe en themes.ts', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export const imageAnimation');
  });

  test('imageAnimation.fadeInFrames = 30', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/fadeInFrames:\s*30/);
  });

  test('imageAnimation.fadeOutFrames = 15', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Buscar dentro del bloque imageAnimation
    expect(content).toContain('imageAnimation');
    expect(content).toMatch(/fadeOutFrames:\s*15/);
  });

  test('imageAnimation.crossfadeFrames existe', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('crossfadeFrames');
  });

  test('textAnimation sigue existiendo (no afectado)', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export const textAnimation');
  });

});

// =============================================================================
// TESTS: CONTENTSCENE INTEGRATION
// =============================================================================

test.describe('Prompt 19.3 - ContentScene Integration', () => {

  test('ContentScene importa imageAnimation', async () => {
    const filePath = path.join(SCENES_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('imageAnimation');
    expect(content).toMatch(/import\s*{[^}]*imageAnimation[^}]*}\s*from/);
  });

  test('ContentScene usa imageAnimation.fadeInFrames', async () => {
    const filePath = path.join(SCENES_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('imageAnimation.fadeInFrames');
  });

  test('ContentScene NO tiene fade-in hardcodeado a 20', async () => {
    const filePath = path.join(SCENES_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // El patrón anterior era: interpolate(frame, [0, 20], [0, 1]
    // Ahora debería usar imageAnimation.fadeInFrames
    expect(content).not.toMatch(/interpolate\(frame,\s*\[0,\s*20\],\s*\[0,\s*1\]/);
  });

  test('ContentScene usa SafeImage (no Img directamente)', async () => {
    const filePath = path.join(SCENES_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('SafeImage');
    expect(content).toContain("from '../elements/SafeImage'");
  });

});

// =============================================================================
// TESTS: SAFEIMAGE PRELOAD
// =============================================================================

test.describe('Prompt 19.3 - SafeImage Preload', () => {

  test('SafeImage usa componente Img de Remotion', async () => {
    const filePath = path.join(ELEMENTS_PATH, 'SafeImage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Prompt 19.3.2: Verificar que importa Img de remotion (puede tener más imports como delayRender)
    expect(content).toMatch(/import\s*{[^}]*Img[^}]*}\s*from\s*['"]remotion['"]/);
  });

  test('SafeImage retorna null en error sin fallback (Prompt 38-Fix2)', async () => {
    const filePath = path.join(ELEMENTS_PATH, 'SafeImage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Prompt 38-Fix2: UI Avatars eliminado, ahora retorna null en error
    expect(content).toContain('hasError && !fallbackSrc');
  });

  test('SafeImage tiene error handling', async () => {
    const filePath = path.join(ELEMENTS_PATH, 'SafeImage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Prompt 19.3.2: Error handling via img.onerror en useEffect (preload nativo)
    expect(content).toContain('.onerror');
  });

  test('SafeImage tiene estado hasError (Prompt 38-Fix2)', async () => {
    const filePath = path.join(ELEMENTS_PATH, 'SafeImage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Prompt 38-Fix2: generatePlaceholder eliminado, usa hasError
    expect(content).toContain('setHasError');
  });

});

// =============================================================================
// TESTS: ANTI-PATTERNS EVITADOS
// =============================================================================

test.describe('Prompt 19.3 - Anti-Patterns Evitados', () => {

  test('NO usa CSS transition en ContentScene', async () => {
    const filePath = path.join(SCENES_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // CSS transitions no funcionan en renderizado de Remotion
    expect(content).not.toMatch(/transition:\s*['"]opacity/);
  });

  test('SafeImage usa transition minimal para reveal post-preload', async () => {
    const filePath = path.join(ELEMENTS_PATH, 'SafeImage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Prompt 19.3.2: SafeImage USA transition minimal de opacity (0.1s)
    // para evitar flash blanco después del preload.
    // Esta es una excepción válida - NO es animación de Remotion.
    expect(content).toMatch(/transition:\s*['"]opacity\s+0\.1s/);
  });

  test('NO importa theme como objeto unificado', async () => {
    const filePath = path.join(SCENES_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // El patrón incorrecto sería: import { theme } from
    // El correcto es: import { colors, imageAnimation, ... } from
    expect(content).not.toMatch(/import\s*{\s*theme\s*}\s*from/);
  });

  test('NO accede a theme.animation (no existe)', async () => {
    const filePath = path.join(SCENES_PATH, 'ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).not.toContain('theme.animation');
  });

});

// =============================================================================
// TESTS: VALORES DE CONFIGURACIÓN
// =============================================================================

test.describe('Prompt 19.3 - Valores de Configuración', () => {

  test('fadeInFrames es 30 (1 segundo @ 30fps)', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extraer el valor de imageAnimation.fadeInFrames
    const match = content.match(/imageAnimation\s*=\s*{[^}]*fadeInFrames:\s*(\d+)/s);
    expect(match).not.toBeNull();
    expect(parseInt(match![1])).toBe(30);
  });

  test('crossfadeFrames es 20 (~0.67s @ 30fps)', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const match = content.match(/imageAnimation\s*=\s*{[^}]*crossfadeFrames:\s*(\d+)/s);
    expect(match).not.toBeNull();
    expect(parseInt(match![1])).toBe(20);
  });

  test('fadeInFrames es mayor que el anterior (20)', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const match = content.match(/imageAnimation\s*=\s*{[^}]*fadeInFrames:\s*(\d+)/s);
    expect(match).not.toBeNull();

    // El valor anterior era 20, ahora debe ser mayor para transiciones más suaves
    const fadeInFrames = parseInt(match![1]);
    expect(fadeInFrames).toBeGreaterThan(20);
  });

});

// =============================================================================
// TESTS: TYPESCRIPT TYPES
// =============================================================================

test.describe('Prompt 19.3 - TypeScript Types', () => {

  test('themes.ts tiene comentario de Prompt 19.3', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('Prompt 19.3');
  });

  test('imageAnimation tiene JSDoc con descripción de frames', async () => {
    const filePath = path.join(STYLES_PATH, 'themes.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('Frames para fade in');
    expect(content).toContain('30fps');
  });

});
