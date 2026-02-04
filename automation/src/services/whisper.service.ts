/**
 * @fileoverview Whisper Service - Prompt 19.7
 *
 * Transcribe audio y genera timestamps precisos por palabra.
 * Usa OpenAI Whisper API para obtener timing real del audio,
 * permitiendo sincronización precisa entre texto y voz.
 *
 * Características:
 * - Transcripción con timestamps por palabra
 * - Agrupación automática en frases (~60 chars)
 * - Fallback graceful si OPENAI_API_KEY no está definida
 * - Logging detallado para debugging
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19.7
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import { logger } from '../../utils/logger';
import type { WordTimestamp, PhraseTimestamp } from '../types/tts.types';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/** Modelo de Whisper a usar (whisper-1 es el único disponible actualmente) */
const WHISPER_MODEL = 'whisper-1';

/** Máximo de caracteres por frase (debe coincidir con text-splitter) */
const CHARS_PER_PHRASE = 60;

/** Idioma del audio (español) */
const AUDIO_LANGUAGE = 'es';

// =============================================================================
// TIPOS INTERNOS
// =============================================================================

/**
 * Respuesta de Whisper con formato verbose_json
 * Incluye timestamps por palabra
 */
interface WhisperVerboseResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

// =============================================================================
// SERVICIO
// =============================================================================

/**
 * Servicio de transcripción usando OpenAI Whisper API
 *
 * Genera timestamps precisos por palabra para sincronizar
 * el texto mostrado en pantalla con el audio de narración.
 *
 * @example
 * ```typescript
 * const whisper = new WhisperService();
 *
 * if (whisper.isAvailable()) {
 *   const words = await whisper.transcribe('./audio.mp3');
 *   const phrases = whisper.groupIntoPhrases(words);
 *   console.log(phrases[0].startSeconds); // 0.0
 * }
 * ```
 */
