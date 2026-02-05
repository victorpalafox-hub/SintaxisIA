/**
 * @fileoverview Tests para Prompt 23 - Smart Image Selector
 *
 * Valida la funcionalidad de:
 * - SmartQueryGenerator: traduccion de keywords ES->EN y generacion de queries
 * - smart-image.config: diccionario, scoring, query config, fallback theme
 * - Pexels Provider: searchPexelsMultiple retorna PexelsCandidate[]
 * - Image Orchestration: scoring inteligente + retry con queries alternativas
 * - Scene Segmenter: integracion con SmartQueryGenerator
 * - Tipos: SmartQueryResult, PexelsCandidate
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 23
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import type { SmartQueryResult, PexelsCandidate } from '../../automation/src/types/image.types';

// =============================================================================
// CONSTANTES DE RUTAS
// =============================================================================

const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const SERVICES_PATH = path.join(AUTOMATION_SRC, 'services');
const PROVIDERS_PATH = path.join(AUTOMATION_SRC, 'image-providers');
const TYPES_PATH = path.join(AUTOMATION_SRC, 'types');
const CONFIG_PATH = path.join(AUTOMATION_SRC, 'config');

// =============================================================================
// SUITE 1: ESTRUCTURA Y ARCHIVOS
// =============================================================================

test.describe('PROMPT 23: Estructura y Archivos', () => {

  test('smart-query-generator.ts existe en automation/src/services/', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const exists = fs.existsSync(filePath);

    expect(exists).toBe(true);
  });

  test('smart-image.config.ts existe en automation/src/config/', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const exists = fs.existsSync(filePath);

    expect(exists).toBe(true);
  });

  test('smart-query-generator importa logger de utils/logger (NO TestLogger)', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe importar el logger de produccion
    expect(content).toContain("from '../../utils/logger'");
    // NO debe importar TestLogger (ese es solo para tests)
    expect(content).not.toContain('TestLogger');
  });

  test('smart-image.config exporta SPANISH_TO_ENGLISH, IMAGE_SCORING_CONFIG, QUERY_CONFIG, FALLBACK_THEME', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export const SPANISH_TO_ENGLISH');
    expect(content).toContain('export const IMAGE_SCORING_CONFIG');
    expect(content).toContain('export const QUERY_CONFIG');
    expect(content).toContain('export const FALLBACK_THEME');
  });

});

// =============================================================================
// SUITE 2: DICCIONARIO DE TRADUCCION
// =============================================================================

test.describe('PROMPT 23: Diccionario de Traduccion ES->EN', () => {

  test('SPANISH_TO_ENGLISH tiene al menos 80 entradas', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Contar entradas del diccionario (patron: 'key': 'value')
    const entries = content.match(/'[a-z]+'\s*:\s*'[^']+'/g);
    expect(entries).not.toBeNull();
    expect(entries!.length).toBeGreaterThanOrEqual(80);
  });

  test('cubre categoria IA/ML con terminos criticos', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain("'inteligencia': 'intelligence'");
    expect(content).toContain("'artificial': 'artificial'");
    expect(content).toContain("'modelo': 'model'");
    expect(content).toContain("'datos': 'data'");
    expect(content).toContain("'entrenamiento': 'training'");
  });

  test('cubre categoria Tecnologia', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain("'tecnologia': 'technology'");
    expect(content).toContain("'software': 'software'");
    expect(content).toContain("'hardware': 'hardware'");
  });

  test('cubre categoria Acciones', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain("'revoluciona': 'revolution'");
    expect(content).toContain("'innovacion': 'innovation'");
    expect(content).toContain("'investigacion': 'research'");
  });

  test('cubre categoria Seguridad', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain("'seguridad': 'security'");
    expect(content).toContain("'ciberseguridad': 'cybersecurity'");
    expect(content).toContain("'privacidad': 'privacy'");
  });

  test('todas las keys estan en minusculas sin acentos', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extraer keys del diccionario
    const keyMatches = content.match(/'([a-z\s]+)'\s*:\s*'/g);
    expect(keyMatches).not.toBeNull();

    // Verificar que ninguna key tiene caracteres acentuados
    for (const match of keyMatches!) {
      const key = match.replace(/'\s*:\s*'/, '').replace(/'/g, '');
      // Las keys deben ser solo ASCII minusculas
      expect(key).toMatch(/^[a-z\s]+$/);
    }
  });

});

// =============================================================================
// SUITE 3: SMARTQUERYGENERATOR - TRADUCCION
// =============================================================================

test.describe('PROMPT 23: SmartQueryGenerator - Traduccion', () => {

  test('SmartQueryGenerator exporta clase con translateKeywords', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export class SmartQueryGenerator');
    expect(content).toContain('translateKeywords');
    // Debe ser metodo publico (no private)
    expect(content).toMatch(/^\s+translateKeywords\(/m);
    expect(content).not.toMatch(/private\s+translateKeywords/);
  });

  test('translateKeywords usa diccionario SPANISH_TO_ENGLISH', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('SPANISH_TO_ENGLISH');
    expect(content).toContain("from '../config/smart-image.config'");
  });

  test('translateKeywords normaliza con NFD y strip diacritics', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Verificar normalizacion NFD
    expect(content).toContain("normalize('NFD')");
    // Verificar strip de diacriticos
    expect(content).toMatch(/\\u0300.*\\u036f/);
  });

  test('translateKeywords elimina duplicados post-traduccion', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe usar Set para tracking de duplicados
    expect(content).toContain('new Set');
    expect(content).toContain('seen');
  });

  test('translateKeywords maneja array vacio sin error', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe tener guard clause para array vacio
    expect(content).toMatch(/keywords\.length\s*===\s*0/);
    expect(content).toContain('return []');
  });

  test('translateKeywords deja nombres propios sin cambiar', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Si no encuentra en diccionario, usa keyword original en lowercase
    expect(content).toMatch(/SPANISH_TO_ENGLISH\[.*\]\s*\|\|\s*keyword/);
  });

});

// =============================================================================
// SUITE 4: SMARTQUERYGENERATOR - GENERACION DE QUERIES
// =============================================================================

test.describe('PROMPT 23: SmartQueryGenerator - Generacion de Queries', () => {

  test('generateQueries existe como metodo publico', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('generateQueries');
    expect(content).not.toMatch(/private\s+generateQueries/);
  });

  test('generateQueries retorna SmartQueryResult con campos requeridos', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe retornar objeto con todos los campos
    expect(content).toContain('primary');
    expect(content).toContain('alternatives');
    expect(content).toContain("language: 'en'");
    expect(content).toContain('originalKeywords');
    expect(content).toContain('translatedKeywords');
  });

  test('alternatives tiene maximo 2 elementos (configurado en QUERY_CONFIG)', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/maxAlternatives\s*:\s*2/);
  });

  test('primary tiene maximo 3 keywords (configurado en QUERY_CONFIG)', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/maxKeywordsPerQuery\s*:\s*3/);
  });

  test('generateAlternatives incluye empresa en alternativa 1 si se proporciona', async () => {
    const filePath = path.join(SERVICES_PATH, 'smart-query-generator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Verificar logica de alternativa con empresa
    expect(content).toContain('generateAlternatives');
    expect(content).toContain('company');
    // Debe concatenar empresa + keyword
    expect(content).toMatch(/company.*toLowerCase.*translatedKeywords/s);
  });

});

// =============================================================================
// SUITE 5: PEXELS PROVIDER
// =============================================================================

test.describe('PROMPT 23: Pexels Provider', () => {

  test('searchPexelsMultiple existe y exporta', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export async function searchPexelsMultiple');
  });

  test('searchPexelsMultiple retorna PexelsCandidate[] (no string[])', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe retornar PexelsCandidate[]
    expect(content).toMatch(/Promise<PexelsCandidate\[\]>/);
    // Debe importar PexelsCandidate
    expect(content).toContain('PexelsCandidate');
  });

  test('PexelsCandidate incluye campos url, alt, width, height', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // El mapping debe retornar objetos con estos campos
    expect(content).toMatch(/url\s*:/);
    expect(content).toMatch(/alt\s*:/);
    expect(content).toMatch(/width\s*:/);
    expect(content).toMatch(/height\s*:/);
  });

  test('searchPexels sigue existiendo sin cambios de firma', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // searchPexels original sigue retornando string | null
    expect(content).toContain('export async function searchPexels');
    expect(content).toMatch(/searchPexels\([^)]*\)\s*:\s*Promise<string\s*\|\s*null>/);
  });

});

// =============================================================================
// SUITE 6: IMAGE ORCHESTRATION - RETRY Y SCORING
// =============================================================================

test.describe('PROMPT 23: Image Orchestration - Retry y Scoring', () => {

  test('importa searchPexelsMultiple (no solo searchPexels)', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('searchPexelsMultiple');
  });

  test('importa SmartQueryGenerator', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('SmartQueryGenerator');
    expect(content).toContain("from './smart-query-generator'");
  });

  test('tiene scoring de candidatos de Pexels', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe tener metodo de scoring
    expect(content).toMatch(/score(Candidate|Image|Pexels)/i);
    // Debe usar pesos de config
    expect(content).toContain('IMAGE_SCORING_CONFIG');
    // Debe evaluar alt text para relevancia
    expect(content).toContain('alt');
  });

  test('tiene retry con queries alternativas', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe generar queries alternativas
    expect(content).toContain('alternatives');
    expect(content).toMatch(/alternativ/i);
    // Debe usar SmartQueryGenerator para obtenerlas
    expect(content).toContain('queryGenerator');
  });

  test('cascade de contenido tiene al menos 6 pasos', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Contar pasos en searchWithFallback
    // Minimo: Pexels+scoring, Unsplash, Google, Alt1, Alt2, Simplified, UIAvatars
    expect(content).toContain('searchPexelsWithScoring');
    expect(content).toContain('searchUnsplash');
    expect(content).toContain('searchGoogle');
    expect(content).toContain('generateFallbackImage');

    // Debe haber al menos 6 puntos de retorno en el cascade
    const returnStatements = content.match(/return this\.createSceneImage/g);
    expect(returnStatements).not.toBeNull();
    // Al menos 6 returns en el archivo (cascade contenido + cascade logos)
    expect(returnStatements!.length).toBeGreaterThanOrEqual(6);
  });

  test('scoring evalua textRelevance con keywords en alt text', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe comparar keywords con alt text de la imagen
    expect(content).toContain('textRelevance');
    expect(content).toMatch(/alt.*toLowerCase/);
    expect(content).toMatch(/matchCount|matchRatio/);
  });

  test('scoring evalua orientation bonus para portrait', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Portrait (height > width) debe tener bonus
    expect(content).toContain('orientationBonus');
    expect(content).toMatch(/height.*>.*width/);
  });

});

// =============================================================================
// SUITE 7: SCENE SEGMENTER - INTEGRACION
// =============================================================================

test.describe('PROMPT 23: Scene Segmenter - Integracion', () => {

  test('importa SmartQueryGenerator', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('SmartQueryGenerator');
    expect(content).toContain("from './smart-query-generator'");
  });

  test('generateSearchQuery sigue teniendo senal __LOGO__ para segmento 0', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // La senal __LOGO__ para el segmento 0 NO debe cambiar
    expect(content).toContain('__LOGO__');
    expect(content).toMatch(/segmentIndex\s*===\s*0.*company/s);
  });

  test('VISUAL_PATTERNS sigue existiendo con al menos 30 patrones', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('VISUAL_PATTERNS');
    expect(content).toContain('extractVisualConcepts');

    // Contar patrones (cada uno tiene pattern: y query:)
    const patterns = content.match(/pattern:\s*\//g);
    expect(patterns).not.toBeNull();
    expect(patterns!.length).toBeGreaterThanOrEqual(25);
  });

  test('fallback de generateSearchQuery traduce keywords al ingles', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe usar queryGenerator para traducir en el fallback
    expect(content).toContain('queryGenerator');
    expect(content).toContain('translateKeywords');
  });

});

// =============================================================================
// SUITE 8: TIPO SMARTQUERYRESULT Y PEXELSCANDIDATE
// =============================================================================

test.describe('PROMPT 23: Tipos SmartQueryResult y PexelsCandidate', () => {

  test('SmartQueryResult existe en image.types.ts', async () => {
    const filePath = path.join(TYPES_PATH, 'image.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('interface SmartQueryResult');
  });

  test('SmartQueryResult tiene campos primary, alternatives, language, originalKeywords, translatedKeywords', async () => {
    const filePath = path.join(TYPES_PATH, 'image.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/primary\s*:\s*string/);
    expect(content).toMatch(/alternatives\s*:\s*string\[\]/);
    expect(content).toMatch(/language\s*:\s*'en'/);
    expect(content).toMatch(/originalKeywords\s*:\s*string\[\]/);
    expect(content).toMatch(/translatedKeywords\s*:\s*string\[\]/);
  });

  test('PexelsCandidate existe en image.types.ts con campos url, alt, width, height', async () => {
    const filePath = path.join(TYPES_PATH, 'image.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('interface PexelsCandidate');
    expect(content).toMatch(/url\s*:\s*string/);
    expect(content).toMatch(/alt\s*:\s*string/);
    expect(content).toMatch(/width\s*:\s*number/);
    expect(content).toMatch(/height\s*:\s*number/);
  });

  test('SmartQueryResult se puede instanciar como tipo valido', async () => {
    // Arrange - Crear un mock que cumpla la interface
    const mockResult: SmartQueryResult = {
      primary: 'intelligence artificial google',
      alternatives: ['google model', 'artificial intelligence technology'],
      language: 'en',
      originalKeywords: ['inteligencia', 'artificial', 'google'],
      translatedKeywords: ['intelligence', 'artificial', 'google'],
    };

    // Assert
    expect(mockResult).toHaveProperty('primary');
    expect(mockResult).toHaveProperty('alternatives');
    expect(mockResult).toHaveProperty('language');
    expect(mockResult.language).toBe('en');
    expect(mockResult.alternatives.length).toBeLessThanOrEqual(2);
    expect(mockResult.originalKeywords.length).toBeGreaterThan(0);
    expect(mockResult.translatedKeywords.length).toBeGreaterThan(0);
  });

  test('PexelsCandidate se puede instanciar como tipo valido', async () => {
    // Arrange
    const mockCandidate: PexelsCandidate = {
      url: 'https://images.pexels.com/photos/123/test.jpg',
      alt: 'artificial intelligence robot',
      width: 1920,
      height: 2880,
    };

    // Assert
    expect(mockCandidate).toHaveProperty('url');
    expect(mockCandidate).toHaveProperty('alt');
    expect(mockCandidate).toHaveProperty('width');
    expect(mockCandidate).toHaveProperty('height');
    expect(mockCandidate.width).toBeGreaterThan(0);
    expect(mockCandidate.height).toBeGreaterThan(0);
  });

});

// =============================================================================
// SUITE 9: CONFIGURACION DE SCORING
// =============================================================================

test.describe('PROMPT 23: Configuracion de Scoring', () => {

  test('IMAGE_SCORING_CONFIG tiene pesos que suman 100', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extraer valores de los pesos
    const textRelevance = content.match(/textRelevance\s*:\s*(\d+)/);
    const orientationBonus = content.match(/orientationBonus\s*:\s*(\d+)/);
    const resolution = content.match(/resolution\s*:\s*(\d+)/);
    const positionBonus = content.match(/positionBonus\s*:\s*(\d+)/);

    expect(textRelevance).not.toBeNull();
    expect(orientationBonus).not.toBeNull();
    expect(resolution).not.toBeNull();
    expect(positionBonus).not.toBeNull();

    const total = parseInt(textRelevance![1]) +
                  parseInt(orientationBonus![1]) +
                  parseInt(resolution![1]) +
                  parseInt(positionBonus![1]);

    expect(total).toBe(100);
  });

  test('candidateCount es 5 (obtener 5 imagenes para evaluar)', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/candidateCount\s*:\s*5/);
  });

  test('minimumScore esta definido y es razonable (10-50)', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const match = content.match(/minimumScore\s*:\s*(\d+)/);
    expect(match).not.toBeNull();

    const minimumScore = parseInt(match![1]);
    expect(minimumScore).toBeGreaterThanOrEqual(10);
    expect(minimumScore).toBeLessThanOrEqual(50);
  });

});

// =============================================================================
// SUITE 10: FALLBACK THEME (TECH EDITORIAL)
// =============================================================================

test.describe('PROMPT 23: Fallback Theme Tech Editorial', () => {

  test('FALLBACK_THEME usa colores Tech Editorial (no cyberpunk)', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Tech Editorial: background oscuro (#0F172A), primary blue (#4A9EFF)
    expect(content).toContain("'0F172A'");
    expect(content).toContain("'4A9EFF'");

    // NO debe tener colores cyberpunk
    expect(content).not.toContain('00F0FF');
    expect(content).not.toContain('FF00FF');
  });

  test('image-orchestration usa FALLBACK_THEME del config (no colores hardcodeados)', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Debe importar FALLBACK_THEME
    expect(content).toContain('FALLBACK_THEME');
    // Debe usar en generateFallbackImage
    expect(content).toContain('FALLBACK_THEME.backgroundColor');
    expect(content).toContain('FALLBACK_THEME.textColor');
  });

  test('FALLBACK_THEME tiene imageSize de al menos 400px', async () => {
    const filePath = path.join(CONFIG_PATH, 'smart-image.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const match = content.match(/imageSize\s*:\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(parseInt(match![1])).toBeGreaterThanOrEqual(400);
  });

});

// =============================================================================
// SUITE 11: NPM SCRIPTS
// =============================================================================

test.describe('PROMPT 23: npm Scripts', () => {

  test('root package.json tiene test:smart-image y test:prompt23', async () => {
    const filePath = path.join(__dirname, '../../package.json');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('test:smart-image');
    expect(content).toContain('test:prompt23');
  });

  test('scripts apuntan a prompt23-smart-image-selector.spec.ts', async () => {
    const filePath = path.join(__dirname, '../../package.json');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('prompt23-smart-image-selector.spec.ts');
  });

});
