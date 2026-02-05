/**
 * @fileoverview CLI de Gestion de Noticias Publicadas - Prompt 22
 *
 * Interfaz de linea de comandos para administrar el historial
 * de noticias publicadas del sistema anti-duplicacion (Prompt 21).
 *
 * Permite:
 * - Ver historial completo, activos, expirados
 * - Buscar noticias por titulo
 * - Ver detalles de una noticia
 * - Desbloquear noticias para re-publicar
 * - Limpiar entries expirados o todo el historial
 * - Ver estadisticas del tracker
 *
 * @example
 * ```bash
 * # Desde raiz del proyecto
 * npm run news:history
 * npm run news:stats
 *
 * # Comandos con argumentos (desde automation/)
 * cd automation && ts-node src/news-manager-cli.ts search "gemini"
 * cd automation && ts-node src/news-manager-cli.ts unlock abc123def
 * ```
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 22
 */

import * as readline from 'readline';
import { PublishedNewsTracker } from './services/published-news-tracker.service';
import { PUBLISHED_NEWS_CONFIG } from './config/published-news.config';
import { PublishedNewsEntry } from './types/published-news.types';

// =============================================================================
// COLORES ANSI
// =============================================================================

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

// =============================================================================
// HELPERS DE FORMATO
// =============================================================================

/**
 * Trunca un string a N caracteres agregando "..." si excede
 */
function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

/**
 * Formatea una fecha ISO a formato legible YYYY-MM-DD HH:mm
 */
function formatDate(isoDate: string): string {
  return isoDate.slice(0, 16).replace('T', ' ');
}

/**
 * Determina si un entry esta activo (dentro de ventana de cooldown)
 */
function isActive(entry: PublishedNewsEntry): boolean {
  const cooldownMs =
    PUBLISHED_NEWS_CONFIG.cooldownDays * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(entry.publishedAt).getTime() < cooldownMs;
}

/**
 * Imprime una linea separadora
 */
function separator(length: number = 90): void {
  console.log(COLORS.dim + '-'.repeat(length) + COLORS.reset);
}

/**
 * Pide confirmacion al usuario (s/n)
 */
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question + ' (s/n): ', answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 's');
    });
  });
}

/**
 * Imprime entries en formato tabla
 */
function printTable(entries: PublishedNewsEntry[]): void {
  if (entries.length === 0) {
    console.log(
      `${COLORS.yellow}  No hay noticias para mostrar.${COLORS.reset}`,
    );
    return;
  }

  // Header
  console.log(
    `${COLORS.bold}  ${'ID'.padEnd(10)} ${'Fecha'.padEnd(18)} ${'Titulo'.padEnd(50)} ${'Empresa'.padEnd(14)} ${'Score'.padEnd(6)} Estado${COLORS.reset}`,
  );
  separator();

  for (const entry of entries) {
    const id = entry.newsId.slice(-8);
    const date = formatDate(entry.publishedAt);
    const title = truncate(entry.title, 48);
    const company = truncate(entry.company || '-', 12);
    const score = String(entry.score).padStart(3);
    const active = isActive(entry);
    const status = active
      ? `${COLORS.green}activa${COLORS.reset}`
      : `${COLORS.dim}expirada${COLORS.reset}`;

    console.log(
      `  ${COLORS.cyan}${id.padEnd(10)}${COLORS.reset} ${date.padEnd(18)} ${title.padEnd(50)} ${company.padEnd(14)} ${score}   ${status}`,
    );
  }
}

// =============================================================================
// COMANDOS
// =============================================================================

/**
 * Comando: history - Muestra historial completo
 */
async function cmdHistory(
  tracker: PublishedNewsTracker,
  args: string[],
): Promise<void> {
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

  const entries = tracker.getHistory(limit);
  const active = tracker.getActiveEntries();
  const expired = tracker.getExpiredEntries();

  console.log('');
  console.log(
    `${COLORS.bold}📚 HISTORIAL DE NOTICIAS PUBLICADAS${COLORS.reset}`,
  );
  separator();
  console.log(
    `  Total: ${entries.length} noticias | ${COLORS.green}${active.length} activas${COLORS.reset} | ${COLORS.dim}${expired.length} expiradas${COLORS.reset}`,
  );
  console.log('');

  printTable(entries);
  console.log('');
}

