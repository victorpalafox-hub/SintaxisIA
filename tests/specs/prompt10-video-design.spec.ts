/**
 * @fileoverview Tests de Diseño de Video - Prompt 10
 *
 * Este archivo contiene tests que validan los nuevos componentes de video:
 * AudioMixer (con ducking) y ProgressBar, así como la configuración
 * de audio en el theme.
 *
 * @description
 * Las pruebas cubren:
 * - Existencia y estructura de componentes de audio
 * - Existencia y estructura de ProgressBar
 * - Configuración de audio en theme
 * - Tipos TypeScript definidos
 * - Integración en Video.tsx
 * - Scripts de npm disponibles
 *
 * @prerequisites
 * - Remotion instalado en /remotion-app
 * - Componentes AudioMixer y ProgressBar creados
 * - theme.ts actualizado con configuración de audio
 *
 * @author Sintaxis IA
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURACION DE TESTS
// ============================================================================

/**
 * Rutas base del proyecto
 */
const PATHS = {
  remotionApp: path.join(process.cwd(), 'remotion-app'),
  components: path.join(process.cwd(), 'remotion-app', 'src', 'components'),
  types: path.join(process.cwd(), 'remotion-app', 'src', 'types'),
  styles: path.join(process.cwd(), 'remotion-app', 'src', 'styles'),
  src: path.join(process.cwd(), 'remotion-app', 'src'),
  root: process.cwd(),
};

/**
 * Archivos esperados del Prompt 10
 */
const EXPECTED_FILES = {
  audioMixer: path.join(PATHS.components, 'audio', 'AudioMixer.tsx'),
  progressBar: path.join(PATHS.components, 'ui', 'ProgressBar.tsx'),
  audioTypes: path.join(PATHS.types, 'audio.types.ts'),
  themes: path.join(PATHS.styles, 'themes.ts'),
  theme: path.join(PATHS.src, 'theme.ts'),
  video: path.join(PATHS.src, 'Video.tsx'),
  packageJson: path.join(PATHS.root, 'package.json'),
  remotionReadme: path.join(PATHS.root, 'README-REMOTION.md'),
};

// ============================================================================
// SUITE 0: SISTEMA DE TEMAS
// ============================================================================

test.describe('Suite 0: Theme System', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ThemeSystemTests' });
  });

  /**
   * Verifica que existe el archivo de temas
   */
  test('should have themes.ts file in styles folder', async () => {
    logger.info('Verificando existencia de themes.ts');

    const exists = fs.existsSync(EXPECTED_FILES.themes);
    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'themes.ts', path: EXPECTED_FILES.themes }
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que tiene cyberpunkTheme y minimalistTheme
   */
  test('should have cyberpunk and minimalist themes', async () => {
    logger.info('Verificando temas disponibles');

    const content = fs.readFileSync(EXPECTED_FILES.themes, 'utf-8');

    const hasCyberpunk = content.includes('cyberpunkTheme');
    const hasMinimalist = content.includes('minimalistTheme');
    const hasActiveTheme = content.includes('activeTheme');

    logger.logValidationResults({
      validator: 'ThemesAvailable',
      passed: hasCyberpunk && hasMinimalist && hasActiveTheme,
      details: { hasCyberpunk, hasMinimalist, hasActiveTheme }
    });

    expect(hasCyberpunk).toBe(true);
    expect(hasMinimalist).toBe(true);
    expect(hasActiveTheme).toBe(true);
  });

  /**
   * Verifica colores cyberpunk correctos
   */
  test('should have cyberpunk colors (#00F0FF cyan, #FF0099 magenta)', async () => {
    logger.info('Verificando colores cyberpunk');

    const content = fs.readFileSync(EXPECTED_FILES.themes, 'utf-8');

    const hasCyan = content.includes('#00F0FF');
    const hasMagenta = content.includes('#FF0099');

    logger.logValidationResults({
      validator: 'CyberpunkColors',
      passed: hasCyan && hasMagenta,
      details: { hasCyan, hasMagenta }
    });

    expect(hasCyan).toBe(true);
    expect(hasMagenta).toBe(true);
  });

  /**
   * Verifica que cyberpunk es el tema activo por defecto
   */
  test('should have cyberpunk theme active by default', async () => {
    logger.info('Verificando tema activo por defecto');

    const content = fs.readFileSync(EXPECTED_FILES.themes, 'utf-8');

    // Buscar patrón: activeTheme = cyberpunkTheme
    const isCyberpunkActive = /activeTheme\s*=\s*cyberpunkTheme/.test(content);

    logger.logValidationResults({
      validator: 'ActiveTheme',
      passed: isCyberpunkActive,
      details: { isCyberpunkActive }
    });

    expect(isCyberpunkActive).toBe(true);
  });

  /**
   * Verifica que es fácil cambiar de tema (tiene comentarios)
   */
  test('should have instructions for changing themes', async () => {
    logger.info('Verificando instrucciones de cambio de tema');

    const content = fs.readFileSync(EXPECTED_FILES.themes, 'utf-8');

    const hasInstructions = content.includes('Para cambiar de tema') ||
                            content.includes('TEMA ACTIVO');

    logger.logValidationResults({
      validator: 'ThemeInstructions',
      passed: hasInstructions,
      details: { hasInstructions }
    });

    expect(hasInstructions).toBe(true);
  });
});

