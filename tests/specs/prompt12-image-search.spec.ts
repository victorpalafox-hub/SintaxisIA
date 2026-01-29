/**
 * @fileoverview Tests de Búsqueda de Imágenes - Prompt 12
 *
 * Valida el sistema de búsqueda inteligente de imágenes:
 * - Existencia de archivos y configuración
 * - Proveedores individuales
 * - Sistema de cascada con fallback
 * - Caché de imágenes
 * - Estructura de 3 imágenes por video
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

const AUTOMATION_SRC = path.join(process.cwd(), 'automation', 'src');

// =============================================================================
// SUITE 1: EXISTENCIA DE ARCHIVOS
// =============================================================================

test.describe('Suite 1: Image Search Files', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ImageSearchFilesTests' });
  });

  /**
   * Verifica que existe image.types.ts
   */
  test('should have image.types.ts file', async () => {
    logger.info('Verificando existencia de image.types.ts');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'image.types.ts');
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'image.types.ts', path: filePath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe image-sources.ts
   */
  test('should have image-sources.ts config file', async () => {
    logger.info('Verificando existencia de image-sources.ts');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'image-sources.ts');
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'image-sources.ts', path: filePath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe image-searcher-v2.ts
   */
  test('should have image-searcher-v2.ts file', async () => {
    logger.info('Verificando existencia de image-searcher-v2.ts');

    const filePath = path.join(AUTOMATION_SRC, 'image-searcher-v2.ts');
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'image-searcher-v2.ts', path: filePath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe image-cache.ts
   */
  test('should have image-cache.ts utility file', async () => {
    logger.info('Verificando existencia de image-cache.ts');

    const filePath = path.join(AUTOMATION_SRC, 'utils', 'image-cache.ts');
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'image-cache.ts', path: filePath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe directorio de proveedores
   */
  test('should have image-providers directory', async () => {
    logger.info('Verificando directorio de proveedores');

    const dirPath = path.join(AUTOMATION_SRC, 'image-providers');
    const exists = fs.existsSync(dirPath);

    logger.logValidationResults({
      validator: 'DirectoryExistence',
      passed: exists,
      details: { directory: 'image-providers', path: dirPath },
    });

    expect(exists).toBe(true);
  });
});

// =============================================================================
// SUITE 2: PROVEEDORES DE IMÁGENES
// =============================================================================

test.describe('Suite 2: Image Providers', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ImageProvidersTests' });
  });

  /**
   * Verifica que existe clearbit-provider.ts
   */
  test('should have clearbit-provider.ts', async () => {
    logger.info('Verificando clearbit-provider.ts');

    const filePath = path.join(
      AUTOMATION_SRC,
      'image-providers',
      'clearbit-provider.ts'
    );
    const exists = fs.existsSync(filePath);

    if (exists) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const hasExport = content.includes('export async function searchClearbit');
      const usesClearbitUrl = content.includes('logo.clearbit.com');

      logger.logValidationResults({
        validator: 'ClearbitProvider',
        passed: hasExport && usesClearbitUrl,
        details: { exists, hasExport, usesClearbitUrl },
      });

      expect(hasExport).toBe(true);
      expect(usesClearbitUrl).toBe(true);
    } else {
      expect(exists).toBe(true);
    }
  });

  /**
   * Verifica que existe logodev-provider.ts
   */
  test('should have logodev-provider.ts', async () => {
    logger.info('Verificando logodev-provider.ts');

    const filePath = path.join(
      AUTOMATION_SRC,
      'image-providers',
      'logodev-provider.ts'
    );
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'LogodevProvider',
      passed: exists,
      details: { file: 'logodev-provider.ts' },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe google-provider.ts
   */
  test('should have google-provider.ts', async () => {
    logger.info('Verificando google-provider.ts');

    const filePath = path.join(
      AUTOMATION_SRC,
      'image-providers',
      'google-provider.ts'
    );
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'GoogleProvider',
      passed: exists,
      details: { file: 'google-provider.ts' },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe unsplash-provider.ts
   */
  test('should have unsplash-provider.ts', async () => {
    logger.info('Verificando unsplash-provider.ts');

    const filePath = path.join(
      AUTOMATION_SRC,
      'image-providers',
      'unsplash-provider.ts'
    );
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'UnsplashProvider',
      passed: exists,
      details: { file: 'unsplash-provider.ts' },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe opengraph-provider.ts
   */
  test('should have opengraph-provider.ts', async () => {
    logger.info('Verificando opengraph-provider.ts');

    const filePath = path.join(
      AUTOMATION_SRC,
      'image-providers',
      'opengraph-provider.ts'
    );
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'OpenGraphProvider',
      passed: exists,
      details: { file: 'opengraph-provider.ts' },
    });

    expect(exists).toBe(true);
  });
});

// =============================================================================
// SUITE 3: CONFIGURACIÓN DE IMÁGENES
// =============================================================================

test.describe('Suite 3: Image Configuration', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ImageConfigTests' });
  });

  /**
   * Verifica que IMAGE_API_CONFIG tiene todos los proveedores
   */
  test('should define IMAGE_API_CONFIG with all providers', async () => {
    logger.info('Verificando IMAGE_API_CONFIG');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'image-sources.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasClearbit = content.includes('clearbit:');
    const hasLogodev = content.includes('logodev:');
    const hasGoogle = content.includes('google:');
    const hasUnsplash = content.includes('unsplash:');
    const hasCache = content.includes('cache:');

    logger.logValidationResults({
      validator: 'ImageApiConfig',
      passed: hasClearbit && hasLogodev && hasGoogle && hasUnsplash && hasCache,
      details: { hasClearbit, hasLogodev, hasGoogle, hasUnsplash, hasCache },
    });

    expect(hasClearbit).toBe(true);
    expect(hasLogodev).toBe(true);
    expect(hasGoogle).toBe(true);
    expect(hasUnsplash).toBe(true);
    expect(hasCache).toBe(true);
  });

  /**
   * Verifica que COMPANY_DOMAIN_MAP tiene empresas principales
   */
  test('should define COMPANY_DOMAIN_MAP with major companies', async () => {
    logger.info('Verificando COMPANY_DOMAIN_MAP');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'image-sources.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasOpenAI = content.includes("'OpenAI': 'openai.com'");
    const hasGoogle = content.includes("'Google': 'google.com'");
    const hasAnthropic = content.includes("'Anthropic': 'anthropic.com'");
    const hasMicrosoft = content.includes("'Microsoft': 'microsoft.com'");

    logger.logValidationResults({
      validator: 'CompanyDomainMap',
      passed: hasOpenAI && hasGoogle && hasAnthropic && hasMicrosoft,
      details: { hasOpenAI, hasGoogle, hasAnthropic, hasMicrosoft },
    });

    expect(hasOpenAI).toBe(true);
    expect(hasGoogle).toBe(true);
    expect(hasAnthropic).toBe(true);
    expect(hasMicrosoft).toBe(true);
  });

  /**
   * Verifica que companyToDomain está exportada
   */
  test('should export companyToDomain function', async () => {
    logger.info('Verificando export de companyToDomain');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'image-sources.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export function companyToDomain');

    logger.logValidationResults({
      validator: 'CompanyToDomainExport',
      passed: hasExport,
      details: { hasExport },
    });

    expect(hasExport).toBe(true);
  });
});