/**
 * Comando: active - Muestra solo noticias activas
 */
async function cmdActive(tracker: PublishedNewsTracker): Promise<void> {
  const entries = tracker.getActiveEntries();

  console.log('');
  console.log(
    `${COLORS.bold}🟢 NOTICIAS ACTIVAS${COLORS.reset} ${COLORS.dim}(cooldown: ${PUBLISHED_NEWS_CONFIG.cooldownDays} dias)${COLORS.reset}`,
  );
  separator();
  console.log(
    `  Estas noticias ${COLORS.yellow}BLOQUEAN${COLORS.reset} re-publicacion.`,
  );
  console.log(`  Total: ${entries.length}`);
  console.log('');

  printTable(entries);
  console.log('');
}

/**
 * Comando: expired - Muestra solo noticias expiradas
 */
async function cmdExpired(tracker: PublishedNewsTracker): Promise<void> {
  const entries = tracker.getExpiredEntries();

  console.log('');
  console.log(
    `${COLORS.bold}⏰ NOTICIAS EXPIRADAS${COLORS.reset} ${COLORS.dim}(fuera de ventana de ${PUBLISHED_NEWS_CONFIG.cooldownDays} dias)${COLORS.reset}`,
  );
  separator();
  console.log(
    `  Estas noticias ${COLORS.green}NO bloquean${COLORS.reset} re-publicacion.`,
  );
  console.log(`  Total: ${entries.length}`);
  console.log('');

  printTable(entries);
  console.log('');
}

/**
 * Comando: search <query> - Buscar por titulo
 */
async function cmdSearch(
  tracker: PublishedNewsTracker,
  args: string[],
): Promise<void> {
  const query = args.join(' ');
  if (!query) {
    console.error(
      `${COLORS.red}Error: Se requiere un termino de busqueda.${COLORS.reset}`,
    );
    console.log('  Uso: ts-node src/news-manager-cli.ts search <query>');
    process.exit(1);
  }

  const results = tracker.searchByTitle(query);

  console.log('');
  console.log(
    `${COLORS.bold}🔍 BUSQUEDA: "${query}"${COLORS.reset}`,
  );
  separator();
  console.log(`  Encontrados: ${results.length} resultado(s)`);
  console.log('');

  printTable(results);
  console.log('');
}

/**
 * Comando: view <id> - Ver detalles de una noticia
 */
async function cmdView(
  tracker: PublishedNewsTracker,
  args: string[],
): Promise<void> {
  const partialId = args[0];
  if (!partialId) {
    console.error(
      `${COLORS.red}Error: Se requiere un ID de noticia.${COLORS.reset}`,
    );
    console.log('  Uso: ts-node src/news-manager-cli.ts view <news-id>');
    process.exit(1);
  }

  if (partialId.length < 6) {
    console.error(
      `${COLORS.red}Error: ID debe tener al menos 6 caracteres.${COLORS.reset}`,
    );
    process.exit(1);
  }

  // Intentar match exacto primero, luego parcial
  let entry = tracker.getById(partialId);
  if (!entry) {
    const matches = tracker.findByPartialId(partialId);
    if (matches.length === 0) {
      console.error(
        `${COLORS.red}No se encontro noticia con ID '${partialId}'.${COLORS.reset}`,
      );
      process.exit(1);
    }
    if (matches.length > 1) {
      console.log(
        `${COLORS.yellow}Multiples coincidencias para '${partialId}':${COLORS.reset}`,
      );
      for (const m of matches) {
        console.log(`  ${COLORS.cyan}${m.newsId}${COLORS.reset} - ${m.title}`);
      }
      console.log('  Usa un ID mas especifico.');
      process.exit(1);
    }
    entry = matches[0];
  }

  const active = isActive(entry);

  console.log('');
  console.log(
    `${COLORS.bold}📰 DETALLE DE NOTICIA${COLORS.reset}`,
  );
  separator();
  console.log(
    `  ${COLORS.bold}ID:${COLORS.reset}              ${COLORS.cyan}${entry.newsId}${COLORS.reset}`,
  );
  console.log(
    `  ${COLORS.bold}Titulo:${COLORS.reset}          ${entry.title}`,
  );
  console.log(
    `  ${COLORS.bold}Titulo norm.:${COLORS.reset}    ${COLORS.dim}${entry.normalizedTitle}${COLORS.reset}`,
  );
  console.log(
    `  ${COLORS.bold}Empresa:${COLORS.reset}         ${entry.company || '-'}`,
  );
  console.log(
    `  ${COLORS.bold}Producto:${COLORS.reset}        ${entry.productName || '-'}`,
  );
  console.log(
    `  ${COLORS.bold}Fecha:${COLORS.reset}           ${formatDate(entry.publishedAt)}`,
  );
  console.log(
    `  ${COLORS.bold}Score:${COLORS.reset}           ${entry.score}`,
  );
  console.log(
    `  ${COLORS.bold}Output:${COLORS.reset}          ${entry.outputFolder || '-'}`,
  );
  console.log(
    `  ${COLORS.bold}Estado:${COLORS.reset}          ${active ? `${COLORS.green}activa (bloquea re-publicacion)${COLORS.reset}` : `${COLORS.dim}expirada (no bloquea)${COLORS.reset}`}`,
  );
  console.log('');
}

