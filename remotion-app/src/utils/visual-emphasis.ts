/**
 * @fileoverview Visual Emphasis - Sistema de énfasis visual
 *
 * Detecta momentos de impacto en bloques editoriales y asigna
 * niveles de énfasis (hard/soft/none) para efectos visuales.
 *
 * Reglas determinísticas basadas en peso + posición del bloque.
 * NO modifica timing, audio ni duración — solo cambia la presentación visual.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 34
 */

import type { EditorialTextBlock } from './text-editorial';

// =============================================================================
// TIPOS
// =============================================================================

/** Nivel de intensidad de énfasis visual */
export type EmphasisLevel = 'hard' | 'soft' | 'none';

/**
 * Asignación de énfasis para un bloque individual
 */
export interface BlockEmphasis {
  /** Índice del bloque en el array de bloques */
  blockIndex: number;
  /** Nivel de énfasis asignado */
  level: EmphasisLevel;
  /** Razón de la asignación (para debugging) */
  reason: string;
}

/**
 * Resultado de la detección de énfasis para todo el video
 */
export interface EmphasisMap {
  /** Asignaciones de énfasis por bloque */
  blocks: BlockEmphasis[];
  /** Total de momentos HARD */
  hardCount: number;
  /** Total de momentos SOFT */
  softCount: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/** Máximo de momentos de énfasis por video (HARD + SOFT combinados) */
const MAX_EMPHASIS_TOTAL = 3;

/** Máximo de momentos HARD por video */
const MAX_HARD_TOTAL = 1;

/** Mínimo de bloques para activar el sistema de énfasis */
const MIN_BLOCKS_FOR_EMPHASIS = 4;

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Detecta momentos de énfasis visual en bloques editoriales
 *
 * Algoritmo determinístico:
 * 1. Si hay pocos bloques (< 4), no aplica énfasis
 * 2. Busca candidatos HARD entre bloques punch (no el último)
 * 3. Selecciona el punch más cercano al tercio medio del video
 * 4. Asigna SOFT al bloque justo antes del HARD + hasta 1 headline
 * 5. Limita a MAX_EMPHASIS_TOTAL momentos totales
 *
 * @param blocks - Bloques editoriales del video
 * @returns Mapa de énfasis con asignaciones por bloque
 */
export function detectEmphasis(blocks: EditorialTextBlock[]): EmphasisMap {
  // Inicializar todos como 'none'
  const emphasisBlocks: BlockEmphasis[] = blocks.map((_, i) => ({
    blockIndex: i,
    level: 'none' as EmphasisLevel,
    reason: 'default',
  }));

  // Si hay pocos bloques, no aplicar énfasis
  if (blocks.length < MIN_BLOCKS_FOR_EMPHASIS) {
    return { blocks: emphasisBlocks, hardCount: 0, softCount: 0 };
  }

  // Paso 1: Encontrar candidatos HARD (punch, no primero ni último)
  const hardCandidates = findHardCandidates(blocks);

  // Paso 2: Seleccionar el mejor HARD (más cercano al tercio medio)
  const selectedHard = selectBestHard(hardCandidates, blocks.length);

  // Paso 3: Encontrar candidatos SOFT
  const softCandidates = findSoftCandidates(blocks, selectedHard);

  // Paso 4: Asignar énfasis respetando límites
  let hardCount = 0;
  let softCount = 0;

  // Asignar HARD
  if (selectedHard !== null && hardCount < MAX_HARD_TOTAL) {
    emphasisBlocks[selectedHard].level = 'hard';
    emphasisBlocks[selectedHard].reason = 'punch in middle third';
    hardCount++;
  }

  // Asignar SOFT (hasta completar MAX_EMPHASIS_TOTAL)
  for (const candidate of softCandidates) {
    if (hardCount + softCount >= MAX_EMPHASIS_TOTAL) break;
    if (emphasisBlocks[candidate.index].level === 'none') {
      emphasisBlocks[candidate.index].level = 'soft';
      emphasisBlocks[candidate.index].reason = candidate.reason;
      softCount++;
    }
  }

  return { blocks: emphasisBlocks, hardCount, softCount };
}

/**
 * Obtiene el nivel de énfasis para un bloque específico
 *
 * @param emphasisMap - Mapa de énfasis del video
 * @param blockIndex - Índice del bloque a consultar
 * @returns Nivel de énfasis ('hard', 'soft', o 'none')
 */
export function getEmphasisForBlock(
  emphasisMap: EmphasisMap,
  blockIndex: number
): EmphasisLevel {
  const entry = emphasisMap.blocks.find(b => b.blockIndex === blockIndex);
  return entry?.level ?? 'none';
}

// =============================================================================
// SELECCIÓN DE CANDIDATOS
// =============================================================================

/**
 * Encuentra bloques candidatos a énfasis HARD
 *
 * Candidatos: bloques punch que no son el primero ni el último
 * (el último punch es cierre natural, no necesita énfasis extra)
 */
function findHardCandidates(blocks: EditorialTextBlock[]): number[] {
  const candidates: number[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    // HARD solo en punch, no primero ni último bloque
    if (
      block.weight === 'punch' &&
      i > 0 &&
      i < blocks.length - 1
    ) {
      candidates.push(i);
    }
  }

  return candidates;
}

/**
 * Selecciona el mejor candidato HARD: el más cercano al tercio medio
 *
 * El tercio medio (33%-66%) es donde el impacto visual es más efectivo.
 * Desempate: el bloque con menos palabras (más impactante).
 */
function selectBestHard(
  candidates: number[],
  totalBlocks: number
): number | null {
  if (candidates.length === 0) return null;

  const midStart = totalBlocks * 0.33;
  const midEnd = totalBlocks * 0.66;

  // Ordenar por distancia al centro del tercio medio
  const midCenter = (midStart + midEnd) / 2;
  const sorted = [...candidates].sort((a, b) => {
    const distA = Math.abs(a - midCenter);
    const distB = Math.abs(b - midCenter);
    return distA - distB;
  });

  return sorted[0];
}

/**
 * Encuentra candidatos SOFT basados en posición relativa al HARD
 *
 * - Bloque justo antes del HARD seleccionado (setup)
 * - Hasta 1 headline en la primera mitad del video
 */
function findSoftCandidates(
  blocks: EditorialTextBlock[],
  selectedHard: number | null
): Array<{ index: number; reason: string }> {
  const candidates: Array<{ index: number; reason: string }> = [];
  const halfPoint = Math.floor(blocks.length / 2);

  // Candidato 1: Bloque justo antes del HARD (setup)
  if (selectedHard !== null && selectedHard > 0) {
    const setupIndex = selectedHard - 1;
    const setupBlock = blocks[setupIndex];
    if (setupBlock.weight === 'headline' || setupBlock.weight === 'support') {
      candidates.push({ index: setupIndex, reason: 'setup before hard' });
    }
  }

  // Candidato 2: Hasta 1 headline en la primera mitad (enganche)
  let headlineCount = 0;
  for (let i = 0; i < halfPoint && headlineCount < 1; i++) {
    if (
      blocks[i].weight === 'headline' &&
      i > 1 && // Saltar los primeros 2 (apertura natural)
      (!selectedHard || i !== selectedHard - 1) // No duplicar con setup
    ) {
      candidates.push({ index: i, reason: 'headline in first half' });
      headlineCount++;
    }
  }

  return candidates;
}
