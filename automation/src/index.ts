// ===================================
// ORQUESTADOR PRINCIPAL - Sintaxis IA
// ===================================

import { fetchAINews, selectBestArticle } from './newsAPI';
import { generateScript } from './scriptGen';
import { generateAudio } from './audioGen';
import { createVideoData, saveVideoData } from './dataContract';
import { getWorkingModel, getCurrentModel } from './modelValidator';
import { logger } from '../utils/logger';

/**
 * Pipeline principal de generación de contenido
 * 1. Validar modelo de Gemini disponible
 * 2. Obtener noticias de IA
 * 3. Seleccionar la mejor noticia
 * 4. Generar guión con Gemini
 * 5. Generar audio con ElevenLabs
 * 6. Crear data.json para Remotion
 */
async function main(): Promise<void> {
  logger.header('SINTAXIS IA - Generador de Shorts');
  logger.info('Iniciando pipeline de generación...\n');

  try {
    // Paso 0: Validar y seleccionar mejor modelo de Gemini
    logger.step(0, 6, 'Validando modelo de Gemini');
    await getWorkingModel();
    const activeModel = getCurrentModel();
    logger.success(`Modelo activo: ${activeModel}\n`);

    // Paso 1: Obtener noticias
    logger.step(1, 6, 'Obteniendo noticias de IA');
    const articles = await fetchAINews(5);

    // Paso 2: Seleccionar mejor artículo
    logger.step(2, 6, 'Seleccionando mejor noticia');
    const bestArticle = selectBestArticle(articles);

    if (!bestArticle) {
      throw new Error('No se encontraron noticias válidas');
    }

    // Paso 3: Generar guión
    logger.step(3, 6, 'Generando guión con Gemini');
    const script = await generateScript(bestArticle);

    // Paso 4: Generar audio
    logger.step(4, 6, 'Generando audio con ElevenLabs');
    const audio = await generateAudio(script.fullScript, `news_${Date.now()}.mp3`);

    // Paso 5: Crear y guardar datos
    logger.step(5, 6, 'Guardando datos para Remotion');
    const videoData = createVideoData(bestArticle, script, audio);
    const dataPath = saveVideoData(videoData);

    // Resumen final
    logger.header('GENERACIÓN COMPLETADA');
    logger.success(`Modelo usado: ${activeModel}`);
    logger.success(`Headline: "${script.headline}"`);
    logger.success(`Audio: ${audio.durationInSeconds.toFixed(1)}s (${audio.durationInFrames} frames)`);
    logger.success(`Datos: ${dataPath}`);
    logger.info('\nEjecuta "npm run dev" en remotion-app para previsualizar');
    logger.info('Ejecuta "npm run render" para renderizar el video final');

  } catch (error) {
    logger.error(`Error en el pipeline: ${error}`);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
main();

export default main;