// ============================================================================
// SUITE 1: COMPONENTE AUDIO MIXER
// ============================================================================

test.describe('Suite 1: AudioMixer Component', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'AudioMixerTests' });
  });

  /**
   * Verifica que el archivo AudioMixer.tsx existe
   */
  test('should have AudioMixer.tsx file', async () => {
    logger.info('Verificando existencia de AudioMixer.tsx');

    const exists = fs.existsSync(EXPECTED_FILES.audioMixer);
    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'AudioMixer.tsx', path: EXPECTED_FILES.audioMixer }
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que AudioMixer exporta el componente correctamente
   */
  test('should export AudioMixer component', async () => {
    logger.info('Verificando export de AudioMixer');

    const content = fs.readFileSync(EXPECTED_FILES.audioMixer, 'utf-8');

    // Verificar export del componente
    const hasExport = content.includes('export const AudioMixer');
    const hasDefaultExport = content.includes('export default AudioMixer');

    logger.logValidationResults({
      validator: 'ComponentExport',
      passed: hasExport && hasDefaultExport,
      details: { hasNamedExport: hasExport, hasDefaultExport }
    });

    expect(hasExport).toBe(true);
    expect(hasDefaultExport).toBe(true);
  });

  /**
   * Verifica que AudioMixer tiene las props correctas
   */
  test('should have correct AudioMixer props interface', async () => {
    logger.info('Verificando props de AudioMixer');

    const content = fs.readFileSync(EXPECTED_FILES.audioMixer, 'utf-8');

    // Verificar uso de tipos
    const usesAudioMixerProps = content.includes('AudioMixerProps');
    const hasVoiceProp = content.includes('voice');
    const hasMusicProp = content.includes('music');

    logger.logValidationResults({
      validator: 'PropsInterface',
      passed: usesAudioMixerProps && hasVoiceProp && hasMusicProp,
      details: { usesAudioMixerProps, hasVoiceProp, hasMusicProp }
    });

    expect(usesAudioMixerProps).toBe(true);
    expect(hasVoiceProp).toBe(true);
    expect(hasMusicProp).toBe(true);
  });

  /**
   * Verifica que AudioMixer implementa ducking
   */
  test('should implement audio ducking logic', async () => {
    logger.info('Verificando implementación de ducking');

    const content = fs.readFileSync(EXPECTED_FILES.audioMixer, 'utf-8');

    // Verificar lógica de ducking
    const hasDuckingLogic = content.includes('duckingReduction') ||
                            content.includes('ducking');
    const hasVolumeCalculation = content.includes('calculateMusicVolume') ||
                                  content.includes('volume');

    logger.logValidationResults({
      validator: 'DuckingImplementation',
      passed: hasDuckingLogic && hasVolumeCalculation,
      details: { hasDuckingLogic, hasVolumeCalculation }
    });

    expect(hasDuckingLogic).toBe(true);
  });

  /**
   * Verifica que ducking reduce música a 60%
   */
  test('should reduce music to 60% when voice is active (0.6)', async () => {
    logger.info('Verificando factor de ducking (0.6)');

    const themeContent = fs.readFileSync(EXPECTED_FILES.theme, 'utf-8');

    // Verificar que duckingReduction es 0.6
    const hasDucking06 = themeContent.includes('duckingReduction: 0.6') ||
                          themeContent.includes('duckingReduction:0.6');

    logger.logValidationResults({
      validator: 'DuckingFactor',
      passed: hasDucking06,
      details: { hasDucking06, expectedValue: 0.6 }
    });

    expect(hasDucking06).toBe(true);
  });

  /**
   * Verifica que AudioMixer soporta loop de música
   */
  test('should support music loop', async () => {
    logger.info('Verificando soporte de loop');

    const content = fs.readFileSync(EXPECTED_FILES.audioMixer, 'utf-8');

    const hasLoop = content.includes('loop');
    const hasLoopMusic = content.includes('loopMusic') || content.includes('loop={');

    logger.logValidationResults({
      validator: 'MusicLoop',
      passed: hasLoop,
      details: { hasLoop, hasLoopMusic }
    });

    expect(hasLoop).toBe(true);
  });

  /**
   * Verifica que AudioMixer soporta startFrom
   */
  test('should support voice startFrom', async () => {
    logger.info('Verificando soporte de startFrom');

    const content = fs.readFileSync(EXPECTED_FILES.audioMixer, 'utf-8');

    const hasStartFrom = content.includes('startFrom');

    logger.logValidationResults({
      validator: 'VoiceStartFrom',
      passed: hasStartFrom,
      details: { hasStartFrom }
    });

    expect(hasStartFrom).toBe(true);
  });

  /**
   * Verifica que AudioMixer usa componentes de Remotion
   */
  test('should use Remotion Audio components', async () => {
    logger.info('Verificando uso de Remotion Audio');

    const content = fs.readFileSync(EXPECTED_FILES.audioMixer, 'utf-8');

    // Verificar imports de Remotion
    const importsAudio = content.includes("from 'remotion'");
    const usesAudioComponent = content.includes('<Audio');
    const usesStaticFile = content.includes('staticFile');

    logger.logValidationResults({
      validator: 'RemotionIntegration',
      passed: importsAudio && usesAudioComponent,
      details: { importsAudio, usesAudioComponent, usesStaticFile }
    });

    expect(importsAudio).toBe(true);
    expect(usesAudioComponent).toBe(true);
  });
});

