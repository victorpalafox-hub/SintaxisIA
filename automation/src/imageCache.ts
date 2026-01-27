// ===================================
// IMAGE CACHE - Sistema de cache para imágenes
// ===================================

import { imageConfig, ImageSource } from './imageConfig';
import { CachedImage, ImageCacheStats } from './types/imageSearch';
import { logger } from '../utils/logger';

/**
 * CACHE EN MEMORIA PARA IMÁGENES
 * Evita búsquedas repetidas de la misma entidad
 * Implementa LRU (Least Recently Used) para evicción
 */
class ImageCache {
  private cache: Map<string, CachedImage> = new Map();
  private maxSize: number;
  private ttl: number;
  private totalHits: number = 0;
  private totalMisses: number = 0;

  constructor() {
    this.maxSize = imageConfig.cache.maxSize;
    this.ttl = imageConfig.cache.ttl;
  }

  /**
   * Obtiene imagen del cache
   */
  get(entityName: string): string | null {
    if (!imageConfig.cache.enabled) {
      return null;
    }

    const key = this.normalizeKey(entityName);
    const cached = this.cache.get(key);

    if (!cached) {
      this.totalMisses++;
      return null;
    }

    // Verificar si expiró
    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      logger.info(`   Cache expirado para: ${entityName}`);
      this.cache.delete(key);
      this.totalMisses++;
      return null;
    }

    // Incrementar hits y retornar
    cached.hits++;
    this.totalHits++;
    logger.info(`   ✓ Cache hit: ${entityName} (${cached.hits} hits)`);

    return cached.url;
  }

  /**
   * Guarda imagen en cache
   */
  set(entityName: string, url: string, source: ImageSource): void {
    if (!imageConfig.cache.enabled) {
      return;
    }

    const key = this.normalizeKey(entityName);

    // Si cache está lleno, eliminar entrada más antigua
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      url,
      source,
      timestamp: Date.now(),
      hits: 0,
    });

    logger.info(`   ✓ Cacheado: ${entityName}`);
  }

  /**
   * Verifica si existe en cache (sin incrementar hits)
   */
  has(entityName: string): boolean {
    if (!imageConfig.cache.enabled) {
      return false;
    }

    const key = this.normalizeKey(entityName);
    const cached = this.cache.get(key);

    if (!cached) {
      return false;
    }

    // Verificar si expiró
    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Elimina entrada del cache
   */
  delete(entityName: string): boolean {
    const key = this.normalizeKey(entityName);
    return this.cache.delete(key);
  }

  /**
   * Elimina entrada más antigua (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.info(`   Cache evicted: ${oldestKey}`);
    }
  }

  /**
   * Normaliza key (lowercase, sin espacios extras)
   */
  private normalizeKey(entityName: string): string {
    return entityName.toLowerCase().trim().replace(/\s+/g, '-');
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
    logger.info('   Cache limpiado');
  }

  /**
   * Limpia solo entradas expiradas
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info(`   Cache: ${cleared} entradas expiradas eliminadas`);
    }

    return cleared;
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): ImageCacheStats {
    const totalRequests = this.totalHits + this.totalMisses;
    const hitRate = totalRequests > 0
      ? (this.totalHits / totalRequests) * 100
      : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        hits: value.hits,
        age: Date.now() - value.timestamp,
      })),
    };
  }

  /**
   * Obtiene el tamaño actual del cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Verifica si el cache está habilitado
   */
  get isEnabled(): boolean {
    return imageConfig.cache.enabled;
  }
}

// Singleton export
export const imageCache = new ImageCache();

export default imageCache;