/**
 * Comando: unlock <id> - Desbloquear noticia
 */
async function cmdUnlock(
  tracker: PublishedNewsTracker,
  args: string[],
): Promise<void> {
  const partialId = args[0];
  if (!partialId) {
    console.error(
      `${COLORS.red}Error: Se requiere un ID de noticia.${COLORS.reset}`,
    );
    console.log('  Uso: ts-node src/news-manager-cli.ts unlock <news-id>');
    process.exit(1);
  }

  if (partialId.length < 6) {
    console.error(
      `${COLORS.red}Error: ID debe tener al menos 6 caracteres.${COLORS.reset}`,
    );
    process.exit(1);
  }

  // Buscar por ID exacto o parcial
  let entry = tracker.getById(partialId);
  if (!entry) {
    const matches = tracker.findByPartialId(partialId);
    if (matches.length === 0) {
      console.error(
        `${COLORS.red}No se encontro noticia con ID '${partialId}'.${COLORS.reset}`,
      );
      process.exit(1);
    }
    if (matches.length > 1) {
      console.log(
        `${COLORS.yellow}Multiples coincidencias para '${partialId}':${COLORS.reset}`,
      );
      for (const m of matches) {
        console.log(`  ${COLORS.cyan}${m.newsId}${COLORS.reset} - ${m.title}`);
      }
      console.log('  Usa un ID mas especifico.');
      process.exit(1);
    }
    entry = matches[0];
  }

  // Pedir confirmacion
  const confirmed = await askConfirmation(
    `${COLORS.yellow}Desbloquear '${truncate(entry.title, 60)}'?${COLORS.reset}`,
  );

  if (!confirmed) {
    console.log('  Operacion cancelada.');
    return;
  }

  const removed = tracker.removeById(entry.newsId);
  if (removed) {
    await tracker.save();
    console.log(
      `${COLORS.green}  Noticia desbloqueada: '${truncate(entry.title, 60)}'${COLORS.reset}`,
    );
  } else {
    console.error(
      `${COLORS.red}  Error al desbloquear noticia.${COLORS.reset}`,
    );
  }
}

/**
 * Comando: cleanup - Limpiar entries expirados
 */
async function cmdCleanup(
  tracker: PublishedNewsTracker,
  args: string[],
): Promise<void> {
  const dryRun = args.includes('--dry-run');
  const expired = tracker.getExpiredEntries();

  if (expired.length === 0) {
    console.log(
      `${COLORS.green}  No hay noticias expiradas para limpiar.${COLORS.reset}`,
    );
    return;
  }

  console.log('');
  console.log(
    `🧹 Se encontraron ${COLORS.yellow}${expired.length}${COLORS.reset} noticias expiradas:`,
  );
  console.log('');
  printTable(expired);

  if (dryRun) {
    console.log('');
    console.log(
      `${COLORS.dim}  (--dry-run: no se elimino nada)${COLORS.reset}`,
    );
    return;
  }

  console.log('');
  const result = tracker.cleanupExpired();
  await tracker.save();
  console.log(
    `${COLORS.green}  Limpieza completada. ${result.removed} noticias eliminadas, ${result.remaining} activas conservadas.${COLORS.reset}`,
  );
  console.log('');
}