export class WhisperService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey !== 'ci-test-mock-key') {
      this.client = new OpenAI({ apiKey });
      logger.info('[WhisperService] Inicializado con OpenAI API');
    } else {
      logger.warn('[WhisperService] OPENAI_API_KEY no definida - timestamps deshabilitados');
      logger.info('[WhisperService] Para habilitar timestamps precisos, configura OPENAI_API_KEY en .env');
    }
  }

  /**
   * Verifica si el servicio está disponible
   *
   * @returns true si OPENAI_API_KEY está configurada
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Transcribe un archivo de audio y retorna timestamps por palabra
   *
   * Usa Whisper API con response_format='verbose_json' y
   * timestamp_granularities=['word'] para obtener timing preciso.
   *
   * @param audioPath - Path absoluto al archivo MP3
   * @returns Array de timestamps por palabra, o null si falla
   *
   * @example
   * ```typescript
   * const words = await whisperService.transcribe('./narration.mp3');
   * // words = [{ word: 'Hola', startSeconds: 0.0, endSeconds: 0.4 }, ...]
   * ```
   */
  async transcribe(audioPath: string): Promise<WordTimestamp[] | null> {
    if (!this.client) {
      logger.warn('[WhisperService] Cliente no disponible - retornando null');
      return null;
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(audioPath)) {
      logger.error(`[WhisperService] Archivo no encontrado: ${audioPath}`);
      return null;
    }

    try {
      logger.info(`[WhisperService] Transcribiendo: ${audioPath}`);
      const startTime = Date.now();

      // Crear stream del archivo de audio
      const audioFile = fs.createReadStream(audioPath);

      // Llamar a Whisper API con timestamps por palabra
      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: WHISPER_MODEL,
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
        language: AUDIO_LANGUAGE,
      }) as unknown as WhisperVerboseResponse;

      const elapsed = Date.now() - startTime;
      logger.info(`[WhisperService] Transcripción completada en ${elapsed}ms`);

      // Verificar que obtuvimos timestamps
      if (!response.words || response.words.length === 0) {
        logger.warn('[WhisperService] No se obtuvieron timestamps de palabras');
        logger.info(`[WhisperService] Texto transcrito: "${response.text?.substring(0, 100)}..."`);
        return null;
      }

      // Convertir a nuestro formato
      const wordTimestamps: WordTimestamp[] = response.words.map((w) => ({
        word: w.word.trim(),
        startSeconds: w.start,
        endSeconds: w.end,
      }));

      logger.info(`[WhisperService] Transcrito: ${wordTimestamps.length} palabras en ${response.duration?.toFixed(1)}s de audio`);

      // Log de muestra para debugging
      if (wordTimestamps.length > 0) {
        const sample = wordTimestamps.slice(0, 3).map(w => `"${w.word}" (${w.startSeconds.toFixed(2)}s)`).join(', ');
        logger.debug(`[WhisperService] Muestra: ${sample}...`);
      }

      return wordTimestamps;

    } catch (error) {
      logger.error(`[WhisperService] Error transcribiendo: ${error}`);

      // Log más detallado del error
      if (error instanceof Error) {
        logger.error(`[WhisperService] Mensaje: ${error.message}`);
        if ('status' in error) {
          logger.error(`[WhisperService] Status: ${(error as Record<string, unknown>).status}`);
        }
      }

      return null;
    }
  }

  /**
   * Agrupa timestamps de palabras en frases de ~60 caracteres
   *
   * Respeta el límite de caracteres por frase definido en text-splitter
   * para mantener consistencia con el texto mostrado en ContentScene.
   *
   * @param wordTimestamps - Array de timestamps de palabras individuales
   * @returns Array de timestamps de frases
   *
   * @example
   * ```typescript
   * const words = await whisperService.transcribe('./audio.mp3');
   * const phrases = whisperService.groupIntoPhrases(words);
   * // phrases = [{ text: 'Primera frase...', startSeconds: 0.0, endSeconds: 3.5, words: [...] }]
   * ```
   */
  groupIntoPhrases(wordTimestamps: WordTimestamp[]): PhraseTimestamp[] {
    if (!wordTimestamps || wordTimestamps.length === 0) {
      return [];
    }

    const phrases: PhraseTimestamp[] = [];
    let currentPhrase: WordTimestamp[] = [];
    let currentCharCount = 0;

    for (const word of wordTimestamps) {
      const wordLength = word.word.length + 1; // +1 por espacio entre palabras

      // Si agregar esta palabra excede el límite y ya tenemos palabras, cerrar frase
      if (currentCharCount + wordLength > CHARS_PER_PHRASE && currentPhrase.length > 0) {
        phrases.push(this.createPhraseTimestamp(currentPhrase));
        currentPhrase = [];
        currentCharCount = 0;
      }

      currentPhrase.push(word);
      currentCharCount += wordLength;
    }

    // Agregar última frase si tiene palabras
    if (currentPhrase.length > 0) {
      phrases.push(this.createPhraseTimestamp(currentPhrase));
    }

    logger.info(`[WhisperService] Agrupado en ${phrases.length} frases`);

    // Log de duración de frases para debugging
    if (phrases.length > 0) {
      const durations = phrases.map(p => (p.endSeconds - p.startSeconds).toFixed(1) + 's');
      logger.debug(`[WhisperService] Duraciones de frases: ${durations.join(', ')}`);
    }

    return phrases;
  }

  /**
   * Crea un PhraseTimestamp a partir de un array de palabras
   *
   * @param words - Array de palabras que forman la frase
   * @returns Timestamp de la frase completa
   */
  private createPhraseTimestamp(words: WordTimestamp[]): PhraseTimestamp {
    return {
      text: words.map(w => w.word).join(' '),
      startSeconds: words[0].startSeconds,
      endSeconds: words[words.length - 1].endSeconds,
      words: [...words], // Copia para evitar mutaciones
    };
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

/**
 * Instancia singleton del servicio Whisper
 *
 * Usar esta instancia para evitar crear múltiples clientes de OpenAI.
 *
 * @example
 * ```typescript
 * import { whisperService } from './whisper.service';
 *
 * if (whisperService.isAvailable()) {
 *   const timestamps = await whisperService.transcribe(audioPath);
 * }
 * ```
 */
export const whisperService = new WhisperService();

export default WhisperService;
