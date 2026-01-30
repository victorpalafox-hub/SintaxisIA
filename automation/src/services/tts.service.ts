/**
 * @fileoverview Servicio de Text-to-Speech con ElevenLabs
 * @description Convierte scripts de texto a audio profesional
 *
 * Caracteristicas:
 * - ElevenLabs como proveedor principal (Josh voice)
 * - Gestion de cuota free tier (10,000 chars/mes)
 * - Cache para evitar regenerar audios identicos
 * - Fallback automatico a Edge-TTS si falla ElevenLabs
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 16 - ElevenLabs TTS Integration
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { TTS_CONFIG, getElevenLabsTTSUrl } from '../config/tts.config';
import { config } from '../config';
import { logger } from '../../utils/logger';
import type {
  TTSRequest,
  TTSResponse,
  TTSQuotaStatus,
  TTSQuotaData,
  AudioCacheEntry,
  AudioCacheIndex,
  TTSServiceOptions,
  AudioResult,
  WordTiming,
} from '../types/tts.types';

const execAsync = promisify(exec);

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

/**
 * Servicio para generar audio a partir de texto usando ElevenLabs API
 *
 * Incluye cache, gestion de cuota, y fallback a Edge-TTS
 *
 * @example
 * ```typescript
 * const tts = new TTSService();
 *
 * // Generar audio
 * const result = await tts.generateAudio({ text: 'Hola mundo' });
 * console.log(`Audio en: ${result.audioPath}`);
 *
 * // Verificar cuota
 * const quota = await tts.getQuotaStatus();
 * console.log(`Usado: ${quota.used}/${quota.limit}`);
 * ```
 */
export class TTSService {
  private quotaPath: string;
  private cachePath: string;
  private cacheIndexPath: string;
  private options: Required<TTSServiceOptions>;

  /**
   * Crea una nueva instancia del servicio TTS
   */
  constructor(options: TTSServiceOptions = {}) {
    this.options = {
      cacheDirectory: options.cacheDirectory || TTS_CONFIG.cache.directory,
      enableCache: options.enableCache ?? TTS_CONFIG.cache.enabled,
      enableFallback: options.enableFallback ?? TTS_CONFIG.fallback.enabled,
      forceFallback: options.forceFallback ?? false,
    };

    this.cachePath = path.join(process.cwd(), this.options.cacheDirectory);
    this.cacheIndexPath = path.join(this.cachePath, 'index.json');
    this.quotaPath = path.join(process.cwd(), 'cache', 'tts-quota.json');

    this.ensureDirectories();
  }

  // ===========================================================================
  // METODOS PUBLICOS PRINCIPALES
  // ===========================================================================

  /**
   * Genera audio a partir de texto
   *
   * @param request - Configuracion de la solicitud TTS
   * @returns Respuesta con ruta al audio y metadata
   */
  async generateAudio(request: TTSRequest): Promise<TTSResponse> {
    const { text, forceRegenerate = false, outputFileName } = request;
    const textHash = this.generateHash(text);

    logger.info(`[TTS] Generando audio para ${text.length} caracteres`);

    // 1. Verificar cache
    if (this.options.enableCache && !forceRegenerate) {
      const cached = await this.checkCache(textHash);
      if (cached) {
        logger.info(`[TTS] Audio encontrado en cache`);
        return {
          ...cached,
          fromCache: true,
        };
      }
    }

    // 2. Forzar fallback si esta configurado (para testing)
    if (this.options.forceFallback) {
      logger.info(`[TTS] Fallback forzado, usando Edge-TTS`);
      return this.generateWithFallback(text, textHash, outputFileName);
    }

    // 3. Verificar cuota antes de llamar a ElevenLabs
    const quota = await this.getQuotaStatus();

    if (quota.exceeded) {
      logger.warn(`[TTS] Cuota ElevenLabs excedida, usando fallback`);
      return this.generateWithFallback(text, textHash, outputFileName);
    }

    if (quota.nearLimit) {
      logger.warn(
        `[TTS] Cuota al ${quota.percentageUsed.toFixed(1)}% - cerca del limite`
      );
    }

    // 4. Verificar API key
    const apiKey = config.api.elevenLabsApiKey;
    if (!apiKey) {
      logger.warn(`[TTS] ELEVENLABS_API_KEY no configurada, usando fallback`);
      if (this.options.enableFallback) {
        return this.generateWithFallback(text, textHash, outputFileName);
      }
      throw new Error('ELEVENLABS_API_KEY no configurada en .env');
    }

    // 5. Intentar con ElevenLabs
    try {
      const response = await this.generateWithElevenLabs(
        text,
        textHash,
        outputFileName
      );
      await this.updateQuota(text.length);
      await this.saveToCache(textHash, response);
      return response;
    } catch (error) {
      logger.error(`[TTS] Error con ElevenLabs: ${error}`);

      if (this.options.enableFallback) {
        logger.info(`[TTS] Intentando con fallback (Edge-TTS)`);
        return this.generateWithFallback(text, textHash, outputFileName);
      }

      throw error;
    }
  }

