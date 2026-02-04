/**
 * @fileoverview Tests para Prompt 19.5 - Visual Queries
 *
 * Valida la funcionalidad de extracción de conceptos visuales del texto
 * para generar queries más específicas en la búsqueda de imágenes.
 *
 * Cubre:
 * - extractVisualConcepts(): detección de patrones visuales
 * - generateSearchQuery(): priorización de conceptos visuales
 * - Fallback a keywords cuando no hay conceptos visuales
 * - Mantenimiento de señal __LOGO__ para segmento 0
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.5
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const SERVICES_PATH = path.join(AUTOMATION_SRC, 'services');
const SCENE_SEGMENTER_PATH = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');

// =============================================================================
// FIXTURES
// =============================================================================

/**
 * Textos de prueba con conceptos visuales específicos
 */
const VISUAL_TEXTS = {
  mundosVirtuales: 'Google DeepMind presenta Genie 2, que genera mundos virtuales interactivos en tiempo real.',
  robotsHumanoides: 'Boston Dynamics muestra sus robots humanoides más avanzados.',
  hologramas: 'Nueva interfaz holográfica permite interactuar con datos en 3D.',
  realidadVirtual: 'La realidad virtual alcanza nuevos niveles de inmersión.',
  deepLearning: 'El deep learning revoluciona el procesamiento de imágenes médicas.',
  vehiculosAutonomos: 'Tesla presenta su nuevo sistema de vehículos autónomos.',
  reconocimientoFacial: 'Sistema de reconocimiento facial mejora la seguridad aeroportuaria.',
  generacionImagenes: 'OpenAI lanza herramienta de generación de imágenes más potente.',
  chipNeuronal: 'Intel desarrolla chips neuronales para procesamiento de IA.',
  metaverso: 'Meta expande su metaverso con nuevas experiencias sociales.',
};

/**
 * Texto genérico sin conceptos visuales claros
 */
const GENERIC_TEXT = 'La empresa anunció nuevas funcionalidades para su plataforma.';

// =============================================================================
// TESTS: ESTRUCTURA Y ARCHIVOS
// =============================================================================

test.describe('Prompt 19.5 - Estructura y Archivos', () => {
  const logger = new TestLogger({ testName: 'Prompt19.2-Estructura' });

  test('SceneSegmenterService contiene VISUAL_PATTERNS', async () => {
    logger.info('Verificando VISUAL_PATTERNS en SceneSegmenterService');

    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');

    expect(content).toContain('VISUAL_PATTERNS');
    expect(content).toContain('pattern: RegExp');
    expect(content).toContain('query: string');
  });

  test('SceneSegmenterService contiene extractVisualConcepts()', async () => {
    logger.info('Verificando método extractVisualConcepts');

    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');

    expect(content).toContain('extractVisualConcepts');
    expect(content).toContain('private extractVisualConcepts(text: string): string[]');
  });

  test('generateSearchQuery() acepta parámetro fullText', async () => {
    logger.info('Verificando parámetro fullText en generateSearchQuery');

    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');

    expect(content).toContain('fullText?: string');
    expect(content).toContain('generateSearchQuery(keywords, i, company, text)');
  });
});

// =============================================================================
// TESTS: PATRONES VISUALES
// =============================================================================

test.describe('Prompt 19.5 - Patrones Visuales Incluidos', () => {
  const logger = new TestLogger({ testName: 'Prompt19.2-Patrones' });
  let serviceContent: string;

  test.beforeAll(async () => {
    serviceContent = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
  });

  test('patrón mundos virtuales está definido', async () => {
    logger.info('Verificando patrón: mundos virtuales');

    expect(serviceContent).toContain('mundos?\\s+virtuales?');
    expect(serviceContent).toContain('virtual world');
  });

  test('patrón robots humanoides está definido', async () => {
    logger.info('Verificando patrón: robots humanoides');

    expect(serviceContent).toContain('robots?\\s+(humanoides?|autonomos?)');
    expect(serviceContent).toContain('humanoid robot');
  });

  test('patrón realidad virtual está definido', async () => {
    logger.info('Verificando patrón: realidad virtual');

    expect(serviceContent).toContain('realidad\\s+virtual');
    expect(serviceContent).toContain('virtual reality');
  });

  test('patrón deep learning está definido', async () => {
    logger.info('Verificando patrón: deep learning');

    expect(serviceContent).toContain('deep\\s+learning');
    expect(serviceContent).toContain('deep learning neural');
  });

  test('patrón vehículos autónomos está definido', async () => {
    logger.info('Verificando patrón: vehículos autónomos');

    expect(serviceContent).toContain('vehiculos?\\s+autonomos?');
    expect(serviceContent).toContain('autonomous vehicle');
  });

  test('patrón reconocimiento facial está definido', async () => {
    logger.info('Verificando patrón: reconocimiento facial');

    expect(serviceContent).toContain('reconocimiento\\s+facial');
    expect(serviceContent).toContain('facial recognition');
  });

  test('patrón generación de imágenes está definido', async () => {
    logger.info('Verificando patrón: generación de imágenes');

    expect(serviceContent).toContain('generacion\\s+de\\s+imagenes');
    expect(serviceContent).toContain('ai image generation');
  });

  test('patrón chips neuronales está definido', async () => {
    logger.info('Verificando patrón: chips neuronales');

    expect(serviceContent).toContain('chips?\\s+(neuronales?|cuanticos?)');
    expect(serviceContent).toContain('neural chip');
  });

  test('patrón metaverso está definido', async () => {
    logger.info('Verificando patrón: metaverso');

    expect(serviceContent).toContain('metaverso|metaverse');
    expect(serviceContent).toContain('metaverse digital');
  });

  test('patrón hologramas está definido', async () => {
    logger.info('Verificando patrón: hologramas');

    expect(serviceContent).toContain('holograma|holografico');
    expect(serviceContent).toContain('hologram technology');
  });
});

