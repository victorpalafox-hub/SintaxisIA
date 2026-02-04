/**
 * @fileoverview Tests para Prompt 19.3.2 - SafeImage Preload con delayRender
 *
 * Valida:
 * - Imports correctos de delayRender y continueRender
 * - useEffect con preload implementado
 * - Refs para evitar múltiples llamadas
 * - Timeout de seguridad (8 segundos)
 * - Opacity transition para transición suave
 * - Regresión: generatePlaceholder sin cambios
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.3.2
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { getTestLogger } from '../utils';

// Rutas de archivos
const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');
const SAFE_IMAGE_PATH = path.join(REMOTION_SRC, 'components/elements/SafeImage.tsx');

// Logger para tests
const logger = getTestLogger();

// =============================================================================
// TESTS: IMPORTS CORRECTOS
// =============================================================================

test.describe('Prompt 19.3.2 - Imports Correctos', () => {

  test('debe importar delayRender de remotion', async () => {
    logger.logTestStart('importar delayRender de remotion');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // Debe importar delayRender (como función o del hook)
    const hasDelayRenderImport = content.includes('delayRender') &&
                                  content.includes("from 'remotion'");

    expect(hasDelayRenderImport).toBeTruthy();
    logger.logTestEnd('importar delayRender de remotion', 'passed', 0);
  });

  test('debe importar continueRender de remotion', async () => {
    logger.logTestStart('importar continueRender de remotion');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    const hasContinueRenderImport = content.includes('continueRender') &&
                                     content.includes("from 'remotion'");

    expect(hasContinueRenderImport).toBeTruthy();
    logger.logTestEnd('importar continueRender de remotion', 'passed', 0);
  });

  test('debe importar useRef de react', async () => {
    logger.logTestStart('importar useRef de react');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    const hasUseRefImport = content.includes('useRef') &&
                            content.includes("from 'react'");

    expect(hasUseRefImport).toBeTruthy();
    logger.logTestEnd('importar useRef de react', 'passed', 0);
  });

});

// =============================================================================
// TESTS: DELAY RENDER IMPLEMENTADO
// =============================================================================

test.describe('Prompt 19.3.2 - delayRender Implementado', () => {

  test('debe llamar delayRender en useEffect', async () => {
    logger.logTestStart('delayRender en useEffect');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // Debe tener useEffect y delayRender juntos
    const hasUseEffect = content.includes('useEffect');
    const hasDelayRenderCall = content.includes('delayRender(');

    expect(hasUseEffect).toBeTruthy();
    expect(hasDelayRenderCall).toBeTruthy();
    logger.logTestEnd('delayRender en useEffect', 'passed', 0);
  });

  test('debe llamar continueRender en callbacks', async () => {
    logger.logTestStart('continueRender en callbacks');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // Debe llamar continueRender en onload, onerror, y cleanup
    const continueRenderCount = (content.match(/continueRender\(/g) || []).length;

    // Mínimo 2 llamadas: una en complete() y una en cleanup
    expect(continueRenderCount).toBeGreaterThanOrEqual(2);
    logger.logTestEnd('continueRender en callbacks', 'passed', 0);
  });

  test('debe almacenar handle en ref', async () => {
    logger.logTestStart('handle almacenado en ref');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // Debe tener handleRef
    const hasHandleRef = content.includes('handleRef');
    const hasUseRefNumber = content.includes('useRef<number');

    expect(hasHandleRef).toBeTruthy();
    expect(hasUseRefNumber).toBeTruthy();
    logger.logTestEnd('handle almacenado en ref', 'passed', 0);
  });

  test('debe tener mensaje descriptivo en delayRender', async () => {
    logger.logTestStart('mensaje descriptivo en delayRender');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // Debe tener mensaje como "Loading image: ..."
    const hasLoadingMessage = content.includes('Loading image');

    expect(hasLoadingMessage).toBeTruthy();
    logger.logTestEnd('mensaje descriptivo en delayRender', 'passed', 0);
  });

});

// =============================================================================
// TESTS: MANEJO DE ESTADOS
// =============================================================================

test.describe('Prompt 19.3.2 - Manejo de Estados', () => {

  test('debe tener estado isLoaded', async () => {
    logger.logTestStart('estado isLoaded');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    const hasIsLoaded = content.includes('isLoaded');
    const hasSetIsLoaded = content.includes('setIsLoaded');

    expect(hasIsLoaded).toBeTruthy();
    expect(hasSetIsLoaded).toBeTruthy();
    logger.logTestEnd('estado isLoaded', 'passed', 0);
  });

  test('debe tener isCompleteRef para evitar duplicados', async () => {
    logger.logTestStart('isCompleteRef para evitar duplicados');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    const hasIsCompleteRef = content.includes('isCompleteRef');
    // Debe verificar isCompleteRef.current antes de continuar
    const checksComplete = content.includes('isCompleteRef.current');

    expect(hasIsCompleteRef).toBeTruthy();
    expect(checksComplete).toBeTruthy();
    logger.logTestEnd('isCompleteRef para evitar duplicados', 'passed', 0);
  });

  test('debe tener opacity transition en style', async () => {
    logger.logTestStart('opacity transition en style');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // Debe tener opacity condicional y transition
    const hasOpacity = content.includes('opacity:');
    const hasTransition = content.includes('transition:');
    const hasIsLoadedCondition = content.includes('isLoaded ?');

    expect(hasOpacity).toBeTruthy();
    expect(hasTransition).toBeTruthy();
    expect(hasIsLoadedCondition).toBeTruthy();
    logger.logTestEnd('opacity transition en style', 'passed', 0);
  });

});

// =============================================================================
// TESTS: TIMEOUT DE SEGURIDAD
// =============================================================================

test.describe('Prompt 19.3.2 - Timeout de Seguridad', () => {

  test('debe tener constante IMAGE_LOAD_TIMEOUT = 8000', async () => {
    logger.logTestStart('IMAGE_LOAD_TIMEOUT = 8000');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    const hasTimeoutConstant = content.includes('IMAGE_LOAD_TIMEOUT');
    const hasValue8000 = content.includes('8000');

    expect(hasTimeoutConstant).toBeTruthy();
    expect(hasValue8000).toBeTruthy();
    logger.logTestEnd('IMAGE_LOAD_TIMEOUT = 8000', 'passed', 0);
  });

  test('debe tener setTimeout con clearTimeout', async () => {
    logger.logTestStart('setTimeout con clearTimeout');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    const hasSetTimeout = content.includes('setTimeout');
    const hasClearTimeout = content.includes('clearTimeout');

    expect(hasSetTimeout).toBeTruthy();
    expect(hasClearTimeout).toBeTruthy();
    logger.logTestEnd('setTimeout con clearTimeout', 'passed', 0);
  });

  test('debe usar fallback en timeout', async () => {
    logger.logTestStart('fallback en timeout');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // El timeout debe llamar complete con fallback
    const timeoutUsesFallback = content.includes('complete(false');

    expect(timeoutUsesFallback).toBeTruthy();
    logger.logTestEnd('fallback en timeout', 'passed', 0);
  });

});

// =============================================================================
// TESTS: REGRESIÓN
// =============================================================================

test.describe('Prompt 19.3.2 - Regresión', () => {

  test('generatePlaceholder debe existir sin cambios', async () => {
    logger.logTestStart('generatePlaceholder sin cambios');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // Debe mantener la función generatePlaceholder
    const hasGeneratePlaceholder = content.includes('function generatePlaceholder');
    const hasUiAvatars = content.includes('ui-avatars.com');
    const hasClearbit = content.includes('clearbit.com');
    const hasLogoDev = content.includes('logo.dev');

    expect(hasGeneratePlaceholder).toBeTruthy();
    expect(hasUiAvatars).toBeTruthy();
    expect(hasClearbit).toBeTruthy();
    expect(hasLogoDev).toBeTruthy();
    logger.logTestEnd('generatePlaceholder sin cambios', 'passed', 0);
  });

  test('Props interface debe mantenerse', async () => {
    logger.logTestStart('Props interface mantenida');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    // Debe tener todas las props originales
    const hasSrc = content.includes('src: string');
    const hasFallbackSrc = content.includes('fallbackSrc?:');
    const hasStyle = content.includes('style?:');
    const hasAlt = content.includes('alt?:');
    const hasWidth = content.includes('width?:');
    const hasHeight = content.includes('height?:');

    expect(hasSrc).toBeTruthy();
    expect(hasFallbackSrc).toBeTruthy();
    expect(hasStyle).toBeTruthy();
    expect(hasAlt).toBeTruthy();
    expect(hasWidth).toBeTruthy();
    expect(hasHeight).toBeTruthy();
    logger.logTestEnd('Props interface mantenida', 'passed', 0);
  });

});

// =============================================================================
// TESTS: DOCUMENTACIÓN
// =============================================================================

test.describe('Prompt 19.3.2 - Documentación', () => {

  test('debe tener versión 1.1.0', async () => {
    logger.logTestStart('versión 1.1.0');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    const hasVersion = content.includes('@version 1.1.0');

    expect(hasVersion).toBeTruthy();
    logger.logTestEnd('versión 1.1.0', 'passed', 0);
  });

  test('debe tener @updated Prompt 19.3.2', async () => {
    logger.logTestStart('@updated Prompt 19.3.2');
    const content = fs.readFileSync(SAFE_IMAGE_PATH, 'utf-8');

    const hasUpdated = content.includes('@updated Prompt 19.3.2');

    expect(hasUpdated).toBeTruthy();
    logger.logTestEnd('@updated Prompt 19.3.2', 'passed', 0);
  });

});