// =============================================================================
// SUITE 4: SISTEMA DE CACHÉ
// =============================================================================

test.describe('Suite 4: Cache System', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'CacheSystemTests' });
  });

  /**
   * Verifica que cache directory existe
   */
  test('should have cache directory', async () => {
    logger.info('Verificando directorio de caché');

    const cachePath = path.join(process.cwd(), 'automation', 'cache', 'images');
    const exists = fs.existsSync(cachePath);

    logger.logValidationResults({
      validator: 'CacheDirectory',
      passed: exists,
      details: { path: cachePath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que .gitkeep existe en cache
   */
  test('should have .gitkeep in cache directory', async () => {
    logger.info('Verificando .gitkeep en caché');

    const gitkeepPath = path.join(
      process.cwd(),
      'automation',
      'cache',
      'images',
      '.gitkeep'
    );
    const exists = fs.existsSync(gitkeepPath);

    logger.logValidationResults({
      validator: 'CacheGitkeep',
      passed: exists,
      details: { path: gitkeepPath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que image-cache.ts exporta funciones principales
   */
  test('should export cache functions', async () => {
    logger.info('Verificando exports de image-cache.ts');

    const filePath = path.join(AUTOMATION_SRC, 'utils', 'image-cache.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasCacheImage = content.includes('export async function cacheImage');
    const hasIsCached = content.includes('export function isCached');
    const hasGetCachePath = content.includes('export function getCachePath');
    const hasCleanOldCache = content.includes('export function cleanOldCache');
    const hasGetCacheSize = content.includes('export function getCacheSize');

    logger.logValidationResults({
      validator: 'CacheFunctions',
      passed:
        hasCacheImage &&
        hasIsCached &&
        hasGetCachePath &&
        hasCleanOldCache &&
        hasGetCacheSize,
      details: {
        hasCacheImage,
        hasIsCached,
        hasGetCachePath,
        hasCleanOldCache,
        hasGetCacheSize,
      },
    });

    expect(hasCacheImage).toBe(true);
    expect(hasIsCached).toBe(true);
    expect(hasGetCachePath).toBe(true);
    expect(hasCleanOldCache).toBe(true);
    expect(hasGetCacheSize).toBe(true);
  });
});

// =============================================================================
// SUITE 5: IMAGE SEARCHER
// =============================================================================

test.describe('Suite 5: Image Searcher', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ImageSearcherTests' });
  });

  /**
   * Verifica que searchImagesV2 está exportada
   */
  test('should export searchImagesV2 function', async () => {
    logger.info('Verificando export de searchImagesV2');

    const filePath = path.join(AUTOMATION_SRC, 'image-searcher-v2.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export async function searchImagesV2');

    logger.logValidationResults({
      validator: 'SearchImagesV2Export',
      passed: hasExport,
      details: { hasExport },
    });

    expect(hasExport).toBe(true);
  });

  /**
   * Verifica que downloadAndCacheImages está exportada
   */
  test('should export downloadAndCacheImages function', async () => {
    logger.info('Verificando export de downloadAndCacheImages');

    const filePath = path.join(AUTOMATION_SRC, 'image-searcher-v2.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes(
      'export async function downloadAndCacheImages'
    );

    logger.logValidationResults({
      validator: 'DownloadAndCacheExport',
      passed: hasExport,
      details: { hasExport },
    });

    expect(hasExport).toBe(true);
  });

  /**
   * Verifica que implementa cascada de proveedores
   */
  test('should implement provider cascade', async () => {
    logger.info('Verificando cascada de proveedores');

    const filePath = path.join(AUTOMATION_SRC, 'image-searcher-v2.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Verificar que menciona los 5 intentos de cascada
    const hasClearbitAttempt = content.includes('Intento 1/5: Clearbit');
    const hasLogodevAttempt = content.includes('Intento 2/5: Logo.dev');
    const hasGoogleAttempt = content.includes('Intento 3/5: Google');
    const hasUnsplashAttempt = content.includes('Intento 4/5: Unsplash');
    const hasUiAvatarsAttempt = content.includes('Intento 5/5: UI Avatars');

    logger.logValidationResults({
      validator: 'ProviderCascade',
      passed:
        hasClearbitAttempt &&
        hasLogodevAttempt &&
        hasGoogleAttempt &&
        hasUnsplashAttempt &&
        hasUiAvatarsAttempt,
      details: {
        hasClearbitAttempt,
        hasLogodevAttempt,
        hasGoogleAttempt,
        hasUnsplashAttempt,
        hasUiAvatarsAttempt,
      },
    });

    expect(hasClearbitAttempt).toBe(true);
    expect(hasLogodevAttempt).toBe(true);
    expect(hasGoogleAttempt).toBe(true);
    expect(hasUnsplashAttempt).toBe(true);
    expect(hasUiAvatarsAttempt).toBe(true);
  });

  /**
   * Verifica que UI Avatars es el fallback garantizado
   */
  test('should have UI Avatars as guaranteed fallback', async () => {
    logger.info('Verificando UI Avatars como fallback');

    const filePath = path.join(AUTOMATION_SRC, 'image-searcher-v2.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasUiAvatarsUrl = content.includes('ui-avatars.com/api');
    const hasUiAvatarsSource =
      content.includes("source: 'ui-avatars'") ||
      content.includes('source: "ui-avatars"');

    logger.logValidationResults({
      validator: 'UiAvatarsFallback',
      passed: hasUiAvatarsUrl && hasUiAvatarsSource,
      details: { hasUiAvatarsUrl, hasUiAvatarsSource },
    });

    expect(hasUiAvatarsUrl).toBe(true);
    expect(hasUiAvatarsSource).toBe(true);
  });
});

// =============================================================================
// SUITE 6: TIPOS DE IMAGEN
// =============================================================================

test.describe('Suite 6: Image Types', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ImageTypesTests' });
  });

  /**
   * Verifica que ImageSearchParams está definida
   */
  test('should define ImageSearchParams interface', async () => {
    logger.info('Verificando interface ImageSearchParams');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'image.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasInterface = content.includes('interface ImageSearchParams');
    const hasTopics = content.includes('topics: string[]');
    const hasCompany = content.includes('company?: string');

    logger.logValidationResults({
      validator: 'ImageSearchParams',
      passed: hasInterface && hasTopics && hasCompany,
      details: { hasInterface, hasTopics, hasCompany },
    });

    expect(hasInterface).toBe(true);
    expect(hasTopics).toBe(true);
    expect(hasCompany).toBe(true);
  });

  /**
   * Verifica que ImageSearchResult está definida
   */
  test('should define ImageSearchResult interface', async () => {
    logger.info('Verificando interface ImageSearchResult');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'image.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasInterface = content.includes('interface ImageSearchResult');
    const hasHero = content.includes('hero:');
    const hasContext = content.includes('context?:');

    logger.logValidationResults({
      validator: 'ImageSearchResult',
      passed: hasInterface && hasHero && hasContext,
      details: { hasInterface, hasHero, hasContext },
    });

    expect(hasInterface).toBe(true);
    expect(hasHero).toBe(true);
    expect(hasContext).toBe(true);
  });

  /**
   * Verifica que HeroImageSource tiene todos los providers
   */
  test('should define HeroImageSource with all providers', async () => {
    logger.info('Verificando tipo HeroImageSource');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'image.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasClearbit = content.includes("'clearbit'");
    const hasLogodev = content.includes("'logodev'");
    const hasGoogle = content.includes("'google'");
    const hasUnsplash = content.includes("'unsplash'");
    const hasUiAvatars = content.includes("'ui-avatars'");

    logger.logValidationResults({
      validator: 'HeroImageSource',
      passed: hasClearbit && hasLogodev && hasGoogle && hasUnsplash && hasUiAvatars,
      details: { hasClearbit, hasLogodev, hasGoogle, hasUnsplash, hasUiAvatars },
    });

    expect(hasClearbit).toBe(true);
    expect(hasLogodev).toBe(true);
    expect(hasGoogle).toBe(true);
    expect(hasUnsplash).toBe(true);
    expect(hasUiAvatars).toBe(true);
  });
});
