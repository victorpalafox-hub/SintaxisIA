/**
 * @fileoverview Email Notifier - Resend API
 *
 * Envía emails de notificación cuando hay videos listos para aprobar.
 * Usa la API de Resend para envío de emails transaccionales.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14.1
 */

import { Resend } from 'resend';
import { NOTIFICATION_CONFIG } from '../config/env.config';
import { VideoMetadata } from '../types/orchestrator.types';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Parámetros para enviar notificación de email
 */
export interface EmailNotificationParams {
  /** Metadata del video generado */
  video: VideoMetadata;
  /** URL para ver preview del video */
  previewUrl: string;
  /** URL para aprobar el video */
  approveUrl: string;
  /** URL para rechazar el video */
  rejectUrl: string;
}

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Envía email de notificación cuando video está listo
 *
 * @param params - Parámetros de la notificación
 * @returns true si el email se envió exitosamente
 *
 * @example
 * ```typescript
 * const sent = await sendEmailNotification({
 *   video: videoMetadata,
 *   previewUrl: 'http://localhost:3000/preview/abc123',
 *   approveUrl: 'http://localhost:3000/api/approve?id=abc123&action=approve',
 *   rejectUrl: 'http://localhost:3000/api/approve?id=abc123&action=reject',
 * });
 * ```
 */
export async function sendEmailNotification(
  params: EmailNotificationParams
): Promise<boolean> {
  const { video, previewUrl, approveUrl, rejectUrl } = params;

  // Verificar configuración
  if (!NOTIFICATION_CONFIG.email.apiKey) {
    console.warn('⚠️  Email: API key no configurada, saltando envío');
    return false;
  }

  if (!NOTIFICATION_CONFIG.email.to) {
    console.warn('⚠️  Email: Destinatario no configurado, saltando envío');
    return false;
  }

  try {
    console.log('📧 Enviando email de notificación...');

    const resend = new Resend(NOTIFICATION_CONFIG.email.apiKey);

    const { data, error } = await resend.emails.send({
      // Usar dominio pre-verificado de Resend (no requiere DNS)
      from: 'Sintaxis IA <onboarding@resend.dev>',
      to: NOTIFICATION_CONFIG.email.to,
      subject: `🎬 Video listo para aprobar - ${truncateTitle(video.newsItem.title, 50)}`,
      html: generateEmailHTML(params),
    });

    if (error) {
      console.error('❌ Error enviando email:', error.message);
      return false;
    }

    console.log(`✅ Email enviado exitosamente (ID: ${data?.id})`);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error en email notifier:', errorMessage);
    return false;
  }
}

// =============================================================================
// GENERACIÓN DE HTML
// =============================================================================

/**
 * Genera HTML del email con diseño profesional
 *
 * @param params - Parámetros de la notificación
 * @returns HTML del email
 */
function generateEmailHTML(params: EmailNotificationParams): string {
  const { video, previewUrl, approveUrl, rejectUrl } = params;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Video Listo para Aprobar</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #00F0FF 0%, #FF0099 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .video-info {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #00F0FF;
        }
        .video-info h2 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }
        .info-row {
          display: flex;
          margin: 8px 0;
        }
        .info-label {
          font-weight: bold;
          width: 100px;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .score-badge {
          display: inline-block;
          background: linear-gradient(135deg, #00F0FF 0%, #00CC99 100%);
          color: black;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
        }
        .score-breakdown {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
        .score-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 14px;
        }
        .score-item span:first-child {
          color: #666;
        }
        .score-item span:last-child {
          font-weight: bold;
        }
        .buttons {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          margin: 10px 5px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: scale(1.05);
        }
        .btn-preview {
          background: #00F0FF;
          color: black;
        }
        .btn-approve {
          background: #00FF88;
          color: black;
        }
        .btn-reject {
          background: #FF6666;
          color: white;
        }
        .note {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
          font-size: 14px;
        }
        .note strong {
          color: #856404;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
        @media only screen and (max-width: 480px) {
          .button {
            display: block;
            margin: 10px 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 Video Listo para Aprobar</h1>
          <p>Sintaxis IA - Sistema de Generación Automática</p>
        </div>

        <div class="content">
          <p>Hola,</p>

          <p>Tu video ha sido generado exitosamente y está listo para revisión:</p>

          <div class="video-info">
            <h2>${escapeHtml(video.newsItem.title)}</h2>

            <div class="info-row">
              <span class="info-label">Empresa:</span>
              <span class="info-value">${escapeHtml(video.newsItem.company || 'N/A')}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Tipo:</span>
              <span class="info-value">${escapeHtml(video.newsItem.type || 'N/A')}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Duración:</span>
              <span class="info-value">${video.duration} segundos</span>
            </div>

            <div class="info-row">
              <span class="info-label">Score:</span>
              <span class="info-value">
                <span class="score-badge">${video.score.totalScore} pts</span>
              </span>
            </div>

            <div class="score-breakdown">
              <strong>Desglose del Score:</strong>
              <div class="score-item">
                <span>Empresa</span>
                <span>${video.score.breakdown.companyRelevance} pts</span>
              </div>
              <div class="score-item">
                <span>Tipo de noticia</span>
                <span>${video.score.breakdown.newsType} pts</span>
              </div>
              <div class="score-item">
                <span>Engagement</span>
                <span>${video.score.breakdown.engagement} pts</span>
              </div>
              <div class="score-item">
                <span>Frescura</span>
                <span>${video.score.breakdown.freshness} pts</span>
              </div>
              <div class="score-item">
                <span>Impacto</span>
                <span>${video.score.breakdown.impact} pts</span>
              </div>
            </div>
          </div>

          <div class="buttons">
            <a href="${previewUrl}" class="button btn-preview">👀 Ver Preview</a>
          </div>

          <div class="buttons">
            <a href="${approveUrl}" class="button btn-approve">✅ Aprobar y Publicar</a>
            <a href="${rejectUrl}" class="button btn-reject">❌ Rechazar</a>
          </div>

          <div class="note">
            <strong>Nota:</strong> Este video fue generado automáticamente.
            Por favor revisa cuidadosamente el contenido antes de aprobar su publicación.
          </div>
        </div>

        <div class="footer">
          <p>Sintaxis IA - Sistema Automático de Videos</p>
          <p>Generado el ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
          <p style="color: #999;">Este es un email automático. No responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Escapa caracteres HTML para prevenir XSS
 *
 * @param text - Texto a escapar
 * @returns Texto escapado
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, char => htmlEscapes[char] || char);
}

/**
 * Trunca título para subject del email
 *
 * @param title - Título original
 * @param maxLength - Longitud máxima
 * @returns Título truncado
 */
function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + '...';
}

// Export por defecto
export default {
  sendEmailNotification,
};