  /**
   * Genera audio compatible con el formato legacy de audioGen.ts
   *
   * @param text - Texto a convertir
   * @param outputFileName - Nombre del archivo de salida
   * @returns Resultado en formato AudioResult
   */
  async generateAudioLegacy(
    text: string,
    outputFileName: string = 'narration.mp3'
  ): Promise<AudioResult> {
    const response = await this.generateAudio({ text, outputFileName });

    // Generar subtitulos palabra por palabra
    const words = text.split(/\s+/);
    const durationInFrames = Math.ceil(response.durationSeconds * 30); // 30 fps
    const subtitles = this.generateWordTimings(words, durationInFrames);

    return {
      audioPath: response.audioPath,
      durationInSeconds: response.durationSeconds,
      durationInFrames,
      subtitles,
    };
  }

  /**
   * Verifica el estado de la cuota mensual
   */
  async getQuotaStatus(): Promise<TTSQuotaStatus> {
    const quota = this.loadQuota();
    const { freeTierLimits } = TTS_CONFIG.elevenlabs;

    const remaining = Math.max(0, freeTierLimits.monthlyCharacters - quota.used);
    const percentageUsed =
      (quota.used / freeTierLimits.monthlyCharacters) * 100;

    return {
      used: quota.used,
      limit: freeTierLimits.monthlyCharacters,
      remaining,
      percentageUsed,
      nearLimit: quota.used >= freeTierLimits.warningThreshold,
      exceeded: quota.used >= freeTierLimits.monthlyCharacters,
      lastReset: quota.lastReset,
    };
  }

  /**
   * Resetea la cuota mensual (llamar al inicio de cada mes)
   */
  async resetMonthlyQuota(): Promise<void> {
    this.saveQuota({ used: 0, lastReset: new Date().toISOString() });
    logger.info(`[TTS] Cuota mensual reseteada`);
  }

  /**
   * Limpia el cache de audio
   */
  async clearCache(): Promise<number> {
    if (!fs.existsSync(this.cacheIndexPath)) {
      return 0;
    }

    const index = this.loadCacheIndex();
    const entries = Object.keys(index);

    // Eliminar archivos
    for (const entry of Object.values(index)) {
      if (fs.existsSync(entry.audioPath)) {
        fs.unlinkSync(entry.audioPath);
      }
    }

    // Limpiar indice
    fs.writeFileSync(this.cacheIndexPath, JSON.stringify({}, null, 2));

    logger.info(`[TTS] Cache limpiado: ${entries.length} archivos eliminados`);
    return entries.length;
  }

  // ===========================================================================
  // METODOS PRIVADOS - GENERACION
  // ===========================================================================

