/**
 * @fileoverview Tests para Prompt 24 - Integración NewsData.io Real
 *
 * Valida la integración real del orchestrator con NewsData.io:
 * - newsdata.config.ts: query, límites, patterns, aliases
 * - news-enricher.service.ts: detectCompany, detectType, extractProductName
 * - newsAPI.ts: usa config centralizada
 * - orchestrator.ts: PASO 2 con fetch real + enrichment + dry-run
 * - Compatibilidad con scoring existente (CarnitaScorer, PublishedNewsTracker)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 24
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const CONFIG_PATH = path.join(AUTOMATION_SRC, 'config');
const SERVICES_PATH = path.join(AUTOMATION_SRC, 'services');

const NEWSDATA_CONFIG_PATH = path.join(CONFIG_PATH, 'newsdata.config.ts');
const NEWS_ENRICHER_PATH = path.join(SERVICES_PATH, 'news-enricher.service.ts');
const NEWS_API_PATH = path.join(AUTOMATION_SRC, 'newsAPI.ts');
const ORCHESTRATOR_PATH = path.join(AUTOMATION_SRC, 'orchestrator.ts');
const SCORING_RULES_PATH = path.join(CONFIG_PATH, 'scoring-rules.ts');

// =============================================================================
// SUITE 1: ESTRUCTURA Y ARCHIVOS
// =============================================================================

test.describe('Prompt 24 - Estructura y Archivos', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Estructura' });

  test('newsdata.config.ts existe en automation/src/config/', async () => {
    logger.info('Verificando existencia de newsdata.config.ts');
    expect(fs.existsSync(NEWSDATA_CONFIG_PATH)).toBe(true);
  });

  test('news-enricher.service.ts existe en automation/src/services/', async () => {
    logger.info('Verificando existencia de news-enricher.service.ts');
    expect(fs.existsSync(NEWS_ENRICHER_PATH)).toBe(true);
  });

  test('news-enricher importa logger de producción (NO TestLogger)', async () => {
    logger.info('Verificando import de logger correcto');
    const content = fs.readFileSync(NEWS_ENRICHER_PATH, 'utf-8');
    expect(content).toContain("from '../../utils/logger'");
    expect(content).not.toContain('TestLogger');
  });

  test('newsdata.config exporta NEWSDATA_QUERY, COMPANY_ALIASES y NEWS_TYPE_PATTERNS', async () => {
    logger.info('Verificando exports de newsdata.config');
    const content = fs.readFileSync(NEWSDATA_CONFIG_PATH, 'utf-8');
    expect(content).toContain('export const NEWSDATA_QUERY');
    expect(content).toContain('export const COMPANY_ALIASES');
    expect(content).toContain('export const NEWS_TYPE_PATTERNS');
  });
});

// =============================================================================
// SUITE 2: CONFIGURACIÓN NEWSDATA
// =============================================================================

test.describe('Prompt 24 - Configuración NewsData', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Config' });
  let configContent: string;

  test.beforeAll(async () => {
    configContent = fs.readFileSync(NEWSDATA_CONFIG_PATH, 'utf-8');
  });

  test('NEWSDATA_QUERY contiene "artificial intelligence"', async () => {
    logger.info('Verificando query de búsqueda');
    expect(configContent).toContain('artificial intelligence');
  });

  test('DEFAULT_NEWS_LIMIT es un número positivo', async () => {
    logger.info('Verificando DEFAULT_NEWS_LIMIT');
    expect(configContent).toContain('export const DEFAULT_NEWS_LIMIT');
    // Extraer valor numérico
    const match = configContent.match(/DEFAULT_NEWS_LIMIT\s*=\s*(\d+)/);
    expect(match).not.toBeNull();
    const value = parseInt(match![1]);
    expect(value).toBeGreaterThan(0);
  });

  test('MAX_NEWS_LIMIT >= DEFAULT_NEWS_LIMIT', async () => {
    logger.info('Verificando MAX_NEWS_LIMIT');
    expect(configContent).toContain('export const MAX_NEWS_LIMIT');
    const defaultMatch = configContent.match(/DEFAULT_NEWS_LIMIT\s*=\s*(\d+)/);
    const maxMatch = configContent.match(/MAX_NEWS_LIMIT\s*=\s*(\d+)/);
    expect(defaultMatch).not.toBeNull();
    expect(maxMatch).not.toBeNull();
    expect(parseInt(maxMatch![1])).toBeGreaterThanOrEqual(parseInt(defaultMatch![1]));
  });

  test('COMPANY_ALIASES tiene al menos 30 entradas', async () => {
    logger.info('Verificando cantidad de aliases');
    // Extraer bloque entre COMPANY_ALIASES = { ... }
    const aliasStart = configContent.indexOf('export const COMPANY_ALIASES');
    const blockStart = configContent.indexOf('{', aliasStart);
    const blockEnd = configContent.indexOf('};', blockStart);
    const aliasBlock = configContent.substring(blockStart, blockEnd);
    // Contar líneas con patrón 'key': 'value'
    const aliasEntries = aliasBlock.match(/'[^']+'\s*:\s*'[^']+'/g) || [];
    logger.info(`Encontradas ${aliasEntries.length} entradas en COMPANY_ALIASES`);
    expect(aliasEntries.length).toBeGreaterThanOrEqual(30);
  });

  test('NEWS_TYPE_PATTERNS cubre los 8 tipos principales', async () => {
    logger.info('Verificando cobertura de tipos');
    const types = [
      'product-launch', 'model-release', 'breakthrough', 'controversy',
      'funding', 'acquisition', 'research-paper', 'partnership',
    ];
    for (const type of types) {
      expect(configContent).toContain(`'${type}'`);
    }
  });
});

// =============================================================================
// SUITE 3: NEWSENRICHERSERVICE - ESTRUCTURA
// =============================================================================

test.describe('Prompt 24 - NewsEnricherService Estructura', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Enricher' });
  let enricherContent: string;

  test.beforeAll(async () => {
    enricherContent = fs.readFileSync(NEWS_ENRICHER_PATH, 'utf-8');
  });

  test('tiene método público enrichAll', async () => {
    logger.info('Verificando método enrichAll');
    expect(enricherContent).toContain('enrichAll(');
    expect(enricherContent).toMatch(/enrichAll\(items:\s*NewsItem\[\]\)/);
  });

  test('tiene método público enrich', async () => {
    logger.info('Verificando método enrich');
    expect(enricherContent).toContain('enrich(');
    expect(enricherContent).toMatch(/enrich\(item:\s*NewsItem\)/);
  });

  test('tiene método privado detectCompany', async () => {
    logger.info('Verificando método detectCompany');
    expect(enricherContent).toContain('private detectCompany');
  });

  test('tiene método privado detectType', async () => {
    logger.info('Verificando método detectType');
    expect(enricherContent).toContain('private detectType');
  });
});

// =============================================================================
// SUITE 4: DETECCIÓN DE EMPRESAS
// =============================================================================

test.describe('Prompt 24 - Detección de Empresas', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Empresas' });
  let configContent: string;

  test.beforeAll(async () => {
    configContent = fs.readFileSync(NEWSDATA_CONFIG_PATH, 'utf-8');
  });

  test('COMPANY_ALIASES incluye variantes de OpenAI', async () => {
    logger.info('Verificando aliases de OpenAI');
    expect(configContent).toContain("'openai': 'OpenAI'");
    expect(configContent).toContain("'chatgpt': 'OpenAI'");
    expect(configContent).toContain("'gpt-4': 'OpenAI'");
  });

  test('COMPANY_ALIASES incluye variantes de Google/DeepMind', async () => {
    logger.info('Verificando aliases de Google');
    expect(configContent).toContain("'google': 'Google'");
    expect(configContent).toContain("'deepmind': 'DeepMind'");
  });

  test('COMPANY_ALIASES incluye variantes de Anthropic', async () => {
    logger.info('Verificando aliases de Anthropic');
    expect(configContent).toContain("'anthropic': 'Anthropic'");
    expect(configContent).toContain("'claude': 'Anthropic'");
  });

  test('COMPANY_ALIASES incluye variantes de Meta', async () => {
    logger.info('Verificando aliases de Meta');
    expect(configContent).toContain("'meta': 'Meta'");
    expect(configContent).toContain("'llama': 'Meta'");
  });

  test('todas las keys en COMPANY_ALIASES están en lowercase', async () => {
    logger.info('Verificando que keys están en lowercase');
    // Extraer keys del objeto COMPANY_ALIASES
    const aliasSection = configContent.split('export const COMPANY_ALIASES')[1];
    const endIndex = aliasSection.indexOf('};');
    const aliasBlock = aliasSection.substring(0, endIndex);
    const keyMatches = aliasBlock.match(/'([^']+)'\s*:/g) || [];

    for (const keyMatch of keyMatches) {
      const key = keyMatch.replace(/[':\s]/g, '');
      expect(key).toBe(key.toLowerCase());
    }
    logger.info(`Verificadas ${keyMatches.length} keys en lowercase`);
  });

  test('valores de COMPANY_ALIASES corresponden a empresas conocidas', async () => {
    logger.info('Verificando que valores son empresas válidas');
    // Verificar que los valores principales existen
    const scoringContent = fs.readFileSync(SCORING_RULES_PATH, 'utf-8');
    const mainCompanies = ['OpenAI', 'Google', 'Anthropic', 'Microsoft', 'Meta', 'NVIDIA'];
    for (const company of mainCompanies) {
      expect(scoringContent).toContain(`'${company}'`);
    }
  });
});

// =============================================================================
// SUITE 5: DETECCIÓN DE TIPO DE NOTICIA
// =============================================================================

test.describe('Prompt 24 - Detección de Tipo', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Tipos' });
  let configContent: string;

  test.beforeAll(async () => {
    configContent = fs.readFileSync(NEWSDATA_CONFIG_PATH, 'utf-8');
  });

  test('NEWS_TYPE_PATTERNS tiene patrones para product-launch', async () => {
    logger.info('Verificando patrones product-launch');
    expect(configContent).toContain("type: 'product-launch'");
    expect(configContent).toMatch(/launch|presenta|release/);
  });

  test('NEWS_TYPE_PATTERNS tiene patrones para model-release', async () => {
    logger.info('Verificando patrones model-release');
    expect(configContent).toContain("type: 'model-release'");
    expect(configContent).toMatch(/GPT|Claude|Gemini|Llama|model/);
  });

  test('NEWS_TYPE_PATTERNS tiene patrones para breakthrough', async () => {
    logger.info('Verificando patrones breakthrough');
    expect(configContent).toContain("type: 'breakthrough'");
    expect(configContent).toMatch(/breakthrough|avance/);
  });

  test('NEWS_TYPE_PATTERNS tiene patrones para funding', async () => {
    logger.info('Verificando patrones funding');
    expect(configContent).toContain("type: 'funding'");
    expect(configContent).toMatch(/funding|raised|investment/);
  });
});

// =============================================================================
// SUITE 6: INTEGRACIÓN ORCHESTRATOR
// =============================================================================

test.describe('Prompt 24 - Integración Orchestrator', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Orchestrator' });
  let orchestratorContent: string;

  test.beforeAll(async () => {
    orchestratorContent = fs.readFileSync(ORCHESTRATOR_PATH, 'utf-8');
  });

  test('orchestrator importa fetchAINews', async () => {
    logger.info('Verificando import de fetchAINews');
    expect(orchestratorContent).toContain("import { fetchAINews }");
    expect(orchestratorContent).toContain("from './newsAPI'");
  });

  test('orchestrator importa normalizeNewsArticle', async () => {
    logger.info('Verificando import de normalizeNewsArticle');
    expect(orchestratorContent).toContain('normalizeNewsArticle');
    expect(orchestratorContent).toContain("from './types/news.types'");
  });

  test('orchestrator importa NewsEnricherService', async () => {
    logger.info('Verificando import de NewsEnricherService');
    expect(orchestratorContent).toContain('NewsEnricherService');
    expect(orchestratorContent).toContain("from './services/news-enricher.service'");
  });

  test('PASO 2 contiene referencia a NewsData.io', async () => {
    logger.info('Verificando referencia a NewsData.io en PASO 2');
    expect(orchestratorContent).toContain('NewsData.io');
  });

  test('PASO 2 tiene lógica de dry-run', async () => {
    logger.info('Verificando lógica dry-run en PASO 2');
    // Debe tener condición para dry-run que use mock
    expect(orchestratorContent).toContain('dryRun');
    expect(orchestratorContent).toContain('dryReal');
    expect(orchestratorContent).toContain('getMockNews()');
  });

  test('enrichAll se llama después de normalizeNewsArticle', async () => {
    logger.info('Verificando orden: normalizar → enriquecer');
    const normalizeIndex = orchestratorContent.indexOf('articles.map(normalizeNewsArticle)');
    const enrichIndex = orchestratorContent.indexOf('enricher.enrichAll(');
    expect(normalizeIndex).toBeGreaterThan(-1);
    expect(enrichIndex).toBeGreaterThan(-1);
    expect(enrichIndex).toBeGreaterThan(normalizeIndex);
  });
});

// =============================================================================
// SUITE 7: NEWSAPI.TS ACTUALIZADO
// =============================================================================

test.describe('Prompt 24 - newsAPI.ts Actualizado', () => {
  const logger = new TestLogger({ testName: 'Prompt24-NewsAPI' });
  let newsApiContent: string;

  test.beforeAll(async () => {
    newsApiContent = fs.readFileSync(NEWS_API_PATH, 'utf-8');
  });

  test('importa NEWSDATA_QUERY de config', async () => {
    logger.info('Verificando import de NEWSDATA_QUERY');
    expect(newsApiContent).toContain('NEWSDATA_QUERY');
    expect(newsApiContent).toContain("from './config/newsdata.config'");
  });

  test('importa DEFAULT_NEWS_LIMIT de config', async () => {
    logger.info('Verificando import de DEFAULT_NEWS_LIMIT');
    expect(newsApiContent).toContain('DEFAULT_NEWS_LIMIT');
  });

  test('usa NEWSDATA_QUERY en vez de string hardcodeado', async () => {
    logger.info('Verificando uso de NEWSDATA_QUERY en params');
    // Debe usar la variable, no el string hardcodeado
    expect(newsApiContent).toContain('q: NEWSDATA_QUERY');
  });

  test('tiene safety check para MAX_NEWS_LIMIT', async () => {
    logger.info('Verificando safety check de límite');
    expect(newsApiContent).toContain('MAX_NEWS_LIMIT');
    expect(newsApiContent).toContain('Math.min');
  });
});

// =============================================================================
// SUITE 8: COMPATIBILIDAD CON SCORING
// =============================================================================

test.describe('Prompt 24 - Compatibilidad con Scoring', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Compatibilidad' });

  test('COMPANY_SCORES sigue existiendo sin cambios', async () => {
    logger.info('Verificando COMPANY_SCORES intacto');
    const content = fs.readFileSync(SCORING_RULES_PATH, 'utf-8');
    expect(content).toContain('export const COMPANY_SCORES');
    expect(content).toContain("'OpenAI': 10");
    expect(content).toContain("'default': 3");
  });

  test('NEWS_TYPE_SCORES sigue existiendo sin cambios', async () => {
    logger.info('Verificando NEWS_TYPE_SCORES intacto');
    const content = fs.readFileSync(SCORING_RULES_PATH, 'utf-8');
    expect(content).toContain('export const NEWS_TYPE_SCORES');
    expect(content).toContain("'product-launch': 9");
  });

  test('selectTopNewsExcluding sigue importado en orchestrator', async () => {
    logger.info('Verificando import de selectTopNewsExcluding');
    const content = fs.readFileSync(ORCHESTRATOR_PATH, 'utf-8');
    expect(content).toContain('selectTopNewsExcluding');
    expect(content).toContain("from './news-scorer'");
  });
});

// =============================================================================
// SUITE 9: DEAD CODE Y DEPRECACIÓN
// =============================================================================

test.describe('Prompt 24 - Dead Code y Deprecación', () => {
  const logger = new TestLogger({ testName: 'Prompt24-DeadCode' });
  let orchestratorContent: string;

  test.beforeAll(async () => {
    orchestratorContent = fs.readFileSync(ORCHESTRATOR_PATH, 'utf-8');
  });

  test('orchestrator NO contiene extractProductName como función standalone', async () => {
    logger.info('Verificando eliminación de extractProductName');
    // No debe tener la función, solo un comentario de que fue movida
    expect(orchestratorContent).not.toMatch(/function\s+extractProductName\s*\(/);
    expect(orchestratorContent).toContain('extractProductName() eliminado en Prompt 24');
  });

  test('getMockNews tiene tag @deprecated', async () => {
    logger.info('Verificando tag @deprecated en getMockNews');
    expect(orchestratorContent).toContain('@deprecated');
    expect(orchestratorContent).toContain('getMockNews');
  });
});

// =============================================================================
// SUITE 10: NPM SCRIPTS
// =============================================================================

test.describe('Prompt 24 - npm Scripts', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Scripts' });
  let packageContent: string;

  test.beforeAll(async () => {
    const packagePath = path.join(__dirname, '../../package.json');
    packageContent = fs.readFileSync(packagePath, 'utf-8');
  });

  test('root package.json tiene test:newsdata y test:prompt24', async () => {
    logger.info('Verificando scripts de test');
    expect(packageContent).toContain('"test:newsdata"');
    expect(packageContent).toContain('"test:prompt24"');
  });

  test('scripts apuntan a prompt24-newsdata-integration.spec.ts', async () => {
    logger.info('Verificando targets de scripts');
    expect(packageContent).toContain('prompt24-newsdata-integration.spec.ts');
  });
});

// =============================================================================
// SUITE 11: DOCUMENTACIÓN
// =============================================================================

test.describe('Prompt 24 - Documentación', () => {
  const logger = new TestLogger({ testName: 'Prompt24-Docs' });

  test('news-enricher.service.ts tiene JSDoc de clase', async () => {
    logger.info('Verificando JSDoc de NewsEnricherService');
    const content = fs.readFileSync(NEWS_ENRICHER_PATH, 'utf-8');
    expect(content).toContain('@since Prompt 24');
    expect(content).toContain('class NewsEnricherService');
  });

  test('newsdata.config.ts tiene JSDoc de archivo', async () => {
    logger.info('Verificando JSDoc de newsdata.config');
    const content = fs.readFileSync(NEWSDATA_CONFIG_PATH, 'utf-8');
    expect(content).toContain('@fileoverview');
    expect(content).toContain('@since Prompt 24');
  });

  test('orchestrator.ts tiene @updated Prompt 24', async () => {
    logger.info('Verificando @updated tag en orchestrator');
    const content = fs.readFileSync(ORCHESTRATOR_PATH, 'utf-8');
    expect(content).toContain('@updated Prompt 24');
  });

  test('newsAPI.ts tiene @updated Prompt 24', async () => {
    logger.info('Verificando @updated tag en newsAPI');
    const content = fs.readFileSync(NEWS_API_PATH, 'utf-8');
    expect(content).toContain('@updated Prompt 24');
  });
});
