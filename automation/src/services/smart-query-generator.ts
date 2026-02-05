/**
 * @fileoverview Smart Query Generator - Prompt 23
 *
 * Genera queries de búsqueda optimizadas en inglés para APIs de imágenes.
 *
 * Problema que resuelve: El scene-segmenter extrae keywords del script
 * en español, pero Pexels/Unsplash funcionan mejor con queries en inglés.
 * Este servicio traduce las keywords antes de enviarlas a los proveedores.
 *
 * @example
 * ```typescript
 * const generator = new SmartQueryGenerator();
 * const keywords = ['inteligencia', 'artificial', 'google', 'modelo'];
 * const translated = generator.translateKeywords(keywords);
 * // → ['intelligence', 'artificial', 'google', 'model']
 *
 * const queries = generator.generateQueries(keywords, text, 'Google');
 * // → { primary: 'intelligence artificial google', alternatives: [...], language: 'en' }
 * ```
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 23
 */

import { logger } from '../../utils/logger';
import { SPANISH_TO_ENGLISH, QUERY_CONFIG } from '../config/smart-image.config';
import type { SmartQueryResult } from '../types/image.types';

// =============================================================================
// SERVICIO PRINCIPAL
// =============================================================================

/**
 * Servicio para generar queries de búsqueda optimizadas en inglés.
 *
 * Traduce keywords del español al inglés usando un diccionario de ~100+
 * términos tech, y genera queries alternativas para retry cuando la
 * búsqueda principal no retorna resultados relevantes.
 */
export class SmartQueryGenerator {
  /**
   * Traduce un array de keywords del español al inglés.
   *
   * Proceso:
   * 1. Normaliza cada keyword (minúsculas, sin acentos)
   * 2. Busca en el diccionario SPANISH_TO_ENGLISH
   * 3. Si no encuentra, deja la keyword original (puede ser nombre propio o ya inglés)
   * 4. Elimina duplicados post-traducción
   *
   * @param keywords - Keywords a traducir (pueden estar en español o inglés)
   * @returns Keywords traducidas al inglés, sin duplicados
   *
   * @example
   * translateKeywords(['inteligencia', 'artificial', 'google'])
   * // → ['intelligence', 'artificial', 'google']
   */
  translateKeywords(keywords: string[]): string[] {
    if (keywords.length === 0) return [];

    const translated: string[] = [];
    const seen = new Set<string>();

    for (const keyword of keywords) {
      // Normalizar: minúsculas y sin acentos
      const normalized = this.normalize(keyword);

      // Buscar traducción en el diccionario
      const translation = SPANISH_TO_ENGLISH[normalized] || keyword.toLowerCase();

      // Evitar duplicados (ej: 'artificial' en español y inglés es igual)
      const translationLower = translation.toLowerCase();
      if (!seen.has(translationLower)) {
        seen.add(translationLower);
        translated.push(translation);
      }
    }

    logger.info(`[SmartQuery] Traducción: [${keywords.join(', ')}] → [${translated.join(', ')}]`);

    return translated;
  }

  /**
   * Genera queries de búsqueda optimizadas para un segmento.
   *
   * Retorna una query principal y hasta 2 alternativas para retry.
   * Todas las queries se generan en inglés.
   *
   * @param keywords - Keywords extraídas del segmento (español)
   * @param text - Texto completo del segmento (para contexto)
   * @param company - Nombre de la empresa (opcional)
   * @returns Resultado con query principal, alternativas, y metadata
   */
  generateQueries(
    keywords: string[],
    text: string,
    company?: string
  ): SmartQueryResult {
    // Traducir keywords
    const translatedKeywords = this.translateKeywords(keywords);

    // Query principal: primeras N keywords traducidas
    const maxKw = QUERY_CONFIG.maxKeywordsPerQuery;
    const primaryKeywords = translatedKeywords.slice(0, maxKw);
    const primary = primaryKeywords.join(' ');

    // Generar alternativas
    const alternatives = this.generateAlternatives(
      translatedKeywords,
      company,
      primary
    );

    const result: SmartQueryResult = {
      primary,
      alternatives,
      language: 'en',
      originalKeywords: keywords,
      translatedKeywords,
    };

    logger.info(`[SmartQuery] Primary: "${primary}", Alternativas: [${alternatives.join(', ')}]`);

    return result;
  }

  /**
   * Genera queries alternativas diferentes a la principal.
   *
   * Estrategia:
   * - Alt 1: empresa + primera keyword (si hay empresa)
   * - Alt 2: fallback temático aleatorio
   *
   * @param translatedKeywords - Keywords ya traducidas al inglés
   * @param company - Nombre de empresa (opcional)
   * @param primaryQuery - Query principal (para evitar duplicados)
   * @returns Array de queries alternativas (máximo 2)
   */
  private generateAlternatives(
    translatedKeywords: string[],
    company: string | undefined,
    primaryQuery: string
  ): string[] {
    const alternatives: string[] = [];
    const maxAlts = QUERY_CONFIG.maxAlternatives;

    // Alt 1: empresa + primera keyword traducida
    if (company && translatedKeywords.length > 0) {
      const alt1 = `${company.toLowerCase()} ${translatedKeywords[0]}`;
      if (alt1 !== primaryQuery) {
        alternatives.push(alt1);
      }
    }

    // Alt 2: si tenemos suficientes keywords, combinar de forma diferente
    if (alternatives.length < maxAlts && translatedKeywords.length >= 2) {
      // Usar la segunda y tercera keyword (diferente a la primary que usa la primera)
      const alt2Keywords = translatedKeywords.slice(1, 3);
      const alt2 = alt2Keywords.join(' ');
      if (alt2 !== primaryQuery && !alternatives.includes(alt2)) {
        alternatives.push(alt2);
      }
    }

    // Si aún faltan alternativas, usar fallback temático
    if (alternatives.length < maxAlts) {
      const fallback = this.getRandomFallbackTopic();
      if (!alternatives.includes(fallback)) {
        alternatives.push(fallback);
      }
    }

    return alternatives.slice(0, maxAlts);
  }

  /**
   * Selecciona un topic fallback aleatorio de la lista configurada.
   * Útil cuando no hay suficientes keywords para generar alternativas.
   *
   * @returns Topic en inglés para búsqueda de imágenes
   */
  private getRandomFallbackTopic(): string {
    const topics = QUERY_CONFIG.fallbackTopics;
    const index = Math.floor(Math.random() * topics.length);
    return topics[index];
  }

  /**
   * Normaliza una keyword: minúsculas y sin acentos/diacríticos.
   *
   * @param text - Texto a normalizar
   * @returns Texto normalizado
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default SmartQueryGenerator;
