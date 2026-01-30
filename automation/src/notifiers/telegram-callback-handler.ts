/**
 * @fileoverview Telegram Callback Handler
 *
 * Escucha callbacks de botones inline y ejecuta acciones.
 * Permite aprobar/rechazar videos directamente desde Telegram
 * sin necesidad de un servidor web público.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14.2
 */

import TelegramBot from 'node-telegram-bot-api';
import { getTelegramBot, sendPublishedNotification, sendRejectedNotification } from './telegram-notifier';
import * as fs from 'fs';
import * as path from 'path';
import { STORAGE_CONFIG } from '../config/env.config';
import { VideoMetadata } from '../types/orchestrator.types';

// =============================================================================
// VARIABLES DE ESTADO
// =============================================================================

/** Flag para indicar si el handler ya fue inicializado */
let isInitialized = false;

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Inicializa el listener de callbacks de Telegram
 *
 * Configura el bot para escuchar respuestas a los botones inline.
 * Solo se inicializa una vez (singleton).
 *
 * @example
 * ```typescript
 * // En cli.ts, después de enviar notificaciones:
 * initCallbackHandler();
 * ```
 */
export function initCallbackHandler(): void {
  if (isInitialized) {
    console.log('⚠️  Callback handler ya inicializado');
    return;
  }

  const bot = getTelegramBot();

  // Activar polling para recibir callbacks
  bot.startPolling();

  console.log('🎧 Telegram callback handler iniciado');
  console.log('   Escuchando aprobaciones/rechazos...');
  console.log('');

  // Escuchar callbacks de botones inline
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message?.chat.id;
    const messageId = callbackQuery.message?.message_id;
    const data = callbackQuery.data; // 'data' es la propiedad correcta en el tipo CallbackQuery

    if (!chatId || !data) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Error: datos incompletos',
      });
      return;
    }

    console.log(`📱 Callback recibido: ${data}`);

    // Parsear callback_data (formato: action_videoId)
    const underscoreIndex = data.indexOf('_');
    if (underscoreIndex === -1) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Formato de callback inválido',
      });
      return;
    }

    const action = data.substring(0, underscoreIndex);
    const videoId = data.substring(underscoreIndex + 1);

    try {
      switch (action) {
        case 'approve':
          await handleApprove(bot, chatId, messageId, videoId, callbackQuery.id);
          break;

        case 'reject':
          await handleReject(bot, chatId, messageId, videoId, callbackQuery.id);
          break;

        case 'details':
          await handleDetails(bot, chatId, videoId, callbackQuery.id);
          break;

        default:
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Acción desconocida',
          });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error manejando callback:', errorMessage);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Error ejecutando acción',
      });
    }
  });

  isInitialized = true;
}

// =============================================================================
// HANDLERS DE ACCIONES
// =============================================================================

/**
 * Maneja la aprobación de un video
 *
 * @param bot - Instancia del bot
 * @param chatId - ID del chat
 * @param messageId - ID del mensaje original
 * @param videoId - ID del video
 * @param callbackId - ID del callback para responder
 */
async function handleApprove(
  bot: TelegramBot,
  chatId: number,
  messageId: number | undefined,
  videoId: string,
  callbackId: string
): Promise<void> {
  console.log('');
  console.log('✅ ========================================');
  console.log('✅ PROCESANDO APROBACIÓN');
  console.log('✅ ========================================');
  console.log(`   Video ID: ${videoId}`);
  console.log('');

  // Responder al callback inmediatamente
  await bot.answerCallbackQuery(callbackId, {
    text: '✅ Procesando aprobación...',
  });

  // Cargar metadata del video
  const metadata = loadVideoMetadata(videoId);

  if (!metadata) {
    console.error('❌ Error: No se pudo cargar metadata');
    await bot.sendMessage(chatId,
      '❌ *Error: Video no encontrado*\n\n' +
      'El video puede haber sido procesado anteriormente o el archivo temporal fue eliminado\\.\n\n' +
      '_Video ID: ' + videoId + '_\n\n' +
      'Por favor ejecuta el pipeline nuevamente\\.',
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  console.log(`✅ Metadata cargada: ${metadata.newsItem.title}`);

  // TODO: Implementar upload real a YouTube (Prompt futuro)
  const mockYoutubeUrl = `https://youtube.com/shorts/${videoId.substring(0, 11)}`;

  // Editar mensaje original para indicar que fue procesado
  if (messageId) {
    try {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        { chat_id: chatId, message_id: messageId }
      );
    } catch {
      // Ignorar error si el mensaje no puede ser editado
    }
  }

  // Escapar caracteres especiales para Markdown
  const escapeV2 = (text: string) => text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');

  // Enviar confirmación
  await bot.sendMessage(chatId, `
✅ *Video Aprobado*

*${escapeV2(metadata.newsItem.title)}*

El video será publicado en YouTube\\.

_Nota: La integración con YouTube API se implementará en prompts futuros\\. Por ahora es una simulación\\._

🔗 URL simulada: ${mockYoutubeUrl}
  `, { parse_mode: 'MarkdownV2' });

  // Enviar notificación de publicación
  await sendPublishedNotification(metadata.newsItem.title, mockYoutubeUrl);

  // Limpiar metadata temporal
  deleteVideoMetadata(videoId);

  console.log('');
  console.log(`✅ Video ${videoId} procesado exitosamente`);
  console.log('✅ ========================================');
  console.log('');
}

/**
 * Maneja el rechazo de un video
 *
 * @param bot - Instancia del bot
 * @param chatId - ID del chat
 * @param messageId - ID del mensaje original
 * @param videoId - ID del video
 * @param callbackId - ID del callback para responder
 */
async function handleReject(
  bot: TelegramBot,
  chatId: number,
  messageId: number | undefined,
  videoId: string,
  callbackId: string
): Promise<void> {
  console.log(`❌ Rechazando video: ${videoId}`);

  // Responder al callback inmediatamente
  await bot.answerCallbackQuery(callbackId, {
    text: '❌ Procesando rechazo...',
  });

  // Cargar metadata del video
  const metadata = loadVideoMetadata(videoId);

  if (!metadata) {
    await bot.sendMessage(chatId, '❌ Error: Video no encontrado o ya fue procesado');
    return;
  }

  // Editar mensaje original para indicar que fue procesado
  if (messageId) {
    try {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        { chat_id: chatId, message_id: messageId }
      );
    } catch {
      // Ignorar error si el mensaje no puede ser editado
    }
  }

  // Enviar confirmación
  await bot.sendMessage(chatId, `
❌ *Video Rechazado*

El video no será publicado\\.

Puedes ejecutar el pipeline nuevamente para generar otro video:
\`npm run automation:force\`
  `, { parse_mode: 'MarkdownV2' });

  // Enviar notificación de rechazo
  await sendRejectedNotification(metadata.newsItem.title);

  // Limpiar metadata temporal
  deleteVideoMetadata(videoId);

  console.log(`❌ Video ${videoId} rechazado`);
}

