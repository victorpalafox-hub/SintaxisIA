/**
 * @fileoverview Smoke Test: Validación de Rutas Críticas
 *
 * Este test se ejecuta PRIMERO (prefijo 00-) para detectar
 * problemas de configuración de rutas antes de otros tests.
 *
 * Valida que:
 * - VIDEO_PATHS apuntan a directorios válidos
 * - Los archivos críticos del proyecto existen
 * - La configuración es compatible con CI/CD (Linux)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 17 Fix
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Importar configuración de video
import { VIDEO_CONFIG } from '../../automation/src/config/video.config';

test.describe('SMOKE TEST: Critical Paths Validation', () => {
  /**
   * Suite rápida que debe pasar antes de ejecutar otros tests.
   * Si falla aquí, hay un problema de configuración fundamental.
   */

  test.describe('Suite 1: VIDEO_PATHS Validation', () => {
    test('remotionApp path should exist', async () => {
      const remotionAppPath = VIDEO_CONFIG.paths.remotionApp;

      // Verificar que no sea undefined
      expect(remotionAppPath).toBeDefined();
      expect(remotionAppPath).not.toBe('');

      // Verificar que exista
      const exists = fs.existsSync(remotionAppPath);

      if (!exists) {
        console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ERROR CRÍTICO: remotionApp path no existe                   ║
╠══════════════════════════════════════════════════════════════╣
║  Path actual: ${remotionAppPath}
║
║  SOLUCIÓN: Verificar video.config.ts usa getProjectRoot()
║  NO debe usar: path.resolve(process.cwd(), '..', 'remotion-app')
║  DEBE usar: path.join(PROJECT_ROOT, 'remotion-app')
╚══════════════════════════════════════════════════════════════╝
        `);
      }

      expect(exists, `remotionApp path no existe: ${remotionAppPath}`).toBe(true);
    });

    test('publicAssets path should exist', async () => {
      const publicAssetsPath = VIDEO_CONFIG.paths.publicAssets;

      expect(publicAssetsPath).toBeDefined();

      const exists = fs.existsSync(publicAssetsPath);

      if (!exists) {
        console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ERROR: publicAssets path no existe                          ║
╠══════════════════════════════════════════════════════════════╣
║  Path actual: ${publicAssetsPath}
║
║  Verificar que remotion-app/public/ existe
╚══════════════════════════════════════════════════════════════╝
        `);
      }

      expect(exists, `publicAssets path no existe: ${publicAssetsPath}`).toBe(true);
    });

    test('VIDEO_PATHS should not contain ".." relative navigation', async () => {
      // Verificar que las rutas no usen navegación relativa problemática
      const paths = VIDEO_CONFIG.paths;

      for (const [key, value] of Object.entries(paths)) {
        // No debe contener /.. o \..
        const hasRelativeNav = value.includes('..') && !value.includes('node_modules');

        if (hasRelativeNav) {
          console.error(`
╔══════════════════════════════════════════════════════════════╗
║  WARNING: Path con navegación relativa ".."                  ║
╠══════════════════════════════════════════════════════════════╣
║  Key: ${key}
║  Value: ${value}
║
║  Esto puede causar problemas en CI/CD
╚══════════════════════════════════════════════════════════════╝
          `);
        }

        // Las rutas resueltas no deberían tener .. (después de path.resolve/join)
        expect(
          value.includes(path.join('..', '..')),
          `Path ${key} contiene navegación relativa múltiple: ${value}`
        ).toBe(false);
      }
    });
  });

  test.describe('Suite 2: Critical Project Files', () => {
    const CRITICAL_FILES = [
      'package.json',
      'automation/package.json',
      'remotion-app/package.json',
      'automation/src/config/video.config.ts',
      'automation/src/types/video.types.ts',
      'automation/src/services/video-rendering.service.ts',
      'remotion-app/src/Root.tsx',
      '.github/workflows/test.yml',
    ];

    for (const file of CRITICAL_FILES) {
      test(`${file} should exist`, async () => {
        const filePath = path.join(process.cwd(), file);
        const exists = fs.existsSync(filePath);

        expect(exists, `Archivo crítico no existe: ${file}`).toBe(true);
      });
    }
  });

  test.describe('Suite 3: Critical Directories', () => {
    const CRITICAL_DIRS = [
      'tests/specs',
      'tests/page-objects',
      'automation/src',
      'remotion-app/src',
      'remotion-app/src/components',
    ];

    for (const dir of CRITICAL_DIRS) {
      test(`${dir}/ should exist`, async () => {
        const dirPath = path.join(process.cwd(), dir);
        const exists = fs.existsSync(dirPath);

        expect(exists, `Directorio crítico no existe: ${dir}`).toBe(true);
      });
    }
  });

  test.describe('Suite 4: CI/CD Compatibility', () => {
    test('process.cwd() should be project root', async () => {
      const cwd = process.cwd();

      // El cwd debe contener estos indicadores de ser la raíz
      const hasPackageJson = fs.existsSync(path.join(cwd, 'package.json'));
      const hasRemotionApp = fs.existsSync(path.join(cwd, 'remotion-app'));
      const hasAutomation = fs.existsSync(path.join(cwd, 'automation'));

      expect(hasPackageJson, 'No se encontró package.json en cwd').toBe(true);
      expect(hasRemotionApp, 'No se encontró remotion-app/ en cwd').toBe(true);
      expect(hasAutomation, 'No se encontró automation/ en cwd').toBe(true);
    });

    test('VIDEO_CONFIG.paths should use absolute paths', async () => {
      const paths = VIDEO_CONFIG.paths;

      for (const [key, value] of Object.entries(paths)) {
        // En Windows las rutas absolutas empiezan con letra de unidad (C:\)
        // En Linux/Mac empiezan con /
        const isAbsolute = path.isAbsolute(value);

        expect(
          isAbsolute,
          `Path ${key} no es absoluto: ${value}`
        ).toBe(true);
      }
    });
  });
});
