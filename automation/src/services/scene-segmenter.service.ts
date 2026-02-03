/**
 * @fileoverview Scene Segmenter Service - Prompt 19.1
 *
 * Divide un script de video en segmentos de ~15 segundos
 * y extrae keywords relevantes para búsqueda de imágenes.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.1
 */

import { logger } from '../../utils/logger';
import type { GeneratedScript } from '../types/script.types';
import type { SceneSegment } from '../types/image.types';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/**
 * Duración objetivo por segmento en segundos
 */
const SEGMENT_DURATION = 15;

/**
 * Stopwords en español a filtrar
 */
const SPANISH_STOPWORDS = new Set([
  // Artículos
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  // Preposiciones
  'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'en', 'entre',
  'hacia', 'hasta', 'para', 'por', 'segun', 'sin', 'sobre', 'tras',
  // Conjunciones
  'y', 'e', 'ni', 'o', 'u', 'pero', 'sino', 'aunque', 'porque', 'que',
  'si', 'como', 'cuando', 'donde', 'mientras', 'aunque',
  // Pronombres
  'yo', 'tu', 'el', 'ella', 'nosotros', 'ustedes', 'ellos', 'ellas',
  'me', 'te', 'se', 'nos', 'les', 'lo', 'la', 'los', 'las',
  'mi', 'tu', 'su', 'nuestro', 'este', 'esta', 'estos', 'estas',
  'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella',
  // Verbos auxiliares
  'es', 'son', 'esta', 'estan', 'ser', 'estar', 'ha', 'han', 'hay',
  'fue', 'fueron', 'era', 'eran', 'sido', 'siendo',
  // Adverbios comunes
  'no', 'si', 'muy', 'mas', 'menos', 'ya', 'aun', 'tambien', 'solo',
  'bien', 'mal', 'aqui', 'ahi', 'alli', 'hoy', 'ayer', 'manana',
  // Palabras genéricas
  'esto', 'eso', 'algo', 'nada', 'todo', 'cada', 'otro', 'otra',
  'mismo', 'misma', 'cual', 'quien', 'cuyo', 'donde', 'como',
]);

/**
 * Keywords técnicas de alto valor para búsqueda de imágenes
 */
const TECH_KEYWORDS = new Set([
  // AI/ML
  'ai', 'ia', 'inteligencia', 'artificial', 'machine', 'learning',
  'deep', 'neural', 'network', 'modelo', 'algoritmo', 'datos',
  'entrenamiento', 'inferencia', 'transformer', 'llm', 'gpt',
  // Gaming
  'gaming', 'videojuegos', 'juegos', 'virtual', '3d', 'mundo',
  'interactivo', 'simulacion', 'render', 'graficos',
  // Tech general
  'tecnologia', 'tech', 'digital', 'software', 'hardware',
  'cloud', 'nube', 'api', 'plataforma', 'sistema',
  // Empresas (se priorizan)
  'google', 'deepmind', 'openai', 'anthropic', 'microsoft',
  'meta', 'apple', 'nvidia', 'amazon', 'tesla',
]);

// =============================================================================
// SERVICIO PRINCIPAL
// =============================================================================

/**
 * Servicio para segmentar scripts y extraer keywords
 *
 * @example
 * ```typescript
 * const segmenter = new SceneSegmenterService();
 * const segments = segmenter.segmentScript(script, 55);
 * // segments = [{ index: 0, startSecond: 0, endSecond: 15, ... }, ...]
 * ```
 */
export class SceneSegmenterService {
  /**
   * Divide un script en segmentos de ~15 segundos
   * Extrae keywords relevantes de cada segmento
   *
   * @param script - Script generado por Gemini
   * @param totalDuration - Duración total del audio en segundos
   * @param company - Nombre de la empresa (opcional, para contexto)
   * @returns Array de segmentos con keywords
   */
  segmentScript(
    script: GeneratedScript,
    totalDuration: number,
    company?: string
  ): SceneSegment[] {
    logger.info(`[SceneSegmenter] Segmentando script de ${totalDuration}s`);

    // Calcular número de segmentos
    const numSegments = Math.max(4, Math.ceil(totalDuration / SEGMENT_DURATION));
    const actualSegmentDuration = totalDuration / numSegments;

    logger.info(`[SceneSegmenter] Creando ${numSegments} segmentos de ~${actualSegmentDuration.toFixed(1)}s`);

    // Mapear secciones del script a segmentos
    const sections = this.mapScriptToSections(script, totalDuration);
    const segments: SceneSegment[] = [];

    for (let i = 0; i < numSegments; i++) {
      const startSecond = Math.round(i * actualSegmentDuration);
      const endSecond = Math.round((i + 1) * actualSegmentDuration);

      // Encontrar qué sección(es) del script corresponden a este segmento
      const text = this.getTextForTimeRange(sections, startSecond, endSecond);

      // Extraer keywords del texto
      const keywords = this.extractKeywords(text, company);

      // Generar query de búsqueda
      const searchQuery = this.generateSearchQuery(keywords, i, company);

      segments.push({
        index: i,
        startSecond,
        endSecond,
        text,
        keywords,
        searchQuery,
      });

      logger.info(`[SceneSegmenter] Segmento ${i}: ${startSecond}-${endSecond}s, query: "${searchQuery}"`);
    }

    return segments;
  }

