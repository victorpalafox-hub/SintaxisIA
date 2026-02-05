// ===================================
// CODE VALIDATOR - Sistema completo de auto-revisión
// ===================================

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

interface ValidationResult {
  name: string;
  category: string;
  success: boolean;
  message: string;
  errors?: string[];
  warnings?: string[];
}

const ROOT_DIR = path.resolve(__dirname, '../..');
const AUTOMATION_DIR = path.join(ROOT_DIR, 'automation');
const REMOTION_DIR = path.join(ROOT_DIR, 'remotion-app');

// ===================================
// UTILIDADES
// ===================================

function log(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function logCategory(category: string): void {
  console.log(`\n${colors.cyan}${colors.bold}📋 ${category}${colors.reset}`);
  console.log(colors.dim + '─'.repeat(45) + colors.reset);
}

function logResult(result: ValidationResult): void {
  const icon = result.success ? '✅' : '❌';
  const color = result.success ? colors.green : colors.red;
  log(`${icon} ${result.name}: ${result.message}`, color);

  if (result.errors && result.errors.length > 0) {
    result.errors.slice(0, 3).forEach(err => log(`   └─ ${err}`, colors.red));
    if (result.errors.length > 3) {
      log(`   └─ ... y ${result.errors.length - 3} más`, colors.dim);
    }
  }
  if (result.warnings && result.warnings.length > 0) {
    result.warnings.slice(0, 3).forEach(warn => log(`   └─ ${warn}`, colors.yellow));
  }
}

function readFileContent(filePath: string): string {
  try {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
  } catch {
    return '';
  }
}

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.includes('node_modules')) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

// ===================================
// 1. COMPILACIÓN
// ===================================

async function validateBuildAutomation(): Promise<ValidationResult> {
  try {
    await execAsync('npm run build', { cwd: AUTOMATION_DIR, timeout: 60000 });
    return {
      name: 'Build automation',
      category: 'Compilación',
      success: true,
      message: 'Compilación exitosa',
    };
  } catch (error: any) {
    const errorMsg = error.stderr || error.stdout || 'Error desconocido';
    return {
      name: 'Build automation',
      category: 'Compilación',
      success: false,
      message: 'Error de compilación',
      errors: [errorMsg.slice(0, 150)],
    };
  }
}

async function validateBuildRemotion(): Promise<ValidationResult> {
  try {
    await execAsync('npm run build', { cwd: REMOTION_DIR, timeout: 120000 });
    return {
      name: 'Build remotion-app',
      category: 'Compilación',
      success: true,
      message: 'Bundle generado correctamente',
    };
  } catch (error: any) {
    return {
      name: 'Build remotion-app',
      category: 'Compilación',
      success: false,
      message: 'Error de bundling',
      errors: [error.stderr?.slice(0, 150) || 'Error desconocido'],
    };
  }
}

// ===================================
// 2. TIPOS TYPESCRIPT
// ===================================

async function validateTypesAutomation(): Promise<ValidationResult> {
  try {
    await execAsync('npx tsc --noEmit', { cwd: AUTOMATION_DIR, timeout: 60000 });
    return {
      name: 'TypeScript automation',
      category: 'Tipos',
      success: true,
      message: 'Sin errores de tipos',
    };
  } catch (error: any) {
    const output = error.stdout || '';
    const errors = output.split('\n').filter((line: string) => line.includes('error TS'));
    return {
      name: 'TypeScript automation',
      category: 'Tipos',
      success: false,
      message: `${errors.length} errores de tipos`,
      errors,
    };
  }
}

async function validateTypesRemotion(): Promise<ValidationResult> {
  try {
    await execAsync('npx tsc --noEmit', { cwd: REMOTION_DIR, timeout: 60000 });
    return {
      name: 'TypeScript remotion-app',
      category: 'Tipos',
      success: true,
      message: 'Sin errores de tipos',
    };
  } catch (error: any) {
    const output = error.stdout || '';
    const errors = output.split('\n').filter((line: string) => line.includes('error TS'));
    return {
      name: 'TypeScript remotion-app',
      category: 'Tipos',
      success: false,
      message: `${errors.length} errores de tipos`,
      errors,
    };
  }
}

// ===================================
// 3. IMPORTS
// ===================================

