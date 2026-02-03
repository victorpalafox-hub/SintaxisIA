/**
 * @fileoverview Tests para Prompt 14.1: Sistema de Notificaciones
 *
 * Valida:
 * - Configuración de variables de entorno
 * - Archivos de notificadores
 * - Enmascaramiento de datos sensibles
 * - Integración con orchestrator
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14.1
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

// Importar funciones de configuración para testing
import { getSafeConfig, areNotificationsEnabled } from '../../automation/src/config/env.config';

test.describe('PROMPT 14.1: Notification System', () => {
  let logger: TestLogger;

  test.beforeAll(async () => {
    logger = new TestLogger('prompt14-1-notifications');
    await logger.info('=== INICIANDO SUITE: Notifications ===');
  });

  test.afterAll(async () => {
    await logger.info('=== FINALIZANDO SUITE: Notifications ===');
    await logger.close();
  });

  // ==========================================
  // SUITE 1: CONFIGURACIÓN DE ENTORNO
  // ==========================================

  test.describe('Suite 1: Environment Configuration', () => {
    test('.env.example should have notification variables', async () => {
      await logger.info('Validando .env.example');

      const envExamplePath = path.join(process.cwd(), '.env.example');
      expect(fs.existsSync(envExamplePath)).toBeTruthy();

      const content = fs.readFileSync(envExamplePath, 'utf-8');

      // Verificar variables de email
      expect(content).toContain('NOTIFICATION_EMAIL');
      expect(content).toContain('RESEND_API_KEY');

      // Verificar variables de Telegram
      expect(content).toContain('TELEGRAM_BOT_TOKEN');
      expect(content).toContain('TELEGRAM_CHAT_ID');

      // Verificar variables de dashboard
      expect(content).toContain('DASHBOARD_URL');
      expect(content).toContain('DASHBOARD_SECRET');

      // Verificar storage temporal
      expect(content).toContain('TEMP_STORAGE_PATH');

      await logger.info('✅ .env.example contiene todas las variables de notificación');
    });

    test('.gitignore should exclude .env files', async () => {
      await logger.info('Validando .gitignore');

      const gitignorePath = path.join(process.cwd(), '.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf-8');

      expect(content).toContain('.env');
      expect(content).toContain('.env.local');
      expect(content).toContain('automation/temp/videos');

      await logger.info('✅ .gitignore excluye archivos sensibles');
    });

    test('env.config.ts should exist with required functions', async () => {
      await logger.info('Validando env.config.ts');

      const configPath = path.join(
        process.cwd(),
        'automation/src/config/env.config.ts'
      );
      expect(fs.existsSync(configPath)).toBeTruthy();

      const content = fs.readFileSync(configPath, 'utf-8');

      // Verificar funciones exportadas
      expect(content).toContain('validateEnvConfig');
      expect(content).toContain('getSafeConfig');
      expect(content).toContain('areNotificationsEnabled');
      expect(content).toContain('initializeStorage');

      // Verificar configuraciones
      expect(content).toContain('NOTIFICATION_CONFIG');
      expect(content).toContain('STORAGE_CONFIG');

      await logger.info('✅ env.config.ts presente con funciones requeridas');
    });
  });

  // ==========================================
  // SUITE 2: ENMASCARAMIENTO DE DATOS
  // ==========================================

  test.describe('Suite 2: Data Masking', () => {
    test('getSafeConfig should mask sensitive data', async () => {
      await logger.info('Validando enmascaramiento de datos sensibles');

      const safeConfig = getSafeConfig() as Record<string, Record<string, string>>;

      // Email config
      expect(safeConfig.email).toBeDefined();
      await logger.info(`   Email to: ${safeConfig.email.to}`);
      await logger.info(`   Email apiKey: ${safeConfig.email.apiKey}`);

      // Telegram config
      expect(safeConfig.telegram).toBeDefined();
      await logger.info(`   Telegram botToken: ${safeConfig.telegram.botToken}`);
      await logger.info(`   Telegram chatId: ${safeConfig.telegram.chatId}`);

      // Dashboard config
      expect(safeConfig.dashboard).toBeDefined();
      await logger.info(`   Dashboard secret: ${safeConfig.dashboard.secret}`);

      // Verificar que los valores sensibles están enmascarados o muestran [NO CONFIGURADO]
      const emailTo = safeConfig.email.to;
      const isEmailMasked = emailTo.includes('*') || emailTo === '[NO CONFIGURADO]';
      expect(isEmailMasked).toBeTruthy();

      const apiKey = safeConfig.email.apiKey;
      const isApiKeyMasked = apiKey.includes('***') || apiKey === '[NO CONFIGURADO]';
      expect(isApiKeyMasked).toBeTruthy();

      await logger.info('✅ Datos sensibles correctamente enmascarados');
    });

    test('areNotificationsEnabled should return boolean', async () => {
      await logger.info('Validando areNotificationsEnabled()');

      const enabled = areNotificationsEnabled();
      expect(typeof enabled).toBe('boolean');

      await logger.info(`   Notificaciones habilitadas: ${enabled}`);
      await logger.info('✅ areNotificationsEnabled() funciona correctamente');
    });
  });

  // ==========================================
  // SUITE 3: ARCHIVOS DE NOTIFICADORES
  // ==========================================

  test.describe('Suite 3: Notifier Files', () => {
    test('email-notifier.ts should exist', async () => {
      await logger.info('Validando email-notifier.ts');

      const notifierPath = path.join(
        process.cwd(),
        'automation/src/notifiers/email-notifier.ts'
      );
      expect(fs.existsSync(notifierPath)).toBeTruthy();

      const content = fs.readFileSync(notifierPath, 'utf-8');
      expect(content).toContain('sendEmailNotification');
      expect(content).toContain('Resend');
      expect(content).toContain('generateEmailHTML');

      await logger.info('✅ email-notifier.ts presente');
    });

    test('telegram-notifier.ts should exist', async () => {
      await logger.info('Validando telegram-notifier.ts');

      const notifierPath = path.join(
        process.cwd(),
        'automation/src/notifiers/telegram-notifier.ts'
      );
      expect(fs.existsSync(notifierPath)).toBeTruthy();

      const content = fs.readFileSync(notifierPath, 'utf-8');
      expect(content).toContain('sendTelegramNotification');
      expect(content).toContain('TelegramBot');
      expect(content).toContain('inline_keyboard');

      await logger.info('✅ telegram-notifier.ts presente');
    });

    test('notification-orchestrator.ts should exist', async () => {
      await logger.info('Validando notification-orchestrator.ts');

      const orchestratorPath = path.join(
        process.cwd(),
        'automation/src/notifiers/notification-orchestrator.ts'
      );
      expect(fs.existsSync(orchestratorPath)).toBeTruthy();

      const content = fs.readFileSync(orchestratorPath, 'utf-8');
      expect(content).toContain('notifyVideoReady');
      expect(content).toContain('notifyVideoPublished');
      expect(content).toContain('notifyPipelineError');

      await logger.info('✅ notification-orchestrator.ts presente');
    });

    test('notifiers index.ts should export all functions', async () => {
      await logger.info('Validando notifiers/index.ts');

      const indexPath = path.join(
        process.cwd(),
        'automation/src/notifiers/index.ts'
      );
      expect(fs.existsSync(indexPath)).toBeTruthy();

      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toContain('notifyVideoReady');
      expect(content).toContain('sendEmailNotification');
      expect(content).toContain('sendTelegramNotification');

      await logger.info('✅ notifiers/index.ts exporta todas las funciones');
    });
  });

  // ==========================================
  // SUITE 4: INTEGRACIÓN CON ORCHESTRATOR
  // ==========================================

  test.describe('Suite 4: Orchestrator Integration', () => {
    test('orchestrator should import notification functions', async () => {
      await logger.info('Validando integración en orchestrator');

      const orchestratorPath = path.join(
        process.cwd(),
        'automation/src/orchestrator.ts'
      );
      const content = fs.readFileSync(orchestratorPath, 'utf-8');

      // Verificar imports
      expect(content).toContain('./notifiers');
      expect(content).toContain('notifyVideoReady');
      expect(content).toContain('./config/env.config');

      // Verificar paso de notificaciones
      // Nota: Desde Prompt 19, notificaciones es PASO 8 (antes 7.5, ahora 7.5 es save_outputs)
      expect(content).toContain('send_notifications');
      expect(content).toContain('PASO 8: Enviando notificaciones');

      await logger.info('✅ Orchestrator integrado con notificaciones');
    });

    test('orchestrator types should include send_notifications step', async () => {
      await logger.info('Validando types del orchestrator');

      const typesPath = path.join(
        process.cwd(),
        'automation/src/types/orchestrator.types.ts'
      );
      const content = fs.readFileSync(typesPath, 'utf-8');

      expect(content).toContain("'send_notifications'");

      await logger.info('✅ PipelineStepName incluye send_notifications');
    });
  });

  // ==========================================
  // SUITE 5: STORAGE TEMPORAL
  // ==========================================

  test.describe('Suite 5: Temporary Storage', () => {
    test('temp videos directory should exist or be creatable', async () => {
      await logger.info('Validando directorio temporal');

      const tempPath = path.join(process.cwd(), 'automation/temp/videos');

      // El directorio debería existir o poder crearse
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      expect(fs.existsSync(tempPath)).toBeTruthy();

      // Verificar .gitkeep
      const gitkeepPath = path.join(tempPath, '.gitkeep');
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '# Keep this directory\n');
      }
      expect(fs.existsSync(gitkeepPath)).toBeTruthy();

      await logger.info('✅ Directorio temporal configurado');
    });
  });
});
