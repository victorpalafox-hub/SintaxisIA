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
    dryReal: args.includes('--dry-real') || args.includes('-dr'),
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
  npm run automation:run       Ejecutar pipeline (modo desarrollo)
  npm run automation:dry       Dry run (simula, no genera video real)
  npm run automation:dry-real  Dry run REAL (genera video, no publica)
  npm run automation:prod      Ejecutar en modo producción
  npm run automation:force     Forzar ejecución aunque no sea día

Opciones:
  --dry, -d       Dry run - simula ejecución sin generar video
  --dry-real, -dr Dry run REAL - genera video pero no publica
  --prod, -p      Modo producción (logs mínimos)
  --force, -f     Forzar ejecución aunque no sea día de publicación
  --help, -h      Mostrar esta ayuda

Ejemplos:
  npx ts-node src/cli.ts                  # Normal
  npx ts-node src/cli.ts --dry            # Dry run (simulado)
  npx ts-node src/cli.ts --dry-real -f    # Dry run REAL + forzar
  npx ts-node src/cli.ts --prod -f        # Producción + forzar

Pipeline (11 pasos):
  1. Verificar calendario (cada 2 días: Lun/Mié/Vie/Dom)
  2. Recolectar noticias (NewsData.io)
  3. Rankear por score (Carnita Score)
  4. Seleccionar top 1 (umbral 75 pts)
  5. Generar script (Gemini + Alex Torres)
  6. Buscar imágenes (multi-provider)
  7. Generar audio (ElevenLabs/Edge-TTS)
  8. Renderizar video (Remotion)
  8.5. Guardar outputs (output/YYYY-MM-DD_slug/)
  9. Enviar notificaciones (Email + Telegram)
  10. Esperar aprobación (Telegram callbacks)
  11. Publicar (YouTube)

Estructura de Output (--dry-real):
  output/
  ├── YYYY-MM-DD_slug-titulo/
  │   ├── news.json        # Noticia original
  │   ├── score.json       # Score Carnita
  │   ├── script.json      # Script estructurado
  │   ├── script.txt       # Script legible (para revisión)
  │   ├── images.json      # Imágenes encontradas
  │   ├── audio.mp3        # Audio TTS
  │   ├── metadata.json    # Metadata completa
  │   └── video-final.mp4  # Video renderizado
  │
  └── tiktok-manual/       # Copia para subir a TikTok
      └── YYYY-MM-DD_slug.mp4

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
  if (options.dry) {
    console.log(`   Dry run: Sí (simulado - sin video real)`);
  } else if (options.dryReal) {
    console.log(`   Dry run: Sí (VIDEO REAL - sin publicar)`);
  } else {
    console.log(`   Dry run: No`);
  }
  console.log(`   Forzar: ${options.force ? 'Sí' : 'No'}`);
  console.log('');

  // Inicializar callback handler solo si:
  // - No es dry run (simulado)
  // - No es dry real (no necesita aprobación)
  // - Notificaciones están habilitadas
  /* DESHABILITADO TEMPORALMENTE - Pendiente integración YouTube (Prompt 26)
  const shouldWaitForApproval = !options.dry && !options.dryReal && areNotificationsEnabled();

  if (shouldWaitForApproval) {
    initCallbackHandler();
    console.log('');
  }
  */
  const shouldWaitForApproval = false;

  try {
    // Ejecutar pipeline
    const result = await runPipeline({
      mode: options.prod ? 'production' : 'development',
      dryRun: options.dry,
      dryReal: options.dryReal,
      requireManualApproval: !options.prod && !options.dryReal, // Auto-aprobar en producción o dryReal
      forceRun: options.force,
    });

    // Exit code basado en resultado
    if (result.success) {
      console.log('');
      console.log('🎉 Pipeline completado exitosamente!');
      console.log(`   Video: ${result.videoPath || 'N/A'}`);

      // Mostrar resumen de outputs si existe (Prompt 19)
      if (result.outputSummary) {
        console.log('');
        console.log('📁 OUTPUTS GUARDADOS:');
        console.log(`   Carpeta: ${result.outputSummary.folderName}`);
        console.log(`   Path: ${result.outputSummary.outputFolder}`);
        console.log(`   Tamaño total: ${result.outputSummary.totalSizeFormatted}`);
        console.log('');
        console.log(`   📱 TikTok: ${result.outputSummary.tiktokPath}`);
        console.log('');
        console.log('   Archivos generados:');
        Object.entries(result.outputSummary.files).forEach(([key, filePath]) => {
          const fileName = filePath.split(/[/\\]/).pop();
          console.log(`     - ${key}: ${fileName}`);
        });
      }

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
