/**
 * @fileoverview Scene Segmenter Service - Prompt 19.1
 *
 * Divide un script de video en segmentos de ~15 segundos
 * y extrae keywords relevantes para búsqueda de imágenes.
 *
 * @author Sintaxis IA
 * @version 1.2.0
 * @since Prompt 19.1
 * @updated Prompt 19.1.6 - Eliminados sufijos genéricos, señal __LOGO__ para logos
 * @updated Prompt 23 - Traducción de keywords ES→EN via SmartQueryGenerator
 * @updated Prompt 28 - newsTitle param, empresa+título en TODAS las queries
 * @updated Prompt 29 - Segmentación topic-aware con marcadores de transición
 */

import { logger } from '../../utils/logger';
import type { GeneratedScript } from '../types/script.types';
import type { SceneSegment } from '../types/image.types';
import { SmartQueryGenerator } from './smart-query-generator';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/**
 * Duración objetivo por segmento en segundos
 */
const SEGMENT_DURATION = 15;

/**
 * Máximo de segmentos de imagen por video (Prompt 25)
 * Limita cambios de imagen para coherencia visual.
 * Los cambios ocurren preferentemente en transiciones de sección.
 */
const MAX_IMAGE_SEGMENTS = 3;

// =============================================================================
// TOPIC-AWARE SEGMENTATION (Prompt 29)
// =============================================================================

/**
 * Marcadores de transición en español que señalan cambio de tópico.
 * Cada marcador tiene un peso (weight) que indica su fuerza como punto de corte.
 *
 * @since Prompt 29
 */
const TRANSITION_MARKERS: Array<{ pattern: RegExp; weight: number }> = [
  // Fuertes (1.0) - cambio explícito de tópico
  { pattern: /\bpor otro lado\b/i, weight: 1.0 },
  { pattern: /\bpor otra parte\b/i, weight: 1.0 },
  { pattern: /\ben cambio\b/i, weight: 1.0 },
  { pattern: /\bsin embargo\b/i, weight: 1.0 },
  { pattern: /\bahora bien\b/i, weight: 1.0 },
  { pattern: /\bno obstante\b/i, weight: 1.0 },
  // Medios (0.7) - progresión de tópico
  { pattern: /\bahora\b/i, weight: 0.7 },
  { pattern: /\bademás\b/i, weight: 0.7 },
  { pattern: /\blo interesante\b/i, weight: 0.7 },
  { pattern: /\blo fascinante\b/i, weight: 0.7 },
  { pattern: /\bmientras tanto\b/i, weight: 0.7 },
  // Conclusión/opinión (0.8) - cambio de sección
  { pattern: /\ben resumen\b/i, weight: 0.8 },
  { pattern: /\bfinalmente\b/i, weight: 0.8 },
  { pattern: /\ben conclusión\b/i, weight: 0.8 },
  { pattern: /\bpersonalmente\b/i, weight: 0.8 },
  { pattern: /\ben mi opinión\b/i, weight: 0.8 },
  { pattern: /\bcreo que\b/i, weight: 0.6 },
  { pattern: /\bme parece\b/i, weight: 0.6 },
];

/** Fracción de totalDuration como tolerancia de proximidad a target (15%) */
const MARKER_PROXIMITY_TOLERANCE = 0.15;

/** Duración mínima de un segmento en segundos (evita cambios bruscos) */
const MIN_SEGMENT_DURATION_S = 8;

/** Score mínimo para aceptar un corte topic-aware */
const MIN_CUT_SCORE = 0.3;

/** Paso de cuantización para boundaries (segundos limpios) */
const BOUNDARY_QUANTIZE_STEP = 1.0;

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

/**
 * Patrones para extraer conceptos visuales del texto
 * Cada patrón mapea a una query específica para búsqueda de imágenes
 *
 * @since Prompt 19.5 - Visual Queries
 */
