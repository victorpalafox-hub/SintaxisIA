/**
 * @fileoverview Tests para Prompt 14: Orchestrator & Calendario de Publicación
 *
 * Valida:
 * - Calendario de publicación (cada 2 días)
 * - Cálculo de próximas fechas
 * - Orchestrator y tipos
 * - CLI script
 * - Scripts npm configurados
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../utils/TestLogger';
import * as fs from 'fs';
import * as path from 'path';

// Importar funciones del calendario para testing directo
import {
  PUBLICATION_SCHEDULE,
  shouldPublishToday,
  getDaysUntilNextPublication,
  getNextPublicationDate,
  getUpcomingPublications,
  getDayName,
  getPreferredDaysFormatted,
} from '../../automation/src/config/publication-calendar';

test.describe('PROMPT 14: Orchestrator & Publication Calendar', () => {
  let logger: TestLogger;

  test.beforeAll(async () => {
    logger = new TestLogger('prompt14-orchestrator');
    await logger.info('=== INICIANDO SUITE: Orchestrator & Calendar ===');
  });

  test.afterAll(async () => {
    await logger.info('=== FINALIZANDO SUITE: Orchestrator & Calendar ===');
    await logger.close();
  });

  // ==========================================
  // SUITE 1: ARCHIVOS DEL CALENDARIO
  // ==========================================

  test.describe('Suite 1: Publication Calendar Files', () => {
    test('publication-calendar.ts should exist', async () => {
      await logger.info('Validando existencia de publication-calendar.ts');

      const calendarPath = path.join(
        process.cwd(),
        'automation/src/config/publication-calendar.ts'
      );
      expect(fs.existsSync(calendarPath)).toBeTruthy();

      const content = fs.readFileSync(calendarPath, 'utf-8');
      expect(content).toContain('PUBLICATION_SCHEDULE');
      expect(content).toContain('shouldPublishToday');
      expect(content).toContain('getNextPublicationDate');
      expect(content).toContain('getDaysUntilNextPublication');

      await logger.info('✅ publication-calendar.ts presente con funciones requeridas');
    });

    test('calendar should have correct configuration', async () => {
      await logger.info('Validando configuración del calendario');

      // Verificar intervalDays
      expect(PUBLICATION_SCHEDULE.intervalDays).toBe(2);
      await logger.info(`   intervalDays: ${PUBLICATION_SCHEDULE.intervalDays}`);

      // Verificar preferredDays incluye días esperados
      expect(PUBLICATION_SCHEDULE.preferredDays).toContain(1); // Lunes
      expect(PUBLICATION_SCHEDULE.preferredDays).toContain(3); // Miércoles
      expect(PUBLICATION_SCHEDULE.preferredDays).toContain(5); // Viernes
      expect(PUBLICATION_SCHEDULE.preferredDays).toContain(0); // Domingo
      await logger.info(`   preferredDays: ${PUBLICATION_SCHEDULE.preferredDays.join(', ')}`);

      // Verificar hora de publicación
      expect(PUBLICATION_SCHEDULE.publicationHour).toBeGreaterThanOrEqual(0);
      expect(PUBLICATION_SCHEDULE.publicationHour).toBeLessThanOrEqual(23);
      await logger.info(`   publicationHour: ${PUBLICATION_SCHEDULE.publicationHour}`);

      // Verificar timezone
      expect(PUBLICATION_SCHEDULE.timezone).toBeTruthy();
      await logger.info(`   timezone: ${PUBLICATION_SCHEDULE.timezone}`);

      await logger.info('✅ Configuración del calendario correcta');
    });
  });

  // ==========================================
  // SUITE 2: FUNCIONES DEL CALENDARIO
  // ==========================================

  test.describe('Suite 2: Calendar Functions', () => {
    test('should calculate next publication date correctly', async () => {
      await logger.info('Validando cálculo de próxima publicación');

      const now = new Date();
      const next = getNextPublicationDate(now);

      // Debe ser una fecha válida
      expect(next).toBeInstanceOf(Date);

      // Debe ser en el futuro
      expect(next.getTime()).toBeGreaterThan(now.getTime());

      // Debe ser dentro de un rango razonable (1-7 días dependiendo del día actual)
      // El calendario puede ajustar a días preferidos (Lun/Mié/Vie/Dom)
      const diffDays = Math.ceil(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBeGreaterThanOrEqual(1);
      expect(diffDays).toBeLessThanOrEqual(7); // Máximo una semana

      // Debe tener la hora correcta
      expect(next.getHours()).toBe(PUBLICATION_SCHEDULE.publicationHour);

      await logger.info(`   Ahora: ${now.toISOString()}`);
      await logger.info(`   Próxima: ${next.toISOString()}`);
      await logger.info(`   Días hasta próxima: ${diffDays}`);
      await logger.info('✅ Cálculo de próxima fecha correcto');
    });

    test('should get upcoming publications in chronological order', async () => {
      await logger.info('Validando cronograma de publicaciones futuras');

      const count = 5;
      const upcoming = getUpcomingPublications(count);

      // Debe retornar la cantidad solicitada
      expect(upcoming).toHaveLength(count);

      // Todas deben ser fechas
      for (let i = 0; i < upcoming.length; i++) {
        expect(upcoming[i]).toBeInstanceOf(Date);
        await logger.info(`   ${i + 1}. ${upcoming[i].toLocaleDateString('es-MX')}`);
      }

      // Deben estar en orden cronológico
      for (let i = 1; i < upcoming.length; i++) {
        expect(upcoming[i].getTime()).toBeGreaterThan(upcoming[i - 1].getTime());
      }

      await logger.info('✅ Cronograma futuro correcto y en orden');
    });

    test('should get days until next publication', async () => {
      await logger.info('Validando días hasta próxima publicación');

      const days = getDaysUntilNextPublication();

      // Debe ser un número no negativo
      expect(days).toBeGreaterThanOrEqual(0);

      // No debe exceder una semana (el calendario ajusta a días preferidos)
      expect(days).toBeLessThanOrEqual(7);

      await logger.info(`   Días hasta próxima publicación: ${days}`);
      await logger.info('✅ Cálculo de días restantes correcto');
    });

    test('shouldPublishToday should return boolean', async () => {
      await logger.info('Validando shouldPublishToday()');

      const result = shouldPublishToday();

      // Debe retornar boolean
      expect(typeof result).toBe('boolean');

      // Verificar consistencia con día actual
      const today = new Date().getDay();
      const isPreferredDay = PUBLICATION_SCHEDULE.preferredDays.includes(today);
      expect(result).toBe(isPreferredDay);

      await logger.info(`   Hoy es: ${getDayName(today)}`);
      await logger.info(`   ¿Es día de publicación?: ${result}`);
      await logger.info('✅ shouldPublishToday() funciona correctamente');
    });

    test('getDayName should return Spanish day names', async () => {
      await logger.info('Validando nombres de días en español');

      expect(getDayName(0)).toBe('Domingo');
      expect(getDayName(1)).toBe('Lunes');
      expect(getDayName(2)).toBe('Martes');
      expect(getDayName(3)).toBe('Miércoles');
      expect(getDayName(4)).toBe('Jueves');
      expect(getDayName(5)).toBe('Viernes');
      expect(getDayName(6)).toBe('Sábado');

      await logger.info('✅ Nombres de días en español correctos');
    });

    test('getPreferredDaysFormatted should return readable string', async () => {
      await logger.info('Validando formato de días preferidos');

      const formatted = getPreferredDaysFormatted();

      // Debe contener abreviaciones de días
      expect(formatted).toContain('Lun');
      expect(formatted).toContain('Mié');
      expect(formatted).toContain('Vie');
      expect(formatted).toContain('Dom');

      await logger.info(`   Días preferidos: ${formatted}`);
      await logger.info('✅ Formato de días legible');
    });
  });

  // ==========================================
  // SUITE 3: ORCHESTRATOR FILES
  // ==========================================

  test.describe('Suite 3: Orchestrator Files', () => {
    test('orchestrator.ts should exist with required functions', async () => {
      await logger.info('Validando existencia de orchestrator.ts');

      const orchestratorPath = path.join(
        process.cwd(),
        'automation/src/orchestrator.ts'
      );
      expect(fs.existsSync(orchestratorPath)).toBeTruthy();

      const content = fs.readFileSync(orchestratorPath, 'utf-8');

      // Verificar función principal
      expect(content).toContain('runPipeline');
      expect(content).toContain('executeStep');

      // Verificar que importa dependencias correctas
      expect(content).toContain('publication-calendar');
      expect(content).toContain('news-scorer');
      expect(content).toContain('image-searcher-v2');

      await logger.info('✅ orchestrator.ts presente con funciones requeridas');
    });

    test('orchestrator.types.ts should define all interfaces', async () => {
      await logger.info('Validando types del orchestrator');

      const typesPath = path.join(
        process.cwd(),
        'automation/src/types/orchestrator.types.ts'
      );
      expect(fs.existsSync(typesPath)).toBeTruthy();

      const content = fs.readFileSync(typesPath, 'utf-8');

      // Verificar interfaces principales
      expect(content).toContain('OrchestratorConfig');
      expect(content).toContain('PipelineResult');
      expect(content).toContain('PipelineStep');
      expect(content).toContain('VideoMetadata');
      expect(content).toContain('PipelineStepName');
      expect(content).toContain('PipelineStepStatus');

      await logger.info('✅ orchestrator.types.ts define todas las interfaces');
    });

    test('cli.ts should exist', async () => {
      await logger.info('Validando CLI script');

      const cliPath = path.join(process.cwd(), 'automation/src/cli.ts');
      expect(fs.existsSync(cliPath)).toBeTruthy();

      const content = fs.readFileSync(cliPath, 'utf-8');

      // Verificar que importa orchestrator
      expect(content).toContain('runPipeline');

      // Verificar parseo de argumentos
      expect(content).toContain('--dry');
      expect(content).toContain('--prod');
      expect(content).toContain('--force');
      expect(content).toContain('--help');

      await logger.info('✅ cli.ts presente con opciones requeridas');
    });
  });

  // ==========================================
  // SUITE 4: NPM SCRIPTS
  // ==========================================

  test.describe('Suite 4: NPM Scripts Configuration', () => {
    test('root package.json should have automation scripts', async () => {
      await logger.info('Validando scripts en package.json (root)');

      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

      // Verificar scripts de automation
      expect(packageJson.scripts).toHaveProperty('automation:run');
      expect(packageJson.scripts).toHaveProperty('automation:dry');
      expect(packageJson.scripts).toHaveProperty('automation:force');
      expect(packageJson.scripts).toHaveProperty('automation:prod');
      expect(packageJson.scripts).toHaveProperty('automation:help');

      // Verificar script de test
      expect(packageJson.scripts).toHaveProperty('test:orchestrator');

      await logger.info('   Scripts encontrados:');
      await logger.info(`   - automation:run: ${packageJson.scripts['automation:run']}`);
      await logger.info(`   - automation:dry: ${packageJson.scripts['automation:dry']}`);
      await logger.info(`   - automation:force: ${packageJson.scripts['automation:force']}`);

      await logger.info('✅ Scripts npm configurados en root');
    });

    test('automation package.json should have pipeline scripts', async () => {
      await logger.info('Validando scripts en package.json (automation)');

      const packagePath = path.join(process.cwd(), 'automation/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

      // Verificar scripts de pipeline
      expect(packageJson.scripts).toHaveProperty('pipeline');
      expect(packageJson.scripts).toHaveProperty('pipeline:dry');
      expect(packageJson.scripts).toHaveProperty('pipeline:force');
      expect(packageJson.scripts).toHaveProperty('pipeline:prod');
      expect(packageJson.scripts).toHaveProperty('pipeline:help');

      await logger.info('✅ Scripts de pipeline configurados en automation');
    });
  });

  // ==========================================
  // SUITE 5: INTEGRATION VALIDATION
  // ==========================================

  test.describe('Suite 5: Integration Validation', () => {
    test('orchestrator should import from existing modules', async () => {
      await logger.info('Validando integración con módulos existentes');

      const orchestratorPath = path.join(
        process.cwd(),
        'automation/src/orchestrator.ts'
      );
      const content = fs.readFileSync(orchestratorPath, 'utf-8');

      // Verificar imports de módulos del Prompt 11 y 12
      expect(content).toContain('./news-scorer');
      expect(content).toContain('./image-searcher-v2');
      expect(content).toContain('./config/publication-calendar');

      // Verificar imports de types
      expect(content).toContain('./types/orchestrator.types');
      expect(content).toContain('./types/news.types');
      expect(content).toContain('./types/image.types');

      await logger.info('✅ Orchestrator integrado con módulos existentes');
    });

    test('all 9 pipeline steps should be defined', async () => {
      await logger.info('Validando 9 pasos del pipeline');

      const orchestratorPath = path.join(
        process.cwd(),
        'automation/src/orchestrator.ts'
      );
      const content = fs.readFileSync(orchestratorPath, 'utf-8');

      // Verificar cada paso del pipeline
      const expectedSteps = [
        'check_schedule',
        'collect_news',
        'select_top',
        'generate_script',
        'search_images',
        'generate_audio',
        'render_video',
        'manual_approval',
        'publish',
      ];

      for (const step of expectedSteps) {
        expect(content).toContain(`'${step}'`);
        await logger.info(`   ✓ ${step}`);
      }

      await logger.info('✅ Los 9 pasos del pipeline están definidos');
    });

    test('types should be compatible with existing news and image types', async () => {
      await logger.info('Validando compatibilidad de types');

      const typesPath = path.join(
        process.cwd(),
        'automation/src/types/orchestrator.types.ts'
      );
      const content = fs.readFileSync(typesPath, 'utf-8');

      // Verificar imports de types existentes
      expect(content).toContain('./news.types');
      expect(content).toContain('./scoring.types');
      expect(content).toContain('./image.types');

      // Verificar que VideoMetadata usa tipos existentes
      expect(content).toContain('NewsItem');
      expect(content).toContain('NewsScore');
      expect(content).toContain('ImageSearchResult');

      await logger.info('✅ Types compatibles con módulos existentes');
    });
  });
});
