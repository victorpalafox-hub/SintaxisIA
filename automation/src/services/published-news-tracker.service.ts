/**
 * @fileoverview Published News Tracker Service - Prompt 21
 *
 * Servicio para rastrear noticias ya publicadas y evitar duplicacion.
 * Mantiene un archivo JSON con el historial de noticias publicadas.
 *
 * Estrategia de deduplicacion (3 capas):
 * 1. Match exacto por ID
 * 2. Similitud de titulo (>80% word overlap Jaccard)
 * 3. Misma empresa + producto en ultimos 7 dias
 *
 * El flujo de uso es:
 * 1. tracker.load() - Carga historial (async, una vez al inicio del pipeline)
 * 2. tracker.getExclusionFilter() - Obtiene filtro sync para scoring
 * 3. selectTopNewsExcluding(items, filter) - Filtra + rankea (sync)
 * 4. tracker.record(news, score) - Registra publicacion (sync)
 * 5. tracker.save() - Persiste a disco (async)
 *
 * @example
 * ```typescript
 * const tracker = new PublishedNewsTracker();
 * await tracker.load();
 *
 * const filter = tracker.getExclusionFilter();
 * const topNews = selectTopNewsExcluding(newsItems, filter);
 *
 * // After pipeline success:
 * tracker.record(topResult.news, topResult.score, outputFolder);
 * await tracker.save();
 * ```
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 21
 */

import * as fs from 'fs';
import * as path from 'path';
import { PUBLISHED_NEWS_CONFIG } from '../config/published-news.config';
import {
  PublishedNewsEntry,
  PublishedNewsData,
  DuplicateCheckResult,
} from '../types/published-news.types';
import { NewsItem } from '../types/news.types';
import { NewsScore } from '../types/scoring.types';

// =============================================================================
// PUBLISHED NEWS TRACKER SERVICE
// =============================================================================

/**
 * Servicio de tracking de noticias publicadas para anti-duplicacion
 *
 * Carga un archivo JSON con el historial y provee metodos sync para
 * verificar duplicados. El patron load-once + sync-queries permite
 * integrarse con el scoring que es sincrono.
 */
export class PublishedNewsTracker {
  private data: PublishedNewsData;
  private loaded: boolean = false;

  constructor() {
    // Estado inicial vacio (se llena con load())
    this.data = {
      version: PUBLISHED_NEWS_CONFIG.dataVersion,
      lastUpdated: new Date().toISOString(),
      entries: [],
    };
  }

  // ===========================================================================
  // METODOS ASYNC (I/O de archivo)
  // ===========================================================================

  /**
   * Carga el historial de noticias publicadas desde el archivo JSON
   *
   * Si el archivo no existe, se usa el estado vacio inicial.
   * Crea el directorio data/ si no existe.
   */
  async load(): Promise<void> {
    this.ensureDataDirectory();
    const filePath = PUBLISHED_NEWS_CONFIG.dataFilePath;

    if (fs.existsSync(filePath)) {
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      this.data = JSON.parse(raw) as PublishedNewsData;
    }

    this.loaded = true;
  }

  /**
   * Persiste el historial actual al archivo JSON
   *
   * Actualiza lastUpdated y poda entries antiguos antes de guardar.
   */
  async save(): Promise<void> {
    this.ensureDataDirectory();
    this.pruneOldEntries();
    this.data.lastUpdated = new Date().toISOString();

    const filePath = PUBLISHED_NEWS_CONFIG.dataFilePath;
    const json = JSON.stringify(this.data, null, 2);
    await fs.promises.writeFile(filePath, json, 'utf-8');
  }

  // ===========================================================================
  // METODOS SYNC (queries despues de load)
  // ===========================================================================

  /**
   * Verifica si un ID de noticia ya fue publicado
   *
   * @param newsId - ID de la noticia a verificar
   * @returns true si ya fue publicada (dentro de la ventana de cooldown)
   */
  isPublished(newsId: string): boolean {
    const recent = this.getRecentEntries(PUBLISHED_NEWS_CONFIG.cooldownDays);
    return recent.some(entry => entry.newsId === newsId);
  }