async function validateImports(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Archivos críticos que deben existir
  const criticalFiles = [
    { path: path.join(REMOTION_DIR, 'src/Video.tsx'), name: 'Video.tsx' },
    { path: path.join(REMOTION_DIR, 'src/Root.tsx'), name: 'Root.tsx' },
    { path: path.join(REMOTION_DIR, 'src/theme.ts'), name: 'theme.ts' },
    { path: path.join(AUTOMATION_DIR, 'src/config.ts'), name: 'config.ts' },
    { path: path.join(AUTOMATION_DIR, 'src/entityMapping.ts'), name: 'entityMapping.ts' },
    { path: path.join(AUTOMATION_DIR, 'src/index.ts'), name: 'index.ts' },
  ];

  for (const file of criticalFiles) {
    if (!fs.existsSync(file.path)) {
      errors.push(`Archivo crítico no encontrado: ${file.name}`);
    }
  }

  // Verificar imports en archivos principales
  const filesToCheck = getAllTsFiles(path.join(REMOTION_DIR, 'src'));

  for (const filePath of filesToCheck.slice(0, 20)) { // Limitar para performance
    const content = readFileContent(filePath);
    const importMatches = content.match(/from\s+['"]([^'"]+)['"]/g) || [];

    for (const importMatch of importMatches) {
      const importPath = importMatch.match(/from\s+['"]([^'"]+)['"]/)?.[1] || '';

      // Solo verificar imports relativos
      if (importPath.startsWith('.')) {
        const dir = path.dirname(filePath);
        let resolvedPath = path.resolve(dir, importPath);

        // Agregar extensiones posibles
        const extensions = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
        const exists = extensions.some(ext => fs.existsSync(resolvedPath + ext));

        if (!exists) {
          warnings.push(`${path.basename(filePath)}: Import no resuelto '${importPath}'`);
        }
      }
    }
  }

  return {
    name: 'Imports y rutas',
    category: 'Imports',
    success: errors.length === 0,
    message: errors.length === 0
      ? (warnings.length === 0 ? 'Todos los imports correctos' : `${warnings.length} advertencias`)
      : `${errors.length} errores críticos`,
    errors,
    warnings: warnings.slice(0, 5),
  };
}

// ===================================
// 4. FLEXIBILIDAD (No hardcoding)
// ===================================

async function validateFlexibility(): Promise<ValidationResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Archivos que DEBEN usar theme
  const themeRequiredFiles = [
    path.join(REMOTION_DIR, 'src/Video.tsx'),
    path.join(REMOTION_DIR, 'src/Root.tsx'),
    path.join(REMOTION_DIR, 'src/components/ui/Watermark.tsx'),
    path.join(REMOTION_DIR, 'src/components/ui/KaraokeSubtitles.tsx'),
  ];

  // Colores aceptables (definidos en theme.ts o como props por defecto)
  const acceptableColors = [
    '#4A9EFF', '#64748B', '#38BDF8', '#ffd700', '#ff3366',
    '#0F1419', '#1a2332', '#151d28', '#F0F6FC', '#8B949E', '#484F58',
    // Legacy (temas alternativos)
    '#00f0ff', '#ff0099', '#cc00ff', '#0a0a0f', '#ffffff', '#888888'
  ];

  for (const filePath of themeRequiredFiles) {
    if (!fs.existsSync(filePath)) continue;

    const content = readFileContent(filePath);
    const fileName = path.basename(filePath);

    // Verificar que importa theme
    if (!content.includes("from './theme'") &&
        !content.includes("from '../theme'") &&
        !content.includes("from '../../theme'")) {
      if (fileName !== 'Root.tsx' || !content.includes("import { theme }")) {
        // Root.tsx podría tener import diferente
        const hasThemeImport = content.includes('theme');
        if (!hasThemeImport) {
          warnings.push(`${fileName}: No importa theme.ts`);
        }
      }
    }

    // Buscar colores hardcodeados problemáticos
    const colorMatches = content.match(/#[0-9a-fA-F]{6}/g) || [];
    const problematicColors = colorMatches.filter(
      color => !acceptableColors.includes(color.toLowerCase())
    );

    if (problematicColors.length > 3) {
      warnings.push(`${fileName}: ${problematicColors.length} colores no del theme`);
    }
  }

  // Verificar que config.ts tiene estructura correcta
  const configPath = path.join(AUTOMATION_DIR, 'src/config.ts');
  const configContent = readFileContent(configPath);

  const requiredConfigSections = ['api:', 'video:', 'content:', 'paths:', 'watermark:'];
  for (const section of requiredConfigSections) {
    if (!configContent.includes(section)) {
      errors.push(`config.ts: Falta sección '${section.replace(':', '')}'`);
    }
  }

  // Verificar theme.ts
  const themePath = path.join(REMOTION_DIR, 'src/theme.ts');
  const themeContent = readFileContent(themePath);

  const requiredThemeSections = ['colors:', 'fonts:', 'sizes:', 'HIGHLIGHT_KEYWORDS'];
  for (const section of requiredThemeSections) {
    if (!themeContent.includes(section)) {
      errors.push(`theme.ts: Falta '${section.replace(':', '')}'`);
    }
  }

  return {
    name: 'Flexibilidad del código',
    category: 'Flexibilidad',
    success: errors.length === 0,
    message: errors.length === 0
      ? (warnings.length === 0 ? 'Código flexible y configurable' : `${warnings.length} sugerencias`)
      : `${errors.length} problemas de estructura`,
    errors,
    warnings,
  };
}