  /**
   * Mapea las secciones del script a rangos de tiempo
   */
  private mapScriptToSections(
    script: GeneratedScript,
    totalDuration: number
  ): Array<{ start: number; end: number; text: string; section: string }> {
    // Distribución típica del script:
    // hook: 0-8s (~15% del tiempo)
    // body: 8-30s (~40% del tiempo)
    // opinion: 30-45s (~30% del tiempo)
    // cta: 45-55s (~15% del tiempo)

    const hookEnd = Math.round(totalDuration * 0.15);
    const bodyEnd = Math.round(totalDuration * 0.55);
    const opinionEnd = Math.round(totalDuration * 0.85);

    return [
      { start: 0, end: hookEnd, text: script.hook, section: 'hook' },
      { start: hookEnd, end: bodyEnd, text: script.body, section: 'body' },
      { start: bodyEnd, end: opinionEnd, text: script.opinion, section: 'opinion' },
      { start: opinionEnd, end: totalDuration, text: script.cta, section: 'cta' },
    ];
  }

  /**
   * Obtiene el texto que corresponde a un rango de tiempo
   */
  private getTextForTimeRange(
    sections: Array<{ start: number; end: number; text: string; section: string }>,
    startSecond: number,
    endSecond: number
  ): string {
    const relevantTexts: string[] = [];

    for (const section of sections) {
      // Verificar si hay overlap entre el segmento y la sección
      const hasOverlap = startSecond < section.end && endSecond > section.start;

      if (hasOverlap) {
        relevantTexts.push(section.text);
      }
    }

    return relevantTexts.join(' ');
  }

  /**
   * Extrae keywords relevantes de un texto
   * Filtra stopwords y prioriza términos técnicos
   *
   * @param text - Texto a analizar
   * @param company - Nombre de empresa para priorizar
   * @returns Array de keywords ordenadas por relevancia
   */
  private extractKeywords(text: string, company?: string): string[] {
    // Normalizar texto
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^\w\s]/g, ' ') // Remover puntuación
      .replace(/\s+/g, ' ')
      .trim();

    // Tokenizar
    const words = normalized.split(' ').filter(w => w.length > 2);

    // Filtrar stopwords y contar frecuencia
    const wordCounts = new Map<string, number>();
    const techMatches: string[] = [];

    for (const word of words) {
      if (SPANISH_STOPWORDS.has(word)) continue;

      // Priorizar keywords técnicas
      if (TECH_KEYWORDS.has(word)) {
        if (!techMatches.includes(word)) {
          techMatches.push(word);
        }
      }

      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }

    // Ordenar por frecuencia
    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word)
      .filter(w => !techMatches.includes(w))
      .slice(0, 5);

    // Combinar: primero tech keywords, luego frecuentes
    const keywords = [...techMatches, ...sortedWords].slice(0, 5);

    // Agregar empresa si está presente
    if (company && !keywords.includes(company.toLowerCase())) {
      keywords.unshift(company.toLowerCase());
      keywords.pop(); // Mantener máximo 5
    }

    return keywords;
  }

  /**
   * Genera query de búsqueda optimizada para imágenes
   *
   * @param keywords - Keywords extraídas
   * @param segmentIndex - Índice del segmento (para variar queries)
   * @param company - Nombre de empresa
   * @returns Query optimizada
   */
  private generateSearchQuery(
    keywords: string[],
    segmentIndex: number,
    company?: string
  ): string {
    // Sufijos para variar las búsquedas por segmento
    const suffixes = [
      'technology innovation',
      'digital concept',
      'future tech',
      'abstract technology',
    ];

    // Base: keywords principales
    const baseQuery = keywords.slice(0, 3).join(' ');

    // Agregar sufijo según segmento
    const suffix = suffixes[segmentIndex % suffixes.length];

    // Construir query final
    let query = `${baseQuery} ${suffix}`;

    // Si es el primer segmento y hay empresa, incluir "logo"
    if (segmentIndex === 0 && company) {
      query = `${company} logo ${suffix}`;
    }

    return query.trim();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default SceneSegmenterService;