/**
 * Comando: clear - Limpiar todo el historial
 */
async function cmdClear(tracker: PublishedNewsTracker): Promise<void> {
  const count = tracker.getEntryCount();

  if (count === 0) {
    console.log(
      `${COLORS.yellow}  El historial ya esta vacio.${COLORS.reset}`,
    );
    return;
  }

  const confirmed = await askConfirmation(
    `${COLORS.red}Esto eliminara TODO el historial (${count} noticias). Continuar?${COLORS.reset}`,
  );

  if (!confirmed) {
    console.log('  Operacion cancelada.');
    return;
  }

  const removed = tracker.clearAll();
  await tracker.save();
  console.log(
    `${COLORS.green}  Historial limpiado. ${removed} noticias eliminadas.${COLORS.reset}`,
  );
}

/**
 * Comando: stats - Estadisticas del tracker
 */
async function cmdStats(tracker: PublishedNewsTracker): Promise<void> {
  const stats = tracker.getStats();

  console.log('');
  console.log(
    `${COLORS.bold}📊 ESTADISTICAS DEL HISTORIAL${COLORS.reset}`,
  );
  separator();
  console.log('');
  console.log(`  Total de entries:     ${stats.totalEntries}`);
  console.log(
    `  Entries activos:      ${COLORS.green}${stats.activeEntries}${COLORS.reset}  ${COLORS.dim}(cooldown ${PUBLISHED_NEWS_CONFIG.cooldownDays} dias)${COLORS.reset}`,
  );
  console.log(
    `  Entries expirados:    ${COLORS.dim}${stats.expiredEntries}${COLORS.reset}`,
  );
  console.log(`  Score promedio:       ${stats.averageScore}`);

  if (stats.daysSinceLastPublication !== null) {
    console.log(
      `  Dias sin publicar:    ${stats.daysSinceLastPublication}`,
    );
  }

  console.log('');
  console.log(
    `  ${COLORS.bold}Empresas unicas:${COLORS.reset}      ${stats.uniqueCompanies.length}${stats.uniqueCompanies.length > 0 ? ` (${stats.uniqueCompanies.join(', ')})` : ''}`,
  );
  console.log(
    `  ${COLORS.bold}Productos unicos:${COLORS.reset}     ${stats.uniqueProducts.length}${stats.uniqueProducts.length > 0 ? ` (${stats.uniqueProducts.join(', ')})` : ''}`,
  );

  console.log('');
  console.log(`  ${COLORS.bold}Distribucion por Score:${COLORS.reset}`);
  console.log(
    `    ${COLORS.red}0-74  (low):${COLORS.reset}        ${stats.scoreDistribution.low}`,
  );
  console.log(
    `    ${COLORS.yellow}75-84 (good):${COLORS.reset}       ${stats.scoreDistribution.good}`,
  );
  console.log(
    `    ${COLORS.green}85-94 (high):${COLORS.reset}       ${stats.scoreDistribution.high}`,
  );
  console.log(
    `    ${COLORS.cyan}95+   (excellent):${COLORS.reset}  ${stats.scoreDistribution.excellent}`,
  );

  if (stats.newestEntry) {
    console.log('');
    console.log(
      `  ${COLORS.bold}Mas reciente:${COLORS.reset}  ${formatDate(stats.newestEntry.publishedAt)} - ${truncate(stats.newestEntry.title, 50)}`,
    );
  }
  if (stats.oldestEntry) {
    console.log(
      `  ${COLORS.bold}Mas antiguo:${COLORS.reset}   ${formatDate(stats.oldestEntry.publishedAt)} - ${truncate(stats.oldestEntry.title, 50)}`,
    );
  }
  console.log('');
}

/**
 * Muestra ayuda del CLI
 */
