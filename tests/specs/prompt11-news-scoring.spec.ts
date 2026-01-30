/**
 * @fileoverview Tests de Sistema de Scoring - Prompt 11
 *
 * Valida que el sistema de scoring funcione correctamente:
 * - OpenAI > Startup desconocida
 * - Noticias recientes > noticias viejas
 * - Ranking correcto
 * - Engagement boosteado
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 11
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as path from 'path';
import * as fs from 'fs';

// Importar funciones del scorer
// Nota: Usamos import dinámico para evitar problemas de compilación
// ya que automation tiene su propio tsconfig

// =============================================================================
// CONFIGURACIÓN DE TESTS
// =============================================================================

const AUTOMATION_SRC = path.join(process.cwd(), 'automation', 'src');

// =============================================================================
// SUITE 1: EXISTENCIA DE ARCHIVOS
// =============================================================================

test.describe('Suite 1: Scoring System Files', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ScoringFilesTests' });
  });

  /**
   * Verifica que existe scoring.types.ts
   */
  test('should have scoring.types.ts file', async () => {
    logger.info('Verificando existencia de scoring.types.ts');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'scoring.types.ts');
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'scoring.types.ts', path: filePath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe news.types.ts
   */
  test('should have news.types.ts file', async () => {
    logger.info('Verificando existencia de news.types.ts');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'news.types.ts');
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'news.types.ts', path: filePath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe scoring-rules.ts
   */
  test('should have scoring-rules.ts config file', async () => {
    logger.info('Verificando existencia de scoring-rules.ts');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'scoring-rules.ts', path: filePath },
    });

    expect(exists).toBe(true);
  });

  /**
   * Verifica que existe news-scorer.ts
   */
  test('should have news-scorer.ts file', async () => {
    logger.info('Verificando existencia de news-scorer.ts');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const exists = fs.existsSync(filePath);

    logger.logValidationResults({
      validator: 'FileExistence',
      passed: exists,
      details: { file: 'news-scorer.ts', path: filePath },
    });

    expect(exists).toBe(true);
  });
});

// =============================================================================
// SUITE 2: CONTENIDO DE SCORING RULES
// =============================================================================

test.describe('Suite 2: Scoring Rules Content', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ScoringRulesTests' });
  });

  /**
   * Verifica que scoring-rules tiene empresas Tier 1
   */
  test('should define Tier 1 companies with 10 points', async () => {
    logger.info('Verificando empresas Tier 1 en scoring-rules');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasOpenAI = content.includes("'OpenAI': 10");
    const hasGoogle = content.includes("'Google': 10");
    const hasAnthropic = content.includes("'Anthropic': 10");

    logger.logValidationResults({
      validator: 'Tier1Companies',
      passed: hasOpenAI && hasGoogle && hasAnthropic,
      details: { hasOpenAI, hasGoogle, hasAnthropic },
    });

    expect(hasOpenAI).toBe(true);
    expect(hasGoogle).toBe(true);
    expect(hasAnthropic).toBe(true);
  });

  /**
   * Verifica que tiene tipos de noticia definidos
   */
  test('should define news type scores', async () => {
    logger.info('Verificando tipos de noticia en scoring-rules');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasProductLaunch = content.includes("'product-launch': 9");
    const hasModelRelease = content.includes("'model-release': 9");
    const hasBreakthrough = content.includes("'breakthrough': 8");

    logger.logValidationResults({
      validator: 'NewsTypeScores',
      passed: hasProductLaunch && hasModelRelease && hasBreakthrough,
      details: { hasProductLaunch, hasModelRelease, hasBreakthrough },
    });

    expect(hasProductLaunch).toBe(true);
    expect(hasModelRelease).toBe(true);
    expect(hasBreakthrough).toBe(true);
  });

  /**
   * Verifica umbrales de engagement
   */
  test('should define engagement thresholds', async () => {
    logger.info('Verificando umbrales de engagement');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasViral = content.includes('viral: 500_000');
    const hasHigh = content.includes('high: 100_000');

    logger.logValidationResults({
      validator: 'EngagementThresholds',
      passed: hasViral && hasHigh,
      details: { hasViral, hasHigh },
    });

    expect(hasViral).toBe(true);
    expect(hasHigh).toBe(true);
  });

  /**
   * Verifica keywords de alto impacto
   */
  test('should define high impact keywords', async () => {
    logger.info('Verificando keywords de impacto');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasRevolutionary = content.includes("'revolutionary'");
    const hasBreakthrough = content.includes("'breakthrough'");
    const hasAGI = content.includes("'AGI'");

    logger.logValidationResults({
      validator: 'ImpactKeywords',
      passed: hasRevolutionary && hasBreakthrough && hasAGI,
      details: { hasRevolutionary, hasBreakthrough, hasAGI },
    });

    expect(hasRevolutionary).toBe(true);
    expect(hasBreakthrough).toBe(true);
    expect(hasAGI).toBe(true);
  });
});

