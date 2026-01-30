/**
 * @fileoverview Exports centralizados del módulo de notificaciones
 *
 * @author Sintaxis IA
 * @version 1.1.0
 * @since Prompt 14.2
 */

// Orchestrador principal
export {
  notifyVideoReady,
  notifyVideoPublished,
  notifyPipelineError,
  type NotificationParams,
  type NotificationResult,
} from './notification-orchestrator';

// Notificadores individuales (para uso avanzado)
export { sendEmailNotification, type EmailNotificationParams } from './email-notifier';
export {
  sendTelegramNotification,
  sendPublishedNotification,
  sendRejectedNotification,
  sendErrorNotification,
  getTelegramBot,
  type TelegramNotificationParams,
} from './telegram-notifier';

// Callback handler para aprobaciones desde Telegram
export {
  initCallbackHandler,
  stopCallbackHandler,
} from './telegram-callback-handler';
