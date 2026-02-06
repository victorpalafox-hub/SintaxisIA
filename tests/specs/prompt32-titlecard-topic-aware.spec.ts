/**
 * @fileoverview Tests para Prompt 32 - Title Card / Thumbnail Topic-Aware
 *
 * Valida:
 * - title-derivation.ts: Truncación de título y derivación de badge
 * - themes.ts: titleCard config
 * - TitleCardScene.tsx: Componente visual con SafeImage, editorial shadows
 * - AINewsShort.tsx: Integración como overlay Sequence
 * - Regresión: Hero/Content/Outro/Audio timing intactos
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 32
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { TestLogger } from '../utils';

// =============================================================================
// CONSTANTES
// =============================================================================

const REMOTION_SRC = path.join(__dirname, '../../remotion-app/src');

const TITLE_DERIVATION_PATH = path.join(REMOTION_SRC, 'utils/title-derivation.ts');
const TITLE_CARD_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/TitleCardScene.tsx');
const THEMES_PATH = path.join(REMOTION_SRC, 'styles/themes.ts');
const VIDEO_TYPES_PATH = path.join(REMOTION_SRC, 'types/video.types.ts');
const AINEWS_PATH = path.join(REMOTION_SRC, 'compositions/AINewsShort.tsx');
const HERO_SCENE_PATH = path.join(REMOTION_SRC, 'components/scenes/HeroScene.tsx');
const ROOT_PATH = path.join(REMOTION_SRC, 'Root.tsx');

// =============================================================================
// TESTS: TITLE DERIVATION
// =============================================================================

test.describe('Prompt 32 - Title Derivation', () => {
  const logger = new TestLogger({ testName: 'Prompt32-TitleDerivation' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(TITLE_DERIVATION_PATH, 'utf-8');
  });

  test('deriveTitleCardText trunca a 7 palabras con "..."', async () => {
    logger.info('Verificando truncación a 7 palabras');

    expect(content).toContain('MAX_WORDS = 7');
    expect(content).toContain("+ '...'");
  });

  test('deriveTitleCardText no trunca si ≤7 palabras', async () => {
    logger.info('Verificando no-truncación para títulos cortos');

    expect(content).toContain('words.length <= MAX_WORDS');
    expect(content).toContain('return trimmed');
  });

  test('deriveTitleCardText maneja título vacío', async () => {
    logger.info('Verificando manejo de string vacío');

    expect(content).toContain("if (!trimmed) return ''");
  });

  test('deriveBadge mapea todos los NewsType', async () => {
    logger.info('Verificando mapeo de badges');

    expect(content).toContain("'product-launch': 'NUEVO'");
    expect(content).toContain("'model-release': 'MODELO'");
    expect(content).toContain("'funding': 'INVERSIÓN'");
    expect(content).toContain("'controversy': 'URGENTE'");
    expect(content).toContain("'research-paper': 'ESTUDIO'");
    expect(content).toContain("'breakthrough': 'AVANCE'");
    expect(content).toContain("'partnership': 'ALIANZA'");
  });

  test('deriveBadge tiene fallback "NOTICIA"', async () => {
    logger.info('Verificando fallback de badge');

    expect(content).toContain("DEFAULT_BADGE = 'NOTICIA'");
    expect(content).toContain('?? DEFAULT_BADGE');
  });

  test('Prompt 32 documentado en header', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@since Prompt 32');
  });
});

// =============================================================================
// TESTS: CONFIG - themes.ts
// =============================================================================

test.describe('Prompt 32 - Config titleCard en themes.ts', () => {
  const logger = new TestLogger({ testName: 'Prompt32-Config' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(THEMES_PATH, 'utf-8');
  });

  test('titleCard config exportada', async () => {
    logger.info('Verificando export de titleCard');

    expect(content).toContain('export const titleCard');
  });

  test('durationFrames === 90 (3s)', async () => {
    logger.info('Verificando duración de 90 frames');

    const match = content.match(/titleCard[\s\S]*?durationFrames:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(90);
  });

  test('fadeOutFrames === 15', async () => {
    logger.info('Verificando fade out de 15 frames');

    const match = content.match(/titleCard[\s\S]*?fadeOutFrames:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match![1])).toBe(15);
  });

  test('title.fontSize === 96', async () => {
    logger.info('Verificando fontSize del título');

    // Dentro de titleCard.title
    expect(content).toMatch(/titleCard[\s\S]*?title:[\s\S]*?fontSize:\s*96/);
  });

  test('badge.fontSize === 32', async () => {
    logger.info('Verificando fontSize del badge');

    expect(content).toMatch(/titleCard[\s\S]*?badge:[\s\S]*?fontSize:\s*32/);
  });

  test('zoomRange definido [1.00, 1.03]', async () => {
    logger.info('Verificando zoomRange');

    expect(content).toContain('zoomRange:');
    expect(content).toMatch(/zoomRange:\s*\[1\.00,\s*1\.03\]/);
  });
});

// =============================================================================
// TESTS: TITLECARDSCENE COMPONENTE
// =============================================================================

test.describe('Prompt 32 - TitleCardScene Componente', () => {
  const logger = new TestLogger({ testName: 'Prompt32-TitleCardScene' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(TITLE_CARD_SCENE_PATH, 'utf-8');
  });

  test('TitleCardScene.tsx existe y exporta componente', async () => {
    logger.info('Verificando existencia del componente');

    expect(content).toContain('export const TitleCardScene');
    expect(content).toContain('React.FC<TitleCardProps>');
  });

  test('Usa SafeImage para backgroundImage', async () => {
    logger.info('Verificando uso de SafeImage');

    expect(content).toContain("import { SafeImage }");
    expect(content).toContain('<SafeImage');
    expect(content).toContain('src={backgroundImage}');
  });

  test('Usa editorialShadow (no neon glow)', async () => {
    logger.info('Verificando sombras editoriales');

    expect(content).toContain('editorialShadow.textDepth');
    expect(content).not.toContain('neonGlow');
    expect(content).not.toContain('boxShadow');
  });

  test('Usa titleCard config de themes', async () => {
    logger.info('Verificando uso de titleCard config');

    expect(content).toContain('titleCard.fadeOutFrames');
    expect(content).toContain('titleCard.durationFrames');
    expect(content).toContain('titleCard.backgroundImageOpacity');
    expect(content).toContain('titleCard.zoomRange');
  });

  test('Prompt 32 documentado en header', async () => {
    logger.info('Verificando documentación');

    expect(content).toContain('@since Prompt 32');
  });
});

// =============================================================================
// TESTS: TIPOS
// =============================================================================

test.describe('Prompt 32 - TitleCardProps en video.types.ts', () => {
  const logger = new TestLogger({ testName: 'Prompt32-Types' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(VIDEO_TYPES_PATH, 'utf-8');
  });

  test('TitleCardProps interface existe', async () => {
    logger.info('Verificando interface TitleCardProps');

    expect(content).toContain('export interface TitleCardProps');
    expect(content).toContain('titleText: string');
    expect(content).toContain('badge: string');
    expect(content).toContain('backgroundImage: string');
    expect(content).toContain('fps: number');
  });
});

// =============================================================================
// TESTS: INTEGRACION AINewsShort
// =============================================================================

test.describe('Prompt 32 - Integración AINewsShort', () => {
  const logger = new TestLogger({ testName: 'Prompt32-Integration' });
  let content: string;

  test.beforeAll(async () => {
    content = fs.readFileSync(AINEWS_PATH, 'utf-8');
  });

  test('Importa TitleCardScene', async () => {
    logger.info('Verificando import de TitleCardScene');

    expect(content).toMatch(/import.*TitleCardScene.*from/);
  });

  test('Importa deriveTitleCardText y deriveBadge', async () => {
    logger.info('Verificando import de funciones de derivación');

    expect(content).toContain('deriveTitleCardText');
    expect(content).toContain('deriveBadge');
  });

  test('Sequence TitleCard con from={0}', async () => {
    logger.info('Verificando Sequence TitleCard');

    expect(content).toContain('name="TitleCard"');
    // Debe empezar en frame 0
    expect(content).toMatch(/Sequence[\s\S]*?from=\{0\}[\s\S]*?name="TitleCard"/);
  });

  test('Sequence TitleCard usa titleCard.durationFrames', async () => {
    logger.info('Verificando duración de Sequence');

    expect(content).toContain('durationInFrames={titleCard.durationFrames}');
  });

  test('TitleCard es última Sequence (mayor z-index)', async () => {
    logger.info('Verificando z-index (TitleCard después de Narration)');

    const narrationIndex = content.indexOf('name="Narration"');
    const titleCardIndex = content.indexOf('name="TitleCard"');
    expect(narrationIndex).toBeGreaterThan(0);
    expect(titleCardIndex).toBeGreaterThan(narrationIndex);
  });

  test('TitleCard usa deriveTitleCardText(news.title)', async () => {
    logger.info('Verificando uso de deriveTitleCardText');

    expect(content).toContain('deriveTitleCardText(news.title)');
    expect(content).toContain('deriveBadge(props.newsType)');
  });
});

// =============================================================================
// TESTS: REGRESION
// =============================================================================

test.describe('Prompt 32 - Regresión', () => {
  const logger = new TestLogger({ testName: 'Prompt32-Regresion' });

  test('Hero timing sin cambio (heroStart=0, heroDuration=8s)', async () => {
    logger.info('Verificando Hero timing intacto');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('const heroStart = 0');
    expect(content).toContain('heroSceneDuration = 8 * fps');
  });

  test('Content timing sin cambio (contentStart con crossfade)', async () => {
    logger.info('Verificando Content timing intacto');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    expect(content).toContain('contentStart = heroSceneDuration - crossfadeFrames');
  });

  test('Audio narración sigue en contentStart', async () => {
    logger.info('Verificando audio timing intacto');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    // Prompt 32.1: Narration ahora tiene durationInFrames
    expect(content).toMatch(/Sequence\s+from=\{contentStart\}[\s\S]*?name="Narration"/);
  });

  test('BackgroundDirector sigue como primera capa', async () => {
    logger.info('Verificando BackgroundDirector en primera posición');

    const content = fs.readFileSync(AINEWS_PATH, 'utf-8');
    const bgIndex = content.indexOf('<BackgroundDirector');
    const heroIndex = content.indexOf('name="Hero"');
    expect(bgIndex).toBeGreaterThan(0);
    expect(bgIndex).toBeLessThan(heroIndex);
  });

  test('crossfadeFrames sin cambio (30)', async () => {
    logger.info('Verificando crossfadeFrames intacto');

    const content = fs.readFileSync(THEMES_PATH, 'utf-8');
    expect(content).toMatch(/crossfadeFrames:\s*30/);
  });

  test('calculateMetadata en Root.tsx sin cambio', async () => {
    logger.info('Verificando calculateMetadata intacto');

    const content = fs.readFileSync(ROOT_PATH, 'utf-8');
    expect(content).toContain('calculateMetadata={calculateMetadata}');
    expect(content).toContain('durationInFrames: duration * fps');
  });

  test('HeroScene no importa TitleCardScene', async () => {
    logger.info('Verificando que HeroScene no tiene import de TitleCard');

    const content = fs.readFileSync(HERO_SCENE_PATH, 'utf-8');
    expect(content).not.toMatch(/import.*TitleCard/);
  });
});
