// ===================================
// VALIDATORS - Validación de estructuras de datos
// ===================================

import { VideoData, NewsItem, VideoConfig } from '../src/dataContract';
import { VideoScript } from '../src/scriptGen';
import { logger } from './logger';

// Tipos de error de validación
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida la configuración del video
 */
export function validateVideoConfig(config: VideoConfig): ValidationResult {
  const errors: string[] = [];

  if (!config.title || config.title.trim() === '') {
    errors.push('El título del video es requerido');
  }

  if (config.width !== 1080) {
    errors.push(`Ancho debe ser 1080px, recibido: ${config.width}`);
  }

  if (config.height !== 1920) {
    errors.push(`Alto debe ser 1920px, recibido: ${config.height}`);
  }

  if (config.fps !== 30) {
    errors.push(`FPS debe ser 30, recibido: ${config.fps}`);
  }

  if (config.duration < 30 || config.duration > 60) {
    errors.push(`Duración debe estar entre 30-60s, recibido: ${config.duration}`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida un item de noticia
 */
export function validateNewsItem(item: NewsItem): ValidationResult {
  const errors: string[] = [];

  if (!item.id) {
    errors.push('ID de noticia es requerido');
  }

  if (!item.headline || item.headline.length < 10) {
    errors.push('Headline debe tener al menos 10 caracteres');
  }

  if (!item.gancho || item.gancho.length < 5) {
    errors.push('Gancho es requerido');
  }

  if (!item.contenido || item.contenido.length < 2) {
    errors.push('Contenido debe tener al menos 2 puntos');
  }

  if (!item.audioPath) {
    errors.push('Ruta de audio es requerida');
  }

  if (item.durationInFrames < 900 || item.durationInFrames > 1800) {
    errors.push(`Duración debe estar entre 900-1800 frames (30-60s), recibido: ${item.durationInFrames}`);
  }

  if (!item.subtitles || item.subtitles.length === 0) {
    errors.push('Subtítulos son requeridos');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida el guión generado
 */
export function validateScript(script: VideoScript): ValidationResult {
  const errors: string[] = [];

  if (!script.gancho || script.gancho.length < 5) {
    errors.push('Gancho debe tener al menos 5 caracteres');
  }

  if (!script.headline || script.headline.length < 10) {
    errors.push('Headline debe tener al menos 10 caracteres');
  }

  if (!script.contenido || script.contenido.length < 3) {
    errors.push('Contenido debe tener al menos 3 puntos');
  }

  if (!script.impacto) {
    errors.push('Sección de impacto es requerida');
  }

  if (!script.cta) {
    errors.push('Call to action es requerido');
  }

  if (!script.tags || script.tags.length < 2) {
    errors.push('Debe tener al menos 2 tags');
  }

  if (!script.fullScript || script.fullScript.length < 100) {
    errors.push('Script completo debe tener al menos 100 caracteres');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida la estructura completa de VideoData
 */
export function validateVideoData(data: VideoData): ValidationResult {
  const errors: string[] = [];

  // Validar config
  const configResult = validateVideoConfig(data.videoConfig);
  errors.push(...configResult.errors);

  // Validar items
  if (!data.newsItems || data.newsItems.length === 0) {
    errors.push('Debe haber al menos 1 noticia');
  } else {
    data.newsItems.forEach((item, index) => {
      const itemResult = validateNewsItem(item);
      itemResult.errors.forEach(err => {
        errors.push(`NewsItem[${index}]: ${err}`);
      });
    });
  }

  // Log de resultados
  if (errors.length > 0) {
    logger.warn('Validación encontró errores:');
    errors.forEach(err => logger.error(`  - ${err}`));
  } else {
    logger.success('Validación exitosa');
  }

  return { isValid: errors.length === 0, errors };
}

export default {
  validateVideoConfig,
  validateNewsItem,
  validateScript,
  validateVideoData
};
