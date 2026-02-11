/**
 * @fileoverview Text Splitter - Prompt 19.2
 *
 * Divide texto largo en frases cortas para mostrar secuencialmente
 * en videos de YouTube Shorts. Respeta puntuación natural y no corta palabras.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.2
 */

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Opciones para dividir texto
 */
export interface SplitOptions {
  /** Máximo de caracteres por frase (default: 100) */
  maxCharsPerPhrase?: number;
  /** Mínimo de palabras por frase para tener sentido (default: 3) */
  minWordsPerPhrase?: number;
}

/**
 * Frase dividida con metadata
 */
export interface Phrase {
  /** Texto de la frase */
  text: string;
  /** Índice de la frase (0-based) */
  index: number;
  /** Cantidad de caracteres */
  charCount: number;
  /** Cantidad de palabras */
  wordCount: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/**
 * Conectores en español para división secundaria
 * Se usan cuando una oración es muy larga para dividir por comas
 */
const SPANISH_CONNECTORS = [
  ' pero ',
  ' aunque ',
  ' porque ',
  ' cuando ',
  ' mientras ',
  ' donde ',
  ' como ',
  ' si ',
  ' que ',
  ' ya que ',
  ' sin embargo ',
  ' además ',
  ' por lo tanto ',
  ' en cambio ',
];

/**
 * Puntuación que marca fin de oración
 */
const SENTENCE_ENDINGS = /[.!?]+/;

/**
 * Valores por defecto
 * Actualizado en Prompt 19.2.7: Reducido de 100 a 60
 * Actualizado en Prompt 44: Reducido de 60 a 48 para ritmo editorial
 */
const DEFAULT_MAX_CHARS = 48; // Prompt 44: frases más cortas para ritmo editorial
const DEFAULT_MIN_WORDS = 3;

// =============================================================================
// FUNCIONES PRINCIPALES
// =============================================================================

/**
 * Divide texto en frases legibles para display secuencial
 *
 * Prioridad de división:
 * 1. Por puntos (.), signos de exclamación (!), interrogación (?)
 * 2. Por comas (,) si la frase excede maxChars
 * 3. Por conectores (pero, aunque, porque, etc.) si aún es larga
 * 4. Combina frases muy cortas para evitar fragmentación
 *
 * @param text - Texto completo a dividir
 * @param options - Opciones de división
 * @returns Array de frases con metadata
 *
 * @example
 * ```typescript
 * const phrases = splitIntoReadablePhrases(
 *   "Google presenta Genie 2. Esta IA revoluciona gaming.",
 *   { maxCharsPerPhrase: 100 }
 * );
 * // Result: [
 * //   { text: "Google presenta Genie 2.", index: 0, ... },
 * //   { text: "Esta IA revoluciona gaming.", index: 1, ... }
 * // ]
 * ```
 */
export function splitIntoReadablePhrases(
  text: string,
  options: SplitOptions = {}
): Phrase[] {
  const {
    maxCharsPerPhrase = DEFAULT_MAX_CHARS,
    minWordsPerPhrase = DEFAULT_MIN_WORDS,
  } = options;

  // Validar entrada
  if (!text || text.trim() === '') {
    return [];
  }

  // Normalizar texto (remover espacios múltiples)
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  // Paso 1: Dividir por oraciones
  let sentences = splitBySentences(normalizedText);

  // Paso 2: Dividir oraciones largas
  const splitSentences: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length <= maxCharsPerPhrase) {
      splitSentences.push(sentence);
    } else {
      // Dividir oraciones largas por comas o conectores
      const subPhrases = splitLongSentence(sentence, maxCharsPerPhrase);
      splitSentences.push(...subPhrases);
    }
  }

  // Paso 3: Combinar frases muy cortas
  const combinedPhrases = combineSHortPhrases(
    splitSentences,
    minWordsPerPhrase,
    maxCharsPerPhrase
  );

  // Paso 4: Crear objetos Phrase con metadata
  return combinedPhrases.map((text, index) => ({
    text: text.trim(),
    index,
    charCount: text.trim().length,
    wordCount: countWords(text),
  }));
}

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Divide texto por signos de puntuación de fin de oración
 */