// ============================================================================
// SUITE 2: COMPONENTE PROGRESS BAR
// ============================================================================

test.describe('Suite 2: ProgressBar Component', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ProgressBarTests' });
  });

  /**
   * Verifica que el archivo ProgressBar.tsx existe
   */
  test('should have ProgressBar.tsx file', async () => {
    logger.info('Verificando existencia de ProgressBar.tsx');

    const exists = fs.existsSync(EXPECTED_FILES.progressBar);
    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'ProgressBar.tsx', path: EXPECTED_FILES.progressBar }
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que ProgressBar exporta el componente correctamente
   */
  test('should export ProgressBar component', async () => {
    logger.info('Verificando export de ProgressBar');

    const content = fs.readFileSync(EXPECTED_FILES.progressBar, 'utf-8');

    const hasExport = content.includes('export const ProgressBar');
    const hasDefaultExport = content.includes('export default ProgressBar');

    logger.logValidationResults({
      validator: 'ComponentExport',
      passed: hasExport && hasDefaultExport,
      details: { hasNamedExport: hasExport, hasDefaultExport }
    });

    expect(hasExport).toBe(true);
    expect(hasDefaultExport).toBe(true);
  });

  /**
   * Verifica que ProgressBar calcula el progreso correctamente
   */
  test('should calculate progress based on frames', async () => {
    logger.info('Verificando cálculo de progreso');

    const content = fs.readFileSync(EXPECTED_FILES.progressBar, 'utf-8');

    // Verificar uso de hooks de Remotion para frames
    const usesCurrentFrame = content.includes('useCurrentFrame');
    const usesVideoConfig = content.includes('useVideoConfig');
    const hasProgressCalculation = content.includes('interpolate') ||
                                    content.includes('progress');

    logger.logValidationResults({
      validator: 'ProgressCalculation',
      passed: usesCurrentFrame && usesVideoConfig,
      details: { usesCurrentFrame, usesVideoConfig, hasProgressCalculation }
    });

    expect(usesCurrentFrame).toBe(true);
    expect(usesVideoConfig).toBe(true);
  });

  /**
   * Verifica que ProgressBar tiene estilos cyberpunk
   */
  test('should have cyberpunk styling with neon effect', async () => {
    logger.info('Verificando estilo cyberpunk');

    const content = fs.readFileSync(EXPECTED_FILES.progressBar, 'utf-8');

    // Verificar uso de theme y estilos
    const usesTheme = content.includes('theme');
    const hasGlowEffect = content.includes('boxShadow') ||
                          content.includes('glow') ||
                          content.includes('neon');

    logger.logValidationResults({
      validator: 'CyberpunkStyling',
      passed: usesTheme && hasGlowEffect,
      details: { usesTheme, hasGlowEffect }
    });

    expect(usesTheme).toBe(true);
    expect(hasGlowEffect).toBe(true);
  });
});

