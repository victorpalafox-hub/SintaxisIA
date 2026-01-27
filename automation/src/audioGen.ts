// ===================================
// AUDIO GENERATOR - Generar voz con ElevenLabs
// ===================================

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { logger } from '../utils/logger';

// Configuración de ElevenLabs
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Mapeo de nombres de voz a IDs
const VOICE_IDS: Record<string, string> = {
  'adam': 'pNInz6obpgDQGcFmaJgB',
  'antoni': 'ErXwobaYiN019PkySvjV',
  'arnold': 'VR6AewLTigWG4xSOukaG',
  'bella': 'EXAVITQu4vr4xnSDxMaL',
  'domi': 'AZnzlk1XvdvUeBnXmlld',
  'elli': 'MF3mGyEYCl7XYWbV9V6O',
  'josh': 'TxGEqnHWrfWFTfGW9XjX',
  'rachel': '21m00Tcm4TlvDq8ikWAM',
  'sam': 'yoZ06aMxZJJ28mfd3POQ'
};

// Interfaz para subtítulos palabra por palabra
export interface WordTiming {
  word: string;
  startFrame: number;
  endFrame: number;
}

// Interfaz para el resultado del audio
export interface AudioResult {
  audioPath: string;
  durationInSeconds: number;
  durationInFrames: number;
  subtitles: WordTiming[];
}

/**
 * Obtiene el ID de la voz basado en el nombre
 */
function getVoiceId(voiceName: string): string {
  const id = VOICE_IDS[voiceName.toLowerCase()];
  if (!id) {
    logger.warn(`Voz "${voiceName}" no encontrada, usando Adam por defecto`);
    return VOICE_IDS['adam'];
  }
  return id;
}

/**
 * Genera audio con ElevenLabs TTS
 * @param text - Texto a convertir en voz
 * @param outputFileName - Nombre del archivo de salida
 * @returns Información del audio generado
 */
export async function generateAudio(
  text: string,
  outputFileName: string = 'narration.mp3'
): Promise<AudioResult> {
  logger.info('Generando audio con ElevenLabs...');

  const voiceId = getVoiceId(config.api.elevenLabsVoiceId);
  const outputDir = path.resolve(__dirname, '../../remotion-app/public/assets/audio');
  const outputPath = path.join(outputDir, outputFileName);

  // Asegurar que el directorio existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Generar audio
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': config.api.elevenLabsApiKey
        },
        responseType: 'arraybuffer'
      }
    );

    // Guardar archivo de audio
    fs.writeFileSync(outputPath, Buffer.from(response.data));
    logger.success(`Audio guardado en: ${outputPath}`);

    // TODO: Implementar análisis de audio para obtener duración real
    // Por ahora, estimamos basándonos en el texto
    const wordsPerSecond = 2.5; // Velocidad promedio de habla
    const words = text.split(/\s+/);
    const estimatedDuration = words.length / wordsPerSecond;
    const durationInFrames = Math.ceil(estimatedDuration * 30); // 30 fps

    // Generar subtítulos palabra por palabra (estimados)
    const subtitles = generateWordTimings(words, durationInFrames);

    return {
      audioPath: `./public/assets/audio/${outputFileName}`,
      durationInSeconds: estimatedDuration,
      durationInFrames,
      subtitles
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`Error de ElevenLabs: ${error.response?.data || error.message}`);
    } else {
      logger.error(`Error inesperado: ${error}`);
    }
    throw error;
  }
}

/**
 * Genera timings estimados para cada palabra
 * TODO: Usar Whisper o API de transcripción para timings precisos
 */
function generateWordTimings(words: string[], totalFrames: number): WordTiming[] {
  const framesPerWord = totalFrames / words.length;

  return words.map((word, index) => ({
    word,
    startFrame: Math.floor(index * framesPerWord),
    endFrame: Math.floor((index + 1) * framesPerWord)
  }));
}

export default { generateAudio };
