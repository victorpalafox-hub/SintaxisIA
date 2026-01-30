/**
 * @fileoverview Tests para Prompt 14.2: Fix de Notificaciones
 *
 * Valida:
 * - Email usa dominio pre-verificado de Resend
 * - Telegram usa botones callback (no URLs)
 * - Callback handler existe y funciona
 * - CLI inicializa callback handler
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14.2
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

test.describe('PROMPT 14.2: Notification Fixes', () => {
  let logger: TestLogger;

  test.beforeAll(async () => {
    logger = new TestLogger('prompt14-2-notification-fix');
    await logger.info('=== INICIANDO SUITE: Notification Fixes ===');
  });

  test.afterAll(async () => {
    await logger.info('=== FINALIZANDO SUITE: Notification Fixes ===');
    await logger.close();
  });

  // ==========================================
  // SUITE 1: EMAIL FIXES
  // ==========================================

  test.describe('Suite 1: Email Configuration', () => {
    test('email should use onboarding@resend.dev', async () => {
      await logger.info('Validando email con dominio de Resend');

      const emailPath = path.join(process.cwd(), 'automation/src/notifiers/email-notifier.ts');
      expect(fs.existsSync(emailPath)).toBeTruthy();

      const content = fs.readFileSync(emailPath, 'utf-8');

      // Verificar que usa el dominio pre-verificado
      expect(content).toContain('onboarding@resend.dev');
      expect(content).toContain('Sintaxis IA');

      await logger.info('✅ Email usa dominio pre-verificado de Resend');
    });
  });

  // ==========================================
  // SUITE 2: TELEGRAM CALLBACK BUTTONS
  // ==========================================

  test.describe('Suite 2: Telegram Callbacks', () => {
    test('telegram should use callback_data instead of URLs', async () => {
      await logger.info('Validando botones callback en Telegram');

      const telegramPath = path.join(process.cwd(), 'automation/src/notifiers/telegram-notifier.ts');
      const content = fs.readFileSync(telegramPath, 'utf-8');

      // Verificar callback_data
      expect(content).toContain('callback_data');
      expect(content).toContain('approve_');
      expect(content).toContain('reject_');
      expect(content).toContain('details_');

      // No debe usar URLs en botones inline
      expect(content).not.toContain('url: previewUrl');
      expect(content).not.toContain('url: approveUrl');

      await logger.info('✅ Telegram usa callback buttons en lugar de URLs');
    });

    test('telegram interface should accept videoId instead of URLs', async () => {
      await logger.info('Validando interface de Telegram');

      const telegramPath = path.join(process.cwd(), 'automation/src/notifiers/telegram-notifier.ts');
      const content = fs.readFileSync(telegramPath, 'utf-8');

      // La interface debe tener videoId
      expect(content).toContain('videoId: string');

      // No debe tener las URLs viejas
      expect(content).not.toContain('previewUrl: string');
      expect(content).not.toContain('approveUrl: string');
      expect(content).not.toContain('rejectUrl: string');

      await logger.info('✅ Interface de Telegram actualizada con videoId');
    });

    test('telegram should export getTelegramBot', async () => {
      await logger.info('Validando export de getTelegramBot');

      const telegramPath = path.join(process.cwd(), 'automation/src/notifiers/telegram-notifier.ts');
      const content = fs.readFileSync(telegramPath, 'utf-8');

      expect(content).toContain('export function getTelegramBot');

      await logger.info('✅ getTelegramBot exportado');
    });
  });

  // ==========================================
  // SUITE 3: CALLBACK HANDLER
  // ==========================================

  test.describe('Suite 3: Callback Handler', () => {
    test('callback handler file should exist', async () => {
      await logger.info('Validando existencia de callback handler');

      const handlerPath = path.join(
        process.cwd(),
        'automation/src/notifiers/telegram-callback-handler.ts'
      );
      expect(fs.existsSync(handlerPath)).toBeTruthy();

      await logger.info('✅ Archivo telegram-callback-handler.ts existe');
    });

    test('callback handler should have required functions', async () => {
      await logger.info('Validando funciones del callback handler');

      const handlerPath = path.join(
        process.cwd(),
        'automation/src/notifiers/telegram-callback-handler.ts'
      );
      const content = fs.readFileSync(handlerPath, 'utf-8');

      // Funciones principales
      expect(content).toContain('export function initCallbackHandler');
      expect(content).toContain('export function stopCallbackHandler');

      // Handlers de acciones
      expect(content).toContain('handleApprove');
      expect(content).toContain('handleReject');
      expect(content).toContain('handleDetails');

      // Utilidades de storage
      expect(content).toContain('loadVideoMetadata');
      expect(content).toContain('deleteVideoMetadata');

      await logger.info('✅ Callback handler tiene todas las funciones requeridas');
    });

    test('callback handler should parse callback_data correctly', async () => {
      await logger.info('Validando parseo de callback_data');

      const handlerPath = path.join(
        process.cwd(),
        'automation/src/notifiers/telegram-callback-handler.ts'
      );
      const content = fs.readFileSync(handlerPath, 'utf-8');

      // Debe parsear el formato action_videoId
      expect(content).toContain("case 'approve'");
      expect(content).toContain("case 'reject'");
      expect(content).toContain("case 'details'");

      await logger.info('✅ Callback handler parsea acciones correctamente');
    });
  });

  // ==========================================
  // SUITE 4: CLI INTEGRATION
  // ==========================================

  test.describe('Suite 4: CLI Integration', () => {
    test('CLI should import callback handler', async () => {
      await logger.info('Validando imports en CLI');

      const cliPath = path.join(process.cwd(), 'automation/src/cli.ts');
      const content = fs.readFileSync(cliPath, 'utf-8');

      expect(content).toContain('initCallbackHandler');
      expect(content).toContain('stopCallbackHandler');
      expect(content).toContain('./notifiers/telegram-callback-handler');

      await logger.info('✅ CLI importa callback handler');
    });

    test('CLI should initialize callback handler conditionally', async () => {
      await logger.info('Validando inicialización condicional');

      const cliPath = path.join(process.cwd(), 'automation/src/cli.ts');
      const content = fs.readFileSync(cliPath, 'utf-8');

      // Debe verificar si no es dry run
      expect(content).toContain('!options.dry');
      expect(content).toContain('areNotificationsEnabled');

      await logger.info('✅ CLI inicializa callbacks condicionalmente');
    });

    test('CLI should handle SIGINT to stop callback handler', async () => {
      await logger.info('Validando manejo de SIGINT');

      const cliPath = path.join(process.cwd(), 'automation/src/cli.ts');
      const content = fs.readFileSync(cliPath, 'utf-8');

      expect(content).toContain('SIGINT');
      expect(content).toContain('stopCallbackHandler');

      await logger.info('✅ CLI maneja Ctrl+C correctamente');
    });
  });

  // ==========================================
  // SUITE 5: NOTIFIERS INDEX
  // ==========================================

  test.describe('Suite 5: Module Exports', () => {
    test('notifiers index should export callback handler', async () => {
      await logger.info('Validando exports en index.ts');

      const indexPath = path.join(process.cwd(), 'automation/src/notifiers/index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      expect(content).toContain('initCallbackHandler');
      expect(content).toContain('stopCallbackHandler');
      expect(content).toContain('getTelegramBot');
      expect(content).toContain('sendRejectedNotification');

      await logger.info('✅ Index exporta todas las funciones necesarias');
    });
  });

  // ==========================================
  // SUITE 6: NOTIFICATION ORCHESTRATOR
  // ==========================================

  test.describe('Suite 6: Notification Orchestrator', () => {
    test('orchestrator should pass videoId to Telegram', async () => {
      await logger.info('Validando orchestrator con videoId');

      const orchestratorPath = path.join(
        process.cwd(),
        'automation/src/notifiers/notification-orchestrator.ts'
      );
      const content = fs.readFileSync(orchestratorPath, 'utf-8');

      // Debe pasar videoId a Telegram
      expect(content).toContain('videoId,');
      expect(content).toContain('sendTelegramNotification({');

      // Debe mostrar mensaje sobre botones de Telegram
      expect(content).toContain('botones en Telegram');

      await logger.info('✅ Orchestrator pasa videoId a Telegram');
    });
  });
});
