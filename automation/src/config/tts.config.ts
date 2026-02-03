/**
 * @fileoverview Configuracion centralizada para Text-to-Speech
 * @description Configuracion anti-hardcode para ElevenLabs TTS
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 16 - ElevenLabs TTS Integration
 */

// =============================================================================
// ELEVENLABS VOICE ID MAPPING
// =============================================================================

/**
 * Mapeo de nombres amigables a voice IDs de ElevenLabs
 * Permite usar ELEVENLABS_VOICE_ID=adam en lugar del ID alfanumérico
 *
 * Lista completa de voces: https://elevenlabs.io/docs/voices/premade-voices
 */
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  // Voces masculinas
  adam: 'pNInz6obpgDQGcFmaJgB',
  josh: 'a38v0NaUbsvackET0tSL', // Josh - energetic
  arnold: 'VR6AewLTigWG4xSOukaG',
  sam: 'yoZ06aMxZJJ28mfd3POQ',
  daniel: 'onwK4e9ZLuTAKqWW03F9',
  charlie: 'IKne3meq5aSn9XLyUdCD',
  james: 'ZQe5CZNOzWyzPSCn5a3c',
  ethan: 'g5CIjZEefAph4nQFvHAz',
  clyde: '2EiwWnXFnvU5JabPnv8n',
  // Voces femeninas
  bella: 'EXAVITQu4vr4xnSDxMaL',
  rachel: '21m00Tcm4TlvDq8ikWAM',
  domi: 'AZnzlk1XvdvUeBnXmlld',
  elli: 'MF3mGyEYCl7XYWbV9V6O',
  emily: 'LcfcDJNUP1GQjkzn1xUU',
  grace: 'oWAxZDx7w5VEj9dCyTzz',
  charlotte: 'XB0fDUnXU5powFXDhCwa',
  matilda: 'XrExE9yKIg1WjnnlVkGX',
  serena: 'pMsXgVXv3BLzUgSXRplE',
  // Voces narración
  bill: 'pqHfZKP75CvOlQylNhV4',
  george: 'JBFqnCBsd6RMkjVDRZzb',
  callum: 'N2lVS1w4EtoT3dr4eOWO',
  liam: 'TX3LPaxmHKxFdv7VOQHJ',
  will: 'bIHbv24MWmeRgasZH58o',
};

/**
 * Resuelve un voice ID de ElevenLabs
 * Acepta tanto nombres amigables (adam, josh) como IDs directos
 */
function resolveVoiceId(input: string): string {
  const lower = input.toLowerCase();
  return ELEVENLABS_VOICE_MAP[lower] || input;
}

// =============================================================================
// CONFIGURACION TTS
// =============================================================================

/**
 * Configuracion completa del servicio TTS
 *
 * Incluye:
 * - ElevenLabs como proveedor principal
 * - Edge-TTS como fallback gratuito
 * - Sistema de cache para optimizar cuota
 * - Gestion de limites del free tier
 */
export const TTS_CONFIG = {
  // Proveedor principal
  provider: 'elevenlabs' as const,

  // ElevenLabs Configuration
  elevenlabs: {
    // API Base URL
    baseUrl: 'https://api.elevenlabs.io/v1',

    // Modelo a usar (eleven_multilingual_v2 soporta espanol)
    modelId: 'eleven_multilingual_v2',

    // Voz seleccionada (Josh - slow, natural, calm)
    // NOTA: Acepta nombres amigables (adam, josh) o IDs directos
    voiceId: resolveVoiceId(process.env.ELEVENLABS_VOICE_ID || 'josh'), // Josh default

    // Voice settings para tono profesional de noticias
    voiceSettings: {
      stability: 0.5, // Balance entre variacion y consistencia
      similarity_boost: 0.75, // Que tanto se parece a la voz original
      style: 0.0, // Estilo neutral
      use_speaker_boost: true,
    },

    // Output format
    outputFormat: 'mp3_44100_128', // Alta calidad para YouTube

    // Free tier limits
    freeTierLimits: {
      monthlyCharacters: 10000,
      warningThreshold: 8000, // Avisar al 80%
    },
  },

  // Cache configuration
  cache: {
    enabled: true,
    directory: 'cache/audio',
    maxSizeMB: 500,
    ttlDays: 30,
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },

  // Fallback configuration (Edge-TTS como backup gratuito)
  fallback: {
    enabled: true,
    provider: 'edge-tts' as const,
    edgeTts: {
      voice: 'es-MX-JorgeNeural', // Voz masculina mexicana natural
      rate: '+0%',
      pitch: '+0Hz',
    },
  },
} as const;

// =============================================================================
// TIPOS DERIVADOS
// =============================================================================

export type TTSProvider = typeof TTS_CONFIG.provider | typeof TTS_CONFIG.fallback.provider;

export type ElevenLabsVoiceSettings = typeof TTS_CONFIG.elevenlabs.voiceSettings;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Obtiene la URL completa para text-to-speech
 */
export function getElevenLabsTTSUrl(voiceId?: string): string {
  const vid = voiceId || TTS_CONFIG.elevenlabs.voiceId;
  return `${TTS_CONFIG.elevenlabs.baseUrl}/text-to-speech/${vid}`;
}

/**
 * Verifica si estamos cerca del limite de cuota
 */
export function isNearQuotaLimit(usedCharacters: number): boolean {
  return usedCharacters >= TTS_CONFIG.elevenlabs.freeTierLimits.warningThreshold;
}

/**
 * Verifica si excedimos la cuota
 */
export function isQuotaExceeded(usedCharacters: number): boolean {
  return usedCharacters >= TTS_CONFIG.elevenlabs.freeTierLimits.monthlyCharacters;
}
