/**
 * @fileoverview Tests para Prompt 53 - Smart Image Query Tech Context
 *
 * Valida que:
 * - TECH_CONTEXT_TERMS y BANNED_QUERY_TERMS exportados desde config
 * - sanitizeQuery() elimina banned terms con fallback seguro
 * - enrichWithTechContext() agrega tech term rotado por segmentIndex
 * - generateAlternatives() incluye tech context en alt1 y alt2
 * - searchWithFallback() sanitiza y enriquece queries antes de buscar
 * - __LOGO__ queries bypasean sanitización y enrichment
 * - Sin regresiones en traducción, scoring ni config existente
 *
 * @since Prompt 53
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

const AUTOMATION_SRC = path.join(process.cwd(), 'automation', 'src');
const CONFIG_PATH = path.join(AUTOMATION_SRC, 'config', 'smart-image.config.ts');
const QUERY_GEN_PATH = path.join(AUTOMATION_SRC, 'services', 'smart-query-generator.ts');
const ORCHESTRATION_PATH = path.join(AUTOMATION_SRC, 'services', 'image-orchestration.service.ts');

// =============================================================================
// TESTS: CONFIG — TECH_CONTEXT_TERMS
// =============================================================================

test.describe('Prompt 53 - Config TECH_CONTEXT_TERMS', () => {
  const logger = new TestLogger({ testName: 'Prompt53-TechTerms' });
  let config: string;

  test.beforeAll(async () => {
    config = fs.readFileSync(CONFIG_PATH, 'utf-8');
  });

  test('TECH_CONTEXT_TERMS exportado desde smart-image.config.ts', async () => {
    logger.info('Verificando export');
    expect(config).toContain('export const TECH_CONTEXT_TERMS');
  });

  test('Contiene al menos 4 términos', async () => {
    logger.info('Verificando cantidad de términos');
    const section = config.substring(config.indexOf('TECH_CONTEXT_TERMS'));
    const terms = section.match(/'[a-z]+'/g);
    expect(terms).toBeTruthy();
    expect(terms!.length).toBeGreaterThanOrEqual(4);
  });

  test("Incluye 'technology' y 'digital'", async () => {
    logger.info('Verificando términos clave');
    expect(config).toMatch(/TECH_CONTEXT_TERMS[\s\S]*?'technology'/);
    expect(config).toMatch(/TECH_CONTEXT_TERMS[\s\S]*?'digital'/);
  });
});

// =============================================================================
// TESTS: CONFIG — BANNED_QUERY_TERMS
// =============================================================================

test.describe('Prompt 53 - Config BANNED_QUERY_TERMS', () => {
  const logger = new TestLogger({ testName: 'Prompt53-BannedTerms' });
  let config: string;

  test.beforeAll(async () => {
    config = fs.readFileSync(CONFIG_PATH, 'utf-8');
  });

  test('BANNED_QUERY_TERMS exportado desde smart-image.config.ts', async () => {
    logger.info('Verificando export');
    expect(config).toContain('export const BANNED_QUERY_TERMS');
  });

  test('Contiene al menos 20 términos banned', async () => {
    logger.info('Verificando cantidad');
    const section = config.substring(config.indexOf('BANNED_QUERY_TERMS'));
    const terms = section.match(/'[a-z]+'/g);
    expect(terms).toBeTruthy();
    expect(terms!.length).toBeGreaterThanOrEqual(20);
  });

  test("Incluye términos de personas (person, people, man, woman)", async () => {
    logger.info('Verificando personas');
    const section = config.substring(config.indexOf('BANNED_QUERY_TERMS'));
    expect(section).toContain("'person'");
    expect(section).toContain("'people'");
    expect(section).toContain("'man'");
    expect(section).toContain("'woman'");
  });

  test("Incluye términos de oficina (office, desk, meeting, corporate)", async () => {
    logger.info('Verificando oficina');
    const section = config.substring(config.indexOf('BANNED_QUERY_TERMS'));
    expect(section).toContain("'office'");
    expect(section).toContain("'desk'");
    expect(section).toContain("'meeting'");
    expect(section).toContain("'corporate'");
  });
});

// =============================================================================
// TESTS: SMARTQUERYGENERATOR — sanitizeQuery()
// =============================================================================

test.describe('Prompt 53 - SmartQueryGenerator sanitizeQuery', () => {
  const logger = new TestLogger({ testName: 'Prompt53-Sanitize' });
  let queryGen: string;

  test.beforeAll(async () => {
    queryGen = fs.readFileSync(QUERY_GEN_PATH, 'utf-8');
  });

  test('sanitizeQuery es un método público', async () => {
    logger.info('Verificando visibilidad');
    expect(queryGen).toMatch(/^\s+sanitizeQuery\s*\(/m);
    expect(queryGen).not.toMatch(/private\s+sanitizeQuery/);
  });

  test('sanitizeQuery usa BANNED_QUERY_TERMS', async () => {
    logger.info('Verificando uso de banned terms');
    expect(queryGen).toContain('BANNED_QUERY_TERMS');
  });

  test("Tiene fallback 'artificial intelligence technology' cuando todos banned", async () => {
    logger.info('Verificando fallback');
    expect(queryGen).toContain("'artificial intelligence technology'");
  });

  test('Importa BANNED_QUERY_TERMS desde config', async () => {
    logger.info('Verificando import');
    expect(queryGen).toMatch(/import.*BANNED_QUERY_TERMS.*from.*smart-image\.config/);
  });
});

// =============================================================================
// TESTS: SMARTQUERYGENERATOR — enrichWithTechContext()
// =============================================================================

test.describe('Prompt 53 - SmartQueryGenerator enrichWithTechContext', () => {
  const logger = new TestLogger({ testName: 'Prompt53-Enrich' });
  let queryGen: string;

  test.beforeAll(async () => {
    queryGen = fs.readFileSync(QUERY_GEN_PATH, 'utf-8');
  });

  test('enrichWithTechContext es un método público', async () => {
    logger.info('Verificando visibilidad');
    expect(queryGen).toMatch(/^\s+enrichWithTechContext\s*\(/m);
    expect(queryGen).not.toMatch(/private\s+enrichWithTechContext/);
  });

  test('enrichWithTechContext usa TECH_CONTEXT_TERMS', async () => {
    logger.info('Verificando uso de tech terms');
    expect(queryGen).toContain('TECH_CONTEXT_TERMS');
  });

  test('Skip si query ya contiene tech term (.some + .includes)', async () => {
    logger.info('Verificando skip logic');
    // Debe verificar si ya tiene un term tech antes de agregar
    expect(queryGen).toMatch(/TECH_CONTEXT_TERMS\.some/);
  });

  test('Rota tech term por segmentIndex (modulo operator)', async () => {
    logger.info('Verificando rotación');
    expect(queryGen).toMatch(/segmentIndex\s*%\s*TECH_CONTEXT_TERMS\.length/);
  });
});

// =============================================================================
// TESTS: SMARTQUERYGENERATOR — generateAlternatives con tech context
// =============================================================================

test.describe('Prompt 53 - generateAlternatives tech context', () => {
  const logger = new TestLogger({ testName: 'Prompt53-Alts' });
  let queryGen: string;

  test.beforeAll(async () => {
    queryGen = fs.readFileSync(QUERY_GEN_PATH, 'utf-8');
  });

  test("Alt 1 incluye 'artificial intelligence'", async () => {
    logger.info('Verificando alt1 tech context');
    expect(queryGen).toMatch(/alt1[\s\S]*?artificial intelligence/);
  });

  test("Alt 2 incluye 'technology'", async () => {
    logger.info('Verificando alt2 tech context');
    // alt2 debe terminar con technology
    const altSection = queryGen.substring(
      queryGen.indexOf('// Alt 2:'),
      queryGen.indexOf('// Prompt 35:')
    );
    expect(altSection).toContain('technology');
  });
});

// =============================================================================
// TESTS: IMAGEORCHESTRATIONSERVICE — Integración
// =============================================================================

test.describe('Prompt 53 - ImageOrchestration integración', () => {
  const logger = new TestLogger({ testName: 'Prompt53-Integration' });
  let orchestration: string;

  test.beforeAll(async () => {
    orchestration = fs.readFileSync(ORCHESTRATION_PATH, 'utf-8');
  });

  test('searchWithFallback llama sanitizeQuery antes de Pexels', async () => {
    logger.info('Verificando sanitización del query primario');
    expect(orchestration).toContain('sanitizeQuery(searchQuery)');
  });

  test('searchWithFallback llama enrichWithTechContext', async () => {
    logger.info('Verificando enriquecimiento');
    expect(orchestration).toContain('enrichWithTechContext');
  });

  test('__LOGO__ queries bypasean sanitización (return antes de sanitize)', async () => {
    logger.info('Verificando bypass __LOGO__');
    // __LOGO__ check debe estar ANTES de sanitizeQuery
    const logoPos = orchestration.indexOf("'__LOGO__:'");
    const sanitizePos = orchestration.indexOf('sanitizeQuery(searchQuery)');
    expect(logoPos).toBeGreaterThan(0);
    expect(sanitizePos).toBeGreaterThan(0);
    expect(logoPos).toBeLessThan(sanitizePos);
  });

  test('Alternativas se sanitizan antes de buscar', async () => {
    logger.info('Verificando sanitización de alternativas');
    expect(orchestration).toContain('sanitizeQuery(altQuery)');
  });

  test('Keywords de scoring separadas del query enriquecido (anti-dilución)', async () => {
    logger.info('Verificando separación scoring vs query');
    // scoringKeywords usa el sanitizado sin tech term
    expect(orchestration).toContain('scoringKeywords = sanitizedQuery.split');
    // Pexels recibe enrichedQuery pero scoringKeywords para scoring
    expect(orchestration).toMatch(/searchPexelsWithScoring\(enrichedQuery,\s*scoringKeywords/);
  });

  test('JSDoc menciona Prompt 53', async () => {
    logger.info('Verificando documentación');
    expect(orchestration).toMatch(/@updated Prompt 53/);
  });
});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 53 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt53-Regression' });

  test('SPANISH_TO_ENGLISH dictionary sigue exportado', async () => {
    logger.info('Verificando dictionary');
    const config = fs.readFileSync(CONFIG_PATH, 'utf-8');
    expect(config).toContain('export const SPANISH_TO_ENGLISH');
  });

  test('GENERIC_PENALTY_PATTERNS sigue exportado', async () => {
    logger.info('Verificando penalty patterns');
    const config = fs.readFileSync(CONFIG_PATH, 'utf-8');
    expect(config).toContain('export const GENERIC_PENALTY_PATTERNS');
  });

  test('QUERY_CONFIG valores intactos (maxAlternatives: 2, maxKeywordsPerQuery: 3)', async () => {
    logger.info('Verificando QUERY_CONFIG');
    const config = fs.readFileSync(CONFIG_PATH, 'utf-8');
    expect(config).toMatch(/maxAlternatives:\s*2/);
    expect(config).toMatch(/maxKeywordsPerQuery:\s*3/);
  });

  test('translateKeywords sigue siendo público', async () => {
    logger.info('Verificando translateKeywords');
    const queryGen = fs.readFileSync(QUERY_GEN_PATH, 'utf-8');
    expect(queryGen).toMatch(/^\s+translateKeywords\s*\(/m);
    expect(queryGen).not.toMatch(/private\s+translateKeywords/);
  });

  test('IMAGE_SCORING_CONFIG sin cambios', async () => {
    logger.info('Verificando scoring config');
    const config = fs.readFileSync(CONFIG_PATH, 'utf-8');
    expect(config).toContain('export const IMAGE_SCORING_CONFIG');
    expect(config).toMatch(/minimumScore:\s*35/);
    expect(config).toMatch(/minTextRelevance:\s*8/);
  });

  test('searchLogoWithCascade sin cambios', async () => {
    logger.info('Verificando logo cascade');
    const orchestration = fs.readFileSync(ORCHESTRATION_PATH, 'utf-8');
    expect(orchestration).toContain('searchLogoWithCascade');
    expect(orchestration).toContain('searchClearbit');
  });
});