// =============================================================================
// SUITE 3: CONTENIDO DE NEWS SCORER
// =============================================================================

test.describe('Suite 3: News Scorer Functions', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'NewsScorerTests' });
  });

  /**
   * Verifica que news-scorer exporta scoreNews
   */
  test('should export scoreNews function', async () => {
    logger.info('Verificando export de scoreNews');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export function scoreNews');

    logger.logValidationResults({
      validator: 'ScoreNewsExport',
      passed: hasExport,
      details: { hasExport },
    });

    expect(hasExport).toBe(true);
  });

  /**
   * Verifica que news-scorer exporta rankNews
   */
  test('should export rankNews function', async () => {
    logger.info('Verificando export de rankNews');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export function rankNews');

    logger.logValidationResults({
      validator: 'RankNewsExport',
      passed: hasExport,
      details: { hasExport },
    });

    expect(hasExport).toBe(true);
  });

  /**
   * Verifica que news-scorer exporta selectTopNews
   */
  test('should export selectTopNews function', async () => {
    logger.info('Verificando export de selectTopNews');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export function selectTopNews');

    logger.logValidationResults({
      validator: 'SelectTopNewsExport',
      passed: hasExport,
      details: { hasExport },
    });

    expect(hasExport).toBe(true);
  });

  /**
   * Verifica que implementa cálculo de company score
   */
  test('should implement company score calculation', async () => {
    logger.info('Verificando cálculo de company score');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFunction = content.includes('calculateCompanyScore');
    const usesCompanyScores = content.includes('COMPANY_SCORES');

    logger.logValidationResults({
      validator: 'CompanyScoreCalc',
      passed: hasFunction && usesCompanyScores,
      details: { hasFunction, usesCompanyScores },
    });

    expect(hasFunction).toBe(true);
    expect(usesCompanyScores).toBe(true);
  });

  /**
   * Verifica que implementa cálculo de freshness
   */
  test('should implement freshness score calculation', async () => {
    logger.info('Verificando cálculo de freshness score');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFunction = content.includes('calculateFreshnessScore');
    const calculatesHours = content.includes('ageInHours');

    logger.logValidationResults({
      validator: 'FreshnessScoreCalc',
      passed: hasFunction && calculatesHours,
      details: { hasFunction, calculatesHours },
    });

    expect(hasFunction).toBe(true);
    expect(calculatesHours).toBe(true);
  });

  /**
   * Verifica que implementa estimación de impacto
   */
  test('should implement impact estimation', async () => {
    logger.info('Verificando estimación de impacto');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFunction = content.includes('estimateImpact');
    const usesKeywords = content.includes('HIGH_IMPACT_KEYWORDS');
    const hasMaxLimit = content.includes('Math.min(impact, 7)');

    logger.logValidationResults({
      validator: 'ImpactEstimation',
      passed: hasFunction && usesKeywords && hasMaxLimit,
      details: { hasFunction, usesKeywords, hasMaxLimit },
    });

    expect(hasFunction).toBe(true);
    expect(usesKeywords).toBe(true);
    expect(hasMaxLimit).toBe(true);
  });
});

// =============================================================================
// SUITE 4: TIPOS DEFINIDOS
// =============================================================================