// ===================================
// 5. ESTILO DE CÓDIGO
// ===================================

async function validateCodeStyle(): Promise<ValidationResult> {
  const warnings: string[] = [];

  const allFiles = [
    ...getAllTsFiles(path.join(AUTOMATION_DIR, 'src')),
    ...getAllTsFiles(path.join(REMOTION_DIR, 'src')),
  ];

  let filesWithoutComments = 0;
  let filesWithLongLines = 0;
  let filesWithAnyType = 0;

  for (const filePath of allFiles) {
    const content = readFileContent(filePath);
    const fileName = path.basename(filePath);
    const lines = content.split('\n');

    // Verificar comentarios en archivos principales
    if (lines.length > 50 && !content.includes('//') && !content.includes('/*')) {
      filesWithoutComments++;
    }

    // Verificar líneas muy largas (>120 caracteres)
    const longLines = lines.filter(line => line.length > 120);
    if (longLines.length > 5) {
      filesWithLongLines++;
    }

    // Verificar uso de 'any'
    const anyMatches = content.match(/:\s*any\b/g) || [];
    if (anyMatches.length > 3) {
      filesWithAnyType++;
    }

    // Verificar nombres de funciones descriptivos (funciones de una letra)
    const badFunctionNames = content.match(/function\s+[a-z]\s*\(/g) || [];
    if (badFunctionNames.length > 0) {
      warnings.push(`${fileName}: Funciones con nombres cortos`);
    }
  }

  if (filesWithoutComments > 3) {
    warnings.push(`${filesWithoutComments} archivos grandes sin comentarios`);
  }

  if (filesWithLongLines > 2) {
    warnings.push(`${filesWithLongLines} archivos con líneas muy largas (>120)`);
  }

  if (filesWithAnyType > 2) {
    warnings.push(`${filesWithAnyType} archivos con uso excesivo de 'any'`);
  }

  return {
    name: 'Estilo de código',
    category: 'Estilo',
    success: true, // Warnings no son errores críticos
    message: warnings.length === 0 ? 'Estilo consistente' : `${warnings.length} sugerencias`,
    warnings,
  };
}

// ===================================
// 6. FUNCIONALIDAD
// ===================================

async function validateFunctionality(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar que data.json existe y es válido
  const dataJsonPath = path.join(REMOTION_DIR, 'src/data.json');
  if (fs.existsSync(dataJsonPath)) {
    try {
      const data = JSON.parse(readFileContent(dataJsonPath));
      if (!data.newsItems || !Array.isArray(data.newsItems)) {
        errors.push('data.json: Falta array newsItems');
      }
      if (!data.videoConfig) {
        errors.push('data.json: Falta objeto videoConfig');
      }
    } catch {
      errors.push('data.json: JSON inválido');
    }
  } else {
    warnings.push('data.json no existe (se creará al generar contenido)');
  }

  // Verificar que los componentes principales exportan correctamente
  const componentsToCheck = [
    { path: path.join(REMOTION_DIR, 'src/Video.tsx'), export: 'Video' },
    { path: path.join(REMOTION_DIR, 'src/Root.tsx'), export: 'RemotionRoot' },
    { path: path.join(REMOTION_DIR, 'src/theme.ts'), export: 'theme' },
  ];

  for (const comp of componentsToCheck) {
    if (fs.existsSync(comp.path)) {
      const content = readFileContent(comp.path);
      if (!content.includes(`export const ${comp.export}`) &&
          !content.includes(`export { ${comp.export}`)) {
        errors.push(`${path.basename(comp.path)}: No exporta '${comp.export}'`);
      }
    }
  }

  // Verificar que no hay console.log en producción (excepto en logger)
  const prodFiles = getAllTsFiles(path.join(REMOTION_DIR, 'src/components'));
  let consoleLogs = 0;
  for (const file of prodFiles) {
    const content = readFileContent(file);
    const matches = content.match(/console\.(log|warn|error)/g) || [];
    consoleLogs += matches.length;
  }

  if (consoleLogs > 5) {
    warnings.push(`${consoleLogs} console.log en componentes (considerar remover)`);
  }

  // Verificar manejo de errores en funciones async
  const automationFiles = getAllTsFiles(path.join(AUTOMATION_DIR, 'src'));
  let asyncWithoutTry = 0;
  for (const file of automationFiles) {
    const content = readFileContent(file);
    const asyncFunctions = content.match(/async\s+function|async\s*\(/g) || [];
    const tryBlocks = content.match(/try\s*{/g) || [];

    if (asyncFunctions.length > tryBlocks.length + 2) {
      asyncWithoutTry++;
    }
  }

  if (asyncWithoutTry > 2) {
    warnings.push(`${asyncWithoutTry} archivos con async sin try-catch`);
  }

  return {
    name: 'Funcionalidad',
    category: 'Funcionalidad',
    success: errors.length === 0,
    message: errors.length === 0
      ? (warnings.length === 0 ? 'Funcionalidad verificada' : `${warnings.length} sugerencias`)
      : `${errors.length} problemas encontrados`,
    errors,
    warnings,
  };
}

// ===================================
// EJECUCIÓN PRINCIPAL
// ===================================

export async function runFullValidation(): Promise<boolean> {
  const startTime = Date.now();

  console.log('\n' + '═'.repeat(50));
  log('  🔍 AUTO-REVISIÓN DE CÓDIGO', colors.cyan + colors.bold);
  console.log('═'.repeat(50));
  log(`  Fecha: ${new Date().toLocaleString()}`, colors.dim);

  const results: ValidationResult[] = [];

  // 1. COMPILACIÓN
  logCategory('1. Compilación');
  results.push(await validateBuildAutomation());
  logResult(results[results.length - 1]);
  results.push(await validateBuildRemotion());
  logResult(results[results.length - 1]);

  // 2. TIPOS TYPESCRIPT
  logCategory('2. Tipos TypeScript');
  results.push(await validateTypesAutomation());
  logResult(results[results.length - 1]);
  results.push(await validateTypesRemotion());
  logResult(results[results.length - 1]);

  // 3. IMPORTS
  logCategory('3. Imports');
  results.push(await validateImports());
  logResult(results[results.length - 1]);

  // 4. FLEXIBILIDAD
  logCategory('4. Flexibilidad');
  results.push(await validateFlexibility());
  logResult(results[results.length - 1]);

  // 5. ESTILO DE CÓDIGO
  logCategory('5. Estilo de Código');
  results.push(await validateCodeStyle());
  logResult(results[results.length - 1]);

  // 6. FUNCIONALIDAD
  logCategory('6. Funcionalidad');
  results.push(await validateFunctionality());
  logResult(results[results.length - 1]);

  // RESUMEN FINAL
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const withWarnings = results.filter(r => r.warnings && r.warnings.length > 0).length;
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '═'.repeat(50));
  log('  📊 RESUMEN', colors.cyan + colors.bold);
  console.log('═'.repeat(50));

  log(`  ✅ Pasadas: ${passed}/${results.length}`, colors.green);
  if (failed > 0) {
    log(`  ❌ Fallidas: ${failed}`, colors.red);
  }
  if (withWarnings > 0) {
    log(`  ⚠️  Con advertencias: ${withWarnings}`, colors.yellow);
  }
  log(`  ⏱️  Tiempo: ${duration}s`, colors.blue);

  console.log('\n' + '─'.repeat(50));

  if (failed === 0) {
    log('\n  ✨ Cambios validados, listo para continuar\n', colors.green + colors.bold);
  } else {
    log('\n  ⛔ Hay problemas que resolver antes de continuar\n', colors.red + colors.bold);
    log('  Revisar errores arriba y corregir.', colors.yellow);
  }

  console.log('');

  return failed === 0;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runFullValidation()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
      console.error('Error ejecutando validación:', err);
      process.exit(1);
    });
}
