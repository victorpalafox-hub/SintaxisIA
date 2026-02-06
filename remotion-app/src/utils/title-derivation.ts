/**
 * @fileoverview Title Derivation - Lógica determinística para Title Card
 *
 * Funciones puras para derivar texto corto y badge contextual
 * a partir de los datos existentes del pipeline (news.title, newsType).
 *
 * No usa IA ni servicios externos. Todo es heurístico y testeable.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 32
 */

import type { NewsType } from '../types/video.types';

// =============================================================================
// TITLE DERIVATION
// =============================================================================

/**
 * Deriva título corto para title card (max 7 palabras)
 *
 * Trunca a límite de palabras completas, agrega "..." si trunca.
 * Respeta acentos y caracteres especiales del español.
 *
 * @param fullTitle - Título completo de la noticia
 * @returns Título truncado a 7 palabras o menos
 *
 * @example
 * deriveTitleCardText('Google lanza Genie 2: IA que crea mundos 3D')
 * // → 'Google lanza Genie 2: IA que...'
 *
 * deriveTitleCardText('Opus 4.6 ya está aquí')
 * // → 'Opus 4.6 ya está aquí' (sin truncar, ≤7 palabras)
 */
export function deriveTitleCardText(fullTitle: string): string {
  const MAX_WORDS = 7;
  const trimmed = fullTitle.trim();
  if (!trimmed) return '';

  const words = trimmed.split(/\s+/);
  if (words.length <= MAX_WORDS) return trimmed;

  return words.slice(0, MAX_WORDS).join(' ') + '...';
}

// =============================================================================
// BADGE DERIVATION
// =============================================================================

/** Mapeo de NewsType a badge en español (1 palabra) */
const BADGE_MAP: Record<string, string> = {
  'product-launch': 'NUEVO',
  'model-release': 'MODELO',
  'funding': 'INVERSIÓN',
  'controversy': 'URGENTE',
  'research-paper': 'ESTUDIO',
  'breakthrough': 'AVANCE',
  'partnership': 'ALIANZA',
};

/** Badge por defecto cuando no hay newsType */
const DEFAULT_BADGE = 'NOTICIA';

/**
 * Deriva badge de 1 palabra basado en el tipo de noticia
 *
 * @param newsType - Tipo de noticia del pipeline
 * @returns Badge en español, mayúsculas, 1 palabra
 *
 * @example
 * deriveBadge('product-launch') // → 'NUEVO'
 * deriveBadge('model-release')  // → 'MODELO'
 * deriveBadge(undefined)        // → 'NOTICIA'
 */
export function deriveBadge(newsType?: NewsType): string {
  return BADGE_MAP[newsType || ''] ?? DEFAULT_BADGE;
}
