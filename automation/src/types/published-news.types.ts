/**
 * @fileoverview Types para Anti-Duplicacion de Noticias - Prompt 21
 *
 * Define interfaces para el sistema de tracking de noticias publicadas.
 * Usado por PublishedNewsTracker para evitar duplicaciones.
 *
 * Estrategia de deduplicacion (3 capas):
 * 1. Match exacto por ID
 * 2. Similitud de titulo (>80% word overlap Jaccard)
 * 3. Misma empresa + producto en ultimos 7 dias
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 21
 */

/**
 * Entrada individual de noticia publicada
 *
 * Almacena los datos minimos necesarios para detectar duplicados:
 * - ID original para match exacto
 * - Titulo normalizado para similitud fuzzy
 * - Company + product para deteccion por empresa/producto
 */
export interface PublishedNewsEntry {
  /** ID original de la noticia (de NewsItem.id) */
  newsId: string;

  /** Titulo original */
  title: string;

  /** Titulo normalizado (lowercase, sin acentos, sin puntuacion) */
  normalizedTitle: string;

  /** Empresa principal (de NewsItem.company) */
  company?: string;

  /** Nombre del producto (de NewsItem.productName o extraido del titulo) */
  productName?: string;

  /** Fecha en que se publico el video (ISO 8601) */
  publishedAt: string;

  /** Score que obtuvo la noticia */
  score: number;

  /** Nombre de la carpeta de output (para referencia) */
  outputFolder?: string;
}

/**
 * Estructura completa del archivo published-news.json
 */
export interface PublishedNewsData {
  /** Version del formato de datos */
  version: number;

  /** Ultima actualizacion (ISO 8601) */
  lastUpdated: string;

  /** Lista de noticias publicadas */
  entries: PublishedNewsEntry[];
}

/**
 * Resultado de verificacion de duplicado
 *
 * Provee informacion detallada sobre por que una noticia fue
 * detectada como duplicada (o no), util para logging y debugging.
 */
export interface DuplicateCheckResult {
  /** Si es duplicado */
  isDuplicate: boolean;

  /** Razon de la deteccion */
  reason?: string;

  /** Entry existente que hizo match (si aplica) */
  matchedEntry?: PublishedNewsEntry;

  /** Tipo de match */
  matchType?: 'exact-id' | 'title-similarity' | 'company-product';

  /** Porcentaje de similitud (para title-similarity, 0.0-1.0) */
  similarityScore?: number;
}

/**
 * Estadisticas del tracker de noticias publicadas
 *
 * Retornada por `getStats()` para mostrar resumen del historial.
 *
 * @since Prompt 22
 */
export interface TrackerStats {
  /** Total de entries en historial */
  totalEntries: number;

  /** Entries activos (dentro de ventana de cooldown) */
  activeEntries: number;

  /** Entries expirados (fuera de ventana de cooldown) */
  expiredEntries: number;

  /** Score promedio de todas las noticias */
  averageScore: number;

  /** Lista de empresas unicas mencionadas */
  uniqueCompanies: string[];

  /** Lista de productos unicos mencionados */
  uniqueProducts: string[];

  /** Distribucion por rangos de score */
  scoreDistribution: {
    /** 0-74 (no publicables) */
    low: number;
    /** 75-84 */
    good: number;
    /** 85-94 */
    high: number;
    /** 95+ */
    excellent: number;
  };

  /** Entry mas antiguo (titulo + fecha) o null si vacio */
  oldestEntry: { title: string; publishedAt: string } | null;

  /** Entry mas reciente (titulo + fecha) o null si vacio */
  newestEntry: { title: string; publishedAt: string } | null;

  /** Dias desde la ultima publicacion o null si vacio */
  daysSinceLastPublication: number | null;
}
