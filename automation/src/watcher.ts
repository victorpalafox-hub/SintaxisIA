// ===================================
// WATCHER - Monitor de cambios con auto-validación
// ===================================

import fs from 'fs';
import path from 'path';
import { runFullValidation } from './codeValidator';

const ROOT_DIR = path.resolve(__dirname, '../..');
const AUTOMATION_SRC = path.join(ROOT_DIR, 'automation/src');
const REMOTION_SRC = path.join(ROOT_DIR, 'remotion-app/src');

// Configuración
const DEBOUNCE_MS = 2000; // Esperar 2 segundos después del último cambio
const EXTENSIONS = ['.ts', '.tsx', '.json'];

// Estado
let debounceTimer: NodeJS.Timeout | null = null;
let isValidating = false;
let changedFiles: Set<string> = new Set();

// Colores
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset): void {
  const time = new Date().toLocaleTimeString();
  console.log(`${colors.cyan}[${time}]${colors.reset} ${color}${message}${colors.reset}`);
}

function shouldWatch(filename: string): boolean {
  return EXTENSIONS.some(ext => filename.endsWith(ext));
}

async function handleChanges(): Promise<void> {
  if (isValidating) {
    log('Validación en progreso, esperando...', colors.yellow);
    return;
  }

  isValidating = true;
  const files = Array.from(changedFiles);
  changedFiles.clear();

  console.log('\n');
  log(`🔄 Detectados ${files.length} archivo(s) modificado(s):`, colors.magenta + colors.bold);
  files.forEach(f => log(`   └─ ${path.basename(f)}`, colors.yellow));
  console.log('');

  try {
    await runFullValidation();
  } catch (error) {
    console.error('Error en validación:', error);
  } finally {
    isValidating = false;
  }
}

function onFileChange(eventType: string, filename: string, directory: string): void {
  if (!filename || !shouldWatch(filename)) return;

  const fullPath = path.join(directory, filename);
  changedFiles.add(fullPath);

  log(`📝 Cambio detectado: ${filename}`, colors.yellow);

  // Debounce: esperar antes de ejecutar validación
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    handleChanges();
  }, DEBOUNCE_MS);
}

function watchDirectory(directory: string, name: string): void {
  if (!fs.existsSync(directory)) {
    log(`⚠️  Directorio no existe: ${directory}`, colors.yellow);
    return;
  }

  fs.watch(directory, { recursive: true }, (eventType, filename) => {
    onFileChange(eventType, filename || '', directory);
  });

  log(`👁️  Monitoreando: ${name}`, colors.green);
}

// ===================================
// INICIO
// ===================================

console.clear();
console.log('='.repeat(50));
log('🔍 WATCHER - Monitor de Auto-Validación', colors.cyan + colors.bold);
console.log('='.repeat(50));
console.log('');
log('Extensiones monitoreadas: ' + EXTENSIONS.join(', '), colors.yellow);
log(`Debounce: ${DEBOUNCE_MS}ms`, colors.yellow);
console.log('');

// Iniciar watchers
watchDirectory(AUTOMATION_SRC, 'automation/src');
watchDirectory(REMOTION_SRC, 'remotion-app/src');

console.log('');
log('✅ Watcher activo. Esperando cambios...', colors.green + colors.bold);
log('   Presiona Ctrl+C para detener', colors.cyan);
console.log('\n' + '-'.repeat(50) + '\n');

// Ejecutar validación inicial
log('🚀 Ejecutando validación inicial...', colors.magenta);
runFullValidation().then(() => {
  log('✅ Validación inicial completada. Esperando cambios...', colors.green);
});

// Mantener proceso activo
process.on('SIGINT', () => {
  console.log('\n');
  log('👋 Watcher detenido', colors.yellow);
  process.exit(0);
});