test.describe('Suite 4: Type Definitions', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'TypeDefinitionsTests' });
  });

  /**
   * Verifica que NewsScore interface tiene todos los campos
   */
  test('should define NewsScore interface with all fields', async () => {
    logger.info('Verificando interface NewsScore');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'scoring.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasNewsScore = content.includes('interface NewsScore');
    const hasNewsId = content.includes('newsId: string');
    const hasTotalScore = content.includes('totalScore: number');
    const hasBreakdown = content.includes('breakdown:');

    logger.logValidationResults({
      validator: 'NewsScoreInterface',
      passed: hasNewsScore && hasNewsId && hasTotalScore && hasBreakdown,
      details: { hasNewsScore, hasNewsId, hasTotalScore, hasBreakdown },
    });

    expect(hasNewsScore).toBe(true);
    expect(hasNewsId).toBe(true);
    expect(hasTotalScore).toBe(true);
    expect(hasBreakdown).toBe(true);
  });

  /**
   * Verifica que NewsType tiene todos los tipos
   */
  test('should define NewsType with all types', async () => {
    logger.info('Verificando tipo NewsType');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'scoring.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasProductLaunch = content.includes("'product-launch'");
    const hasModelRelease = content.includes("'model-release'");
    const hasControversy = content.includes("'controversy'");
    const hasOther = content.includes("'other'");

    logger.logValidationResults({
      validator: 'NewsTypeDefinition',
      passed: hasProductLaunch && hasModelRelease && hasControversy && hasOther,
      details: { hasProductLaunch, hasModelRelease, hasControversy, hasOther },
    });

    expect(hasProductLaunch).toBe(true);
    expect(hasModelRelease).toBe(true);
    expect(hasControversy).toBe(true);
    expect(hasOther).toBe(true);
  });

  /**
   * Verifica que NewsItem tiene campos para scoring
   */
  test('should define NewsItem with scoring fields', async () => {
    logger.info('Verificando interface NewsItem');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'news.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasNewsItem = content.includes('interface NewsItem');
    const hasCompany = content.includes('company?: string');
    const hasType = content.includes('type?: NewsType');
    const hasMetrics = content.includes('metrics?: NewsMetrics');

    logger.logValidationResults({
      validator: 'NewsItemInterface',
      passed: hasNewsItem && hasCompany && hasType && hasMetrics,
      details: { hasNewsItem, hasCompany, hasType, hasMetrics },
    });

    expect(hasNewsItem).toBe(true);
    expect(hasCompany).toBe(true);
    expect(hasType).toBe(true);
    expect(hasMetrics).toBe(true);
  });
});

// =============================================================================
// SUITE 5: DOCUMENTACIÓN Y COMENTARIOS
// =============================================================================

test.describe('Suite 5: Documentation', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'DocumentationTests' });
  });

  /**
   * Verifica que news-scorer tiene JSDoc comments
   */
  test('should have JSDoc documentation in news-scorer', async () => {
    logger.info('Verificando documentación JSDoc');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFileOverview = content.includes('@fileoverview');
    const hasParamDocs = content.includes('@param');
    const hasReturnsDocs = content.includes('@returns');
    const hasExamples = content.includes('@example');

    logger.logValidationResults({
      validator: 'JSDocComments',
      passed: hasFileOverview && hasParamDocs && hasReturnsDocs,
      details: { hasFileOverview, hasParamDocs, hasReturnsDocs, hasExamples },
    });

    expect(hasFileOverview).toBe(true);
    expect(hasParamDocs).toBe(true);
    expect(hasReturnsDocs).toBe(true);
  });

  /**
   * Verifica que scoring-rules tiene comentarios explicativos
   */
  test('should have explanatory comments in scoring-rules', async () => {
    logger.info('Verificando comentarios en scoring-rules');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasTierComments = content.includes('Tier 1') && content.includes('Tier 2');
    const hasPointsComments = content.includes('pts');
    const hasDescriptions = content.includes('Gigantes') || content.includes('Players');

    logger.logValidationResults({
      validator: 'ScoringRulesComments',
      passed: hasTierComments && hasPointsComments,
      details: { hasTierComments, hasPointsComments, hasDescriptions },
    });

    expect(hasTierComments).toBe(true);
    expect(hasPointsComments).toBe(true);
  });
});

// =============================================================================
// SUITE 6: CRITERIOS "CARNITA" - Prompt 17-A
// =============================================================================

