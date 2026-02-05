/**
 * @fileoverview Tests para Prompt 13: Video Optimizado
 *
 * Valida la implementación del sistema de video optimizado para 1 noticia:
 * - Timing correcto (8s + 37s + 5s = 50s)
 * - 3 imágenes por video (hero, context, outro hardcoded)
 * - Efectos dinámicos implementados (zoom, parallax, blur, glow)
 * - NO renderiza hashtags (solo metadata)
 * - Nuevos tipos e interfaces
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 13
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURACION
// =============================================================================

const REMOTION_SRC = path.join(process.cwd(), 'remotion-app', 'src');

test.describe('PROMPT 13: Video Optimizado para 1 Noticia', () => {
  let logger: TestLogger;

  test.beforeAll(async () => {
    logger = new TestLogger('prompt13-video-optimized');
    await logger.info('=== INICIANDO SUITE: Video Optimizado Prompt 13 ===');
  });

  test.afterAll(async () => {
    await logger.info('=== FINALIZANDO SUITE: Video Optimizado Prompt 13 ===');
    await logger.close();
  });

  // ===========================================================================
  // SUITE 1: Archivos Creados
  // ===========================================================================

  test.describe('Suite 1: Archivos del Sistema', () => {
    test('should have video.types.ts file', async () => {
      await logger.info('Verificando existencia de video.types.ts');

      const typesPath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
      const exists = fs.existsSync(typesPath);

      expect(exists).toBeTruthy();

      await logger.logValidationResults({
        validator: 'FileExistence',
        passed: exists,
        details: { file: 'video.types.ts', path: typesPath },
      });
    });

    test('should have HeroScene.tsx file', async () => {
      await logger.info('Verificando existencia de HeroScene.tsx');

      const scenePath = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
      const exists = fs.existsSync(scenePath);

      expect(exists).toBeTruthy();

      await logger.logValidationResults({
        validator: 'FileExistence',
        passed: exists,
        details: { file: 'HeroScene.tsx', path: scenePath },
      });
    });

    test('should have ContentScene.tsx file', async () => {
      await logger.info('Verificando existencia de ContentScene.tsx');

      const scenePath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
      const exists = fs.existsSync(scenePath);

      expect(exists).toBeTruthy();

      await logger.logValidationResults({
        validator: 'FileExistence',
        passed: exists,
        details: { file: 'ContentScene.tsx', path: scenePath },
      });
    });

    test('should have OutroScene.tsx file', async () => {
      await logger.info('Verificando existencia de OutroScene.tsx');

      const scenePath = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');
      const exists = fs.existsSync(scenePath);

      expect(exists).toBeTruthy();

      await logger.logValidationResults({
        validator: 'FileExistence',
        passed: exists,
        details: { file: 'OutroScene.tsx', path: scenePath },
      });
    });

    test('should have AINewsShort.tsx composition', async () => {
      await logger.info('Verificando existencia de AINewsShort.tsx');

      const compositionPath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
      const exists = fs.existsSync(compositionPath);

      expect(exists).toBeTruthy();

      await logger.logValidationResults({
        validator: 'FileExistence',
        passed: exists,
        details: { file: 'AINewsShort.tsx', path: compositionPath },
      });
    });
  });

  // ===========================================================================
  // SUITE 2: Timing de Escenas
  // ===========================================================================

  test.describe('Suite 2: Timing de Escenas', () => {
    test('should have optimized timing (8s + 37s + 5s) - Prompt 19.4', async () => {
      await logger.info('Validando timing de escenas en AINewsShort');

      const compositionPath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
      const content = fs.readFileSync(compositionPath, 'utf-8');

      // Buscar definiciones de timing
      const hasHeroTiming = content.includes('8 * fps');
      const hasContentTiming = content.includes('37 * fps');
      // Actualizado de 10 a 5 en Prompt 19.4
      const hasOutroTiming = content.includes('5 * fps');

      expect(hasHeroTiming).toBeTruthy();
      expect(hasContentTiming).toBeTruthy();
      expect(hasOutroTiming).toBeTruthy();

      await logger.logValidationResults({
        validator: 'TimingValidation',
        passed: hasHeroTiming && hasContentTiming && hasOutroTiming,
        details: {
          hero: hasHeroTiming ? '8s' : 'missing',
          content: hasContentTiming ? '37s' : 'missing',
          outro: hasOutroTiming ? '5s' : 'missing', // Actualizado Prompt 19.4
        },
      });
    });

    test('should have 50 seconds default duration - Prompt 19.4', async () => {
      await logger.info('Validando duración default de 50 segundos');

      const compositionPath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
      const content = fs.readFileSync(compositionPath, 'utf-8');

      // Buscar duración default (actualizado de 55 a 50 en Prompt 19.4)
      const hasDuration50 = content.includes('duration ?? 50') || content.includes('duration: 50');

      expect(hasDuration50).toBeTruthy();

      await logger.logValidationResults({
        validator: 'DurationValidation',
        passed: hasDuration50,
        details: { defaultDuration: '50 seconds (Prompt 19.4)' },
      });
    });
  });

  // ===========================================================================
  // SUITE 3: Efectos Dinámicos
  // ===========================================================================

  test.describe('Suite 3: Efectos Dinamicos', () => {
    test('HeroScene should have zoom effect (imageScale)', async () => {
      await logger.info('Validando efecto zoom en HeroScene');

      const heroPath = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
      const content = fs.readFileSync(heroPath, 'utf-8');

      const hasImageScale = content.includes('imageScale');
      const hasZoomValues = content.includes('0.8') && content.includes('1.2');

      expect(hasImageScale).toBeTruthy();
      expect(hasZoomValues).toBeTruthy();

      await logger.logValidationResults({
        validator: 'ZoomEffect',
        passed: hasImageScale && hasZoomValues,
        details: { effect: 'zoom', range: '0.8 -> 1.2' },
      });
    });

    test('HeroScene should have blur effect (imageBlur)', async () => {
      await logger.info('Validando efecto blur en HeroScene');

      const heroPath = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
      const content = fs.readFileSync(heroPath, 'utf-8');

      const hasImageBlur = content.includes('imageBlur');
      const hasBlurToFocus = content.includes('20') && content.includes('0');

      expect(hasImageBlur).toBeTruthy();

      await logger.logValidationResults({
        validator: 'BlurEffect',
        passed: hasImageBlur,
        details: { effect: 'blur-to-focus', hasBlur: hasImageBlur },
      });
    });

    test('HeroScene should have editorial shadow effect (Prompt 20)', async () => {
      await logger.info('Validando editorial shadow en HeroScene');

      const heroPath = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
      const content = fs.readFileSync(heroPath, 'utf-8');

      const hasEditorialShadow = content.includes('editorialShadow');

      expect(hasEditorialShadow).toBeTruthy();

      await logger.logValidationResults({
        validator: 'EditorialShadow',
        passed: hasEditorialShadow,
        details: { effect: 'editorial-shadow' },
      });
    });

    test('HeroScene should have slide up effect (titleY)', async () => {
      await logger.info('Validando efecto slide up en HeroScene');

      const heroPath = path.join(REMOTION_SRC, 'components', 'scenes', 'HeroScene.tsx');
      const content = fs.readFileSync(heroPath, 'utf-8');

      const hasTitleY = content.includes('titleY');
      const hasSlideUp = content.includes('100') && content.includes('0');

      expect(hasTitleY).toBeTruthy();

      await logger.logValidationResults({
        validator: 'SlideUpEffect',
        passed: hasTitleY,
        details: { effect: 'slide-up', hasTitleY },
      });
    });

    test('ContentScene should have parallax effect (parallaxY)', async () => {
      await logger.info('Validando efecto parallax en ContentScene');

      const contentPath = path.join(REMOTION_SRC, 'components', 'scenes', 'ContentScene.tsx');
      const content = fs.readFileSync(contentPath, 'utf-8');

      const hasParallaxY = content.includes('parallaxY');
      const hasDynamicEffects = content.includes('dynamicEffects');

      expect(hasParallaxY).toBeTruthy();
      expect(hasDynamicEffects).toBeTruthy();

      await logger.logValidationResults({
        validator: 'ParallaxEffect',
        passed: hasParallaxY && hasDynamicEffects,
        details: { effect: 'parallax', hasParallaxY, hasDynamicEffects },
      });
    });
  });

  // ===========================================================================
  // SUITE 4: Hashtags NO Renderizados
  // ===========================================================================

  test.describe('Suite 4: Hashtags NO Renderizados', () => {
    test('OutroScene should NOT render hashtags', async () => {
      await logger.info('Validando que OutroScene NO renderiza hashtags');

      const outroPath = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');
      const content = fs.readFileSync(outroPath, 'utf-8');

      // Buscar comentario crítico sobre hashtags
      const hasNoRenderNote = content.includes('NO SE RENDERIZAN') ||
                              content.includes('NO se renderizan') ||
                              content.includes('NO RENDERIZADOS');

      expect(hasNoRenderNote).toBeTruthy();

      // Verificar que NO hay .map de hashtags (sin comentarios)
      const uncommentedContent = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '');

      // Buscar si hay renderizado de hashtags
      const hasHashtagRendering = (
        uncommentedContent.includes('hashtags') &&
        uncommentedContent.includes('.map(') &&
        !uncommentedContent.includes('eslint-disable')
      );

      // No debería renderizar hashtags en JSX
      expect(hasHashtagRendering).toBeFalsy();

      await logger.logValidationResults({
        validator: 'HashtagsNotRendered',
        passed: hasNoRenderNote && !hasHashtagRendering,
        details: {
          hasComment: hasNoRenderNote,
          rendersHashtags: hasHashtagRendering,
        },
      });
    });

    test('OutroScene should have hashtags in props (for metadata)', async () => {
      await logger.info('Validando que OutroScene recibe hashtags como props');

      const outroPath = path.join(REMOTION_SRC, 'components', 'scenes', 'OutroScene.tsx');
      const content = fs.readFileSync(outroPath, 'utf-8');

      // Debe recibir hashtags en props (para metadata de YouTube)
      const hasHashtagsProp = content.includes('hashtags') &&
                               content.includes('OutroSceneProps');

      expect(hasHashtagsProp).toBeTruthy();

      await logger.logValidationResults({
        validator: 'HashtagsInProps',
        passed: hasHashtagsProp,
        details: { hasHashtagsProp, purpose: 'YouTube metadata only' },
      });
    });
  });

  // ===========================================================================
  // SUITE 5: Tipos e Interfaces
  // ===========================================================================

  test.describe('Suite 5: Tipos e Interfaces', () => {
    test('should define VideoProps interface', async () => {
      await logger.info('Validando interface VideoProps');

      const typesPath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
      const content = fs.readFileSync(typesPath, 'utf-8');

      const hasVideoProps = content.includes('interface VideoProps');
      const hasNews = content.includes('news:');
      const hasImages = content.includes('images:');
      const hasAudio = content.includes('audio:');

      expect(hasVideoProps).toBeTruthy();
      expect(hasNews).toBeTruthy();
      expect(hasImages).toBeTruthy();
      expect(hasAudio).toBeTruthy();

      await logger.logValidationResults({
        validator: 'VideoPropsInterface',
        passed: hasVideoProps && hasNews && hasImages && hasAudio,
        details: { hasVideoProps, hasNews, hasImages, hasAudio },
      });
    });

    test('should define NewsType type', async () => {
      await logger.info('Validando tipo NewsType');

      const typesPath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
      const content = fs.readFileSync(typesPath, 'utf-8');

      const hasNewsType = content.includes('type NewsType');
      const hasProductLaunch = content.includes('product-launch');
      const hasModelRelease = content.includes('model-release');

      expect(hasNewsType).toBeTruthy();
      expect(hasProductLaunch).toBeTruthy();

      await logger.logValidationResults({
        validator: 'NewsTypeDefinition',
        passed: hasNewsType && hasProductLaunch,
        details: { hasNewsType, hasProductLaunch, hasModelRelease },
      });
    });

    test('should define enhancedEffects config option', async () => {
      await logger.info('Validando opción enhancedEffects en config');

      const typesPath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
      const content = fs.readFileSync(typesPath, 'utf-8');

      const hasEnhancedEffects = content.includes('enhancedEffects');

      expect(hasEnhancedEffects).toBeTruthy();

      await logger.logValidationResults({
        validator: 'EnhancedEffectsConfig',
        passed: hasEnhancedEffects,
        details: { hasEnhancedEffects },
      });
    });

    test('should support 3 images (hero, context, outro)', async () => {
      await logger.info('Validando soporte de 3 imágenes');

      const typesPath = path.join(REMOTION_SRC, 'types', 'video.types.ts');
      const content = fs.readFileSync(typesPath, 'utf-8');

      // Verificar que images tiene hero y context
      const hasHeroImage = content.includes('hero:') || content.includes('hero?:');
      const hasContextImage = content.includes('context?:') || content.includes('context:');

      expect(hasHeroImage).toBeTruthy();
      expect(hasContextImage).toBeTruthy();

      await logger.logValidationResults({
        validator: 'ThreeImagesSupport',
        passed: hasHeroImage && hasContextImage,
        details: {
          hero: hasHeroImage,
          context: hasContextImage,
          outro: 'hardcoded in OutroScene',
        },
      });
    });
  });

  // ===========================================================================
  // SUITE 6: Composición AINewsShort
  // ===========================================================================

  test.describe('Suite 6: Composicion AINewsShort', () => {
    test('should import all three scenes', async () => {
      await logger.info('Validando imports de escenas en AINewsShort');

      const compositionPath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
      const content = fs.readFileSync(compositionPath, 'utf-8');

      const hasHeroImport = content.includes("from '../components/scenes/HeroScene'");
      const hasContentImport = content.includes("from '../components/scenes/ContentScene'");
      const hasOutroImport = content.includes("from '../components/scenes/OutroScene'");

      expect(hasHeroImport).toBeTruthy();
      expect(hasContentImport).toBeTruthy();
      expect(hasOutroImport).toBeTruthy();

      await logger.logValidationResults({
        validator: 'SceneImports',
        passed: hasHeroImport && hasContentImport && hasOutroImport,
        details: { hasHeroImport, hasContentImport, hasOutroImport },
      });
    });

    test('should use Sequence for each scene', async () => {
      await logger.info('Validando uso de Sequence para cada escena');

      const compositionPath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
      const content = fs.readFileSync(compositionPath, 'utf-8');

      // Contar cuántas veces aparece <Sequence
      const sequenceMatches = content.match(/<Sequence/g);
      const sequenceCount = sequenceMatches ? sequenceMatches.length : 0;

      // Debe haber al menos 3 sequences (Hero, Content, Outro)
      expect(sequenceCount).toBeGreaterThanOrEqual(3);

      await logger.logValidationResults({
        validator: 'SequenceUsage',
        passed: sequenceCount >= 3,
        details: { sequenceCount, expected: 3 },
      });
    });

    test('should include AudioMixer component', async () => {
      await logger.info('Validando inclusión de AudioMixer');

      const compositionPath = path.join(REMOTION_SRC, 'compositions', 'AINewsShort.tsx');
      const content = fs.readFileSync(compositionPath, 'utf-8');

      const hasAudioMixerImport = content.includes('AudioMixer');
      const hasAudioMixerUsage = content.includes('<AudioMixer');

      expect(hasAudioMixerImport).toBeTruthy();
      expect(hasAudioMixerUsage).toBeTruthy();

      await logger.logValidationResults({
        validator: 'AudioMixerInclusion',
        passed: hasAudioMixerImport && hasAudioMixerUsage,
        details: { hasAudioMixerImport, hasAudioMixerUsage },
      });
    });

    test('Root.tsx should include AINewsShort composition', async () => {
      await logger.info('Validando inclusión de AINewsShort en Root.tsx');

      const rootPath = path.join(REMOTION_SRC, 'Root.tsx');
      const content = fs.readFileSync(rootPath, 'utf-8');

      const hasAINewsShortImport = content.includes('AINewsShort');
      const hasAINewsShortComposition = content.includes('id="AINewsShort"');

      expect(hasAINewsShortImport).toBeTruthy();
      expect(hasAINewsShortComposition).toBeTruthy();

      await logger.logValidationResults({
        validator: 'RootComposition',
        passed: hasAINewsShortImport && hasAINewsShortComposition,
        details: { hasAINewsShortImport, hasAINewsShortComposition },
      });
    });
  });
});