function showHelp(): void {
  console.log(`
${COLORS.bold}📰 Sintaxis IA - News Manager CLI${COLORS.reset}
${COLORS.dim}============================================${COLORS.reset}

Gestion manual del historial de noticias publicadas.
Trabaja sobre: ${COLORS.cyan}${PUBLISHED_NEWS_CONFIG.dataFilePath}${COLORS.reset}
Cooldown:      ${PUBLISHED_NEWS_CONFIG.cooldownDays} dias

${COLORS.bold}Comandos sin argumentos${COLORS.reset} (con alias npm):
  npm run news:history              Ver historial completo
  npm run news:history -- --limit=10  Limitar a 10 resultados
  npm run news:active               Ver noticias activas (bloquean re-publicacion)
  npm run news:expired              Ver noticias expiradas
  npm run news:stats                Ver estadisticas
  npm run news:cleanup              Limpiar entries expirados
  npm run news:help                 Mostrar esta ayuda

${COLORS.bold}Comandos con argumentos${COLORS.reset} (ejecutar con ts-node):
  cd automation && ts-node src/news-manager-cli.ts search <query>     Buscar por titulo
  cd automation && ts-node src/news-manager-cli.ts view <news-id>     Ver detalles
  cd automation && ts-node src/news-manager-cli.ts unlock <news-id>   Desbloquear noticia
  cd automation && ts-node src/news-manager-cli.ts clear              Limpiar TODO

${COLORS.bold}Notas:${COLORS.reset}
  - Los IDs se pueden usar parcialmente (minimo 6 caracteres)
  - unlock requiere confirmacion interactiva
  - clear elimina TODO el historial (requiere confirmacion)
  - cleanup admite --dry-run para ver que se eliminaria
`);
}

// =============================================================================
// PARSEO DE ARGUMENTOS Y MAIN
// =============================================================================

/**
 * Parsea argumentos de linea de comandos
 *
 * @returns Objeto con comando y argumentos restantes
 */
function parseArgs(): { command: string; args: string[] } {
  const rawArgs = process.argv.slice(2);

  // Detectar --help como comando especial
  if (rawArgs.includes('--help') || rawArgs.includes('-h')) {
    return { command: 'help', args: [] };
  }

  const command = rawArgs[0] || 'help';
  const args = rawArgs.slice(1);

  return { command, args };
}

/**
 * Funcion principal del CLI
 */
async function main(): Promise<void> {
  const { command, args } = parseArgs();

  if (command === 'help') {
    showHelp();
    process.exit(0);
  }

  // Cargar tracker
  const tracker = new PublishedNewsTracker();
  try {
    await tracker.load();
  } catch (error) {
    console.error(
      `${COLORS.red}Error al cargar historial: ${error}${COLORS.reset}`,
    );
    console.log(
      `${COLORS.dim}  Archivo: ${PUBLISHED_NEWS_CONFIG.dataFilePath}${COLORS.reset}`,
    );
    process.exit(1);
  }

  // Si no hay datos, mostrar mensaje amigable para comandos de consulta
  const isEmpty = tracker.getEntryCount() === 0;
  const readOnlyCommands = [
    'history',
    'active',
    'expired',
    'search',
    'view',
    'stats',
  ];
  if (isEmpty && readOnlyCommands.includes(command)) {
    console.log('');
    console.log(
      `${COLORS.yellow}  No hay noticias publicadas aun.${COLORS.reset}`,
    );
    console.log(
      `${COLORS.dim}  El historial se llena automaticamente al ejecutar el pipeline.${COLORS.reset}`,
    );
    console.log('');
    process.exit(0);
  }

  // Ejecutar comando
  switch (command) {
    case 'history':
      await cmdHistory(tracker, args);
      break;
    case 'active':
      await cmdActive(tracker);
      break;
    case 'expired':
      await cmdExpired(tracker);
      break;
    case 'search':
      await cmdSearch(tracker, args);
      break;
    case 'view':
      await cmdView(tracker, args);
      break;
    case 'unlock':
      await cmdUnlock(tracker, args);
      break;
    case 'cleanup':
      await cmdCleanup(tracker, args);
      break;
    case 'clear':
      await cmdClear(tracker);
      break;
    case 'stats':
      await cmdStats(tracker);
      break;
    default:
      console.error(
        `${COLORS.red}Comando desconocido: '${command}'${COLORS.reset}`,
      );
      console.log(
        `  Usa ${COLORS.cyan}--help${COLORS.reset} para ver los comandos disponibles.`,
      );
      process.exit(1);
  }
}

// =============================================================================
// EJECUCION
// =============================================================================

main().catch(error => {
  console.error(`${COLORS.red}Error fatal: ${error}${COLORS.reset}`);
  process.exit(1);
});
