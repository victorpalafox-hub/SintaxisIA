/**
 * @fileoverview Tests para Prompt 19 - Output Manager + Dry-Run Real
 *
 * Valida:
 * - OutputManager service existe y funciona correctamente
 * - Sanitización de slugs
 * - Estructura de carpetas de output
 * - Formato de script.txt legible
 * - CLI --dry-real opción
 * - Integración VideoRenderingService en orchestrator
 * - Paso save_outputs en pipeline
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19
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
// SUITE 1: OUTPUT MANAGER SERVICE - EXISTENCIA Y EXPORTS
// =============================================================================

test.describe('PROMPT 19: Output Manager Service', () => {
  test('output-manager.service.ts debe existir', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const exists = fs.existsSync(servicePath);

    // Assert
    expect(exists).toBe(true);
  });

  test('output.config.ts debe existir', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const exists = fs.existsSync(configPath);

    // Assert
    expect(exists).toBe(true);
  });

  test('output-manager debe exportar outputManager singleton', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('export const outputManager');
    expect(content).toContain('class OutputManagerService');
  });

  test('output-manager debe exportar OUTPUT_PATHS', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('OUTPUT_PATHS');
  });

  test('output-manager debe exportar OutputData interface', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('export interface OutputData');
  });
});

// =============================================================================
// SUITE 2: SANITIZACIÓN DE SLUGS
// =============================================================================

test.describe('PROMPT 19: Slug Sanitization', () => {
  test('output-manager debe tener método sanitizeSlug', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('sanitizeSlug');
    expect(content).toContain('maxLength');
  });

  test('sanitizeSlug debe manejar caracteres especiales', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - Debe tener lógica para normalizar y limpiar
    expect(content).toContain('normalize');
    expect(content).toContain('replace');
    expect(content).toContain('toLowerCase');
  });

  test('sanitizeSlug debe tener límite de longitud configurable', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('slugMaxLength');
    expect(content).toContain('OUTPUT_SLUG_MAX_LENGTH');
  });

  test('sanitizeSlug debe manejar títulos vacíos', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('sin-titulo');
  });

  test('config debe permitir separadores configurables', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('dateSeparator');
    expect(content).toContain('wordSeparator');
  });
});

// =============================================================================
// SUITE 3: ESTRUCTURA DE CARPETAS DE OUTPUT
// =============================================================================

test.describe('PROMPT 19: Output Folder Structure', () => {
  test('output-manager debe crear formato YYYY-MM-DD_slug', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('createFolderName');
    expect(content).toContain('formatDate');
  });

  test('output-manager debe guardar todos los archivos requeridos', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert - Verificar métodos de guardado
    expect(content).toContain('saveNewsJson');
    expect(content).toContain('saveScoreJson');
    expect(content).toContain('saveScriptJson');
    expect(content).toContain('saveScriptTxt');
    expect(content).toContain('saveImagesJson');
    expect(content).toContain('copyAudioFile');
    expect(content).toContain('saveMetadataJson');
    expect(content).toContain('copyVideoFile');
  });

  test('output-manager debe copiar a tiktok-manual', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('copyToTikTokManual');
    expect(content).toContain('tiktokPath');
  });

  test('config debe definir nombres de archivos configurables', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('OUTPUT_FILES');
    expect(content).toContain('news');
    expect(content).toContain('score');
    expect(content).toContain('scriptJson');
    expect(content).toContain('scriptTxt');
    expect(content).toContain('metadata');
    expect(content).toContain('video');
  });
});

// =============================================================================
// SUITE 4: FORMATO DE SCRIPT.TXT
// =============================================================================

test.describe('PROMPT 19: Script.txt Format', () => {
  test('output-manager debe formatear script legible', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');

    // Act
    const content = fs.readFileSync(servicePath, 'utf-8');

    // Assert
    expect(content).toContain('formatScriptTxt');
  });

  test('script.txt debe incluir secciones HOOK, BODY, OPINION, CTA', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('HOOK');
    expect(content).toContain('BODY');
    expect(content).toContain('OPINION');
    expect(content).toContain('CTA');
  });

  test('script.txt debe incluir Alex Torres como personaje', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('Alex Torres');
  });

  test('script.txt debe incluir compliance report', async () => {
    // Arrange
    const servicePath = path.join(AUTOMATION_SRC, 'services', 'output-manager.service.ts');
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const serviceContent = fs.readFileSync(servicePath, 'utf-8');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Assert - Service usa complianceReport
    expect(serviceContent).toContain('complianceReport');
    // Config define la sección COMPLIANCE REPORT
    expect(configContent).toContain('COMPLIANCE');
  });
});

// =============================================================================
// SUITE 5: CLI OPTIONS - DRY REAL
// =============================================================================

test.describe('PROMPT 19: CLI --dry-real Option', () => {
  test('cli.ts debe soportar --dry-real flag', async () => {
    // Arrange
    const cliPath = path.join(AUTOMATION_SRC, 'cli.ts');

    // Act
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain('--dry-real');
    expect(content).toContain('-dr');
  });

  test('cli.ts debe tener dryReal en parseArgs', async () => {
    // Arrange
    const cliPath = path.join(AUTOMATION_SRC, 'cli.ts');

    // Act
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain('dryReal:');
  });

  test('CLIOptions debe incluir dryReal', async () => {
    // Arrange
    const typesPath = path.join(AUTOMATION_SRC, 'types', 'orchestrator.types.ts');

    // Act
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('dryReal: boolean');
  });

  test('OrchestratorConfig debe incluir dryReal', async () => {
    // Arrange
    const typesPath = path.join(AUTOMATION_SRC, 'types', 'orchestrator.types.ts');

    // Act
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('dryReal?:');
  });

  test('showHelp debe documentar --dry-real', async () => {
    // Arrange
    const cliPath = path.join(AUTOMATION_SRC, 'cli.ts');

    // Act
    const content = fs.readFileSync(cliPath, 'utf-8');

    // Assert
    expect(content).toContain('automation:dry-real');
  });
});

// =============================================================================
// SUITE 6: ORCHESTRATOR INTEGRATION
// =============================================================================

test.describe('PROMPT 19: Orchestrator Integration', () => {
  test('orchestrator debe importar videoRenderingService', async () => {
    // Arrange
    const orchestratorPath = path.join(AUTOMATION_SRC, 'orchestrator.ts');

    // Act
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain("import { videoRenderingService }");
  });

  test('orchestrator debe importar outputManager', async () => {
    // Arrange
    const orchestratorPath = path.join(AUTOMATION_SRC, 'orchestrator.ts');

    // Act
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain("import { outputManager");
  });

  test('PipelineStepName debe incluir save_outputs', async () => {
    // Arrange
    const typesPath = path.join(AUTOMATION_SRC, 'types', 'orchestrator.types.ts');

    // Act
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain("'save_outputs'");
  });

  test('orchestrator debe tener paso save_outputs', async () => {
    // Arrange
    const orchestratorPath = path.join(AUTOMATION_SRC, 'orchestrator.ts');

    // Act
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain("executeStep('save_outputs'");
  });
});

// =============================================================================
// SUITE 7: VIDEO RENDERING SERVICE INTEGRATION
// =============================================================================

test.describe('PROMPT 19: VideoRenderingService in Orchestrator', () => {
  test('orchestrator debe llamar videoRenderingService.renderVideo', async () => {
    // Arrange
    const orchestratorPath = path.join(AUTOMATION_SRC, 'orchestrator.ts');

    // Act
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain('videoRenderingService.renderVideo');
  });

  test('orchestrator debe mapear audioDuration correctamente', async () => {
    // Arrange
    const orchestratorPath = path.join(AUTOMATION_SRC, 'orchestrator.ts');

    // Act
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain('audioDuration:');
    expect(content).toContain('audioData.durationSeconds');
  });

  test('orchestrator debe manejar renderResult.success', async () => {
    // Arrange
    const orchestratorPath = path.join(AUTOMATION_SRC, 'orchestrator.ts');

    // Act
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain('renderResult.success');
    expect(content).toContain('renderResult.error');
  });

  test('orchestrator debe diferenciar dry run de dry-real', async () => {
    // Arrange
    const orchestratorPath = path.join(AUTOMATION_SRC, 'orchestrator.ts');

    // Act
    const content = fs.readFileSync(orchestratorPath, 'utf-8');

    // Assert
    expect(content).toContain('finalConfig.dryReal');
    expect(content).toContain('finalConfig.dryRun && !finalConfig.dryReal');
  });
});

// =============================================================================
// SUITE 8: OUTPUT SUMMARY
// =============================================================================

test.describe('PROMPT 19: OutputSummary Interface', () => {
  test('OutputSummary debe existir en orchestrator.types.ts', async () => {
    // Arrange
    const typesPath = path.join(AUTOMATION_SRC, 'types', 'orchestrator.types.ts');

    // Act
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('export interface OutputSummary');
  });

  test('OutputSummary debe tener outputFolder', async () => {
    // Arrange
    const typesPath = path.join(AUTOMATION_SRC, 'types', 'orchestrator.types.ts');

    // Act
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('outputFolder: string');
  });

  test('OutputSummary debe tener tiktokPath', async () => {
    // Arrange
    const typesPath = path.join(AUTOMATION_SRC, 'types', 'orchestrator.types.ts');

    // Act
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('tiktokPath: string');
  });

  test('PipelineResult debe tener outputSummary opcional', async () => {
    // Arrange
    const typesPath = path.join(AUTOMATION_SRC, 'types', 'orchestrator.types.ts');

    // Act
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Assert
    expect(content).toContain('outputSummary?: OutputSummary');
  });
});

// =============================================================================
// SUITE 9: PACKAGE.JSON SCRIPTS
// =============================================================================

test.describe('PROMPT 19: Package.json Scripts', () => {
  test('automation/package.json debe tener pipeline:dry-real', async () => {
    // Arrange
    const packagePath = path.join(PROJECT_ROOT, 'automation', 'package.json');

    // Act
    const content = fs.readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert
    expect(pkg.scripts['pipeline:dry-real']).toBeDefined();
    expect(pkg.scripts['pipeline:dry-real']).toContain('--dry-real');
  });

  test('root package.json debe tener automation:dry-real', async () => {
    // Arrange
    const packagePath = path.join(PROJECT_ROOT, 'package.json');

    // Act
    const content = fs.readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert
    expect(pkg.scripts['automation:dry-real']).toBeDefined();
  });

  test('root package.json debe tener test:output-manager', async () => {
    // Arrange
    const packagePath = path.join(PROJECT_ROOT, 'package.json');

    // Act
    const content = fs.readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert
    expect(pkg.scripts['test:output-manager']).toBeDefined();
  });

  test('root package.json debe tener test:prompt19', async () => {
    // Arrange
    const packagePath = path.join(PROJECT_ROOT, 'package.json');

    // Act
    const content = fs.readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(content);

    // Assert
    expect(pkg.scripts['test:prompt19']).toBeDefined();
  });
});

// =============================================================================
// SUITE 10: CONFIGURACIÓN FLEXIBLE (ANTI-HARDCODE)
// =============================================================================

test.describe('PROMPT 19: Anti-Hardcode Configuration', () => {
  test('output.config debe usar variables de entorno para paths', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('process.env.OUTPUT_BASE_DIR');
    expect(content).toContain('process.env.OUTPUT_TIKTOK_DIR');
  });

  test('output.config debe usar variables de entorno para formato', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('process.env.OUTPUT_SLUG_MAX_LENGTH');
  });

  test('output.config debe usar variables de entorno para nombres de archivos', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('process.env.OUTPUT_FILE_');
  });

  test('output.config debe exportar OUTPUT_CONFIG consolidado', async () => {
    // Arrange
    const configPath = path.join(AUTOMATION_SRC, 'config', 'output.config.ts');

    // Act
    const content = fs.readFileSync(configPath, 'utf-8');

    // Assert
    expect(content).toContain('export const OUTPUT_CONFIG');
  });
});
