/**
 * @fileoverview CLI para ejecutar pipeline con soporte de Telegram callbacks
 *
 * Interfaz de línea de comandos para el Orchestrator.
 * Permite ejecutar el pipeline con diferentes opciones.
 * Incluye soporte para aprobar/rechazar videos desde Telegram.
 *
 * @example
 * ```bash
 * # Ejecutar pipeline normal
 * npm run automation:run
 *
 * # Dry run (no publica)
 * npm run automation:dry
 *
 * # Modo producción
 * npm run automation:prod
 *
 * # Forzar ejecución
 * npm run automation:force
 *
 * # Ver ayuda
 * npm run automation:help
 * ```
 *
 * @author Sintaxis IA
 * @version 1.1.0
 * @since Prompt 14.2
 */

import { runPipeline } from './orchestrator';
import { initCallbackHandler, stopCallbackHandler } from './notifiers/telegram-callback-handler';
import { CLIOptions } from './types/orchestrator.types';
import { areNotificationsEnabled } from './config/env.config';

// =============================================================================
// PARSEO DE ARGUMENTOS
// =============================================================================

/**
 * Parsea argumentos de línea de comandos
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);

  return {
    dry: args.includes('--dry') || args.includes('-d'),
    prod: args.includes('--prod') || args.includes('-p'),
    force: args.includes('--force') || args.includes('-f'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

// =============================================================================
// AYUDA
// =============================================================================

/**
 * Muestra ayuda del CLI
 */
function showHelp(): void {
  console.log(`
🎬 Sintaxis IA - CLI de Generación de Videos
=============================================

Uso: npm run automation:[comando]

Comandos disponibles:
  npm run automation:run     Ejecutar pipeline (modo desarrollo)
  npm run automation:dry     Dry run (no publica, no consume APIs)
  npm run automation:prod    Ejecutar en modo producción
  npm run automation:force   Forzar ejecución aunque no sea día de publicación

Opciones:
  --dry, -d      Dry run - simula ejecución sin acciones reales
  --prod, -p     Modo producción (logs mínimos)
  --force, -f    Forzar ejecución aunque no sea día de publicación
  --help, -h     Mostrar esta ayuda

Ejemplos:
  npx ts-node automation/src/cli.ts              # Normal
  npx ts-node automation/src/cli.ts --dry        # Dry run
  npx ts-node automation/src/cli.ts --force      # Forzar ejecución
  npx ts-node automation/src/cli.ts --prod -f    # Producción + forzar

Pipeline (10 pasos):
  1. Verificar calendario (cada 2 días: Lun/Mié/Vie/Dom)
  2. Recolectar noticias (NewsData.io - mock)
  3. Rankear por score
  4. Seleccionar top 1
  5. Generar script (Gemini - mock)
  6. Buscar imágenes (funcional)
  7. Generar audio (ElevenLabs - mock)
  8. Renderizar video (Remotion - mock)
  8.5. Enviar notificaciones (Email + Telegram)
  9. Esperar aprobación (Telegram callbacks)
  10. Publicar (manual)

Flujo de Aprobación:
  1. Pipeline genera video y envía notificaciones
  2. Recibes mensaje en Telegram con botones
  3. Toca "Aprobar" o "Rechazar" directamente
  4. El bot ejecuta la acción y te confirma
  5. Presiona Ctrl+C para salir

Más información: Ver README.md
`);
}

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Función principal del CLI
 */
async function main(): Promise<void> {
  const options = parseArgs();

  // Mostrar ayuda si se solicita
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Banner
  console.log('');
  console.log('🎬 ═══════════════════════════════════════════════');
  console.log('🎬  SINTAXIS IA - Pipeline de Generación de Videos');
  console.log('🎬 ═══════════════════════════════════════════════');
  console.log('');

  // Mostrar configuración
  console.log('📋 Configuración:');
  console.log(`   Modo: ${options.prod ? 'producción' : 'desarrollo'}`);
  console.log(`   Dry run: ${options.dry ? 'Sí' : 'No'}`);
  console.log(`   Forzar: ${options.force ? 'Sí' : 'No'}`);
  console.log('');

  // Inicializar callback handler si no es dry run y notificaciones están habilitadas
  const shouldWaitForApproval = !options.dry && areNotificationsEnabled();

  if (shouldWaitForApproval) {
    initCallbackHandler();
    console.log('');
  }

  try {
    // Ejecutar pipeline
    const result = await runPipeline({
      mode: options.prod ? 'production' : 'development',
      dryRun: options.dry,
      requireManualApproval: !options.prod, // Auto-aprobar en producción
      forceRun: options.force,
    });

    // Exit code basado en resultado
    if (result.success) {
      console.log('');
      console.log('🎉 Pipeline completado exitosamente!');
      console.log(`   Video: ${result.videoPath || 'N/A'}`);

      // Si no es dry run y hay notificaciones, esperar aprobación
      if (shouldWaitForApproval) {
        console.log('');
        console.log('⏳ ========================================');
        console.log('⏳ Bot en espera de tu respuesta en Telegram...');
        console.log('⏳ ========================================');
        console.log('');
        console.log('   📱 Abre Telegram y toca un botón para aprobar/rechazar');
        console.log('   ⌨️  Presiona Ctrl+C cuando hayas terminado');
        console.log('');

        // Manejar señal de interrupción
        process.on('SIGINT', () => {
          console.log('');
          console.log('🛑 Deteniendo bot...');
          stopCallbackHandler();
          console.log('👋 ¡Hasta luego!');
          process.exit(0);
        });

        // Mantener proceso vivo para escuchar callbacks
        await new Promise(() => {
          // Esta promesa nunca se resuelve - el proceso termina con Ctrl+C
        });
      } else {
        process.exit(0);
      }
    } else {
      console.error('');
      console.error('💥 Pipeline falló:', result.error);
      stopCallbackHandler();
      process.exit(1);
    }
  } catch (error) {
    console.error('');
    console.error('💥 Error fatal:', error);
    stopCallbackHandler();
    process.exit(1);
  }
}

// =============================================================================
// EJECUCIÓN
// =============================================================================

main().catch(error => {
  console.error('Error no manejado:', error);
  stopCallbackHandler();
  process.exit(1);
});
