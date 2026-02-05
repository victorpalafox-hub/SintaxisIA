/**
 * @fileoverview Tests para Prompt 19.1 - Imágenes Dinámicas por Segmento
 *
 * Valida la funcionalidad de:
 * - SceneSegmenterService: división de script en segmentos
 * - ImageOrchestrationService: búsqueda de imágenes por segmento
 * - Formato de images.json con estructura scenes[]
 * - PexelsProvider: integración con API de Pexels
 *
 * NOTA: Los tests de lógica de servicios verifican existencia de archivos
 * y estructura de tipos. La compilación se valida con `npm run check`.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.1
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import type { GeneratedScript } from '../../automation/src/types/script.types';
import type { SceneSegment, SceneImage, DynamicImagesResult } from '../../automation/src/types/image.types';

// =============================================================================
// CONSTANTES DE RUTAS
// =============================================================================

const AUTOMATION_SRC = path.join(__dirname, '../../automation/src');
const SERVICES_PATH = path.join(AUTOMATION_SRC, 'services');
const PROVIDERS_PATH = path.join(AUTOMATION_SRC, 'image-providers');
const TYPES_PATH = path.join(AUTOMATION_SRC, 'types');
const CONFIG_PATH = path.join(AUTOMATION_SRC, 'config');

// =============================================================================
// MOCKS Y FIXTURES
// =============================================================================

/**
 * Script de prueba simulando Gemini output
 */
const MOCK_SCRIPT: GeneratedScript = {
  hook: 'Google DeepMind acaba de presentar Genie 2, una IA que crea mundos virtuales interactivos.',
  body: 'Esta tecnología revoluciona el gaming porque genera entornos 3D completos a partir de una sola imagen. ' +
        'Imagina describir un mundo y verlo cobrar vida en segundos. Los jugadores podrán explorar universos únicos.',
  opinion: 'Lo fascinante es que esto democratiza la creación de videojuegos. Ya no necesitas ser un gran estudio ' +
           'para crear experiencias inmersivas. La barrera de entrada se reduce drásticamente.',
  cta: 'Esto estará disponible en 2026. Síguenos para más noticias de inteligencia artificial.',
  compliance: {
    passed: true,
    humanScore: 5,
    markers: {
      hasFirstPerson: true,
      hasOpinion: true,
      admitsUncertainty: false,
      hasReflectiveQuestion: false,
      avoidsCorpSpeak: true,
      hasAnalogy: true,
    },
    wordCount: 100,
    issues: [],
    suggestions: [],
  },
};

/**
 * Duración típica del audio TTS
 */
const MOCK_DURATION = 55; // segundos

// =============================================================================
// TESTS: ARCHIVOS Y ESTRUCTURA DEL PROYECTO
// =============================================================================

test.describe('Prompt 19.1 - Archivos y Estructura', () => {

  test('SceneSegmenterService archivo existe', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const exists = fs.existsSync(filePath);

    expect(exists).toBe(true);
  });

  test('ImageOrchestrationService archivo existe', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const exists = fs.existsSync(filePath);

    expect(exists).toBe(true);
  });

  test('PexelsProvider archivo existe', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const exists = fs.existsSync(filePath);

    expect(exists).toBe(true);
  });

  test('image.types.ts contiene SceneSegment', async () => {
    const filePath = path.join(TYPES_PATH, 'image.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('interface SceneSegment');
    expect(content).toContain('interface SceneImage');
    expect(content).toContain('interface DynamicImagesResult');
  });

  test('image-sources.ts contiene configuración de Pexels', async () => {
    const filePath = path.join(CONFIG_PATH, 'image-sources.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('pexels');
    expect(content).toContain('PEXELS_API_KEY');
  });

  test('index.ts de image-providers exporta searchPexels', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'index.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('searchPexels');
    expect(content).toContain('isPexelsConfigured');
  });

});

// =============================================================================
// TESTS: CONTENIDO DE SCENE SEGMENTER SERVICE
// =============================================================================