// ============================================================================
// SUITE 3: TIPOS DE AUDIO
// ============================================================================

test.describe('Suite 3: Audio Types', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'AudioTypesTests' });
  });

  /**
   * Verifica que el archivo de tipos existe
   */
  test('should have audio.types.ts file', async () => {
    logger.info('Verificando existencia de audio.types.ts');

    const exists = fs.existsSync(EXPECTED_FILES.audioTypes);
    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'audio.types.ts', path: EXPECTED_FILES.audioTypes }
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que define las interfaces necesarias
   */
  test('should define required interfaces', async () => {
    logger.info('Verificando interfaces definidas');

    const content = fs.readFileSync(EXPECTED_FILES.audioTypes, 'utf-8');

    const hasAudioMixerProps = content.includes('interface AudioMixerProps');
    const hasDuckingConfig = content.includes('interface DuckingConfig');
    const hasAudioSource = content.includes('interface AudioSource') ||
                           content.includes('interface MusicConfig');
    const hasProgressBarProps = content.includes('interface ProgressBarProps');

    logger.logValidationResults({
      validator: 'InterfaceDefinitions',
      passed: hasAudioMixerProps && hasDuckingConfig,
      details: {
        hasAudioMixerProps,
        hasDuckingConfig,
        hasAudioSource,
        hasProgressBarProps
      }
    });

    expect(hasAudioMixerProps).toBe(true);
    expect(hasDuckingConfig).toBe(true);
  });
});

// ============================================================================
// SUITE 4: CONFIGURACION DE AUDIO EN THEME
// ============================================================================

test.describe('Suite 4: Audio Configuration in Theme', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ThemeAudioTests' });
  });

  /**
   * Verifica que theme.ts tiene configuración de audio
   */
  test('should have audio configuration in theme', async () => {
    logger.info('Verificando configuración de audio en theme');

    const content = fs.readFileSync(EXPECTED_FILES.theme, 'utf-8');

    const hasAudioSection = content.includes('audio:');
    const hasVoiceVolume = content.includes('voiceVolume');
    const hasMusicVolume = content.includes('musicVolume');
    const hasDuckingReduction = content.includes('duckingReduction');

    logger.logValidationResults({
      validator: 'ThemeAudioConfig',
      passed: hasAudioSection && hasVoiceVolume && hasMusicVolume,
      details: { hasAudioSection, hasVoiceVolume, hasMusicVolume, hasDuckingReduction }
    });

    expect(hasAudioSection).toBe(true);
    expect(hasVoiceVolume).toBe(true);
    expect(hasMusicVolume).toBe(true);
    expect(hasDuckingReduction).toBe(true);
  });

  /**
   * Verifica que theme.ts tiene configuración de fade
   */
  test('should have fade configuration for music', async () => {
    logger.info('Verificando configuración de fade');

    const content = fs.readFileSync(EXPECTED_FILES.theme, 'utf-8');

    const hasFadeIn = content.includes('fadeInSeconds') ||
                       content.includes('fadeIn');
    const hasFadeOut = content.includes('fadeOutSeconds') ||
                        content.includes('fadeOut');

    logger.logValidationResults({
      validator: 'FadeConfiguration',
      passed: hasFadeIn && hasFadeOut,
      details: { hasFadeIn, hasFadeOut }
    });

    expect(hasFadeIn).toBe(true);
    expect(hasFadeOut).toBe(true);
  });
});

