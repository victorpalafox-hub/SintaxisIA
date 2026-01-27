// ===================================
// NEWS API - Obtener noticias de IA
// ===================================

import axios from 'axios';
import { config } from './config';
import { logger } from '../utils/logger';

// Interfaces para la respuesta de NewsData.io
export interface NewsArticle {
  article_id: string;
  title: string;
  description: string | null;
  content: string | null;
  pubDate: string;
  source_id: string;
  source_name: string;
  image_url: string | null;
  link: string;
  keywords: string[] | null;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage?: string;
}

// Configuración de la API
const NEWS_API_BASE_URL = 'https://newsdata.io/api/1/news';

/**
 * Obtiene las últimas noticias de Inteligencia Artificial
 * @param limit - Número máximo de noticias a obtener (default: 5)
 * @returns Array de artículos de noticias
 */
export async function fetchAINews(limit: number = 5): Promise<NewsArticle[]> {
  logger.info('Obteniendo noticias de IA desde NewsData.io...');

  try {
    const response = await axios.get<NewsDataResponse>(NEWS_API_BASE_URL, {
      params: {
        apikey: config.api.newsDataApiKey,
        q: 'artificial intelligence OR AI OR machine learning OR GPT OR OpenAI',
        language: config.content.targetLanguage,
        category: 'technology',
        size: limit
      }
    });

    if (response.data.status !== 'success') {
      throw new Error('La API de NewsData no devolvió estado exitoso');
    }

    const articles = response.data.results;
    logger.success(`Se obtuvieron ${articles.length} noticias de IA`);

    return articles;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`Error de API: ${error.response?.data?.message || error.message}`);
    } else {
      logger.error(`Error inesperado: ${error}`);
    }
    throw error;
  }
}

/**
 * Filtra y selecciona la mejor noticia para el video
 * @param articles - Array de artículos
 * @returns El artículo más relevante
 */
export function selectBestArticle(articles: NewsArticle[]): NewsArticle | null {
  if (articles.length === 0) {
    logger.warn('No hay artículos para seleccionar');
    return null;
  }

  // Priorizar artículos con imagen y contenido completo
  const scored = articles.map(article => ({
    article,
    score: (article.image_url ? 2 : 0) +
           (article.content ? 1 : 0) +
           (article.description ? 1 : 0)
  }));

  scored.sort((a, b) => b.score - a.score);

  logger.info(`Artículo seleccionado: "${scored[0].article.title}"`);
  return scored[0].article;
}

export default { fetchAINews, selectBestArticle };
