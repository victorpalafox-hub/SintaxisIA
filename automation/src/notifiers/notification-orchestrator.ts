/**
 * @fileoverview Notification Orchestrator
 *
 * Coordina el envío de notificaciones por múltiples canales.
 * Actualmente soporta: Email (Resend) y Telegram.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14.1
 */

import { sendEmailNotification } from './email-notifier';
import {
  sendTelegramNotification,
  sendPublishedNotification,
  sendErrorNotification,
} from './telegram-notifier';
import { VideoMetadata } from '../types/orchestrator.types';
import { NOTIFICATION_CONFIG, areNotificationsEnabled } from '../config/env.config';

// Re-export para uso externo
export { sendPublishedNotification, sendErrorNotification };

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Parámetros para notificar video listo
 */
export interface NotificationParams {
  /** Metadata completa del video */
  video: VideoMetadata;
  /** ID único del video (para URLs) */
  videoId: string;
}

/**
 * Resultado del envío de notificaciones
 */
export interface NotificationResult {
  /** Si al menos una notificación fue enviada */
  success: boolean;
  /** Estado del envío por email */
  emailSent: boolean;
  /** Estado del envío por Telegram */
  telegramSent: boolean;
}

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Envía notificaciones por todos los canales cuando video está listo
 *
 * Coordina el envío paralelo de notificaciones por email y Telegram.
 * Si un canal falla, continúa con los demás.
 *
 * @param params - Parámetros de la notificación
 * @returns Resultado del envío por cada canal
 *
 * @example
 * ```typescript
 * const result = await notifyVideoReady({
 *   video: videoMetadata,
 *   videoId: 'abc123def456',
 * });
 *
 * if (result.success) {
 *   console.log('Notificaciones enviadas');
 * }
 * ```
 */
export async function notifyVideoReady(
  params: NotificationParams
): Promise<NotificationResult> {
  const { video, videoId } = params;

  console.log('');
  console.log('📢 ========================================');
  console.log('📢 ENVIANDO NOTIFICACIONES');
  console.log('📢 ========================================');
  console.log('');

  // Verificar si las notificaciones están habilitadas
  if (!areNotificationsEnabled()) {
    console.warn('⚠️  Notificaciones deshabilitadas (variables de entorno faltantes)');
    console.warn('   Ejecuta: npm run automation:help para ver configuración');
    console.log('');

    return {
      success: false,
      emailSent: false,
      telegramSent: false,
    };
  }

  // Generar URLs del dashboard (para email)
  const baseUrl = NOTIFICATION_CONFIG.dashboard.url;
  const secret = NOTIFICATION_CONFIG.dashboard.secret;

  const previewUrl = `${baseUrl}/preview/${videoId}`;
  const approveUrl = `${baseUrl}/api/approve?id=${videoId}&action=approve&secret=${secret}`;
  const rejectUrl = `${baseUrl}/api/approve?id=${videoId}&action=reject&secret=${secret}`;

  console.log('📋 Video ID: ' + videoId);
  console.log('');

  // Enviar email (con URLs del dashboard)
  const emailSent = await sendEmailNotification({
    video,
    previewUrl,
    approveUrl,
    rejectUrl,
  });

  // Enviar Telegram (con videoId para callbacks - funciona localmente)
  const telegramSent = await sendTelegramNotification({
    video,
    videoId,
  });

  // Mostrar resumen
  console.log('');
  console.log('📊 Resumen de Notificaciones:');
  console.log(`   📧 Email: ${emailSent ? '✅ Enviado' : '❌ Falló'}`);
  console.log(`   📱 Telegram: ${telegramSent ? '✅ Enviado' : '❌ Falló'}`);
  console.log('');

  const success = emailSent || telegramSent;

  if (!success) {
    console.warn('⚠️  ADVERTENCIA: Ninguna notificación fue enviada');
    console.warn('   Verifica la configuración en .env');
  }

  if (telegramSent) {
    console.log('💡 IMPORTANTE: Para aprobar/rechazar, usa los botones en Telegram');
    console.log('   El bot está escuchando tus respuestas...');
    console.log('');
  }

  return {
    success,
    emailSent,
    telegramSent,
  };
}

// =============================================================================
// FUNCIONES ADICIONALES
// =============================================================================

/**
 * Notifica cuando video es publicado exitosamente
 *
 * @param videoTitle - Título del video publicado
 * @param youtubeUrl - URL del video en YouTube
 *
 * @example
 * ```typescript
 * await notifyVideoPublished(
 *   'OpenAI lanza GPT-5',
 *   'https://youtube.com/watch?v=abc123'
 * );
 * ```
 */
export async function notifyVideoPublished(
  videoTitle: string,
  youtubeUrl: string
): Promise<void> {
  console.log('');
  console.log('📢 Notificando publicación exitosa...');

  // Por ahora solo Telegram (más inmediato)
  const sent = await sendPublishedNotification(videoTitle, youtubeUrl);

  if (sent) {
    console.log('✅ Notificación de publicación enviada');
  } else {
    console.warn('⚠️  No se pudo enviar notificación de publicación');
  }

  console.log('');
}

/**
 * Notifica cuando hay un error en el pipeline
 *
 * @param error - Mensaje de error
 * @param step - Paso del pipeline donde ocurrió
 *
 * @example
 * ```typescript
 * await notifyPipelineError(
 *   'API key inválida',
 *   'generate_script'
 * );
 * ```
 */
export async function notifyPipelineError(
  error: string,
  step: string
): Promise<void> {
  console.log('');
  console.log('📢 Notificando error en pipeline...');

  const sent = await sendErrorNotification(error, step);

  if (sent) {
    console.log('✅ Notificación de error enviada');
  }

  console.log('');
}

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Enmascara URL para logging (oculta secret)
 *
 * @param url - URL a enmascarar
 * @returns URL con secret enmascarado
 */
function maskUrl(url: string): string {
  return url.replace(/secret=[^&]+/, 'secret=***');
}

// Export por defecto
export default {
  notifyVideoReady,
  notifyVideoPublished,
  notifyPipelineError,
};