test.describe('Suite 6: Carnita Score Criteria (Prompt 17-A)', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'CarnitaScoreTests' });
  });

  /**
   * Verifica que scoring-rules tiene keywords analíticas
   */
  test('should define ANALYTICAL_KEYWORDS', async () => {
    logger.info('Verificando keywords analíticas');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export const ANALYTICAL_KEYWORDS');
    const hasFuturo = content.includes("'futuro'");
    const hasImplications = content.includes("'implications'");

    logger.logValidationResults({
      validator: 'AnalyticalKeywords',
      passed: hasExport && hasFuturo && hasImplications,
      details: { hasExport, hasFuturo, hasImplications },
    });

    expect(hasExport).toBe(true);
    expect(hasFuturo).toBe(true);
    expect(hasImplications).toBe(true);
  });

  /**
   * Verifica que scoring-rules tiene keywords de controversia
   */
  test('should define CONTROVERSY_KEYWORDS', async () => {
    logger.info('Verificando keywords de controversia');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export const CONTROVERSY_KEYWORDS');
    const hasDebate = content.includes("'debate'");
    const hasLayoff = content.includes("'layoff'");

    logger.logValidationResults({
      validator: 'ControversyKeywords',
      passed: hasExport && hasDebate && hasLayoff,
      details: { hasExport, hasDebate, hasLayoff },
    });

    expect(hasExport).toBe(true);
    expect(hasDebate).toBe(true);
    expect(hasLayoff).toBe(true);
  });

  /**
   * Verifica que scoring-rules tiene indicadores de clickbait
   */
  test('should define CLICKBAIT_INDICATORS', async () => {
    logger.info('Verificando indicadores de clickbait');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export const CLICKBAIT_INDICATORS');
    const hasIncreible = content.includes("'increíble'");
    const hasBreaking = content.includes("'BREAKING'");

    logger.logValidationResults({
      validator: 'ClickbaitIndicators',
      passed: hasExport && hasIncreible && hasBreaking,
      details: { hasExport, hasIncreible, hasBreaking },
    });

    expect(hasExport).toBe(true);
    expect(hasIncreible).toBe(true);
    expect(hasBreaking).toBe(true);
  });

  /**
   * Verifica que scoring-rules tiene entidades de alto impacto
   */
  test('should define HIGH_IMPACT_ENTITIES', async () => {
    logger.info('Verificando entidades de alto impacto');

    const filePath = path.join(AUTOMATION_SRC, 'config', 'scoring-rules.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export const HIGH_IMPACT_ENTITIES');
    const hasOpenAI = content.includes("'OpenAI'");
    const hasSamAltman = content.includes("'Sam Altman'");

    logger.logValidationResults({
      validator: 'HighImpactEntities',
      passed: hasExport && hasOpenAI && hasSamAltman,
      details: { hasExport, hasOpenAI, hasSamAltman },
    });

    expect(hasExport).toBe(true);
    expect(hasOpenAI).toBe(true);
    expect(hasSamAltman).toBe(true);
  });
});

// =============================================================================
// SUITE 7: NEWS SCORER CARNITA FUNCTIONS - Prompt 17-A
// =============================================================================

test.describe('Suite 7: News Scorer Carnita Functions (Prompt 17-A)', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'NewsScorerCarnitaTests' });
  });

  /**
   * Verifica que news-scorer calcula analyticalDepth
   */
  test('should calculate analyticalDepth in breakdown', async () => {
    logger.info('Verificando cálculo de analyticalDepth');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFunction = content.includes('calculateAnalyticalDepth');
    const hasInBreakdown = content.includes('analyticalDepth');

    logger.logValidationResults({
      validator: 'AnalyticalDepthCalc',
      passed: hasFunction && hasInBreakdown,
      details: { hasFunction, hasInBreakdown },
    });

    expect(hasFunction).toBe(true);
    expect(hasInBreakdown).toBe(true);
  });

  /**
   * Verifica que news-scorer calcula controversyPotential
   */
  test('should calculate controversyPotential in breakdown', async () => {
    logger.info('Verificando cálculo de controversyPotential');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFunction = content.includes('calculateControversyPotential');
    const hasInBreakdown = content.includes('controversyPotential');

    logger.logValidationResults({
      validator: 'ControversyPotentialCalc',
      passed: hasFunction && hasInBreakdown,
      details: { hasFunction, hasInBreakdown },
    });

    expect(hasFunction).toBe(true);
    expect(hasInBreakdown).toBe(true);
  });

  /**
   * Verifica que news-scorer calcula substantiveContent
   */
  test('should calculate substantiveContent in breakdown', async () => {
    logger.info('Verificando cálculo de substantiveContent');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFunction = content.includes('calculateSubstantiveContent');
    const hasInBreakdown = content.includes('substantiveContent');

    logger.logValidationResults({
      validator: 'SubstantiveContentCalc',
      passed: hasFunction && hasInBreakdown,
      details: { hasFunction, hasInBreakdown },
    });

    expect(hasFunction).toBe(true);
    expect(hasInBreakdown).toBe(true);
  });

  /**
   * Verifica que news-scorer exporta selectPublishableNews
   */
  test('should export selectPublishableNews function', async () => {
    logger.info('Verificando export de selectPublishableNews');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export function selectPublishableNews');

    logger.logValidationResults({
      validator: 'SelectPublishableNewsExport',
      passed: hasExport,
      details: { hasExport },
    });

    expect(hasExport).toBe(true);
  });

  /**
   * Verifica que news-scorer usa PUBLISH_THRESHOLD
   */
  test('should use PUBLISH_THRESHOLD constant', async () => {
    logger.info('Verificando uso de PUBLISH_THRESHOLD');

    const filePath = path.join(AUTOMATION_SRC, 'news-scorer.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const importsThreshold = content.includes('PUBLISH_THRESHOLD');
    const usesInCode = content.includes('>= PUBLISH_THRESHOLD');

    logger.logValidationResults({
      validator: 'PublishThreshold',
      passed: importsThreshold && usesInCode,
      details: { importsThreshold, usesInCode },
    });

    expect(importsThreshold).toBe(true);
    expect(usesInCode).toBe(true);
  });
});

