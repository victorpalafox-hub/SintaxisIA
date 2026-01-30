/**
 * @fileoverview Image Cache System
 *
 * Cachea imágenes descargadas localmente para:
 * - Evitar descargas repetidas
 * - Mejorar performance
 * - Reducir llamadas a APIs
 *
 * Configuración:
 * - Directorio: automation/cache/images/
 * - Max age: 7 días
 * - Limpieza automática disponible
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 12
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { createHash } from 'crypto';
import { IMAGE_API_CONFIG } from '../config/image-sources';
import { TIMEOUTS } from '../config/timeouts.config';

// Directorio de caché
const CACHE_DIR = path.join(process.cwd(), IMAGE_API_CONFIG.cache.directory);

// =============================================================================
// FUNCIONES PRINCIPALES
// =============================================================================

/**
 * Cachea una imagen localmente
 *
 * Descarga la imagen y la guarda en el directorio de caché.
 * El nombre del archivo es un hash MD5 del URL.
 *
 * @param url - URL de la imagen a cachear
 * @returns Path local de la imagen cacheada
 * @throws Error si no se puede descargar o guardar
 *
 * @example
 * const localPath = await cacheImage('https://logo.clearbit.com/google.com');
 * // → 'automation/cache/images/a1b2c3d4e5f6.png'
 */
export async function cacheImage(url: string): Promise<string> {
  // Crear directorio si no existe
  ensureCacheDir();

  // Generar nombre de archivo basado en hash del URL
  const hash = createHash('md5').update(url).digest('hex');
  const ext = getFileExtension(url);
  const cachePath = path.join(CACHE_DIR, `${hash}${ext}`);

  // Si ya está cacheada, retornar path existente
  if (fs.existsSync(cachePath)) {
    return cachePath;
  }

  // Descargar y guardar
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: TIMEOUTS.imageFetch.value,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SintaxisIA/1.0)',
      },
    });

    fs.writeFileSync(cachePath, response.data);
    return cachePath;
  } catch (error) {
    throw new Error(`No se pudo cachear imagen: ${url}`);
  }
}

/**
 * Verifica si una imagen está cacheada
 *
 * @param url - URL de la imagen
 * @returns true si está cacheada localmente
 */
export function isCached(url: string): boolean {
  const hash = createHash('md5').update(url).digest('hex');
  const ext = getFileExtension(url);
  const cachePath = path.join(CACHE_DIR, `${hash}${ext}`);

  return fs.existsSync(cachePath);
}

/**
 * Obtiene path de caché de una imagen
 *
 * @param url - URL de la imagen
 * @returns Path local si está cacheada, null si no
 */
export function getCachePath(url: string): string | null {
  const hash = createHash('md5').update(url).digest('hex');
  const ext = getFileExtension(url);
  const cachePath = path.join(CACHE_DIR, `${hash}${ext}`);

  return fs.existsSync(cachePath) ? cachePath : null;
}

// =============================================================================
// MANTENIMIENTO DE CACHÉ
// =============================================================================

/**
 * Limpia caché vieja (>7 días por defecto)
 *
 * Elimina archivos que superen el maxAge configurado.
 * Ignora el archivo .gitkeep.
 *
 * @returns Número de archivos eliminados
 */
export function cleanOldCache(): number {
  if (!fs.existsSync(CACHE_DIR)) return 0;

  const files = fs.readdirSync(CACHE_DIR);
  const now = Date.now();
  const maxAge = IMAGE_API_CONFIG.cache.maxAge;

  let cleaned = 0;

  files.forEach((file) => {
    // No eliminar .gitkeep
    if (file === '.gitkeep') return;

    const filePath = path.join(CACHE_DIR, file);

    try {
      const stats = fs.statSync(filePath);

      // Si es más viejo que maxAge, eliminar
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    } catch (error) {
      // Ignorar errores de archivos individuales
    }
  });

  if (cleaned > 0) {
    console.log(`✅ Cache limpiado: ${cleaned} archivos eliminados`);
  }

  return cleaned;
}

/**
 * Obtiene tamaño del caché en MB
 *
 * @returns Tamaño total en megabytes
 */
export function getCacheSize(): number {
  if (!fs.existsSync(CACHE_DIR)) return 0;

  const files = fs.readdirSync(CACHE_DIR);
  let totalBytes = 0;

  files.forEach((file) => {
    if (file === '.gitkeep') return;

    const filePath = path.join(CACHE_DIR, file);

    try {
      const stats = fs.statSync(filePath);
      totalBytes += stats.size;
    } catch (error) {
      // Ignorar errores
    }
  });

  // Convertir bytes a MB
  return totalBytes / (1024 * 1024);
}

/**
 * Obtiene número de archivos en caché
 *
 * @returns Número de archivos (excluyendo .gitkeep)
 */
export function getCacheCount(): number {
  if (!fs.existsSync(CACHE_DIR)) return 0;

  const files = fs.readdirSync(CACHE_DIR);
  return files.filter((f) => f !== '.gitkeep').length;
}

/**
 * Limpia todo el caché
 *
 * Elimina todos los archivos del caché excepto .gitkeep.
 * Usar con cuidado.
 *
 * @returns Número de archivos eliminados
 */
export function clearAllCache(): number {
  if (!fs.existsSync(CACHE_DIR)) return 0;

  const files = fs.readdirSync(CACHE_DIR);
  let cleared = 0;

  files.forEach((file) => {
    if (file === '.gitkeep') return;

    const filePath = path.join(CACHE_DIR, file);

    try {
      fs.unlinkSync(filePath);
      cleared++;
    } catch (error) {
      // Ignorar errores
    }
  });

  return cleared;
}

// =============================================================================
// FUNCIONES UTILITARIAS PRIVADAS
// =============================================================================

/**
 * Asegura que el directorio de caché existe
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Obtiene extensión de archivo desde URL
 *
 * @param url - URL del archivo
 * @returns Extensión con punto (ej: '.png')
 */
function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname);

    // Extensiones válidas de imagen
    const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

    if (validExts.includes(ext.toLowerCase())) {
      return ext.toLowerCase();
    }
  } catch (error) {
    // URL inválida o sin extensión
  }

  // Default: .jpg
  return '.jpg';
}

// Exportar como default también
export default {
  cacheImage,
  isCached,
  getCachePath,
  cleanOldCache,
  getCacheSize,
  getCacheCount,
  clearAllCache,
};