// ============================================================================
// SUITE 5: INTEGRACION EN VIDEO.TSX
// ============================================================================

test.describe('Suite 5: Integration in Video.tsx', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'VideoIntegrationTests' });
  });

  /**
   * Verifica que Video.tsx importa AudioMixer
   */
  test('should import AudioMixer in Video.tsx', async () => {
    logger.info('Verificando import de AudioMixer en Video.tsx');

    const content = fs.readFileSync(EXPECTED_FILES.video, 'utf-8');

    const importsAudioMixer = content.includes("import { AudioMixer }") ||
                               content.includes("import {AudioMixer}");

    logger.logValidationResults({
      validator: 'AudioMixerImport',
      passed: importsAudioMixer,
      details: { importsAudioMixer }
    });

    expect(importsAudioMixer).toBe(true);
  });

  /**
   * Verifica que Video.tsx importa ProgressBar
   */
  test('should import ProgressBar in Video.tsx', async () => {
    logger.info('Verificando import de ProgressBar en Video.tsx');

    const content = fs.readFileSync(EXPECTED_FILES.video, 'utf-8');

    const importsProgressBar = content.includes("import { ProgressBar }") ||
                                content.includes("import {ProgressBar}");

    logger.logValidationResults({
      validator: 'ProgressBarImport',
      passed: importsProgressBar,
      details: { importsProgressBar }
    });

    expect(importsProgressBar).toBe(true);
  });

  /**
   * Verifica que Video.tsx usa AudioMixer
   */
  test('should use AudioMixer component in Video.tsx', async () => {
    logger.info('Verificando uso de AudioMixer en Video.tsx');

    const content = fs.readFileSync(EXPECTED_FILES.video, 'utf-8');

    const usesAudioMixer = content.includes('<AudioMixer');

    logger.logValidationResults({
      validator: 'AudioMixerUsage',
      passed: usesAudioMixer,
      details: { usesAudioMixer }
    });

    expect(usesAudioMixer).toBe(true);
  });

  /**
   * Verifica que Video.tsx usa ProgressBar
   */
  test('should use ProgressBar component in Video.tsx', async () => {
    logger.info('Verificando uso de ProgressBar en Video.tsx');

    const content = fs.readFileSync(EXPECTED_FILES.video, 'utf-8');

    const usesProgressBar = content.includes('<ProgressBar');

    logger.logValidationResults({
      validator: 'ProgressBarUsage',
      passed: usesProgressBar,
      details: { usesProgressBar }
    });

    expect(usesProgressBar).toBe(true);
  });
});

// ============================================================================
// SUITE 6: SCRIPTS Y DOCUMENTACION
// ============================================================================

test.describe('Suite 6: Scripts and Documentation', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ScriptsDocTests' });
  });

  /**
   * Verifica que package.json tiene los scripts de video
   */
  test('should have video preview and render scripts', async () => {
    logger.info('Verificando scripts de video en package.json');

    const content = fs.readFileSync(EXPECTED_FILES.packageJson, 'utf-8');
    const packageJson = JSON.parse(content);

    const hasPreviewVideo = 'preview:video' in (packageJson.scripts || {});
    const hasRenderSample = 'render:sample' in (packageJson.scripts || {});
    const hasTestDesign = 'test:design' in (packageJson.scripts || {});

    logger.logValidationResults({
      validator: 'PackageScripts',
      passed: hasPreviewVideo || hasRenderSample || hasTestDesign,
      details: { hasPreviewVideo, hasRenderSample, hasTestDesign }
    });

    // Al menos uno de los scripts debe existir
    expect(hasPreviewVideo || hasRenderSample || hasTestDesign).toBe(true);
  });

  /**
   * Verifica que existe el README de Remotion
   */
  test('should have README-REMOTION.md documentation', async () => {
    logger.info('Verificando existencia de README-REMOTION.md');

    const exists = fs.existsSync(EXPECTED_FILES.remotionReadme);
    logger.logValidationResults({
      validator: 'DocumentationExists',
      passed: exists,
      details: { file: 'README-REMOTION.md' }
    });

    expect(exists).toBe(true);
  });
});

// ============================================================================
// SUITE 7: HASHTAGS NO VISIBLES EN VIDEO (Prompt 10.1)
// ============================================================================

