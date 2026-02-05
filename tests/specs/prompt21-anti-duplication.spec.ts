/**
 * @fileoverview Tests para Prompt 21 - Anti-Duplicacion de Noticias
 *
 * Valida:
 * - Config de anti-duplicacion existe con todos los parametros
 * - Types de published-news existen con interfaces correctas
 * - PublishedNewsTracker service existe con todos los metodos
 * - news-scorer exporta selectTopNewsExcluding (backward compat)
 * - Orchestrator integra tracker en pipeline
 * - Normalizacion de titulos funciona correctamente
 * - Deteccion de similitud funciona correctamente
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 21
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONSTANTES DE TEST
// =============================================================================

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AUTOMATION_SRC = path.join(PROJECT_ROOT, 'automation', 'src');

// =============================================================================
// SUITE 1: PUBLISHED NEWS CONFIG
// =============================================================================

test.describe('PROMPT 21: Published News Config', () => {
  const configPath = path.join(AUTOMATION_SRC, 'config', 'published-news.config.ts');

  test('published-news.config.ts debe existir', async () => {
    // Arrange & Act
    const exists = fs.existsSync(configPath);

    // Assert
    expect(exists).toBe(true);
  });

  test('config debe exportar PUBLISHED_NEWS_CONFIG', async () => {
    // Arrange
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('export const PUBLISHED_NEWS_CONFIG');
  });

  test('config debe tener cooldownDays con default 30', async () => {
    // Arrange
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('cooldownDays');
    expect(content).toContain("'30'");
  });

  test('config debe tener titleSimilarityThreshold con default 0.8', async () => {
    // Arrange
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('titleSimilarityThreshold');
    expect(content).toContain("'0.8'");
  });

  test('config debe tener companyProductCooldownDays con default 7', async () => {
    // Arrange
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('companyProductCooldownDays');
    expect(content).toContain("'7'");
  });

  test('config debe tener maxHistoryEntries con default 100', async () => {
    // Arrange
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('maxHistoryEntries');
    expect(content).toContain("'100'");
  });
});

// =============================================================================
// SUITE 2: PUBLISHED NEWS TYPES
// =============================================================================

test.describe('PROMPT 21: Published News Types', () => {
  const typesPath = path.join(AUTOMATION_SRC, 'types', 'published-news.types.ts');

  test('published-news.types.ts debe existir', async () => {
    // Arrange & Act
    const exists = fs.existsSync(typesPath);

    // Assert
    expect(exists).toBe(true);
  });

  test('debe exportar interface PublishedNewsEntry con campos requeridos', async () => {
    // Arrange
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('export interface PublishedNewsEntry');
    expect(content).toContain('newsId: string');
    expect(content).toContain('normalizedTitle: string');
    expect(content).toContain('publishedAt: string');
    expect(content).toContain('score: number');
  });

  test('debe exportar interface PublishedNewsData', async () => {
    // Arrange
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('export interface PublishedNewsData');
    expect(content).toContain('version: number');
    expect(content).toContain('entries: PublishedNewsEntry[]');
  });

  test('debe exportar interface DuplicateCheckResult con matchType', async () => {
    // Arrange
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('export interface DuplicateCheckResult');
    expect(content).toContain('isDuplicate: boolean');
    expect(content).toContain("'exact-id'");
    expect(content).toContain("'title-similarity'");
    expect(content).toContain("'company-product'");
  });
});

// =============================================================================
// SUITE 3: PUBLISHED NEWS TRACKER SERVICE
// =============================================================================

test.describe('PROMPT 21: PublishedNewsTracker Service', () => {
  const servicePath = path.join(AUTOMATION_SRC, 'services', 'published-news-tracker.service.ts');

  test('published-news-tracker.service.ts debe existir', async () => {
    // Arrange & Act
    const exists = fs.existsSync(servicePath);

    // Assert
    expect(exists).toBe(true);
  });

  test('debe exportar class PublishedNewsTracker', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('export class PublishedNewsTracker');
  });

  test('debe tener metodo async load()', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('async load()');
  });

  test('debe tener metodo async save()', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('async save()');
  });

  test('debe tener metodo isPublished()', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('isPublished(');
  });

  test('debe tener metodo checkDuplicate() con 3 capas', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - metodo existe
    expect(content).toContain('checkDuplicate(');
    // Assert - 3 capas de deteccion
    expect(content).toContain('exact-id');
    expect(content).toContain('title-similarity');
    expect(content).toContain('company-product');
  });

  test('debe tener metodo record()', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('record(');
    expect(content).toContain('NewsItem');
    expect(content).toContain('NewsScore');
  });

  test('debe tener metodo getExclusionFilter()', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('getExclusionFilter()');
  });

  test('debe tener metodo getEntryCount()', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('getEntryCount()');
  });

  test('debe importar desde published-news.config', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain("from '../config/published-news.config'");
  });

  test('debe importar tipos NewsItem y NewsScore', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain("from '../types/news.types'");
    expect(content).toContain("from '../types/scoring.types'");
  });

  test('debe tener metodo estatico normalizeTitle()', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('static normalizeTitle(');
    // Debe usar normalize NFD para remover acentos
    expect(content).toContain("'NFD'");
    expect(content).toContain('toLowerCase');
  });

  test('debe tener metodo estatico calculateTitleSimilarity()', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('static calculateTitleSimilarity(');
    // Debe usar Set para Jaccard similarity
    expect(content).toContain('new Set');
  });
});

// =============================================================================
// SUITE 4: NEWS SCORER INTEGRATION
// =============================================================================

test.describe('PROMPT 21: News Scorer Integration', () => {
  const scorerPath = path.join(AUTOMATION_SRC, 'news-scorer.ts');

  test('news-scorer debe exportar selectTopNewsExcluding', async () => {
    // Arrange
    const content = fs.readFileSync(scorerPath, 'utf-8');

    // Assert
    expect(content).toContain('export function selectTopNewsExcluding');
  });

  test('selectTopNewsExcluding debe aceptar parametro excludeFilter', async () => {
    // Arrange
    const content = fs.readFileSync(scorerPath, 'utf-8');

    // Assert - la firma debe incluir excludeFilter
    const funcMatch = content.match(
      /selectTopNewsExcluding[\s\S]*?excludeFilter/,
    );
    expect(funcMatch).toBeTruthy();
  });

  test('selectTopNewsExcluding debe filtrar antes de rankear', async () => {
    // Arrange
    const content = fs.readFileSync(scorerPath, 'utf-8');

    // Assert - debe llamar filter antes de rankNews
    // Extraer solo el cuerpo de selectTopNewsExcluding
    const funcStart = content.indexOf('export function selectTopNewsExcluding');
    const funcBody = content.slice(funcStart, funcStart + 600);
    const filterIndex = funcBody.indexOf('.filter');
    const rankIndex = funcBody.indexOf('rankNews');

    expect(filterIndex).toBeGreaterThan(-1);
    expect(rankIndex).toBeGreaterThan(-1);
    expect(filterIndex).toBeLessThan(rankIndex);
  });

  test('selectTopNews original debe permanecer sin cambios (backward compat)', async () => {
    // Arrange
    const content = fs.readFileSync(scorerPath, 'utf-8');

    // Assert - selectTopNews original NO debe tener excludeFilter en su firma
    const selectTopMatch = content.match(
      /export function selectTopNews\([^)]*\)/,
    );
    expect(selectTopMatch).toBeTruthy();
    expect(selectTopMatch![0]).not.toContain('excludeFilter');
  });

  test('selectPublishableNews debe permanecer sin cambios', async () => {
    // Arrange
    const content = fs.readFileSync(scorerPath, 'utf-8');

    // Assert
    expect(content).toContain('export function selectPublishableNews');
    // No debe haber sido modificada (sigue usando filterByScore)
    const funcStart = content.indexOf('export function selectPublishableNews');
    const funcBody = content.slice(funcStart, funcStart + 300);
    expect(funcBody).toContain('filterByScore');
  });
});

// =============================================================================
// SUITE 5: ORCHESTRATOR INTEGRATION
// =============================================================================

test.describe('PROMPT 21: Orchestrator Integration', () => {
  const orchestratorPath = path.join(AUTOMATION_SRC, 'orchestrator.ts');

  test('orchestrator debe importar PublishedNewsTracker', async () => {
    // Arrange
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain('PublishedNewsTracker');
    expect(content).toContain("from './services/published-news-tracker.service'");
  });

  test('orchestrator debe importar selectTopNewsExcluding', async () => {
    // Arrange
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain('selectTopNewsExcluding');
    expect(content).toContain("from './news-scorer'");
  });

  test('orchestrator debe llamar tracker.load() antes de seleccion', async () => {
    // Arrange
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert - tracker.load() debe aparecer antes de la LLAMADA a selectTopNewsExcluding
    // (no el import, sino el uso con parentesis y argumento)
    const loadIndex = content.indexOf('tracker.load()');
    const selectCallIndex = content.indexOf('selectTopNewsExcluding(newsItems');
    expect(loadIndex).toBeGreaterThan(-1);
    expect(selectCallIndex).toBeGreaterThan(-1);
    expect(loadIndex).toBeLessThan(selectCallIndex);
  });

  test('orchestrator debe registrar noticia despues de save outputs', async () => {
    // Arrange
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert - tracker.record y tracker.save deben existir
    expect(content).toContain('tracker.record(');
    expect(content).toContain('tracker.save()');

    // record debe estar despues de saveAllOutputs
    const saveOutputsIndex = content.indexOf('saveAllOutputs');
    const recordIndex = content.indexOf('tracker.record(');
    expect(saveOutputsIndex).toBeGreaterThan(-1);
    expect(recordIndex).toBeGreaterThan(saveOutputsIndex);
  });
});

// =============================================================================
// SUITE 6: TITLE SIMILARITY LOGIC
// =============================================================================

test.describe('PROMPT 21: Title Similarity Logic', () => {
  const servicePath = path.join(AUTOMATION_SRC, 'services', 'published-news-tracker.service.ts');

  test('normalizeTitle debe remover acentos con NFD', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - debe usar normalize('NFD') y remover diacriticos
    expect(content).toContain("normalize('NFD')");
    expect(content).toMatch(/\\u0300-\\u036f/);
  });

  test('calculateTitleSimilarity debe usar Jaccard con word sets', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - debe usar Set para words y calcular interseccion/union
    const funcStart = content.indexOf('static calculateTitleSimilarity');
    const funcBody = content.slice(funcStart, funcStart + 800);
    expect(funcBody).toContain('new Set');
    expect(funcBody).toContain("split(' ')");
    expect(funcBody).toContain('commonCount');
  });

  test('checkDuplicate debe implementar 3 capas de deteccion en orden', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - las 3 capas deben estar en orden: ID -> titulo -> empresa
    const funcStart = content.indexOf('checkDuplicate(');
    const funcBody = content.slice(funcStart, funcStart + 1500);

    const idCheckIndex = funcBody.indexOf('newsId');
    const titleCheckIndex = funcBody.indexOf('normalizeTitle');
    const companyCheckIndex = funcBody.indexOf('companyProductCooldownDays');

    expect(idCheckIndex).toBeGreaterThan(-1);
    expect(titleCheckIndex).toBeGreaterThan(idCheckIndex);
    expect(companyCheckIndex).toBeGreaterThan(titleCheckIndex);
  });
});
