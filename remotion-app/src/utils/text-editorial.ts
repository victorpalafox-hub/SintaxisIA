/**
 * @fileoverview Text Editorial - Sistema de bloques editoriales
 *
 * Agrupa frases de Whisper en bloques editoriales con jerarquía visual.
 * Las frases relacionadas se combinan en bloques de 1-2 líneas,
 * y cada bloque recibe un peso tipográfico (headline/support/punch).
 *
 * NO modifica timing de audio — solo cambia la presentación visual.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 33
 */

import type { PhraseTimestamp } from './phrase-timing';

// =============================================================================
// TIPOS
// =============================================================================

/** Peso tipográfico del bloque editorial */
export type EditorialWeight = 'headline' | 'support' | 'punch';

/**
 * Bloque editorial: agrupación visual de 1-2 frases con jerarquía
 *
 * Hereda timing de las frases originales de Whisper.
 * startSeconds/endSeconds provienen del primer/último phrase del bloque.
 */
export interface EditorialTextBlock {
  /** Líneas de texto (1-2 máximo) */
  lines: string[];
  /** Peso tipográfico: headline (apertura), support (normal), punch (impacto) */
  weight: EditorialWeight;
  /** Índices de las frases originales que componen este bloque */
  phraseIndices: number[];
  /** Segundo de inicio (del primer phrase) */
  startSeconds: number;
  /** Segundo de fin (del último phrase) */
  endSeconds: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/** Gap máximo (en segundos) entre frases para agruparlas */
const MAX_GROUP_GAP_SECONDS = 0.6;

/** Máximo de palabras por frase para permitir agrupación */
const MAX_WORDS_FOR_GROUPING = 7;

/** Máximo de caracteres combinados para un bloque de 2 líneas */
const MAX_COMBINED_CHARS = 90;

/** Máximo de palabras para clasificar como "punch" */
const MAX_WORDS_FOR_PUNCH = 4;

/** Duración mínima de un bloque en frames */
export const MIN_BLOCK_DURATION_FRAMES = 18;

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

/**
 * Construye bloques editoriales a partir de frases de Whisper
 *
 * Agrupa frases cortas y cercanas en bloques de 2 líneas,
 * y asigna peso tipográfico según heurísticas editoriales.
 *
 * @param phrases - Timestamps de frases de Whisper
 * @param fps - Frames por segundo del video
 * @returns Array de bloques editoriales con timing heredado
 *
 * @example
 * ```typescript
 * const blocks = buildEditorialBlocks(phraseTimestamps, 30);
 * // blocks[0] = { lines: ['Opus 4.6 llegó', 'pero nadie lo notó'], weight: 'headline', ... }
 * ```
 */
export function buildEditorialBlocks(
  phrases: PhraseTimestamp[],
  fps: number
): EditorialTextBlock[] {
  if (!phrases || phrases.length === 0) return [];

  // Paso 1: Agrupar frases cercanas y cortas
  const rawBlocks = groupPhrases(phrases);

  // Paso 2: Asignar peso editorial a cada bloque
  const blocks = rawBlocks.map((block, index) =>
    assignWeight(block, index, rawBlocks.length, phrases.length)
  );

  // Paso 3: Validar duración mínima (fusionar bloques muy cortos con el anterior)
  return enforceMinDuration(blocks, fps);
}

// =============================================================================
// AGRUPACIÓN
// =============================================================================

/**
 * Agrupa frases consecutivas si son cortas y están cercanas en el tiempo.
 *
 * Reglas:
 * - Gap entre frases ≤ 0.6s
 * - Ambas frases < 7 palabras
 * - Combinadas ≤ 90 caracteres
 * - Máximo 2 líneas por bloque
 */
function groupPhrases(phrases: PhraseTimestamp[]): EditorialTextBlock[] {
  const blocks: EditorialTextBlock[] = [];
  let i = 0;

  while (i < phrases.length) {
    const current = phrases[i];
    const next = i + 1 < phrases.length ? phrases[i + 1] : null;

    // Intentar agrupar con la siguiente frase
    if (next && canGroup(current, next)) {
      blocks.push({
        lines: [current.text.trim(), next.text.trim()],
        weight: 'support', // Se asigna después
        phraseIndices: [i, i + 1],
        startSeconds: current.startSeconds,
        endSeconds: next.endSeconds,
      });
      i += 2; // Saltar ambas frases
    } else {
      // Bloque de 1 línea
      blocks.push({
        lines: [current.text.trim()],
        weight: 'support',
        phraseIndices: [i],
        startSeconds: current.startSeconds,
        endSeconds: current.endSeconds,
      });
      i += 1;
    }
  }

  return blocks;
}

/**
 * Determina si dos frases consecutivas pueden agruparse en un bloque
 */
function canGroup(current: PhraseTimestamp, next: PhraseTimestamp): boolean {
  // Gap temporal entre fin de current e inicio de next
  const gap = next.startSeconds - current.endSeconds;
  if (gap > MAX_GROUP_GAP_SECONDS) return false;

  // Ambas deben ser cortas
  const currentWords = countWords(current.text);
  const nextWords = countWords(next.text);
  if (currentWords >= MAX_WORDS_FOR_GROUPING || nextWords >= MAX_WORDS_FOR_GROUPING) {
    return false;
  }

  // Combinadas no deben exceder el límite
  const combinedChars = current.text.trim().length + next.text.trim().length;
  if (combinedChars > MAX_COMBINED_CHARS) return false;

  return true;
}

// =============================================================================
// CLASIFICACIÓN DE PESO
// =============================================================================

/**
 * Asigna peso editorial a un bloque según heurísticas
 *
 * - headline: primeras frases del video, o frases con nombres propios/versiones
 * - punch: frases muy cortas (≤4 palabras), finales, o con ? !
 * - support: todo lo demás
 */
function assignWeight(
  block: EditorialTextBlock,
  blockIndex: number,
  totalBlocks: number,
  totalPhrases: number
): EditorialTextBlock {
  const firstLine = block.lines[0];
  const allText = block.lines.join(' ');
  const wordCount = countWords(allText);

  // Punch: frases cortas de impacto, preguntas, exclamaciones, o última frase
  if (isPunch(block, blockIndex, totalBlocks, wordCount)) {
    return { ...block, weight: 'punch' };
  }

  // Headline: primeras frases o frases con nombres propios/versiones
  if (isHeadline(block, blockIndex, firstLine)) {
    return { ...block, weight: 'headline' };
  }

  // Support: todo lo demás
  return { ...block, weight: 'support' };
}

/**
 * Determina si un bloque es "punch" (impacto visual)
 */
function isPunch(
  block: EditorialTextBlock,
  blockIndex: number,
  totalBlocks: number,
  wordCount: number
): boolean {
  const allText = block.lines.join(' ');

  // Frase muy corta (≤4 palabras) → impacto
  if (wordCount <= MAX_WORDS_FOR_PUNCH && block.lines.length === 1) return true;

  // Última frase/bloque → remate
  if (blockIndex === totalBlocks - 1) return true;

  // Termina en ? o ! → pregunta retórica o exclamación
  if (allText.trimEnd().endsWith('?') || allText.trimEnd().endsWith('!')) return true;

  return false;
}

/**
 * Determina si un bloque es "headline" (apertura con peso)
 */
function isHeadline(
  block: EditorialTextBlock,
  blockIndex: number,
  firstLine: string
): boolean {
  // Primeras 2 posiciones → headline (apertura del video)
  if (blockIndex <= 1) return true;

  // Contiene dígitos (versiones: GPT-4, Opus 4.6, etc.)
  if (/\d/.test(firstLine)) return true;

  // Contiene nombre propio mid-frase (mayúscula después de espacio, no inicio de oración)
  if (hasProperNounMidSentence(firstLine)) return true;

  return false;
}

/**
 * Detecta nombres propios dentro de una frase (no al inicio)
 *
 * Busca palabras con mayúscula que no sean la primera palabra
 * y no estén después de un punto.
 */
function hasProperNounMidSentence(text: string): boolean {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return false;

  // Revisar desde la segunda palabra
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    // Ignorar si la palabra anterior termina en punto (inicio de oración)
    if (words[i - 1].endsWith('.') || words[i - 1].endsWith('?') || words[i - 1].endsWith('!')) {
      continue;
    }
    // Palabra empieza con mayúscula → probable nombre propio
    if (word.length > 1 && /^[A-ZÁÉÍÓÚÑ]/.test(word)) {
      return true;
    }
  }
  return false;
}

// =============================================================================
// VALIDACIÓN DE DURACIÓN MÍNIMA
// =============================================================================

/**
 * Asegura que ningún bloque dure menos de MIN_BLOCK_DURATION_FRAMES.
 * Si un bloque es muy corto, se fusiona con el anterior.
 */
function enforceMinDuration(
  blocks: EditorialTextBlock[],
  fps: number
): EditorialTextBlock[] {
  if (blocks.length <= 1) return blocks;

  const result: EditorialTextBlock[] = [blocks[0]];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const durationFrames = Math.round((block.endSeconds - block.startSeconds) * fps);

    // Si el bloque es muy corto Y el anterior tiene solo 1 línea, fusionar
    if (durationFrames < MIN_BLOCK_DURATION_FRAMES) {
      const prev = result[result.length - 1];
      if (prev.lines.length < 2) {
        // Fusionar: agregar línea al bloque anterior
        prev.lines.push(block.lines[0]);
        prev.phraseIndices.push(...block.phraseIndices);
        prev.endSeconds = block.endSeconds;
        continue;
      }
    }

    result.push(block);
  }

  return result;
}

// =============================================================================
// UTILIDADES
// =============================================================================

/** Cuenta palabras en un texto */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}