function splitBySentences(text: string): string[] {
  // Dividir por puntuación pero mantener el signo
  const parts = text.split(SENTENCE_ENDINGS);
  const punctuation = text.match(SENTENCE_ENDINGS) || [];

  const sentences: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part === '') continue;

    // Agregar puntuación de vuelta
    const punct = punctuation[i] || '';
    sentences.push(part + punct);
  }

  return sentences;
}

/**
 * Divide una oración larga por comas o conectores
 */
function splitLongSentence(sentence: string, maxChars: number): string[] {
  // Primero intentar por comas
  const commaResult = splitByCommas(sentence, maxChars);
  if (commaResult.every(s => s.length <= maxChars)) {
    return commaResult;
  }

  // Si aún hay frases largas, intentar por conectores
  const result: string[] = [];
  for (const part of commaResult) {
    if (part.length <= maxChars) {
      result.push(part);
    } else {
      const connectorResult = splitByConnectors(part, maxChars);
      result.push(...connectorResult);
    }
  }

  return result;
}

/**
 * Divide por comas manteniendo sentido
 */
function splitByCommas(sentence: string, maxChars: number): string[] {
  const parts = sentence.split(',');

  if (parts.length === 1) {
    return [sentence];
  }

  const result: string[] = [];
  let currentPart = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    const separator = i < parts.length - 1 ? ',' : '';

    const potentialPart = currentPart
      ? currentPart + ', ' + part
      : part;

    if (potentialPart.length <= maxChars) {
      currentPart = potentialPart;
    } else {
      if (currentPart) {
        result.push(currentPart + ',');
      }
      currentPart = part;
    }
  }

  if (currentPart) {
    result.push(currentPart);
  }

  return result;
}

/**
 * Divide por conectores en español
 */
function splitByConnectors(sentence: string, maxChars: number): string[] {
  let result = [sentence];

  for (const connector of SPANISH_CONNECTORS) {
    const newResult: string[] = [];

    for (const part of result) {
      if (part.length <= maxChars) {
        newResult.push(part);
        continue;
      }

      const lowerPart = part.toLowerCase();
      const connectorIndex = lowerPart.indexOf(connector.toLowerCase());

      if (connectorIndex > 0) {
        const before = part.substring(0, connectorIndex).trim();
        const after = part.substring(connectorIndex).trim();

        if (before.length >= 10 && after.length >= 10) {
          newResult.push(before);
          // Capitalizar primera letra del conector
          newResult.push(capitalizeFirst(after));
        } else {
          newResult.push(part);
        }
      } else {
        newResult.push(part);
      }
    }

    result = newResult;
  }

  return result;
}

/**
 * Combina frases muy cortas para evitar fragmentación excesiva
 */
function combineSHortPhrases(
  phrases: string[],
  minWords: number,
  maxChars: number
): string[] {
  const result: string[] = [];
  let pendingPhrase = '';

  for (const phrase of phrases) {
    const trimmedPhrase = phrase.trim();
    if (!trimmedPhrase) continue;

    const wordCount = countWords(trimmedPhrase);

    if (wordCount < minWords && pendingPhrase === '') {
      // Frase muy corta, guardar para combinar
      pendingPhrase = trimmedPhrase;
    } else if (pendingPhrase !== '') {
      // Hay frase pendiente, intentar combinar
      const combined = pendingPhrase + ' ' + trimmedPhrase;

      if (combined.length <= maxChars) {
        result.push(combined);
        pendingPhrase = '';
      } else {
        // No cabe, guardar pendiente y empezar nueva
        result.push(pendingPhrase);
        if (wordCount < minWords) {
          pendingPhrase = trimmedPhrase;
        } else {
          result.push(trimmedPhrase);
          pendingPhrase = '';
        }
      }
    } else {
      result.push(trimmedPhrase);
    }
  }

  // No olvidar la última frase pendiente
  if (pendingPhrase) {
    if (result.length > 0) {
      // Intentar combinar con la última
      const lastIndex = result.length - 1;
      const combined = result[lastIndex] + ' ' + pendingPhrase;
      if (combined.length <= maxChars) {
        result[lastIndex] = combined;
      } else {
        result.push(pendingPhrase);
      }
    } else {
      result.push(pendingPhrase);
    }
  }

  return result;
}

/**
 * Cuenta palabras en un texto
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Capitaliza primera letra
 */
function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// =============================================================================
// EXPORTS
// =============================================================================

export default splitIntoReadablePhrases;