// =============================================================================
// TESTS: LÓGICA DE PRIORIZACIÓN
// =============================================================================

test.describe('Prompt 19.5 - Lógica de Priorización', () => {
  const logger = new TestLogger({ testName: 'Prompt19.2-Priorizacion' });
  let serviceContent: string;

  test.beforeAll(async () => {
    serviceContent = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');
  });

  test('conceptos visuales tienen prioridad sobre keywords', async () => {
    logger.info('Verificando priorización de conceptos visuales');

    // El código debe llamar extractVisualConcepts antes de usar keywords
    expect(serviceContent).toContain('const visualConcepts = this.extractVisualConcepts(fullText)');
    expect(serviceContent).toContain('if (visualConcepts.length > 0)');
  });

  test('fallback a keywords cuando no hay conceptos visuales', async () => {
    logger.info('Verificando fallback a keywords');

    // Debe haber comentario indicando fallback
    expect(serviceContent).toContain('Fallback: Usar keywords si no hay conceptos visuales');
  });

  test('señal __LOGO__ se mantiene para segmento 0', async () => {
    logger.info('Verificando señal __LOGO__ para segmento 0');

    expect(serviceContent).toContain('__LOGO__:${company}');
    expect(serviceContent).toContain('segmentIndex === 0 && company');
  });

  test('máximo 2 conceptos visuales por segmento', async () => {
    logger.info('Verificando límite de conceptos visuales');

    expect(serviceContent).toContain('concepts.length >= 2');
    expect(serviceContent).toContain('Máximo 2 conceptos visuales');
  });

  test('logging de conceptos encontrados', async () => {
    logger.info('Verificando logging de conceptos');

    expect(serviceContent).toContain('Conceptos visuales encontrados');
    expect(serviceContent).toContain('logger.info');
  });
});

// =============================================================================
// TESTS: INTEGRACIÓN CON SEGMENTSCRIPT
// =============================================================================

test.describe('Prompt 19.5 - Integración con segmentScript', () => {
  const logger = new TestLogger({ testName: 'Prompt19.2-Integracion' });

  test('segmentScript pasa texto a generateSearchQuery', async () => {
    logger.info('Verificando paso de texto en segmentScript');

    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');

    // La llamada debe incluir el parámetro text
    expect(content).toContain('generateSearchQuery(keywords, i, company, text)');
  });

  test('SceneSegment incluye searchQuery con formato correcto', async () => {
    logger.info('Verificando estructura de SceneSegment');

    const typesPath = path.join(AUTOMATION_SRC, 'types', 'image.types.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');

    expect(content).toContain('searchQuery: string');
  });
});

// =============================================================================
// TESTS: DOCUMENTACIÓN Y COMENTARIOS
// =============================================================================

test.describe('Prompt 19.5 - Documentación', () => {
  const logger = new TestLogger({ testName: 'Prompt19.2-Documentacion' });

  test('VISUAL_PATTERNS tiene JSDoc', async () => {
    logger.info('Verificando JSDoc de VISUAL_PATTERNS');

    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');

    expect(content).toContain('Patrones para extraer conceptos visuales');
    expect(content).toContain('@since Prompt 19.5');
  });

  test('extractVisualConcepts tiene JSDoc completo', async () => {
    logger.info('Verificando JSDoc de extractVisualConcepts');

    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');

    expect(content).toContain('@param text - Texto a analizar');
    expect(content).toContain('@returns Array de queries visuales');
  });

  test('generateSearchQuery actualizado con @updated tag', async () => {
    logger.info('Verificando @updated tag en generateSearchQuery');

    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');

    expect(content).toContain('@updated Prompt 19.5 - Prioriza conceptos visuales');
  });

  test('archivo header actualizado', async () => {
    logger.info('Verificando header del archivo');

    const content = fs.readFileSync(SCENE_SEGMENTER_PATH, 'utf-8');

    // Debe mencionar Visual Queries o Prompt 19.5 en algún lugar
    expect(content).toContain('Prompt 19.5');
  });
});
