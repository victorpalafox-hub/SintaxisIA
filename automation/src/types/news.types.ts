/**
 * @fileoverview Types para Noticias con soporte de Scoring
 *
 * Extiende la interfaz NewsArticle de newsAPI.ts con campos
 * adicionales necesarios para el sistema de scoring.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 11
 */

import { NewsType, NewsMetrics } from './scoring.types';

/**
 * Item de noticia normalizado para el sistema de scoring
 *
 * Esta interfaz representa una noticia con todos los campos
 * necesarios para calcular su score de importancia.
 *
 * Compatible con NewsArticle de newsAPI.ts pero con campos adicionales.
 */
export interface NewsItem {
  /** ID único de la noticia */
  id: string;

  /** Título de la noticia */
  title: string;

  /** Descripción o resumen de la noticia */
  description: string;

  /** URL de la noticia original */
  url?: string;

  /** Fecha de publicación */
  publishedAt: Date;

  /** Fuente de la noticia (nombre del medio) */
  source: string;

  // === Campos para scoring (Prompt 11) ===

  /**
   * Empresa principal mencionada
   * Ej: "Google", "OpenAI", "Anthropic"
   */
  company?: string;

  /**
   * Tipo de noticia categorizado
   * Se usa para asignar puntuación por tipo
   */
  type?: NewsType;

  /**
   * Métricas de engagement en redes sociales
   * Views, likes, retweets, etc.
   */
  metrics?: NewsMetrics;

  /**
   * Nombre del producto si aplica
   * Ej: "GPT-5", "Genie", "Claude 4"
   */
  productName?: string;

  /** URL de imagen asociada */
  imageUrl?: string;

  /** Keywords/etiquetas de la noticia */
  keywords?: string[];
}

/**
 * Convierte un NewsArticle de la API a NewsItem para scoring
 *
 * @param article - Artículo de NewsData.io
 * @returns NewsItem normalizado
 */
export function normalizeNewsArticle(article: {
  article_id: string;
  title: string;
  description: string | null;
  pubDate: string;
  source_name: string;
  link: string;
  image_url: string | null;
  keywords: string[] | null;
}): NewsItem {
  return {
    id: article.article_id,
    title: article.title,
    description: article.description || '',
    url: article.link,
    publishedAt: new Date(article.pubDate),
    source: article.source_name,
    imageUrl: article.image_url || undefined,
    keywords: article.keywords || undefined,
    // Campos de scoring se llenan después con detectores
    company: undefined,
    type: undefined,
    metrics: undefined,
    productName: undefined,
  };
}