  /**
   * Genera audio usando ElevenLabs API
   */
  private async generateWithElevenLabs(
    text: string,
    textHash: string,
    outputFileName?: string
  ): Promise<TTSResponse> {
    const apiKey = config.api.elevenLabsApiKey;
    const { elevenlabs } = TTS_CONFIG;
    const url = getElevenLabsTTSUrl();

    logger.info(`[TTS] Llamando a ElevenLabs API...`);

    const response = await axios.post(
      url,
      {
        text,
        model_id: elevenlabs.modelId,
        voice_settings: elevenlabs.voiceSettings,
      },
      {
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        responseType: 'arraybuffer',
        params: {
          output_format: elevenlabs.outputFormat,
        },
        timeout: 60000, // 60 segundos timeout
      }
    );

    // Guardar audio
    const fileName = outputFileName || `${textHash}.mp3`;
    const audioPath = path.join(this.cachePath, fileName);
    fs.writeFileSync(audioPath, Buffer.from(response.data));

    // Obtener duracion
    const durationSeconds = await this.getAudioDuration(audioPath);

    logger.success(
      `[TTS] Audio generado (${durationSeconds.toFixed(1)}s) -> ${audioPath}`
    );

    return {
      audioPath,
      durationSeconds,
      provider: 'elevenlabs',
      fromCache: false,
      charactersUsed: text.length,
      metadata: {
        voiceId: elevenlabs.voiceId,
        modelId: elevenlabs.modelId,
        generatedAt: new Date().toISOString(),
        textHash,
      },
    };
  }

  /**
   * Genera audio usando Edge-TTS (fallback gratuito)
   */
  private async generateWithFallback(
    text: string,
    textHash: string,
    outputFileName?: string
  ): Promise<TTSResponse> {
    const { edgeTts } = TTS_CONFIG.fallback;
    const fileName = outputFileName || `${textHash}.mp3`;
    const audioPath = path.join(this.cachePath, fileName);

    logger.info(`[TTS] Generando con Edge-TTS (fallback)...`);

    // Escapar texto para linea de comandos
    const escapedText = text
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    // Edge-TTS command
    const command = `edge-tts --voice "${edgeTts.voice}" --rate "${edgeTts.rate}" --pitch "${edgeTts.pitch}" --text "${escapedText}" --write-media "${audioPath}"`;

    try {
      await execAsync(command, { timeout: 120000 });
    } catch (error) {
      // Intentar instalar edge-tts si no existe
      const errorMsg = error instanceof Error ? error.message : String(error);

      if (
        errorMsg.includes('not found') ||
        errorMsg.includes('not recognized')
      ) {
        logger.warn(`[TTS] edge-tts no instalado, instalando...`);
        try {
          await execAsync('pip install edge-tts');
          await execAsync(command, { timeout: 120000 });
        } catch (installError) {
          throw new Error(
            `No se pudo instalar edge-tts: ${installError}. ` +
              `Instala manualmente con: pip install edge-tts`
          );
        }
      } else {
        throw error;
      }
    }

    const durationSeconds = await this.getAudioDuration(audioPath);

    logger.success(`[TTS] Audio fallback generado (${durationSeconds.toFixed(1)}s)`);

    const response: TTSResponse = {
      audioPath,
      durationSeconds,
      provider: 'edge-tts',
      fromCache: false,
      charactersUsed: 0, // Fallback no consume cuota ElevenLabs
      metadata: {
        voiceId: edgeTts.voice,
        modelId: 'edge-tts',
        generatedAt: new Date().toISOString(),
        textHash,
      },
    };

    await this.saveToCache(textHash, response);
    return response;
  }

  // ===========================================================================
  // METODOS PRIVADOS - CACHE
  // ===========================================================================

  private async checkCache(textHash: string): Promise<TTSResponse | null> {
    if (!fs.existsSync(this.cacheIndexPath)) {
      return null;
    }

    const index = this.loadCacheIndex();
    const entry = index[textHash];

    if (!entry || !fs.existsSync(entry.audioPath)) {
      return null;
    }

    // Verificar TTL
    const age = Date.now() - new Date(entry.createdAt).getTime();
    const maxAge = TTS_CONFIG.cache.ttlDays * 24 * 60 * 60 * 1000;

    if (age > maxAge) {
      delete index[textHash];
      this.saveCacheIndex(index);
      return null;
    }

    return {
      audioPath: entry.audioPath,
      durationSeconds: entry.durationSeconds,
      provider: entry.provider as 'elevenlabs' | 'edge-tts',
      fromCache: true,
      charactersUsed: 0,
      metadata: {
        voiceId: '',
        modelId: '',
        generatedAt: entry.createdAt,
        textHash,
      },
    };
  }

