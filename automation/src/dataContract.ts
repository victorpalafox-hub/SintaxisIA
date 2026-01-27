// ===================================
// DATA CONTRACT - Estructura de datos para Remotion
// ===================================

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { NewsArticle } from './newsAPI';
import { VideoScript } from './scriptGen';
import { AudioResult, WordTiming } from './audioGen';

// ===================================
// INTERFACES PRINCIPALES
// ===================================

export interface VideoConfig {
  title: string;
  themeColor: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  gancho: string;
  contenido: string[];
  impacto: string;
  cta: string;
  tags: string[];
  imageUrl: string | null;
  audioPath: string;
  durationInFrames: number;
  subtitles: WordTiming[];
  source: {
    name: string;
    url: string;
    publishedAt: string;
  };
}

export interface VideoData {
  videoConfig: VideoConfig;
  newsItems: NewsItem[];
  generatedAt: string;
}

// ===================================
// COLORES DEL TEMA SINTAXIS IA
// ===================================

export const THEME_COLORS = {
  cyanPrimary: '#00f0ff',
  magentaPrimary: '#ff0099',
  purpleMid: '#cc00ff',
  bgDark: '#0a0a0f',
  accentGold: '#ffd700',
  accentRed: '#ff3366'
};

// ===================================
// FUNCIONES
// ===================================

/**
 * Crea el objeto de datos completo para Remotion
 */
export function createVideoData(
  article: NewsArticle,
  script: VideoScript,
  audio: AudioResult
): VideoData {
  logger.info('Creando estructura de datos para Remotion...');

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const videoData: VideoData = {
    videoConfig: {
      title: `Sintaxis IA - ${dateStr}`,
      themeColor: THEME_COLORS.cyanPrimary,
      duration: 60,
      fps: 30,
      width: 1080,
      height: 1920
    },
    newsItems: [
      {
        id: `news_${Date.now()}`,
        headline: script.headline,
        gancho: script.gancho,
        contenido: script.contenido,
        impacto: script.impacto,
        cta: script.cta,
        tags: script.tags,
        imageUrl: article.image_url,
        audioPath: audio.audioPath,
        durationInFrames: audio.durationInFrames,
        subtitles: audio.subtitles,
        source: {
          name: article.source_name,
          url: article.link,
          publishedAt: article.pubDate
        }
      }
    ],
    generatedAt: new Date().toISOString()
  };

  return videoData;
}

/**
 * Guarda los datos en el archivo data.json de Remotion
 */
export function saveVideoData(data: VideoData): string {
  const outputPath = path.resolve(__dirname, '../../remotion-app/src/data.json');

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  logger.success(`Datos guardados en: ${outputPath}`);
  return outputPath;
}

/**
 * Carga datos existentes desde data.json
 */
export function loadVideoData(): VideoData | null {
  const dataPath = path.resolve(__dirname, '../../remotion-app/src/data.json');

  if (!fs.existsSync(dataPath)) {
    logger.warn('No existe archivo data.json');
    return null;
  }

  const content = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(content) as VideoData;
}

export default { createVideoData, saveVideoData, loadVideoData, THEME_COLORS };
