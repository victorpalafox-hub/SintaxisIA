/**
 * @fileoverview Telegram Notifier con Callback Buttons
 *
 * Usa callback_data en lugar de URLs para que funcione localmente.
 * El bot escucha callbacks y ejecuta acciones directamente.
 *
 * @author Sintaxis IA
 * @version 1.1.0
 * @since Prompt 14.2
 */

import TelegramBot from 'node-telegram-bot-api';
import { NOTIFICATION_CONFIG } from '../config/env.config';
import { VideoMetadata } from '../types/orchestrator.types';

// =============================================================================
// SINGLETON BOT
// =============================================================================

let bot: TelegramBot | null = null;

/**
 * Inicializa el bot de Telegram (singleton)
 * Polling se activará en CLI cuando sea necesario
 */
function initBot(): TelegramBot {
  if (!bot) {
    bot = new TelegramBot(NOTIFICATION_CONFIG.telegram.botToken, {
      polling: false, // Polling se activa manualmente en callback handler
    });
  }
  return bot;
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Parámetros para enviar notificación de Telegram
 */
export interface TelegramNotificationParams {
  /** Metadata del video generado */
  video: VideoMetadata;
  /** ID único del video (para callbacks) */
  videoId: string;
}

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Envía notificación de Telegram con botones callback
 *
 * Los botones usan callback_data en lugar de URLs, lo que permite
 * aprobar/rechazar directamente desde Telegram sin necesidad de
 * un servidor web público.
 *
 * @param params - Parámetros de la notificación
 * @returns true si la notificación se envió exitosamente
 */
export async function sendTelegramNotification(
  params: TelegramNotificationParams
): Promise<boolean> {
  const { video, videoId } = params;

  // Verificar configuración
  if (!NOTIFICATION_CONFIG.telegram.botToken) {
    console.warn('⚠️  Telegram: Bot token no configurado, saltando envío');
    return false;
  }

  if (!NOTIFICATION_CONFIG.telegram.chatId) {
    console.warn('⚠️  Telegram: Chat ID no configurado, saltando envío');
    return false;
  }

  try {
    console.log('📱 Enviando notificación de Telegram...');

    const telegramBot = initBot();
    const chatId = NOTIFICATION_CONFIG.telegram.chatId;

    // Mensaje de texto con formato Markdown
    const message = `
🎬 *Video Listo para Aprobar*

*${escapeMarkdown(video.newsItem.title)}*

📊 *Información:*
• Empresa: ${escapeMarkdown(video.newsItem.company || 'N/A')}
• Tipo: ${escapeMarkdown(video.newsItem.type || 'N/A')}
• Duración: ${video.duration}s
• Score: ${video.score.totalScore} pts

🏆 *Desglose del Score:*
• Empresa: ${video.score.breakdown.companyRelevance} pts
• Tipo: ${video.score.breakdown.newsType} pts
• Engagement: ${video.score.breakdown.engagement} pts
• Frescura: ${video.score.breakdown.freshness} pts
• Impacto: ${video.score.breakdown.impact} pts

👇 *¿Qué deseas hacer?*
    `.trim();

    // Botones con callback_data (funcionan localmente)
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Aprobar y Publicar',
            callback_data: `approve_${videoId}`,
          },
          {
            text: '❌ Rechazar',
            callback_data: `reject_${videoId}`,
          },
        ],
        [
          {
            text: 'ℹ️ Ver Detalles',
            callback_data: `details_${videoId}`,
          },
        ],
      ],
    };

    await telegramBot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });

    console.log('✅ Notificación de Telegram enviada exitosamente');
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error en Telegram notifier:', errorMessage);
    return false;
  }
}

// =============================================================================
// NOTIFICACIONES ADICIONALES
// =============================================================================

/**
 * Envía notificación de video publicado
 *
 * @param videoTitle - Título del video publicado
 * @param youtubeUrl - URL del video en YouTube
 * @returns true si se envió exitosamente
 */
export async function sendPublishedNotification(
  videoTitle: string,
  youtubeUrl: string
): Promise<boolean> {
  try {
    const telegramBot = initBot();
    const chatId = NOTIFICATION_CONFIG.telegram.chatId;

    if (!chatId) return false;

    const message = `
✅ *Video Publicado Exitosamente*

${escapeMarkdown(videoTitle)}

🔗 Ver en YouTube:
${youtubeUrl}

📊 El video ya está disponible para tu audiencia.
    `.trim();

    await telegramBot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    });

    console.log('✅ Notificación de publicación enviada');
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error enviando notificación de publicación:', errorMessage);
    return false;
  }
}

/**
 * Envía notificación de video rechazado
 *
 * @param videoTitle - Título del video rechazado
 * @returns true si se envió exitosamente
 */
export async function sendRejectedNotification(
  videoTitle: string
): Promise<boolean> {
  try {
    const telegramBot = initBot();
    const chatId = NOTIFICATION_CONFIG.telegram.chatId;

    if (!chatId) return false;

    const message = `
❌ *Video Rechazado*

${escapeMarkdown(videoTitle)}

El video fue rechazado y no se publicará.
    `.trim();

    await telegramBot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    });

    console.log('✅ Notificación de rechazo enviada');
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error enviando notificación de rechazo:', errorMessage);
    return false;
  }
}

/**
 * Envía notificación de error en pipeline
 *
 * @param errorMsg - Mensaje de error
 * @param step - Paso donde ocurrió el error
 * @returns true si se envió exitosamente
 */
export async function sendErrorNotification(
  errorMsg: string,
  step: string
): Promise<boolean> {
  try {
    const telegramBot = initBot();
    const chatId = NOTIFICATION_CONFIG.telegram.chatId;

    if (!chatId) return false;

    const message = `
🚨 *Error en Pipeline*

❌ *Paso:* ${escapeMarkdown(step)}

📝 *Error:*
\`\`\`
${escapeMarkdown(errorMsg.substring(0, 500))}
\`\`\`

⏰ ${new Date().toLocaleString('es-MX')}
    `.trim();

    await telegramBot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    });

    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error enviando notificación de error:', errorMessage);
    return false;
  }
}

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Escapa caracteres especiales de Markdown para Telegram
 *
 * @param text - Texto a escapar
 * @returns Texto escapado
 */
function escapeMarkdown(text: string): string {
  // Caracteres que necesitan escape en Markdown de Telegram
  const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

  let escaped = text;
  for (const char of specialChars) {
    escaped = escaped.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
  }

  return escaped;
}

/**
 * Obtiene instancia del bot (para callback handlers)
 *
 * @returns Instancia del bot de Telegram
 */
export function getTelegramBot(): TelegramBot {
  return initBot();
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  sendTelegramNotification,
  sendPublishedNotification,
  sendRejectedNotification,
  sendErrorNotification,
  getTelegramBot,
};
