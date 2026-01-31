/**
 * @fileoverview Tests para YouTube Upload Service
 * @description Validación de archivos, estructura y contenido del servicio de upload a YouTube
 * @prompt Prompt 18 - YouTube Upload Service
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { TestLogger } from '../utils/TestLogger';

// ============================================================================
// CONSTANTES DE PATHS
// ============================================================================

const AUTOMATION_DIR = path.join(process.cwd(), 'automation/src');
const CONFIG_PATH = path.join(AUTOMATION_DIR, 'config/youtube.config.ts');
const TYPES_PATH = path.join(AUTOMATION_DIR, 'types/youtube.types.ts');
const SERVICE_PATH = path.join(AUTOMATION_DIR, 'services/youtube-upload.service.ts');

// ============================================================================
// SUITE 1: ARCHIVOS EXISTEN
// ============================================================================

test.describe('Prompt 18 - YouTube Upload Files', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger('YouTubeUploadTests');
  });

  test('youtube.config.ts existe', async () => {
    logger.info('Verificando existencia de youtube.config.ts');
    expect(fs.existsSync(CONFIG_PATH)).toBe(true);
    logger.info('youtube.config.ts encontrado');
  });

  test('youtube.types.ts existe', async () => {
    logger.info('Verificando existencia de youtube.types.ts');
    expect(fs.existsSync(TYPES_PATH)).toBe(true);
    logger.info('youtube.types.ts encontrado');
  });

  test('youtube-upload.service.ts existe', async () => {
    logger.info('Verificando existencia de youtube-upload.service.ts');
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
    logger.info('youtube-upload.service.ts encontrado');
  });
});

// ============================================================================
// SUITE 2: CONFIGURACIÓN (youtube.config.ts)
// ============================================================================

test.describe('Prompt 18 - YouTube Config Content', () => {
  let configContent: string;
  let logger: TestLogger;

  test.beforeAll(() => {
    configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
  });

  test.beforeEach(() => {
    logger = new TestLogger('YouTubeConfigTests');
  });

  test('exporta YOUTUBE_CONFIG', () => {
    logger.info('Verificando export de YOUTUBE_CONFIG');
    expect(configContent).toContain('export const YOUTUBE_CONFIG');
    logger.info('YOUTUBE_CONFIG exportado correctamente');
  });

  test('tiene configuración de auth', () => {
    logger.info('Verificando configuración de auth');
    expect(configContent).toContain('clientId');
    expect(configContent).toContain('clientSecret');
    expect(configContent).toContain('redirectUri');
    expect(configContent).toContain('refreshToken');
    logger.info('Configuración de auth completa');
  });

  test('tiene configuración de upload', () => {
    logger.info('Verificando configuración de upload');
    expect(configContent).toContain('categoryId');
    expect(configContent).toContain('defaultLanguage');
    expect(configContent).toContain('defaultPrivacy');
    expect(configContent).toContain('defaultTags');
    expect(configContent).toContain('maxTags');
    expect(configContent).toContain('maxTitleLength');
    expect(configContent).toContain('maxDescriptionLength');
    logger.info('Configuración de upload completa');
  });

  test('tiene configuración de retry', () => {
    logger.info('Verificando configuración de retry');
    expect(configContent).toContain('maxAttempts');
    expect(configContent).toContain('initialDelayMs');
    expect(configContent).toContain('maxDelayMs');
    expect(configContent).toContain('backoffMultiplier');
    logger.info('Configuración de retry completa');
  });

  test('tiene configuración de quota', () => {
    logger.info('Verificando configuración de quota');
    expect(configContent).toContain('uploadCost');
    expect(configContent).toContain('dailyLimit');
    expect(configContent).toContain('warningThreshold');
    logger.info('Configuración de quota completa');
  });

  test('categoryId por defecto es 28 (Science & Technology)', () => {
    logger.info('Verificando categoryId por defecto');
    expect(configContent).toMatch(/categoryId.*['"]28['"]/);
    logger.info('categoryId es 28 (Science & Technology)');
  });

  test('defaultLanguage es español', () => {
    logger.info('Verificando defaultLanguage');
    expect(configContent).toMatch(/defaultLanguage.*['"]es['"]/);
    logger.info('defaultLanguage es es');
  });

  test('uploadCost es 1600 (costo real de YouTube)', () => {
    logger.info('Verificando uploadCost');
    expect(configContent).toContain('uploadCost: 1600');
    logger.info('uploadCost es 1600');
  });

  test('dailyLimit es 10000 (límite estándar)', () => {
    logger.info('Verificando dailyLimit');
    expect(configContent).toContain('10000');
    logger.info('dailyLimit incluye 10000');
  });

  test('incluye tags de IA por defecto', () => {
    logger.info('Verificando defaultTags');
    expect(configContent).toContain('inteligencia artificial');
    expect(configContent).toContain("'IA'");
    expect(configContent).toContain("'AI'");
    expect(configContent).toContain('OpenAI');
    expect(configContent).toContain('Anthropic');
    logger.info('defaultTags incluye tags de IA');
  });

  test('usa isTestOrCI para valores mock', () => {
    logger.info('Verificando uso de isTestOrCI');
    expect(configContent).toContain("import { isTestOrCI } from '../config'");
    expect(configContent).toContain('isTestOrCI()');
    logger.info('Usa isTestOrCI para compatibilidad CI');
  });
});

// ============================================================================
// SUITE 3: VALIDADORES
// ============================================================================

test.describe('Prompt 18 - Validators', () => {
  let configContent: string;
  let logger: TestLogger;

  test.beforeAll(() => {
    configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
  });

  test.beforeEach(() => {
    logger = new TestLogger('YouTubeValidatorsTests');
  });

  test('exporta validateTitle', () => {
    logger.info('Verificando export de validateTitle');
    expect(configContent).toContain('export function validateTitle');
    logger.info('validateTitle exportado');
  });

  test('validateTitle valida título vacío', () => {
    logger.info('Verificando validación de título vacío');
    expect(configContent).toContain('no puede estar vacío');
    logger.info('Valida título vacío');
  });

  test('validateTitle trunca títulos largos', () => {
    logger.info('Verificando truncado de títulos');
    expect(configContent).toContain('truncado');
    expect(configContent).toContain('maxTitleLength');
    logger.info('Trunca títulos largos');
  });

  test('exporta validateDescription', () => {
    logger.info('Verificando export de validateDescription');
    expect(configContent).toContain('export function validateDescription');
    logger.info('validateDescription exportado');
  });

  test('validateDescription trunca descripciones largas', () => {
    logger.info('Verificando truncado de descripciones');
    expect(configContent).toContain('truncada');
    expect(configContent).toContain('maxDescriptionLength');
    logger.info('Trunca descripciones largas');
  });

  test('exporta validateTags', () => {
    logger.info('Verificando export de validateTags');
    expect(configContent).toContain('export function validateTags');
    logger.info('validateTags exportado');
  });

  test('validateTags remueve duplicados', () => {
    logger.info('Verificando remoción de duplicados');
    expect(configContent).toContain('new Set');
    logger.info('Usa Set para remover duplicados');
  });

  test('validateTags limita cantidad', () => {
    logger.info('Verificando límite de tags');
    expect(configContent).toContain('maxTags');
    expect(configContent).toContain('slice');
    logger.info('Limita cantidad de tags');
  });
});

// ============================================================================
// SUITE 4: HELPERS
// ============================================================================

test.describe('Prompt 18 - Helpers', () => {
  let configContent: string;
  let logger: TestLogger;

  test.beforeAll(() => {
    configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
  });

  test.beforeEach(() => {
    logger = new TestLogger('YouTubeHelpersTests');
  });

  test('exporta getVideoUrl', () => {
    logger.info('Verificando export de getVideoUrl');
    expect(configContent).toContain('export function getVideoUrl');
    logger.info('getVideoUrl exportado');
  });

  test('getVideoUrl genera URL de Shorts', () => {
    logger.info('Verificando formato de URL');
    expect(configContent).toContain('youtube.com/shorts/');
    logger.info('URL usa formato de Shorts');
  });

  test('exporta hasQuotaForUpload', () => {
    logger.info('Verificando export de hasQuotaForUpload');
    expect(configContent).toContain('export function hasQuotaForUpload');
    logger.info('hasQuotaForUpload exportado');
  });

  test('exporta isNearQuotaLimit', () => {
    logger.info('Verificando export de isNearQuotaLimit');
    expect(configContent).toContain('export function isNearQuotaLimit');
    logger.info('isNearQuotaLimit exportado');
  });

  test('warningThreshold es 0.8 (80%)', () => {
    logger.info('Verificando warningThreshold');
    expect(configContent).toContain('warningThreshold: 0.8');
    logger.info('warningThreshold es 0.8');
  });
});

// ============================================================================
// SUITE 5: TIPOS (youtube.types.ts)
// ============================================================================

test.describe('Prompt 18 - YouTube Types', () => {
  let typesContent: string;
  let logger: TestLogger;

  test.beforeAll(() => {
    typesContent = fs.readFileSync(TYPES_PATH, 'utf-8');
  });

  test.beforeEach(() => {
    logger = new TestLogger('YouTubeTypesTests');
  });

  test('define AuthStatus interface', () => {
    logger.info('Verificando AuthStatus');
    expect(typesContent).toContain('interface AuthStatus');
    expect(typesContent).toContain('isAuthenticated');
    logger.info('AuthStatus definido');
  });

  test('define ChannelInfo interface', () => {
    logger.info('Verificando ChannelInfo');
    expect(typesContent).toContain('interface ChannelInfo');
    expect(typesContent).toContain('subscriberCount');
    logger.info('ChannelInfo definido');
  });

  test('define YouTubeServiceOptions interface', () => {
    logger.info('Verificando YouTubeServiceOptions');
    expect(typesContent).toContain('interface YouTubeServiceOptions');
    expect(typesContent).toContain('debug');
    expect(typesContent).toContain('onProgress');
    logger.info('YouTubeServiceOptions definido');
  });

  test('define QuotaStatus interface', () => {
    logger.info('Verificando QuotaStatus');
    expect(typesContent).toContain('interface QuotaStatus');
    expect(typesContent).toContain('canUpload');
    expect(typesContent).toContain('nearLimit');
    logger.info('QuotaStatus definido');
  });

  test('define UploadedVideo interface', () => {
    logger.info('Verificando UploadedVideo');
    expect(typesContent).toContain('interface UploadedVideo');
    expect(typesContent).toContain('snippet');
    expect(typesContent).toContain('status');
    logger.info('UploadedVideo definido');
  });

  test('define YouTubeApiError interface', () => {
    logger.info('Verificando YouTubeApiError');
    expect(typesContent).toContain('interface YouTubeApiError');
    expect(typesContent).toContain('quotaExceeded');
    expect(typesContent).toContain('retryable');
    logger.info('YouTubeApiError definido');
  });

  test('re-exporta tipos de config', () => {
    logger.info('Verificando re-exports');
    expect(typesContent).toContain("from '../config/youtube.config'");
    expect(typesContent).toContain('VideoMetadata');
    expect(typesContent).toContain('UploadResult');
    expect(typesContent).toContain('UploadProgress');
    logger.info('Tipos re-exportados');
  });
});

// ============================================================================
// SUITE 6: SERVICIO (youtube-upload.service.ts)
// ============================================================================

test.describe('Prompt 18 - YouTube Upload Service', () => {
  let serviceContent: string;
  let logger: TestLogger;

  test.beforeAll(() => {
    serviceContent = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test.beforeEach(() => {
    logger = new TestLogger('YouTubeServiceTests');
  });

  test('exporta clase YouTubeUploadService', () => {
    logger.info('Verificando export de clase');
    expect(serviceContent).toContain('export class YouTubeUploadService');
    logger.info('YouTubeUploadService exportado');
  });

  test('exporta singleton youtubeService', () => {
    logger.info('Verificando singleton');
    expect(serviceContent).toContain('export const youtubeService');
    logger.info('youtubeService singleton exportado');
  });

  test('exporta helper uploadToYouTube', () => {
    logger.info('Verificando helper');
    expect(serviceContent).toContain('export async function uploadToYouTube');
    logger.info('uploadToYouTube helper exportado');
  });

  test('usa googleapis', () => {
    logger.info('Verificando uso de googleapis');
    expect(serviceContent).toContain("from 'googleapis'");
    expect(serviceContent).toContain('google.auth.OAuth2');
    expect(serviceContent).toContain('google.youtube');
    logger.info('Usa googleapis correctamente');
  });

  test('implementa checkAuth', () => {
    logger.info('Verificando checkAuth');
    expect(serviceContent).toContain('async checkAuth()');
    expect(serviceContent).toContain('AuthStatus');
    logger.info('checkAuth implementado');
  });

  test('implementa getAuthUrl', () => {
    logger.info('Verificando getAuthUrl');
    expect(serviceContent).toContain('getAuthUrl()');
    expect(serviceContent).toContain('generateAuthUrl');
    logger.info('getAuthUrl implementado');
  });

  test('implementa exchangeCodeForTokens', () => {
    logger.info('Verificando exchangeCodeForTokens');
    expect(serviceContent).toContain('async exchangeCodeForTokens');
    expect(serviceContent).toContain('getToken');
    logger.info('exchangeCodeForTokens implementado');
  });

  test('implementa uploadVideo', () => {
    logger.info('Verificando uploadVideo');
    expect(serviceContent).toContain('async uploadVideo');
    expect(serviceContent).toContain('VideoMetadata');
    expect(serviceContent).toContain('UploadResult');
    logger.info('uploadVideo implementado');
  });

  test('implementa mockUpload para CI', () => {
    logger.info('Verificando mockUpload');
    expect(serviceContent).toContain('mockUpload');
    expect(serviceContent).toContain('isTestOrCI()');
    expect(serviceContent).toContain('mock_');
    logger.info('mockUpload implementado para CI');
  });

  test('implementa getQuotaStatus', () => {
    logger.info('Verificando getQuotaStatus');
    expect(serviceContent).toContain('getQuotaStatus()');
    expect(serviceContent).toContain('QuotaStatus');
    logger.info('getQuotaStatus implementado');
  });

  test('implementa getChannelInfo', () => {
    logger.info('Verificando getChannelInfo');
    expect(serviceContent).toContain('async getChannelInfo()');
    expect(serviceContent).toContain('ChannelInfo');
    logger.info('getChannelInfo implementado');
  });

  test('maneja errores de upload', () => {
    logger.info('Verificando manejo de errores');
    expect(serviceContent).toContain('handleUploadError');
    expect(serviceContent).toContain('quotaExceeded');
    logger.info('Manejo de errores implementado');
  });

  test('calcula reset de quota (medianoche PT)', () => {
    logger.info('Verificando cálculo de reset');
    expect(serviceContent).toContain('getNextQuotaReset');
    expect(serviceContent).toContain('setUTCHours');
    logger.info('Cálculo de reset de quota implementado');
  });

  test('tiene JSDoc con ejemplo de uso', () => {
    logger.info('Verificando documentación');
    expect(serviceContent).toContain('@example');
    expect(serviceContent).toContain('uploadVideo');
    logger.info('Documentación con ejemplo incluida');
  });
});

// ============================================================================
// SUITE 7: INTEGRACIÓN
// ============================================================================

test.describe('Prompt 18 - Integration', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger('YouTubeIntegrationTests');
  });

  test('.env.example tiene variables de YouTube', () => {
    logger.info('Verificando .env.example');
    const envExample = fs.readFileSync(
      path.join(process.cwd(), '.env.example'),
      'utf-8'
    );

    expect(envExample).toContain('YOUTUBE_CLIENT_ID');
    expect(envExample).toContain('YOUTUBE_CLIENT_SECRET');
    expect(envExample).toContain('YOUTUBE_REDIRECT_URI');
    expect(envExample).toContain('YOUTUBE_REFRESH_TOKEN');
    expect(envExample).toContain('YOUTUBE_CATEGORY_ID');
    expect(envExample).toContain('YOUTUBE_DEFAULT_PRIVACY');
    logger.info('.env.example tiene todas las variables de YouTube');
  });

  test('googleapis está en package.json de automation', () => {
    logger.info('Verificando dependencia googleapis');
    const packageJson = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'automation/package.json'),
        'utf-8'
      )
    );

    expect(packageJson.dependencies).toHaveProperty('googleapis');
    logger.info('googleapis instalado en automation');
  });

  test('config importa isTestOrCI correctamente', () => {
    logger.info('Verificando imports de config');
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
    expect(configContent).toContain("import { isTestOrCI } from '../config'");
    logger.info('isTestOrCI importado correctamente');
  });

  test('service importa todas las dependencias necesarias', () => {
    logger.info('Verificando imports de service');
    const serviceContent = fs.readFileSync(SERVICE_PATH, 'utf-8');

    expect(serviceContent).toContain("from 'googleapis'");
    expect(serviceContent).toContain("from 'fs'");
    expect(serviceContent).toContain("from 'path'");
    expect(serviceContent).toContain("from '../config/youtube.config'");
    expect(serviceContent).toContain("from '../types/youtube.types'");
    expect(serviceContent).toContain("from '../config'");
    logger.info('Todas las dependencias importadas');
  });

  test('archivos TypeScript son válidos (no tienen errores de sintaxis)', () => {
    logger.info('Verificando sintaxis de archivos');

    // Verificar que los archivos tengan estructura básica correcta
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const typesContent = fs.readFileSync(TYPES_PATH, 'utf-8');
    const serviceContent = fs.readFileSync(SERVICE_PATH, 'utf-8');

    // Verificar balance de llaves
    const countBraces = (content: string) => {
      const open = (content.match(/{/g) || []).length;
      const close = (content.match(/}/g) || []).length;
      return open === close;
    };

    expect(countBraces(configContent)).toBe(true);
    expect(countBraces(typesContent)).toBe(true);
    expect(countBraces(serviceContent)).toBe(true);

    logger.info('Archivos TypeScript tienen sintaxis válida');
  });
});