  /**
   * Verificacion completa de duplicado (3 capas)
   *
   * Capa 1: Match exacto por ID
   * Capa 2: Similitud de titulo >80% (Jaccard word overlap)
   * Capa 3: Misma empresa + producto en ultimos 7 dias
   *
   * @param newsId - ID de la noticia
   * @param title - Titulo de la noticia
   * @param company - Empresa principal (opcional)
   * @param productName - Nombre del producto (opcional)
   * @returns Resultado detallado de la verificacion
   */
  checkDuplicate(
    newsId: string,
    title: string,
    company?: string,
    productName?: string,
  ): DuplicateCheckResult {
    const recentEntries = this.getRecentEntries(PUBLISHED_NEWS_CONFIG.cooldownDays);

    // Capa 1: Match exacto por ID
    const idMatch = recentEntries.find(e => e.newsId === newsId);
    if (idMatch) {
      return {
        isDuplicate: true,
        reason: `ID exacto: ${newsId}`,
        matchedEntry: idMatch,
        matchType: 'exact-id',
      };
    }

    // Capa 2: Similitud de titulo
    const normalizedInput = PublishedNewsTracker.normalizeTitle(title);
    for (const entry of recentEntries) {
      const similarity = PublishedNewsTracker.calculateTitleSimilarity(
        normalizedInput,
        entry.normalizedTitle,
      );
      if (similarity >= PUBLISHED_NEWS_CONFIG.titleSimilarityThreshold) {
        return {
          isDuplicate: true,
          reason: `Similitud de titulo ${(similarity * 100).toFixed(0)}%: "${entry.title}"`,
          matchedEntry: entry,
          matchType: 'title-similarity',
          similarityScore: similarity,
        };
      }
    }

    // Capa 3: Misma empresa + producto en ventana corta
    if (company && productName) {
      const companyEntries = this.getRecentEntries(
        PUBLISHED_NEWS_CONFIG.companyProductCooldownDays,
      );
      const companyMatch = companyEntries.find(
        e =>
          e.company?.toLowerCase() === company.toLowerCase() &&
          e.productName?.toLowerCase() === productName.toLowerCase(),
      );
      if (companyMatch) {
        return {
          isDuplicate: true,
          reason: `Misma empresa+producto en ultimos ${PUBLISHED_NEWS_CONFIG.companyProductCooldownDays} dias: ${company} - ${productName}`,
          matchedEntry: companyMatch,
          matchType: 'company-product',
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Registra una noticia como publicada
   *
   * @param news - Noticia publicada
   * @param score - Score obtenido
   * @param outputFolder - Nombre de la carpeta de output (opcional)
   */
  record(news: NewsItem, score: NewsScore, outputFolder?: string): void {
    const entry: PublishedNewsEntry = {
      newsId: news.id,
      title: news.title,
      normalizedTitle: PublishedNewsTracker.normalizeTitle(news.title),
      company: news.company,
      productName: news.productName,
      publishedAt: new Date().toISOString(),
      score: score.totalScore,
      outputFolder,
    };

    this.data.entries.push(entry);
    this.data.lastUpdated = new Date().toISOString();
  }

  /**
   * Retorna un filtro SYNC para usar con selectTopNewsExcluding
   *
   * Este es el punto de integracion clave: load() es async pero
   * el filtro retornado es sync (closure sobre los datos cargados).
   *
   * @returns Funcion que retorna true si la noticia debe EXCLUIRSE
   */
  getExclusionFilter(): (
    newsId: string,
    title: string,
    company?: string,
    productName?: string,
  ) => boolean {
    return (
      newsId: string,
      title: string,
      company?: string,
      productName?: string,
    ): boolean => {
      const result = this.checkDuplicate(newsId, title, company, productName);
      return result.isDuplicate;
    };
  }

  /**
   * Retorna todos los IDs de noticias publicadas
   */
  getPublishedIds(): string[] {
    return this.data.entries.map(e => e.newsId);
  }

  /**
   * Retorna la cantidad de entries en el historial
   */
  getEntryCount(): number {
    return this.data.entries.length;
  }

  // ===========================================================================
  // METODOS ESTATICOS (funciones puras, testeables)
  // ===========================================================================

  /**
   * Normaliza un titulo para comparacion fuzzy
   *
   * Convierte a lowercase, remueve acentos (NFD), remueve puntuacion,
   * y colapsa espacios multiples.
   *
   * @param title - Titulo original
   * @returns Titulo normalizado
   *
   * @example
   * PublishedNewsTracker.normalizeTitle("Google DeepMind presenta Genie 2!")
   * // => "google deepmind presenta genie 2"
   */
  static normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s]/g, '') // Remover puntuacion
      .replace(/\s+/g, ' ') // Colapsar whitespace
      .trim();
  }

  /**
   * Calcula similitud entre dos titulos normalizados (Jaccard por palabras)
   *
   * Filtra palabras de menos de 3 caracteres para evitar ruido
   * de preposiciones y articulos.
   *
   * @param normalized1 - Primer titulo normalizado
   * @param normalized2 - Segundo titulo normalizado
   * @returns Similitud entre 0.0 (nada) y 1.0 (identico)
   *
   * @example
   * calculateTitleSimilarity("google deepmind genie 2", "google deepmind presenta genie 2")
   * // => 0.8 (4 de 5 palabras significativas en comun)
   */
  static calculateTitleSimilarity(
    normalized1: string,
    normalized2: string,
  ): number {
    // Filtrar palabras cortas (articulos, preposiciones)
    const words1 = new Set(normalized1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(normalized2.split(' ').filter(w => w.length > 2));

    // Edge cases
    if (words1.size === 0 && words2.size === 0) return 1.0;
    if (words1.size === 0 || words2.size === 0) return 0.0;

    // Contar palabras en comun
    let commonCount = 0;
    for (const word of words1) {
      if (words2.has(word)) commonCount++;
    }

    // Jaccard: interseccion / union
    const totalUnique = new Set([...words1, ...words2]).size;
    return commonCount / totalUnique;
  }

  // ===========================================================================
  // METODOS PRIVADOS
  // ===========================================================================

  /**
   * Filtra entries dentro de una ventana de dias
   *
   * @param days - Numero de dias hacia atras
   * @returns Entries publicados dentro de la ventana
   */
  private getRecentEntries(days: number): PublishedNewsEntry[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffTime = cutoff.getTime();

    return this.data.entries.filter(
      entry => new Date(entry.publishedAt).getTime() >= cutoffTime,
    );
  }

  /**
   * Poda entries antiguos si se supera el maximo
   *
   * Remueve los entries mas antiguos (FIFO) para mantener
   * el archivo dentro del limite de maxHistoryEntries.
   */
  private pruneOldEntries(): void {
    const max = PUBLISHED_NEWS_CONFIG.maxHistoryEntries;
    if (this.data.entries.length > max) {
      // Ordenar por fecha descendente y tomar solo los mas recientes
      this.data.entries.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
      this.data.entries = this.data.entries.slice(0, max);
    }
  }

  /**
   * Asegura que el directorio data/ exista
   */
  private ensureDataDirectory(): void {
    const dir = PUBLISHED_NEWS_CONFIG.dataDir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