/**
 * Muestra detalles del video
 *
 * @param bot - Instancia del bot
 * @param chatId - ID del chat
 * @param videoId - ID del video
 * @param callbackId - ID del callback para responder
 */
async function handleDetails(
  bot: TelegramBot,
  chatId: number,
  videoId: string,
  callbackId: string
): Promise<void> {
  console.log(`ℹ️ Mostrando detalles: ${videoId}`);

  // Responder al callback
  await bot.answerCallbackQuery(callbackId, {
    text: 'ℹ️ Cargando detalles...',
  });

  const metadata = loadVideoMetadata(videoId);

  if (!metadata) {
    await bot.sendMessage(chatId, '❌ Error: Video no encontrado o ya fue procesado');
    return;
  }

  // Escapar caracteres especiales para MarkdownV2
  const escapeV2 = (text: string) => text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');

  const message = `
📊 *Detalles del Video*

*Título:* ${escapeV2(metadata.newsItem.title)}

*Fuente:* ${escapeV2(metadata.newsItem.source || 'N/A')}
*URL:* ${escapeV2(metadata.newsItem.url || 'N/A')}

*Imágenes:*
• Hero: ${escapeV2(metadata.images.hero.source)}
• Context: ${escapeV2(metadata.images.context?.source || 'N/A')}

*Script \\(primeros 300 chars\\):*
\`\`\`
${escapeV2(metadata.script.substring(0, 300))}${metadata.script.length > 300 ? '...' : ''}
\`\`\`

*Video ID:* \`${videoId}\`
  `.trim();

  await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
}

// =============================================================================
// UTILIDADES DE STORAGE
// =============================================================================

/**
 * Carga metadata de video desde storage temporal
 *
 * @param videoId - ID del video
 * @returns Metadata del video o null si no existe
 */
function loadVideoMetadata(videoId: string): VideoMetadata | null {
  try {
    const metadataPath = path.join(STORAGE_CONFIG.tempPath, `${videoId}.json`);

    console.log('📂 Buscando metadata...');
    console.log(`   Video ID: ${videoId}`);
    console.log(`   Path: ${metadataPath}`);
    console.log(`   Directorio existe: ${fs.existsSync(STORAGE_CONFIG.tempPath)}`);
    console.log(`   Archivo existe: ${fs.existsSync(metadataPath)}`);

    if (!fs.existsSync(metadataPath)) {
      console.warn(`⚠️ Metadata no encontrada: ${videoId}`);

      // Listar archivos en el directorio para debug
      if (fs.existsSync(STORAGE_CONFIG.tempPath)) {
        const files = fs.readdirSync(STORAGE_CONFIG.tempPath);
        console.log(`   Archivos en directorio: ${files.length}`);
        files.forEach(file => console.log(`   - ${file}`));
      }

      return null;
    }

    const content = fs.readFileSync(metadataPath, 'utf-8');
    console.log('✅ Metadata cargada exitosamente');
    return JSON.parse(content) as VideoMetadata;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error cargando metadata: ${errorMessage}`);
    return null;
  }
}

/**
 * Elimina metadata de video del storage temporal
 *
 * @param videoId - ID del video a eliminar
 */
function deleteVideoMetadata(videoId: string): void {
  try {
    const metadataPath = path.join(STORAGE_CONFIG.tempPath, `${videoId}.json`);

    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
      console.log(`🗑️ Metadata eliminada: ${videoId}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error eliminando metadata: ${errorMessage}`);
  }
}

/**
 * Detiene el callback handler y el polling
 */
export function stopCallbackHandler(): void {
  if (!isInitialized) return;

  const bot = getTelegramBot();
  bot.stopPolling();
  isInitialized = false;
  console.log('🛑 Callback handler detenido');
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  initCallbackHandler,
  stopCallbackHandler,
};