test.describe('Suite 7: Hashtags NOT Rendered in Video (Prompt 10.1)', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'HashtagsNotRenderedTests' });
  });

  /**
   * Función auxiliar para buscar archivos TSX/TS recursivamente
   * @param dir - Directorio a buscar
   * @returns Array de rutas de archivos
   */
  const findTsxFiles = (dir: string): string[] => {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'node_modules') {
        files.push(...findTsxFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  };

  /**
   * Verifica que los hashtags NO se renderizan visualmente en el video
   * Los hashtags deben estar SOLO en el título de YouTube (metadata),
   * NO visibles dentro del video renderizado.
   *
   * PROMPT 10.1: Remover hashtags visibles del video
   */
  test('hashtags should NOT be rendered visually in video', async () => {
    logger.info('Validando que hashtags NO aparezcan en video');

    const remotionSrcPath = PATHS.src;
    const allFiles = findTsxFiles(remotionSrcPath);

    let hashtagsFoundInVideo = false;
    const filesWithHashtags: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');

      // Remover comentarios para analizar solo código activo
      // Comentarios multilínea /* */ y de línea //
      const uncommentedContent = content
        .replace(/\/\*[\s\S]*?\*\//g, '')  // Comentarios /* */
        .replace(/\/\/.*/g, '');           // Comentarios //

      // Buscar renderizado de hashtags (sin estar comentado)
      // Patrones: .map con tag/tags, <FloatingTags>, #{tag}
      const hasHashtagRendering = (
        (uncommentedContent.includes('FloatingTags') &&
         uncommentedContent.includes('<FloatingTags')) ||
        (uncommentedContent.includes('hashtag') &&
         (uncommentedContent.includes('.map(') || uncommentedContent.includes('map((')))
      );

      // Excluir archivos de tipos y el propio componente FloatingTags
      const isTypeFile = file.includes('types') || file.includes('.types.');
      const isFloatingTagsComponent = file.includes('FloatingTags.tsx');

      if (hasHashtagRendering && !isTypeFile && !isFloatingTagsComponent) {
        hashtagsFoundInVideo = true;
        filesWithHashtags.push(file);
        logger.warn(`⚠️ Hashtags encontrados renderizándose en: ${path.basename(file)}`);
      }
    }

    if (filesWithHashtags.length > 0) {
      logger.error(`❌ Archivos con hashtags visibles: ${filesWithHashtags.map(f => path.basename(f)).join(', ')}`, undefined, { filesWithHashtags });
    }

    logger.logValidationResults({
      validator: 'HashtagsNotRendered',
      passed: !hashtagsFoundInVideo,
      details: {
        filesAnalyzed: allFiles.length,
        filesWithHashtags: filesWithHashtags.map(f => path.basename(f)),
        hashtagsFoundInVideo
      }
    });

    expect(hashtagsFoundInVideo).toBeFalsy();
    logger.info('✅ Hashtags NO aparecen en video (solo en metadata para título YouTube)');
  });

  /**
   * Verifica que la interfaz VideoProps aún tiene la propiedad hashtags
   * para uso en título de YouTube (metadata)
   */
  test('should keep hashtags property in interfaces for YouTube title metadata', async () => {
    logger.info('Verificando que hashtags se mantienen en interfaces para metadata');

    // Buscar archivos que definen interfaces de video
    const videoFile = EXPECTED_FILES.video;
    const contenidoPrincipal = path.join(PATHS.components, 'sequences', 'ContenidoPrincipal.tsx');

    let hashtagsInInterface = false;

    // Verificar en ContenidoPrincipal.tsx que tags sigue en la interfaz
    if (fs.existsSync(contenidoPrincipal)) {
      const content = fs.readFileSync(contenidoPrincipal, 'utf-8');
      hashtagsInInterface = content.includes('tags: string[]') ||
                            content.includes('tags:string[]');
    }

    logger.logValidationResults({
      validator: 'HashtagsInInterface',
      passed: hashtagsInInterface,
      details: {
        hashtagsInInterface,
        purpose: 'YouTube title metadata (not visual rendering)'
      }
    });

    expect(hashtagsInInterface).toBe(true);
    logger.info('✅ Hashtags disponibles en interfaz para título de YouTube');
  });
});
