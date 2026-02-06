/**
 * Genera un audio bed ambient estilo "breaking news" para HeroScene
 *
 * Crea un loop de 8 segundos con tonos graves suaves que dan
 * sensación de "algo importante está por decirse".
 *
 * Uso: node scripts/generate-news-bed.js
 * Output: remotion-app/public/audio/news-bed.wav
 */

const fs = require('fs');
const path = require('path');

// Configuración del audio
const SAMPLE_RATE = 44100;
const DURATION_SECONDS = 8; // Loop de 8s (duración de HeroScene)
const NUM_CHANNELS = 1; // Mono
const BITS_PER_SAMPLE = 16;

const totalSamples = SAMPLE_RATE * DURATION_SECONDS;

// Generar samples de audio
const samples = new Int16Array(totalSamples);

for (let i = 0; i < totalSamples; i++) {
  const t = i / SAMPLE_RATE; // Tiempo en segundos
  const progress = i / totalSamples; // 0.0 - 1.0

  // Mezcla de tonos graves para sensación "news/urgente"
  // Tono base grave (80 Hz) - fundamento
  const bass = Math.sin(2 * Math.PI * 80 * t) * 0.3;

  // Tono medio-bajo (160 Hz) - cuerpo
  const mid = Math.sin(2 * Math.PI * 160 * t) * 0.15;

  // Tono sutil armónico (240 Hz) - brillo
  const harmonic = Math.sin(2 * Math.PI * 240 * t) * 0.08;

  // Pulso lento (cada 2s) para sensación de "latido/urgencia"
  const pulse = (Math.sin(2 * Math.PI * 0.5 * t) * 0.5 + 0.5) * 0.15;

  // Sub-bass muy grave (40 Hz) con pulsación
  const subBass = Math.sin(2 * Math.PI * 40 * t) * pulse;

  // Mezcla final
  let sample = bass + mid + harmonic + subBass;

  // Fade in (0.5s) y fade out (0.5s) para loop limpio
  const fadeIn = Math.min(1, t / 0.5);
  const fadeOut = Math.min(1, (DURATION_SECONDS - t) / 0.5);
  sample *= fadeIn * fadeOut;

  // Normalizar a volumen moderado (no muy alto, es background)
  sample *= 0.6;

  // Convertir a Int16
  samples[i] = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
}

// Crear WAV file
const dataSize = totalSamples * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
const headerSize = 44;
const buffer = Buffer.alloc(headerSize + dataSize);

// WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // PCM format chunk size
buffer.writeUInt16LE(1, 20); // PCM format
buffer.writeUInt16LE(NUM_CHANNELS, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 28);
buffer.writeUInt16LE(NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 32);
buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Escribir samples
for (let i = 0; i < totalSamples; i++) {
  buffer.writeInt16LE(samples[i], headerSize + i * 2);
}

// Guardar archivo
const outputPath = path.join(__dirname, '../remotion-app/public/audio/news-bed.wav');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buffer);

const fileSizeKB = (buffer.length / 1024).toFixed(1);
console.log(`Audio bed generado: ${outputPath}`);
console.log(`Duracion: ${DURATION_SECONDS}s | Sample rate: ${SAMPLE_RATE}Hz | Size: ${fileSizeKB}KB`);
console.log('Tonos: 40Hz (sub-bass) + 80Hz (bass) + 160Hz (mid) + 240Hz (harmonic)');
console.log('Efecto: pulso lento cada 2s + fade in/out para loop limpio');