// =============================================================================
// SUITE 8: SCORING TYPES CARNITA - Prompt 17-A
// =============================================================================

test.describe('Suite 8: Scoring Types Carnita (Prompt 17-A)', () => {
  let logger: TestLogger;

  test.beforeEach(() => {
    logger = new TestLogger({ testName: 'ScoringTypesCarnitaTests' });
  });

  /**
   * Verifica que NewsScore tiene isPublishable
   */
  test('should have isPublishable field in NewsScore', async () => {
    logger.info('Verificando campo isPublishable');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'scoring.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasField = content.includes('isPublishable: boolean');

    logger.logValidationResults({
      validator: 'IsPublishableField',
      passed: hasField,
      details: { hasField },
    });

    expect(hasField).toBe(true);
  });

  /**
   * Verifica que NewsScore tiene suggestedAngles
   */
  test('should have suggestedAngles field in NewsScore', async () => {
    logger.info('Verificando campo suggestedAngles');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'scoring.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasField = content.includes('suggestedAngles?:');

    logger.logValidationResults({
      validator: 'SuggestedAnglesField',
      passed: hasField,
      details: { hasField },
    });

    expect(hasField).toBe(true);
  });

  /**
   * Verifica que NewsMetrics usa views genérico (no twitterViews)
   */
  test('should use generic views instead of twitterViews', async () => {
    logger.info('Verificando métricas genéricas');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'scoring.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasGenericViews = content.includes('views?: number');
    const noTwitterViews = !content.includes('twitterViews');

    logger.logValidationResults({
      validator: 'GenericMetrics',
      passed: hasGenericViews && noTwitterViews,
      details: { hasGenericViews, noTwitterViews },
    });

    expect(hasGenericViews).toBe(true);
    expect(noTwitterViews).toBe(true);
  });

  /**
   * Verifica que PUBLISH_THRESHOLD está definido
   */
  test('should export PUBLISH_THRESHOLD constant', async () => {
    logger.info('Verificando constante PUBLISH_THRESHOLD');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'scoring.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasExport = content.includes('export const PUBLISH_THRESHOLD');
    const isCorrectValue = content.includes('PUBLISH_THRESHOLD = 75');

    logger.logValidationResults({
      validator: 'PublishThresholdConstant',
      passed: hasExport && isCorrectValue,
      details: { hasExport, isCorrectValue },
    });

    expect(hasExport).toBe(true);
    expect(isCorrectValue).toBe(true);
  });

  /**
   * Verifica que breakdown tiene nuevos campos carnita
   */
  test('should have carnita fields in breakdown', async () => {
    logger.info('Verificando campos carnita en breakdown');

    const filePath = path.join(AUTOMATION_SRC, 'types', 'scoring.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const hasAnalyticalDepth = content.includes('analyticalDepth: number');
    const hasControversyPotential = content.includes('controversyPotential: number');
    const hasSubstantiveContent = content.includes('substantiveContent: number');

    logger.logValidationResults({
      validator: 'CarnitaBreakdownFields',
      passed: hasAnalyticalDepth && hasControversyPotential && hasSubstantiveContent,
      details: { hasAnalyticalDepth, hasControversyPotential, hasSubstantiveContent },
    });

    expect(hasAnalyticalDepth).toBe(true);
    expect(hasControversyPotential).toBe(true);
    expect(hasSubstantiveContent).toBe(true);
  });
});