  private async saveToCache(
    textHash: string,
    response: TTSResponse
  ): Promise<void> {
    const index = this.loadCacheIndex();

    index[textHash] = {
      textHash,
      audioPath: response.audioPath,
      createdAt: new Date().toISOString(),
      durationSeconds: response.durationSeconds,
      provider: response.provider,
      textLength: response.charactersUsed,
    };

    this.saveCacheIndex(index);
  }

  private loadCacheIndex(): AudioCacheIndex {
    if (!fs.existsSync(this.cacheIndexPath)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(this.cacheIndexPath, 'utf-8'));
  }

  private saveCacheIndex(index: AudioCacheIndex): void {
    fs.writeFileSync(this.cacheIndexPath, JSON.stringify(index, null, 2));
  }

  // ===========================================================================
  // METODOS PRIVADOS - CUOTA
  // ===========================================================================

  private loadQuota(): TTSQuotaData {
    if (!fs.existsSync(this.quotaPath)) {
      return { used: 0, lastReset: new Date().toISOString() };
    }

    const quota = JSON.parse(fs.readFileSync(this.quotaPath, 'utf-8'));

    // Auto-reset si cambio el mes
    const lastReset = new Date(quota.lastReset);
    const now = new Date();

    if (
      lastReset.getMonth() !== now.getMonth() ||
      lastReset.getFullYear() !== now.getFullYear()
    ) {
      const newQuota = { used: 0, lastReset: now.toISOString() };
      this.saveQuota(newQuota);
      logger.info(`[TTS] Cuota auto-reseteada por cambio de mes`);
      return newQuota;
    }

    return quota;
  }

  private saveQuota(quota: TTSQuotaData): void {
    const dir = path.dirname(this.quotaPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.quotaPath, JSON.stringify(quota, null, 2));
  }

  private async updateQuota(charactersUsed: number): Promise<void> {
    const quota = this.loadQuota();
    quota.used += charactersUsed;
    this.saveQuota(quota);

    logger.info(
      `[TTS] Cuota actualizada: ${quota.used}/${TTS_CONFIG.elevenlabs.freeTierLimits.monthlyCharacters} chars`
    );
  }

  // ===========================================================================
  // METODOS PRIVADOS - UTILIDADES
  // ===========================================================================

  private generateHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  private ensureDirectories(): void {
    const dirs = [this.cachePath, path.dirname(this.quotaPath)];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async getAudioDuration(audioPath: string): Promise<number> {
    try {
      // Usar ffprobe para obtener duracion exacta
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
      );
      return parseFloat(stdout.trim());
    } catch {
      // Fallback: estimar por tamano de archivo
      const stats = fs.statSync(audioPath);
      // MP3 128kbps ≈ 16KB/segundo
      return stats.size / (16 * 1024);
    }
  }

  private generateWordTimings(
    words: string[],
    totalFrames: number
  ): WordTiming[] {
    const framesPerWord = totalFrames / words.length;

    return words.map((word, index) => ({
      word,
      startFrame: Math.floor(index * framesPerWord),
      endFrame: Math.floor((index + 1) * framesPerWord),
    }));
  }
}

// =============================================================================
// SINGLETON Y EXPORTS
// =============================================================================

/**
 * Instancia singleton del servicio TTS
 */
export const ttsService = new TTSService();

/**
 * Funcion de conveniencia para generar audio
 */
export async function generateTTSAudio(
  text: string,
  options?: Partial<TTSRequest>
): Promise<TTSResponse> {
  return ttsService.generateAudio({ text, ...options });
}

export default TTSService;