const VISUAL_PATTERNS: Array<{ pattern: RegExp; query: string }> = [
  // Mundos y entornos virtuales
  { pattern: /mundos?\s+virtuales?/i, query: 'virtual world 3d environment' },
  { pattern: /entornos?\s+3d|3d\s+interactivos?/i, query: '3d interactive environment' },
  { pattern: /realidad\s+virtual|vr\s+headset/i, query: 'virtual reality headset' },
  { pattern: /metaverso|metaverse/i, query: 'metaverse digital world' },

  // Robots y automatización
  { pattern: /robots?\s+(humanoides?|autonomos?)/i, query: 'humanoid robot technology' },
  { pattern: /automatizacion\s+industrial/i, query: 'industrial automation robot' },
  { pattern: /drones?\s+(autonomos?|inteligentes?)/i, query: 'autonomous drone technology' },

  // IA y machine learning (visuales)
  { pattern: /redes?\s+neuronales?/i, query: 'neural network visualization' },
  { pattern: /cerebro\s+(artificial|digital)/i, query: 'artificial brain technology' },
  { pattern: /deep\s+learning|aprendizaje\s+profundo/i, query: 'deep learning neural network' },

  // Hologramas y visualización
  { pattern: /holograma|holografico/i, query: 'hologram technology display' },
  { pattern: /interfaz\s+(futurista|holografica)/i, query: 'futuristic holographic interface' },

  // Chips y hardware
  { pattern: /chips?\s+(neuronales?|cuanticos?)/i, query: 'neural chip processor' },
  { pattern: /procesador|cpu\s+avanzado/i, query: 'advanced processor technology' },
  { pattern: /gpu|tarjeta\s+grafica/i, query: 'gpu graphics card technology' },

  // Datos y visualización
  { pattern: /big\s+data|datos\s+masivos/i, query: 'big data visualization' },
  { pattern: /flujo\s+de\s+datos/i, query: 'data stream visualization' },
  { pattern: /nube|cloud\s+computing/i, query: 'cloud computing technology' },

  // Vehículos y transporte
  { pattern: /vehiculos?\s+autonomos?|coches?\s+autonomos?/i, query: 'autonomous vehicle self driving car' },
  { pattern: /tesla\s+(model|cybertruck)/i, query: 'tesla electric vehicle' },

  // Espacial
  { pattern: /satelites?\s+(ia|inteligentes?)/i, query: 'satellite space technology' },
  { pattern: /exploracion\s+espacial/i, query: 'space exploration technology' },

  // Medicina y salud
  { pattern: /diagnostico\s+(ia|medico)/i, query: 'medical ai diagnosis technology' },
  { pattern: /cirugia\s+robotica/i, query: 'robotic surgery medical' },

  // Seguridad y vigilancia
  { pattern: /reconocimiento\s+facial/i, query: 'facial recognition technology' },
  { pattern: /ciberseguridad|seguridad\s+digital/i, query: 'cybersecurity digital protection' },

  // Generación de contenido
  { pattern: /generacion\s+de\s+imagenes/i, query: 'ai image generation' },
  { pattern: /texto\s+a\s+(imagen|video)/i, query: 'text to image ai generation' },
  { pattern: /video\s+generado|sintesis\s+de\s+video/i, query: 'ai video synthesis generation' },
];

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
  /** Generador de queries inteligentes para traducción ES→EN (Prompt 23) */
  private queryGenerator = new SmartQueryGenerator();

  /**
   * Divide un script en segmentos de ~15 segundos
   * Extrae keywords relevantes de cada segmento
   *
   * @param script - Script generado por Gemini
   * @param totalDuration - Duración total del audio en segundos
   * @param company - Nombre de la empresa (opcional, para contexto)
   * @param newsTitle - Título de la noticia (Prompt 28: para queries más relevantes)
   * @returns Array de segmentos con keywords
   */
  segmentScript(
    script: GeneratedScript,
    totalDuration: number,
    company?: string,
    newsTitle?: string
  ): SceneSegment[] {
    logger.info(`[SceneSegmenter] Segmentando script de ${totalDuration}s`);

    // Calcular número de segmentos
    // Prompt 25: Limitar a MAX_IMAGE_SEGMENTS para coherencia visual (2-3 cambios, no 4+)
    const numSegments = Math.min(MAX_IMAGE_SEGMENTS, Math.max(2, Math.ceil(totalDuration / SEGMENT_DURATION)));

    logger.info(`[SceneSegmenter] Creando ${numSegments} segmentos (máx ${MAX_IMAGE_SEGMENTS})`);

    // Prompt 29: Calcular boundaries (topic-aware o uniforme)
    let boundaries: number[];

    if (numSegments === 3) {
      // Intentar segmentación topic-aware con marcadores de transición
      const topicCuts = this.findTopicBoundaries(script, totalDuration);
      if (topicCuts) {
        boundaries = [0, topicCuts[0], topicCuts[1]];
        logger.info(`[SceneSegmenter] Topic-aware boundaries: ${topicCuts[0]}s, ${topicCuts[1]}s`);
      } else {
        // Fallback: división uniforme
        const d = totalDuration / 3;
        boundaries = [0, Math.round(d), Math.round(2 * d)];
        logger.info(`[SceneSegmenter] Fallback: división uniforme`);
      }
    } else {
      // 2 segmentos (videos cortos): división uniforme
      const d = totalDuration / numSegments;
      boundaries = Array.from({ length: numSegments }, (_, i) => Math.round(i * d));
      logger.info(`[SceneSegmenter] División uniforme (${numSegments} segmentos)`);
    }

    // Construir segmentos desde boundaries
    const sections = this.mapScriptToSections(script, totalDuration);
    const segments: SceneSegment[] = [];

    for (let i = 0; i < boundaries.length; i++) {
      const startSecond = boundaries[i];
      const endSecond = i < boundaries.length - 1 ? boundaries[i + 1] : Math.round(totalDuration);

      // Encontrar qué sección(es) del script corresponden a este segmento
      const text = this.getTextForTimeRange(sections, startSecond, endSecond);

      // Extraer keywords del texto
      const keywords = this.extractKeywords(text, company);

      // Generar query de búsqueda (Prompt 28: incluye newsTitle para relevancia)
      const searchQuery = this.generateSearchQuery(keywords, i, company, text, newsTitle);

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

  // ===========================================================================
  // TOPIC-AWARE SEGMENTATION METHODS (Prompt 29)
  // ===========================================================================

  /**
   * Busca marcadores de transición en el texto completo del script.
   * Retorna posiciones (charIndex) y pesos de cada marcador encontrado.
   *
   * @param fullText - Texto concatenado del script (hook + body + opinion + cta)
   * @returns Marcadores encontrados, ordenados por posición en el texto
   *
   * @since Prompt 29
   */
  private findMarkerPositions(fullText: string): Array<{ charIndex: number; weight: number; phrase: string }> {
    const markers: Array<{ charIndex: number; weight: number; phrase: string }> = [];

    for (const { pattern, weight } of TRANSITION_MARKERS) {
      // Usar regex global para encontrar todas las ocurrencias
      const globalPattern = new RegExp(pattern.source, 'gi');
      let match: RegExpExecArray | null;

      while ((match = globalPattern.exec(fullText)) !== null) {
        markers.push({
          charIndex: match.index,
          weight,
          phrase: match[0],
        });
      }
    }

    // Ordenar por posición en el texto
    markers.sort((a, b) => a.charIndex - b.charIndex);

    return markers;
  }

  /**
   * Redondea un boundary a segundos limpios (múltiplo de BOUNDARY_QUANTIZE_STEP).
   * Clamp entre min y max para evitar segmentos fuera de rango.
   *
   * @param seconds - Valor a cuantizar
   * @param min - Valor mínimo permitido
   * @param max - Valor máximo permitido
   * @returns Valor cuantizado y clamped
   *
   * @since Prompt 29
   */
  private quantizeBoundary(seconds: number, min: number, max: number): number {
    const quantized = Math.round(seconds / BOUNDARY_QUANTIZE_STEP) * BOUNDARY_QUANTIZE_STEP;
    return Math.max(min, Math.min(max, quantized));
  }

  /**
   * Algoritmo principal de segmentación topic-aware.
   * Concatena el texto del script, busca marcadores de transición,
   * y selecciona los mejores puntos de corte cerca de 33% y 66%.
   *
   * @param script - Script generado (hook, body, opinion, cta)
   * @param totalDuration - Duración total en segundos
   * @returns Tupla [cut1, cut2] en segundos, o null si no hay buenos candidatos
   *
   * @since Prompt 29
   */
  private findTopicBoundaries(script: GeneratedScript, totalDuration: number): [number, number] | null {
    // Concatenar texto completo del script
    const fullText = [script.hook, script.body, script.opinion, script.cta].join(' ');

    if (fullText.length === 0) return null;

    // Buscar marcadores de transición
    const markers = this.findMarkerPositions(fullText);

    if (markers.length === 0) {
      logger.info('[SceneSegmenter] No se encontraron marcadores de transición');
      return null;
    }

    logger.info(`[SceneSegmenter] ${markers.length} marcadores encontrados: ${markers.map(m => `"${m.phrase}"@${m.charIndex}`).join(', ')}`);

    // Targets: 33% y 66% de la duración total
    const target1 = totalDuration / 3;
    const target2 = (2 * totalDuration) / 3;
    const tolerance = totalDuration * MARKER_PROXIMITY_TOLERANCE;

    // Puntuar cada marcador contra cada target
    let bestForTarget1: { seconds: number; score: number } | null = null;
    let bestForTarget2: { seconds: number; score: number } | null = null;

    for (const marker of markers) {
      // Convertir posición de carácter a tiempo (interpolación lineal)
      const timePosition = (marker.charIndex / fullText.length) * totalDuration;

      // Score para target 1
      const dist1 = Math.abs(timePosition - target1);
      if (dist1 <= tolerance) {
        const score1 = marker.weight * (1 - dist1 / tolerance);
        if (score1 >= MIN_CUT_SCORE && (!bestForTarget1 || score1 > bestForTarget1.score)) {
          bestForTarget1 = { seconds: timePosition, score: score1 };
        }
      }

      // Score para target 2
      const dist2 = Math.abs(timePosition - target2);
      if (dist2 <= tolerance) {
        const score2 = marker.weight * (1 - dist2 / tolerance);
        if (score2 >= MIN_CUT_SCORE && (!bestForTarget2 || score2 > bestForTarget2.score)) {
          bestForTarget2 = { seconds: timePosition, score: score2 };
        }
      }
    }

    // Necesitamos ambos cortes para 3 segmentos
    if (!bestForTarget1 || !bestForTarget2) {
      logger.info(`[SceneSegmenter] Cortes insuficientes: target1=${bestForTarget1 ? 'OK' : 'MISS'}, target2=${bestForTarget2 ? 'OK' : 'MISS'}`);
      return null;
    }

    // Cuantizar boundaries
    const cut1 = this.quantizeBoundary(bestForTarget1.seconds, MIN_SEGMENT_DURATION_S, totalDuration - 2 * MIN_SEGMENT_DURATION_S);
    const cut2 = this.quantizeBoundary(bestForTarget2.seconds, cut1 + MIN_SEGMENT_DURATION_S, totalDuration - MIN_SEGMENT_DURATION_S);

    // Validar duraciones mínimas de los 3 segmentos
    const seg1 = cut1;
    const seg2 = cut2 - cut1;
    const seg3 = totalDuration - cut2;

    if (seg1 < MIN_SEGMENT_DURATION_S || seg2 < MIN_SEGMENT_DURATION_S || seg3 < MIN_SEGMENT_DURATION_S) {
      logger.info(`[SceneSegmenter] Segmentos inválidos: ${seg1}s, ${seg2}s, ${seg3}s (mín ${MIN_SEGMENT_DURATION_S}s)`);
      return null;
    }

    logger.info(`[SceneSegmenter] Topic-aware: cut1=${cut1}s (score ${bestForTarget1.score.toFixed(2)}), cut2=${cut2}s (score ${bestForTarget2.score.toFixed(2)})`);

    return [cut1, cut2];
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
   * Extrae conceptos visuales del texto usando patrones predefinidos
   *
   * Busca frases como "mundos virtuales", "robots humanoides", etc.
   * y retorna queries específicas para búsqueda de imágenes.
   *
   * @param text - Texto a analizar
   * @returns Array de queries visuales encontradas (máx 2)
   *
   * @since Prompt 19.5 - Visual Queries
   */
  private extractVisualConcepts(text: string): string[] {
    const concepts: string[] = [];

    for (const { pattern, query } of VISUAL_PATTERNS) {
      if (pattern.test(text)) {
        // Evitar duplicados
        if (!concepts.includes(query)) {
          concepts.push(query);
        }
        // Máximo 2 conceptos visuales por segmento
        if (concepts.length >= 2) break;
      }
    }

    if (concepts.length > 0) {
      logger.info(`[SceneSegmenter] Conceptos visuales encontrados: ${concepts.join(', ')}`);
    }

    return concepts;
  }

  /**
   * Genera query de búsqueda específica para imágenes
   *
   * Estrategia por segmento:
   * - Segmento 0: Señal especial __LOGO__ para usar cascade de logos (Clearbit/Logo.dev)
   * - Otros segmentos: Prioriza conceptos visuales, fallback a keywords + empresa + título
   *
   * @param keywords - Keywords extraídas
   * @param segmentIndex - Índice del segmento
   * @param company - Nombre de empresa
   * @param fullText - Texto completo del segmento (para extraer conceptos visuales)
   * @param newsTitle - Título de la noticia (Prompt 28: para queries relevantes al tópico)
   * @returns Query específica o señal __LOGO__
   *
   * @updated Prompt 19.1.6 - Eliminados sufijos genéricos, integración con logo providers
   * @updated Prompt 19.5 - Prioriza conceptos visuales sobre keywords genéricas
   * @updated Prompt 28 - Empresa + título en TODAS las queries para relevancia
   */
  private generateSearchQuery(
    keywords: string[],
    segmentIndex: number,
    company?: string,
    fullText?: string,
    newsTitle?: string
  ): string {
    // Segmento 0: Señal especial para usar cascade de logos
    // image-orchestration.service.ts detectará esto y usará Clearbit/Logo.dev
    if (segmentIndex === 0 && company) {
      return `__LOGO__:${company}`;
    }

    // Prompt 19.5: Priorizar conceptos visuales sobre keywords genéricas
    if (fullText) {
      const visualConcepts = this.extractVisualConcepts(fullText);
      if (visualConcepts.length > 0) {
        // Prompt 28: Agregar empresa al concepto visual para más relevancia
        const concept = visualConcepts[0];
        return company ? `${company} ${concept}` : concept;
      }
    }

    // Prompt 28: Extraer keywords del título (más relevante que el body)
    const titleKeywords = newsTitle
      ? this.extractKeywords(newsTitle, company).slice(0, 2)
      : [];

    // Prompt 28: Combinar keywords del título + keywords del segmento
    // El título da contexto del tópico central, las keywords del segmento dan especificidad
    const combinedKeywords = [...titleKeywords, ...keywords];
    // Deduplicar
    const uniqueKeywords = [...new Set(combinedKeywords)].slice(0, 5);

    // Traducir a inglés (Prompt 23: APIs funcionan mejor en inglés)
    const translated = this.queryGenerator.translateKeywords(uniqueKeywords);
    const queryKeywords = translated.slice(0, Math.min(3, translated.length));

    // Prompt 28: Siempre incluir empresa para contexto (si existe y no está duplicada)
    if (company && !queryKeywords.some(k => k.toLowerCase() === company.toLowerCase())) {
      queryKeywords.unshift(company.toLowerCase());
      if (queryKeywords.length > 3) queryKeywords.pop();
    }

    return queryKeywords.join(' ');
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default SceneSegmenterService;