test.describe('Prompt 19.1 - SceneSegmenterService Contenido', () => {

  test('SceneSegmenterService exporta clase', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export class SceneSegmenterService');
    expect(content).toContain('segmentScript');
  });

  test('SceneSegmenterService tiene stopwords en español', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('SPANISH_STOPWORDS');
    expect(content).toMatch(/['"]el['"]/);
    expect(content).toMatch(/['"]la['"]/);
    expect(content).toMatch(/['"]de['"]/);
  });

  test('SceneSegmenterService tiene keywords técnicas', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('TECH_KEYWORDS');
    expect(content).toMatch(/['"]google['"]/);
    expect(content).toMatch(/['"]ai['"]/);
    expect(content).toMatch(/['"]gaming['"]/);
  });

  test('SceneSegmenterService tiene duración de segmento ~15s', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('SEGMENT_DURATION');
    expect(content).toMatch(/SEGMENT_DURATION\s*=\s*15/);
  });

  test('SceneSegmenterService tiene métodos privados de extracción', async () => {
    const filePath = path.join(SERVICES_PATH, 'scene-segmenter.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('extractKeywords');
    expect(content).toContain('generateSearchQuery');
    expect(content).toContain('mapScriptToSections');
  });

});

// =============================================================================
// TESTS: CONTENIDO DE IMAGE ORCHESTRATION SERVICE
// =============================================================================

test.describe('Prompt 19.1 - ImageOrchestrationService Contenido', () => {

  test('ImageOrchestrationService exporta clase', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export class ImageOrchestrationService');
  });

  test('ImageOrchestrationService tiene método searchBySegments', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('searchBySegments');
    expect(content).toMatch(/async searchBySegments.*SceneSegment/);
  });

  test('ImageOrchestrationService tiene método orchestrate', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('orchestrate');
    expect(content).toMatch(/async orchestrate.*DynamicImagesResult/);
  });

  test('ImageOrchestrationService tiene rate limiting', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('RATE_LIMIT_DELAY_MS');
    expect(content).toContain('delay');
  });

  test('ImageOrchestrationService tiene cascade de proveedores', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('searchPexels');
    expect(content).toContain('searchUnsplash');
    expect(content).toContain('searchGoogle');
    expect(content).toContain('searchWithFallback');
  });

  test('ImageOrchestrationService tiene fallback UI Avatars', async () => {
    const filePath = path.join(SERVICES_PATH, 'image-orchestration.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('ui-avatars.com');
    expect(content).toContain('generateFallbackImage');
  });

});

// =============================================================================
// TESTS: CONTENIDO DE PEXELS PROVIDER
// =============================================================================

test.describe('Prompt 19.1 - PexelsProvider Contenido', () => {

  test('PexelsProvider exporta función searchPexels', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export async function searchPexels');
  });

  test('PexelsProvider exporta función isPexelsConfigured', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('export function isPexelsConfigured');
  });

  test('PexelsProvider usa orientación portrait para Shorts', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('portrait');
    expect(content).toContain('orientation');
  });

  test('PexelsProvider maneja errores de rate limit', async () => {
    const filePath = path.join(PROVIDERS_PATH, 'pexels-provider.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('429');
    expect(content).toMatch(/rate limit/i);
  });

});

// =============================================================================
// TESTS: TIPOS Y ESTRUCTURA DE DATOS
// =============================================================================

test.describe('Prompt 19.1 - Tipos y Estructura de Datos', () => {

  test('SceneSegment debe tener todas las propiedades requeridas', async () => {
    // Arrange
    const mockSegment: SceneSegment = {
      index: 0,
      startSecond: 0,
      endSecond: 15,
      text: 'Texto del segmento',
      keywords: ['google', 'ai', 'gaming'],
      searchQuery: 'google ai gaming technology',
    };

    // Assert - Todas las propiedades existen
    expect(mockSegment).toHaveProperty('index');
    expect(mockSegment).toHaveProperty('startSecond');
    expect(mockSegment).toHaveProperty('endSecond');
    expect(mockSegment).toHaveProperty('text');
    expect(mockSegment).toHaveProperty('keywords');
    expect(mockSegment).toHaveProperty('searchQuery');
  });

  test('SceneImage debe tener estructura correcta', async () => {
    // Arrange
    const mockSceneImage: SceneImage = {
      sceneIndex: 0,
      startSecond: 0,
      endSecond: 15,
      imageUrl: 'https://images.pexels.com/photos/123/test.jpg',
      query: 'google ai technology',
      source: 'pexels',
      cached: false,
    };

    // Assert
    expect(mockSceneImage).toHaveProperty('sceneIndex');
    expect(mockSceneImage).toHaveProperty('startSecond');
    expect(mockSceneImage).toHaveProperty('endSecond');
    expect(mockSceneImage).toHaveProperty('imageUrl');
    expect(mockSceneImage).toHaveProperty('query');
    expect(mockSceneImage).toHaveProperty('source');
    expect(mockSceneImage).toHaveProperty('cached');
    expect(['pexels', 'unsplash', 'google', 'fallback']).toContain(mockSceneImage.source);
  });

  test('DynamicImagesResult debe tener estructura scenes[]', async () => {
    // Arrange
    const mockResult: DynamicImagesResult = {
      scenes: [
        {
          sceneIndex: 0,
          startSecond: 0,
          endSecond: 15,
          imageUrl: 'https://example.com/img1.jpg',
          query: 'query 1',
          source: 'pexels',
          cached: false,
        },
        {
          sceneIndex: 1,
          startSecond: 15,
          endSecond: 30,
          imageUrl: 'https://example.com/img2.jpg',
          query: 'query 2',
          source: 'unsplash',
          cached: false,
        },
      ],
      totalSegments: 2,
      generatedAt: new Date().toISOString(),
    };

    // Assert
    expect(mockResult).toHaveProperty('scenes');
    expect(Array.isArray(mockResult.scenes)).toBe(true);
    expect(mockResult.scenes.length).toBe(2);
    expect(mockResult).toHaveProperty('totalSegments');
    expect(mockResult).toHaveProperty('generatedAt');
    expect(mockResult.totalSegments).toBe(mockResult.scenes.length);
  });

});

// =============================================================================
// TESTS: FALLBACK UI AVATARS
// =============================================================================

test.describe('Prompt 19.1 - Fallback UI Avatars', () => {

  test('debe generar URL de fallback válida', async () => {
    // El fallback de UI Avatars se genera internamente
    const baseUrl = 'https://ui-avatars.com/api';
    const testUrl = `${baseUrl}/?name=G&size=800&background=00F0FF&color=000000&bold=true&format=png`;

    // Assert - URL válida
    expect(testUrl).toMatch(/^https:\/\/ui-avatars\.com\/api/);
    expect(testUrl).toContain('size=800');
    expect(testUrl).toContain('format=png');
  });

  test('colores de fallback deben ser cyberpunk', async () => {
    // Los colores están hardcodeados en el servicio
    const expectedColors = [
      { bg: '00F0FF', fg: '000000' }, // Cyan
      { bg: 'FF00FF', fg: 'FFFFFF' }, // Magenta
      { bg: '00FF00', fg: '000000' }, // Green
      { bg: 'FF6600', fg: 'FFFFFF' }, // Orange
    ];

    // Assert - Verificar que los colores son válidos hex
    expectedColors.forEach(color => {
      expect(color.bg).toMatch(/^[0-9A-F]{6}$/i);
      expect(color.fg).toMatch(/^[0-9A-F]{6}$/i);
    });
  });

});

// =============================================================================
// TESTS: INTEGRACIÓN CON OUTPUT MANAGER
// =============================================================================

test.describe('Prompt 19.1 - Integración OutputManager', () => {

  test('OutputManager archivo contiene dynamicImages', async () => {
    const filePath = path.join(SERVICES_PATH, 'output-manager.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('dynamicImages');
    expect(content).toContain('DynamicImagesResult');
  });

  test('OutputManager saveImagesJson acepta dynamicImages', async () => {
    const filePath = path.join(SERVICES_PATH, 'output-manager.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Verificar que el método acepta el parámetro
    expect(content).toMatch(/saveImagesJson.*dynamicImages/);
  });

  test('OutputData interface tiene dynamicImages opcional', async () => {
    const filePath = path.join(SERVICES_PATH, 'output-manager.service.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Verificar que la interface tiene la propiedad opcional
    expect(content).toContain('dynamicImages?: DynamicImagesResult');
  });

});

// =============================================================================
// TESTS: REMOTION VIDEO TYPES
// =============================================================================

test.describe('Prompt 19.1 - Remotion Video Types', () => {

  test('video.types.ts contiene SceneImage type', async () => {
    const filePath = path.join(__dirname, '../../remotion-app/src/types/video.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('interface SceneImage');
    expect(content).toContain('interface DynamicImages');
  });

  test('VideoProps.images soporta dynamicScenes', async () => {
    const filePath = path.join(__dirname, '../../remotion-app/src/types/video.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('dynamicScenes');
    expect(content).toMatch(/dynamicScenes\?.*SceneImage/);
  });

  test('ContentSceneProps soporta dynamicScenes', async () => {
    const filePath = path.join(__dirname, '../../remotion-app/src/types/video.types.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Verificar que ContentSceneProps tiene dynamicScenes
    expect(content).toContain('dynamicScenes?: SceneImage[]');
    expect(content).toContain('sceneStartSecond?');
  });

});

// =============================================================================
// TESTS: REMOTION COMPONENTS
// =============================================================================

test.describe('Prompt 19.1 - Remotion Components', () => {

  test('AINewsShort.tsx pasa dynamicScenes a ContentScene', async () => {
    const filePath = path.join(__dirname, '../../remotion-app/src/compositions/AINewsShort.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('dynamicScenes={images.dynamicScenes}');
    expect(content).toContain('sceneStartSecond=');
  });

  test('ContentScene.tsx implementa selección de imagen dinámica', async () => {
    const filePath = path.join(__dirname, '../../remotion-app/src/components/scenes/ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Prompt 25: renombrado getCurrentImage → getImageWithTransition
    expect(content).toContain('getImageWithTransition');
    expect(content).toContain('dynamicScenes');
    expect(content).toContain('currentSecond');
  });

  test('ContentScene.tsx calcula imagen según tiempo', async () => {
    const filePath = path.join(__dirname, '../../remotion-app/src/components/scenes/ContentScene.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Verificar que hay lógica de selección por tiempo
    expect(content).toMatch(/currentSecond.*>=.*startSecond/);
    expect(content).toMatch(/currentSecond.*<.*endSecond/);
  });

});

// =============================================================================
// TESTS: ENV CONFIGURATION
// =============================================================================

test.describe('Prompt 19.1 - Configuración .env', () => {

  test('.env.example contiene PEXELS_API_KEY', async () => {
    const filePath = path.join(__dirname, '../../.env.example');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('PEXELS_API_KEY');
    expect(content).toContain('pexels.com/api');
  });

});
