/**
 * @fileoverview Tests para Prompt 22 - CLI de Gestion de Noticias Publicadas
 *
 * Valida:
 * - Archivo news-manager-cli.ts existe con imports correctos
 * - TrackerStats interface existe con todos los campos
 * - PublishedNewsTracker tiene nuevos metodos de consulta/gestion
 * - getRecentEntries es public (no private)
 * - Todos los nuevos metodos verifican loaded state
 * - CLI reconoce comandos validos e invalidos
 * - npm scripts existen en ambos package.json
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 22
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
// SUITE 1: CLI FILE STRUCTURE
// =============================================================================

test.describe('PROMPT 22: CLI File Structure', () => {
  const cliPath = path.join(AUTOMATION_SRC, 'news-manager-cli.ts');

  test('news-manager-cli.ts debe existir en automation/src/', async () => {
    // Arrange & Act
    const exists = fs.existsSync(cliPath);

    // Assert
    expect(exists).toBe(true);
  });

  test('CLI debe importar PublishedNewsTracker desde el service correcto', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert - import desde published-news-tracker.service (NO .ts sin .service)
    expect(content).toContain("from './services/published-news-tracker.service'");
  });

  test('CLI debe importar PUBLISHED_NEWS_CONFIG desde config', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("from './config/published-news.config'");
  });

  test('CLI debe usar readline nativo para confirmaciones', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert - usa readline, no inquirer ni prompts
    expect(content).toContain("import * as readline from 'readline'");
    expect(content).not.toContain("from 'inquirer'");
    expect(content).not.toContain("from 'prompts'");
  });

  test('CLI debe tener funcion parseArgs', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain('function parseArgs()');
    expect(content).toContain('process.argv.slice(2)');
  });
});

// =============================================================================
// SUITE 2: TRACKER STATS TYPE
// =============================================================================

test.describe('PROMPT 22: TrackerStats Type', () => {
  const typesPath = path.join(AUTOMATION_SRC, 'types', 'published-news.types.ts');

  test('TrackerStats interface debe existir en published-news.types.ts', async () => {
    // Arrange
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('export interface TrackerStats');
  });

  test('TrackerStats debe tener campos de conteo', async () => {
    // Arrange
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('totalEntries: number');
    expect(content).toContain('activeEntries: number');
    expect(content).toContain('expiredEntries: number');
    expect(content).toContain('averageScore: number');
  });

  test('TrackerStats debe tener scoreDistribution con rangos', async () => {
    // Arrange
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert - verificar que scoreDistribution existe con los 4 rangos
    expect(content).toContain('scoreDistribution');
    expect(content).toContain('low: number');
    expect(content).toContain('good: number');
    expect(content).toContain('high: number');
    expect(content).toContain('excellent: number');
  });

  test('TrackerStats debe tener campos de empresas y productos', async () => {
    // Arrange
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('uniqueCompanies: string[]');
    expect(content).toContain('uniqueProducts: string[]');
  });

  test('TrackerStats debe tener campos de entries extremos y dias', async () => {
    // Arrange
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('oldestEntry');
    expect(content).toContain('newestEntry');
    expect(content).toContain('daysSinceLastPublication');
  });
});

// =============================================================================
// SUITE 3: PUBLISHED NEWS TRACKER - NUEVOS METODOS
// =============================================================================

test.describe('PROMPT 22: PublishedNewsTracker - Nuevos Metodos', () => {
  const servicePath = path.join(AUTOMATION_SRC, 'services', 'published-news-tracker.service.ts');

  test('getHistory() debe existir y retornar PublishedNewsEntry[]', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('getHistory(');
    expect(content).toContain('PublishedNewsEntry[]');
  });

  test('getHistory() debe aceptar parametro limit opcional', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - firma debe tener limit?: number
    const funcMatch = content.match(/getHistory\(limit\?: number\)/);
    expect(funcMatch).toBeTruthy();
  });

  test('getActiveEntries() debe existir', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('getActiveEntries()');
    // Debe usar cooldownDays del config
    const funcStart = content.indexOf('getActiveEntries()');
    const funcBody = content.slice(funcStart, funcStart + 300);
    expect(funcBody).toContain('cooldownDays');
  });

  test('getExpiredEntries() debe existir', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('getExpiredEntries()');
  });

  test('searchByTitle() debe existir y usar normalizeTitle', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('searchByTitle(');
    const funcStart = content.indexOf('searchByTitle(');
    const funcBody = content.slice(funcStart, funcStart + 500);
    expect(funcBody).toContain('normalizeTitle');
  });

  test('getById() debe existir y retornar entry o undefined', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('getById(');
    expect(content).toContain('PublishedNewsEntry | undefined');
  });

  test('findByPartialId() debe existir con validacion minimo 6 chars', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('findByPartialId(');
    const funcStart = content.indexOf('findByPartialId(');
    const funcBody = content.slice(funcStart, funcStart + 300);
    // Debe verificar longitud minima
    expect(funcBody).toContain('length < 6');
  });

  test('removeById() debe existir y retornar boolean', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('removeById(');
    expect(content).toContain('): boolean');
  });

  test('clearAll() debe existir y retornar number', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('clearAll(): number');
  });

  test('cleanupExpired() debe existir y retornar removed + remaining', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('cleanupExpired()');
    const funcStart = content.indexOf('cleanupExpired()');
    const funcBody = content.slice(funcStart, funcStart + 500);
    expect(funcBody).toContain('removed');
    expect(funcBody).toContain('remaining');
  });

  test('getStats() debe existir y retornar TrackerStats', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('getStats(): TrackerStats');
  });

  test('getStats() debe calcular scoreDistribution correctamente', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - debe tener los 4 rangos de score
    const funcStart = content.indexOf('getStats(): TrackerStats');
    const funcBody = content.slice(funcStart, funcStart + 1500);
    expect(funcBody).toContain('scoreDistribution');
    expect(funcBody).toContain('score < 75');
    expect(funcBody).toContain('score < 85');
    expect(funcBody).toContain('score < 95');
  });

  test('tracker debe importar TrackerStats desde types', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('TrackerStats');
    expect(content).toContain("from '../types/published-news.types'");
  });
});

// =============================================================================
// SUITE 4: getRecentEntries VISIBILIDAD
// =============================================================================

test.describe('PROMPT 22: getRecentEntries Visibility', () => {
  const servicePath = path.join(AUTOMATION_SRC, 'services', 'published-news-tracker.service.ts');

  test('getRecentEntries debe ser public (no private)', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - NO debe tener "private getRecentEntries"
    expect(content).not.toMatch(/private\s+getRecentEntries/);
    // Debe tener el metodo sin private
    expect(content).toContain('getRecentEntries(days: number)');
  });

  test('todos los nuevos metodos deben verificar loaded state', async () => {
    // Arrange
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - ensureLoaded debe existir y usarse
    expect(content).toContain('ensureLoaded()');

    // Verificar que los metodos principales usan ensureLoaded
    const methodsToCheck = [
      'getHistory',
      'getActiveEntries',
      'getExpiredEntries',
      'searchByTitle',
      'getById',
      'findByPartialId',
      'removeById',
      'clearAll',
      'cleanupExpired',
      'getStats',
    ];

    for (const method of methodsToCheck) {
      const methodStart = content.indexOf(`${method}(`);
      expect(methodStart).toBeGreaterThan(-1);
      const methodBody = content.slice(methodStart, methodStart + 300);
      expect(methodBody).toContain('ensureLoaded');
    }
  });
});

// =============================================================================
// SUITE 5: CLI COMMANDS
// =============================================================================

test.describe('PROMPT 22: CLI Commands', () => {
  const cliPath = path.join(AUTOMATION_SRC, 'news-manager-cli.ts');

  test('CLI debe reconocer comando history', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'history':");
    expect(content).toContain('cmdHistory');
  });

  test('CLI debe reconocer comando active', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'active':");
    expect(content).toContain('cmdActive');
  });

  test('CLI debe reconocer comando expired', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'expired':");
    expect(content).toContain('cmdExpired');
  });

  test('CLI debe reconocer comando stats', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'stats':");
    expect(content).toContain('cmdStats');
  });

  test('CLI debe reconocer comando search', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'search':");
    expect(content).toContain('cmdSearch');
  });

  test('CLI debe reconocer comando view', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'view':");
    expect(content).toContain('cmdView');
  });

  test('CLI debe reconocer comando unlock', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'unlock':");
    expect(content).toContain('cmdUnlock');
  });

  test('CLI debe reconocer comando cleanup con soporte --dry-run', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'cleanup':");
    expect(content).toContain('--dry-run');
  });

  test('CLI debe reconocer comando clear', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain("case 'clear':");
    expect(content).toContain('cmdClear');
  });

  test('CLI debe manejar comando invalido con mensaje de error', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain('default:');
    expect(content).toContain('Comando desconocido');
    expect(content).toContain('--help');
  });

  test('CLI debe tener funcion showHelp con todos los comandos', async () => {
    // Arrange
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain('function showHelp()');
    expect(content).toContain('news:history');
    expect(content).toContain('news:active');
    expect(content).toContain('news:stats');
    expect(content).toContain('search');
    expect(content).toContain('unlock');
    expect(content).toContain('view');
  });
});

// =============================================================================
// SUITE 6: NPM SCRIPTS
// =============================================================================

test.describe('PROMPT 22: npm Scripts', () => {
  const automationPkgPath = path.join(PROJECT_ROOT, 'automation', 'package.json');
  const rootPkgPath = path.join(PROJECT_ROOT, 'package.json');

  test('automation/package.json debe tener scripts news-manager:*', async () => {
    // Arrange
    const content = fs.readFileSync(automationPkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert
    expect(pkg.scripts['news-manager:history']).toBeDefined();
    expect(pkg.scripts['news-manager:active']).toBeDefined();
    expect(pkg.scripts['news-manager:expired']).toBeDefined();
    expect(pkg.scripts['news-manager:stats']).toBeDefined();
    expect(pkg.scripts['news-manager:cleanup']).toBeDefined();
    expect(pkg.scripts['news-manager:help']).toBeDefined();
  });

  test('scripts en automation deben apuntar a news-manager-cli.ts', async () => {
    // Arrange
    const content = fs.readFileSync(automationPkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert - debe usar news-manager-cli.ts, NO cli/news-manager.ts
    const historyScript = pkg.scripts['news-manager:history'] as string;
    expect(historyScript).toContain('news-manager-cli.ts');
    expect(historyScript).not.toContain('cli/');
  });

  test('scripts deben usar ts-node sin npx', async () => {
    // Arrange
    const content = fs.readFileSync(automationPkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert - ts-node directo, no npx ts-node
    const historyScript = pkg.scripts['news-manager:history'] as string;
    expect(historyScript).toMatch(/^ts-node /);
    expect(historyScript).not.toContain('npx');
  });

  test('root package.json debe tener scripts news:*', async () => {
    // Arrange
    const content = fs.readFileSync(rootPkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert
    expect(pkg.scripts['news:history']).toBeDefined();
    expect(pkg.scripts['news:active']).toBeDefined();
    expect(pkg.scripts['news:expired']).toBeDefined();
    expect(pkg.scripts['news:stats']).toBeDefined();
    expect(pkg.scripts['news:cleanup']).toBeDefined();
    expect(pkg.scripts['news:help']).toBeDefined();
  });

  test('scripts en root deben usar patron cd automation && npm run', async () => {
    // Arrange
    const content = fs.readFileSync(rootPkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert
    const historyScript = pkg.scripts['news:history'] as string;
    expect(historyScript).toContain('cd automation && npm run');
  });

  test('root package.json debe tener scripts de test para prompt22', async () => {
    // Arrange
    const content = fs.readFileSync(rootPkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert
    expect(pkg.scripts['test:news-manager']).toBeDefined();
    expect(pkg.scripts['test:prompt22']).toBeDefined();
    expect(pkg.scripts['test:prompt22']).toContain('prompt22-news-manager-cli.spec.ts');
  });
});
