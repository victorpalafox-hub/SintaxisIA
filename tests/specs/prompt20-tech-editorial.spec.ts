/**
 * @fileoverview Tests para Prompt 20 - Tech Editorial + Background Animado
 *
 * Valida la migración visual de Cyberpunk Neón a Tech Editorial:
 * - Tema techEditorialTheme existe y es activeTheme
 * - BackgroundDirector, GrainOverlay, LightSweep creados
 * - Configs centralizadas: backgroundAnimation, lightSweep, editorialShadow
 * - AINewsShort integra BackgroundDirector como primera capa
 * - Escenas usan fondo transparente (delegado al BackgroundDirector)
 * - Escenas NO contienen glowIntensity/imageGlow/textGlow
 * - Dead code eliminado (Video.tsx, sequences, effects, CyberpunkBG, ParticleField)
 * - Color cyan #00F0FF reemplazado por azul editorial #4A9EFF
 * - theme.ts usa shadows.subtle/elevation en lugar de neon/glow
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 20
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const THEME_PATH = path.join(REMOTION_SRC, 'theme.ts');
const AI_NEWS_SHORT_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');

// Escenas
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/HeroScene.tsx');
const CONTENT_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/ContentScene.tsx');
const OUTRO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/OutroScene.tsx');

// Nuevos componentes de background
const BG_DIRECTOR_PATH = path.join(REMOTION_SRC, 'components/backgrounds/BackgroundDirector.tsx');
const GRAIN_OVERLAY_PATH = path.join(REMOTION_SRC, 'components/backgrounds/GrainOverlay.tsx');
const LIGHT_SWEEP_PATH = path.join(REMOTION_SRC, 'components/backgrounds/LightSweep.tsx');

// UI
const PROGRESS_BAR_PATH = path.join(REMOTION_SRC, 'components/ui/ProgressBar.tsx');
const SAFE_IMAGE_PATH = path.join(REMOTION_SRC, 'components/elements/SafeImage.tsx');

// Dead code paths (deben NO existir)
const DEAD_CODE_PATHS = [
  path.join(REMOTION_SRC, 'Video.tsx'),
  path.join(REMOTION_SRC, 'components/backgrounds/CyberpunkBG.tsx'),
  path.join(REMOTION_SRC, 'components/backgrounds/ParticleField.tsx'),
  path.join(REMOTION_SRC, 'components/effects/GlitchEffect.tsx'),
  path.join(REMOTION_SRC, 'components/effects/NeonBorder.tsx'),
  path.join(REMOTION_SRC, 'components/sequences/GanchoExplosivo.tsx'),
  path.join(REMOTION_SRC, 'components/sequences/HeadlineImpacto.tsx'),
  path.join(REMOTION_SRC, 'components/sequences/ContenidoPrincipal.tsx'),
  path.join(REMOTION_SRC, 'components/sequences/SeccionImpacto.tsx'),
  path.join(REMOTION_SRC, 'components/sequences/OutroBranding.tsx'),
  path.join(REMOTION_SRC, 'components/ui/FloatingTags.tsx'),
  path.join(REMOTION_SRC, 'components/ui/DataOverlay.tsx'),
];

// Automation
const DATA_JSON_PATH = path.join(REMOTION_SRC, 'data.json');

// Logger (instanciado dentro de cada describe)

// =============================================================================
// HELPER
// =============================================================================

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

// =============================================================================
// TESTS: TEMA TECH EDITORIAL
// =============================================================================

test.describe('Prompt 20 - Tech Editorial Theme', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Theme' });

  test('debe tener techEditorialTheme definido en themes.ts', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('export const techEditorialTheme: Theme');
    expect(content).toContain("name: 'Tech Editorial'");
    logger.info('[PASS] techEditorialTheme definido en themes.ts');
  });

  test('debe tener techEditorialTheme como activeTheme', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('export const activeTheme = techEditorialTheme');
    logger.info('[PASS] activeTheme = techEditorialTheme');
  });

  test('debe usar paleta azul editorial premium (#4DA3FF)', () => {
    const content = readFile(THEMES_PATH);
    // techEditorialTheme debe tener el azul premium como primary (Prompt 36)
    expect(content).toMatch(/primary:\s*'#4DA3FF'/);
    logger.info('[PASS] Paleta azul editorial premium configurada');
  });

  test('debe tener theme.ts actualizado con colores editoriales', () => {
    const content = readFile(THEME_PATH);
    expect(content).toContain('#4A9EFF');
    expect(content).toContain('#64748B');
    expect(content).toContain('#0F1419');
    logger.info('[PASS] theme.ts con colores editoriales');
  });

  test('debe tener shadows.subtle y shadows.elevation en theme.ts', () => {
    const content = readFile(THEME_PATH);
    expect(content).toContain('subtle:');
    expect(content).toContain('elevation:');
    // No debe tener neon ni glow
    expect(content).not.toMatch(/\bneon\b.*=>/);
    expect(content).not.toMatch(/\bglow\b.*=>/);
    logger.info('[PASS] shadows migrados a subtle/elevation');
  });
});

// =============================================================================
// TESTS: CONFIGS CENTRALIZADAS
// =============================================================================

test.describe('Prompt 20 - Configs Centralizadas', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Configs' });

  test('debe exportar backgroundAnimation config', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('export const backgroundAnimation');
    expect(content).toContain('gradientAngleDrift');
    expect(content).toContain('parallaxSpeed');
    expect(content).toContain('grainOpacity');
    expect(content).toContain('vignetteStrength');
    expect(content).toContain('sectionMultiplier');
    logger.info('[PASS] backgroundAnimation config centralizada');
  });

  test('debe exportar lightSweep config', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('export const lightSweep');
    expect(content).toContain('intervalFrames');
    expect(content).toContain('durationFrames');
    expect(content).toContain('maxOpacity');
    logger.info('[PASS] lightSweep config centralizada');
  });

  test('debe exportar editorialShadow config', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('export const editorialShadow');
    expect(content).toContain('textDepth');
    expect(content).toContain('imageElevation');
    expect(content).toContain('logoBrandTint');
    expect(content).toContain('progressBar');
    logger.info('[PASS] editorialShadow config centralizada');
  });
});

// =============================================================================
// TESTS: NUEVOS COMPONENTES DE BACKGROUND
// =============================================================================

test.describe('Prompt 20 - BackgroundDirector Components', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Background' });

  test('debe existir BackgroundDirector.tsx', () => {
    expect(fs.existsSync(BG_DIRECTOR_PATH)).toBe(true);
    const content = readFile(BG_DIRECTOR_PATH);
    expect(content).toContain('export const BackgroundDirector');
    expect(content).toContain('GrainOverlay');
    expect(content).toContain('LightSweep');
    logger.info('[PASS] BackgroundDirector.tsx existe y orquesta sub-componentes');
  });

  test('debe existir GrainOverlay.tsx con SVG feTurbulence', () => {
    expect(fs.existsSync(GRAIN_OVERLAY_PATH)).toBe(true);
    const content = readFile(GRAIN_OVERLAY_PATH);
    expect(content).toContain('export const GrainOverlay');
    expect(content).toContain('feTurbulence');
    expect(content).toContain('backgroundAnimation');
    logger.info('[PASS] GrainOverlay.tsx con SVG noise');
  });

  test('debe existir LightSweep.tsx con intervalo periódico', () => {
    expect(fs.existsSync(LIGHT_SWEEP_PATH)).toBe(true);
    const content = readFile(LIGHT_SWEEP_PATH);
    expect(content).toContain('export const LightSweep');
    expect(content).toContain('lightSweep');
    expect(content).toContain('intervalFrames');
    logger.info('[PASS] LightSweep.tsx con barrido periódico');
  });

  test('BackgroundDirector debe tener 7 capas visuales', () => {
    const content = readFile(BG_DIRECTOR_PATH);
    // Gradient base
    expect(content).toContain('linear-gradient');
    // Blob primario
    expect(content).toContain('radial-gradient');
    expect(content).toContain('blobPrimaryOpacity');
    // Blob secundario
    expect(content).toContain('blobSecondaryOpacity');
    // SubtleGrid (Prompt 20.1)
    expect(content).toContain('<SubtleGrid');
    // Grain
    expect(content).toContain('<GrainOverlay');
    // Light sweep
    expect(content).toContain('<LightSweep');
    // Vignette (Prompt 20.1: usa config en vez de hardcoded)
    expect(content).toContain('vignetteTransparentStop');
    logger.info('[PASS] BackgroundDirector tiene 7 capas visuales');
  });

  test('BackgroundDirector debe ajustar parallax por sección', () => {
    const content = readFile(BG_DIRECTOR_PATH);
    expect(content).toContain('sectionMultiplier');
    // Prompt 31: secciones dinámicas reemplazan constantes hardcoded
    expect(content).toContain('contentStart');
    expect(content).toContain('outroStart');
    logger.info('[PASS] Parallax varía por sección (hero/content/outro)');
  });
});

// =============================================================================
// TESTS: INTEGRACION EN AINEWSSHORT
// =============================================================================

test.describe('Prompt 20 - Integración AINewsShort', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Integration' });

  test('AINewsShort debe importar BackgroundDirector', () => {
    const content = readFile(AI_NEWS_SHORT_PATH);
    expect(content).toContain("import { BackgroundDirector }");
    logger.info('[PASS] AINewsShort importa BackgroundDirector');
  });

  test('AINewsShort debe renderizar BackgroundDirector como primera capa', () => {
    const content = readFile(AI_NEWS_SHORT_PATH);
    // BackgroundDirector debe aparecer ANTES de las Sequences
    const bgPos = content.indexOf('<BackgroundDirector');
    const heroPos = content.indexOf('name="Hero"');
    expect(bgPos).toBeGreaterThan(-1);
    expect(heroPos).toBeGreaterThan(-1);
    expect(bgPos).toBeLessThan(heroPos);
    logger.info('[PASS] BackgroundDirector renderizado antes de escenas');
  });
});

// =============================================================================
// TESTS: MIGRACION DE ESCENAS (sin glow)
// =============================================================================

test.describe('Prompt 20 - Migración Escenas', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Scenes' });

  const SCENE_PATHS = [HERO_SCENE_PATH, CONTENT_SCENE_PATH, OUTRO_SCENE_PATH];
  const SCENE_NAMES = ['HeroScene', 'ContentScene', 'OutroScene'];

  for (let i = 0; i < SCENE_PATHS.length; i++) {
    const scenePath = SCENE_PATHS[i];
    const sceneName = SCENE_NAMES[i];

    test(`${sceneName} NO debe contener glowIntensity`, () => {
      const content = readFile(scenePath);
      expect(content).not.toContain('glowIntensity');
      logger.info(`[PASS] ${sceneName} sin glowIntensity`);
    });

    test(`${sceneName} debe usar fondo transparente`, () => {
      const content = readFile(scenePath);
      expect(content).toContain("background: 'transparent'");
      logger.info(`[PASS] ${sceneName} con fondo transparente`);
    });

    test(`${sceneName} debe usar editorialShadow`, () => {
      const content = readFile(scenePath);
      expect(content).toContain('editorialShadow');
      logger.info(`[PASS] ${sceneName} con editorialShadow`);
    });
  }

  test('ContentScene NO debe contener textGlow ni imageGlow', () => {
    const content = readFile(CONTENT_SCENE_PATH);
    expect(content).not.toMatch(/\btextGlow\b/);
    expect(content).not.toMatch(/\bimageGlow\b/);
    logger.info('[PASS] ContentScene sin textGlow/imageGlow');
  });

  test('ProgressBar NO debe tener triple neon boxShadow', () => {
    const content = readFile(PROGRESS_BAR_PATH);
    // No debe tener 3 capas de glow neon
    expect(content).not.toMatch(/0 0 10px.*0 0 20px.*0 0 30px/s);
    logger.info('[PASS] ProgressBar sin triple neon');
  });

  test('ProgressBar NO debe usar theme.shadows.neon', () => {
    const content = readFile(PROGRESS_BAR_PATH);
    expect(content).not.toContain('shadows.neon');
    logger.info('[PASS] ProgressBar sin shadows.neon');
  });
});

// =============================================================================
// TESTS: COLOR MIGRATION
// =============================================================================

test.describe('Prompt 20 - Migración de Colores', () => {
  const logger = new TestLogger({ testName: 'Prompt20-Colors' });

  test('SafeImage placeholder debe usar 4DA3FF (Prompt 36)', () => {
    const content = readFile(SAFE_IMAGE_PATH);
    expect(content).toContain('background=4DA3FF');
    expect(content).not.toContain('background=00F0FF');
    logger.info('[PASS] SafeImage placeholder actualizado (Prompt 36)');
  });

  test('AINewsShort default hero URL debe usar 4A9EFF', () => {
    const content = readFile(AI_NEWS_SHORT_PATH);
    expect(content).toContain('background=4A9EFF');
    expect(content).not.toContain('background=00F0FF');
    logger.info('[PASS] AINewsShort hero URL actualizada');
  });

  test('data.json themeColor debe ser #4A9EFF', () => {
    const content = readFile(DATA_JSON_PATH);
    expect(content).toContain('#4A9EFF');
    expect(content).not.toContain('#00f0ff');
    logger.info('[PASS] data.json themeColor actualizado');
  });

  test('Ninguna escena activa debe contener #00F0FF o #00f0ff', () => {
    const scenePaths = [HERO_SCENE_PATH, CONTENT_SCENE_PATH, OUTRO_SCENE_PATH, PROGRESS_BAR_PATH];
    for (const scenePath of scenePaths) {
      const content = readFile(scenePath);
      const fileName = path.basename(scenePath);
      expect(content).not.toMatch(/#00[fF]0[fF][fF]/);
      logger.info(`[PASS] ${fileName} sin #00F0FF`);
    }
  });
});

// =============================================================================
// TESTS: DEAD CODE ELIMINADO
// =============================================================================

test.describe('Prompt 20 - Dead Code Eliminado', () => {
  const logger = new TestLogger({ testName: 'Prompt20-DeadCode' });

  for (const deadPath of DEAD_CODE_PATHS) {
    const fileName = path.basename(deadPath);

    test(`${fileName} NO debe existir (dead code)`, () => {
      expect(fs.existsSync(deadPath)).toBe(false);
      logger.info(`[PASS] ${fileName} eliminado`);
    });
  }

  test('Directorio sequences/ NO debe existir', () => {
    const seqDir = path.join(REMOTION_SRC, 'components/sequences');
    expect(fs.existsSync(seqDir)).toBe(false);
    logger.info('[PASS] Directorio sequences/ eliminado');
  });

  test('Directorio effects/ NO debe existir', () => {
    const effectsDir = path.join(REMOTION_SRC, 'components/effects');
    expect(fs.existsSync(effectsDir)).toBe(false);
    logger.info('[PASS] Directorio effects/ eliminado');
  });
});

// =============================================================================
// TESTS: PROMPT 20.1 - BACKGROUND VISIBILITY FIX
// =============================================================================

test.describe('Prompt 20.1 - Background Visibility Fix', () => {
  const logger = new TestLogger({ testName: 'Prompt20.1-BgFix' });

  test('BackgroundDirector NO debe tener doble alpha en blobs', () => {
    const content = readFile(BG_DIRECTOR_PATH);
    // NO debe tener hex alpha suffix después de colors.primary/secondary en radial-gradient
    // Ejemplo de lo que NO debe existir: ${colors.primary}18 o ${colors.secondary}15
    expect(content).not.toMatch(/colors\.primary\}[0-9a-fA-F]{2}\s/);
    expect(content).not.toMatch(/colors\.secondary\}[0-9a-fA-F]{2}\s/);
    logger.info('[PASS] Sin doble alpha en blobs');
  });

  test('BackgroundDirector debe usar blobDriftAmplitude desde config', () => {
    const content = readFile(BG_DIRECTOR_PATH);
    expect(content).toContain('blobDriftAmplitude');
    logger.info('[PASS] Drift amplitude desde config');
  });

  test('BackgroundDirector debe tener micro-zoom wrapper', () => {
    const content = readFile(BG_DIRECTOR_PATH);
    expect(content).toContain('microZoom');
    expect(content).toContain('zoomScale');
    logger.info('[PASS] Micro-zoom implementado');
  });

  test('BackgroundDirector debe tener transition boost en outro', () => {
    const content = readFile(BG_DIRECTOR_PATH);
    expect(content).toContain('transitionBoost');
    expect(content).toContain('boostOpacity');
    logger.info('[PASS] Transition boost implementado');
  });

  test('backgroundAnimation debe tener microZoom config', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('microZoom');
    expect(content).toContain('cycleDuration');
    logger.info('[PASS] microZoom config en themes.ts');
  });

  test('backgroundAnimation NO debe tener grainScale (dead config)', () => {
    const content = readFile(THEMES_PATH);
    expect(content).not.toContain('grainScale');
    logger.info('[PASS] grainScale eliminado');
  });

  test('backgroundAnimation debe tener vignetteTransparentStop', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('vignetteTransparentStop');
    logger.info('[PASS] vignetteTransparentStop en config');
  });

  test('backgroundAnimation debe tener blobDriftAmplitude', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('blobDriftAmplitude');
    logger.info('[PASS] blobDriftAmplitude en config');
  });

  test('backgroundAnimation debe tener transitionBoost', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('transitionBoost');
    logger.info('[PASS] transitionBoost en config');
  });

  test('debe existir SubtleGrid.tsx', () => {
    const subtleGridPath = path.join(REMOTION_SRC, 'components/backgrounds/SubtleGrid.tsx');
    expect(fs.existsSync(subtleGridPath)).toBe(true);
    const content = readFile(subtleGridPath);
    expect(content).toContain('export const SubtleGrid');
    expect(content).toContain('subtleGrid');
    expect(content).toContain('repeating-linear-gradient');
    logger.info('[PASS] SubtleGrid.tsx existe');
  });

  test('debe exportar subtleGrid config desde themes.ts', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('export const subtleGrid');
    expect(content).toContain('cellSize');
    expect(content).toContain('driftSpeed');
    logger.info('[PASS] subtleGrid config exportada');
  });

  test('LightSweep debe usar color del tema', () => {
    const content = readFile(LIGHT_SWEEP_PATH);
    expect(content).toContain('colorSource');
    expect(content).toContain('colors.accent');
    logger.info('[PASS] LightSweep usa color del tema');
  });

  test('LightSweep debe usar mixBlendMode', () => {
    const content = readFile(LIGHT_SWEEP_PATH);
    expect(content).toContain('mixBlendMode');
    expect(content).toContain('blendMode');
    logger.info('[PASS] LightSweep con blend mode');
  });

  test('lightSweep config debe tener colorSource y blendMode', () => {
    const content = readFile(THEMES_PATH);
    expect(content).toContain('colorSource');
    expect(content).toContain("blendMode: 'screen'");
    logger.info('[PASS] lightSweep config con colorSource y blendMode');
  });

  test('LightSweep NO debe tener doble alpha en gradiente', () => {
    const content = readFile(LIGHT_SWEEP_PATH);
    // NO debe tener rgba con alpha interno en el gradiente
    expect(content).not.toContain('rgba(255,255,255,0.15)');
    logger.info('[PASS] LightSweep sin doble alpha');
  });
});
