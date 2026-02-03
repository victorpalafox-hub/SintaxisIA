/**
 * @fileoverview Orchestrator - Coordinador Maestro del Pipeline
 *
 * Orquesta todo el proceso de generación de videos:
 * 1. Verificar calendario (cada 2 días)
 * 2. Recolectar noticias
 * 3. Rankear por score
 * 4. Seleccionar top 1
 * 5. Generar script (Gemini + Alex Torres)
 * 6. Buscar imágenes (multi-provider)
 * 7. Generar audio (ElevenLabs/Edge-TTS)
 * 8. Renderizar video (Remotion - REAL desde Prompt 19)
 * 8.5. Guardar outputs organizados (Prompt 19)
 * 9. Enviar notificaciones (email + Telegram)
 * 10. Esperar aprobación manual
 * 11. Publicar (YouTube)
 *
 * @example
 * ```typescript
 * import { runPipeline } from './orchestrator';
 *
 * // Dry run real: genera video pero no publica
 * const result = await runPipeline({ dryReal: true, forceRun: true });
 * console.log(result.outputSummary?.outputFolder);
 * ```
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 14, actualizado Prompt 19
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  shouldPublishToday,
  getDaysUntilNextPublication,
  updateLastPublished,
  getPreferredDaysFormatted,
} from './config/publication-calendar';
import {
  validateEnvConfigPermissive,
  initializeStorage,
  STORAGE_CONFIG,
  areNotificationsEnabled,
} from './config/env.config';
import { selectTopNews } from './news-scorer';
import { searchImagesV2 } from './image-searcher-v2';
import { ScriptGenerator } from './scriptGen';
import { SceneSegmenterService } from './services/scene-segmenter.service';
import { ImageOrchestrationService } from './services/image-orchestration.service';
import { ttsService } from './services/tts.service';
import { notifyVideoReady, notifyPipelineError } from './notifiers';
import {
  OrchestratorConfig,
  PipelineResult,
  PipelineStep,
  PipelineStepName,
  VideoMetadata,
  OutputSummary,
} from './types/orchestrator.types';
import { NewsItem } from './types/news.types';
import { ImageSearchResult, DynamicImagesResult } from './types/image.types';
import { NewsScore } from './types/scoring.types';
import { GeneratedScript } from './types/script.types';
import { videoRenderingService } from './services/video-rendering.service';
import { outputManager, OutputData } from './services/output-manager.service';

// =============================================================================
// CONFIGURACIÓN POR DEFECTO
// =============================================================================

/**
 * Configuración por defecto del orchestrator
 */
const DEFAULT_CONFIG: OrchestratorConfig = {
  mode: 'development',
  requireManualApproval: true,
  dryRun: false,
  dryReal: false,
  maxNewsToFetch: 50,
  forceRun: false,
};

// =============================================================================
// FUNCIÓN PRINCIPAL DEL PIPELINE
// =============================================================================

/**
 * Ejecuta pipeline completo de generación de video
 *
 * Coordina todos los pasos desde recolección de noticias
 * hasta generación del video final.
 *
 * @param config - Configuración del orchestrator (parcial, se mergea con defaults)
 * @returns Resultado del pipeline con video path o error
 *
 * @example
 * ```typescript
 * // Ejecución normal
 * const result = await runPipeline();
 *
 * // Dry run (sin publicar)
 * const result = await runPipeline({ dryRun: true });
 *
 * // Forzar aunque no sea día de publicación
 * const result = await runPipeline({ forceRun: true });
 * ```
 */
export async function runPipeline(
  config: Partial<OrchestratorConfig> = {}
): Promise<PipelineResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = new Date();

  // Header del pipeline
  printHeader(finalConfig);

  // Validar configuración de notificaciones (permisivo - solo warnings)
  console.log('🔐 Validando configuración...');
  const notificationsEnabled = validateEnvConfigPermissive();
  initializeStorage();
  console.log(`   Notificaciones: ${notificationsEnabled ? '✅ Habilitadas' : '⚠️  Deshabilitadas'}`);
  console.log('');

  const steps: PipelineStep[] = [];
  const result: PipelineResult = {
    success: false,
    steps,
    metadata: {} as VideoMetadata,
    startedAt: startTime,
  };

  // Variable para almacenar videoId generado
  let generatedVideoId: string | undefined;

  try {
    // ==========================================
    // PASO 1: VERIFICAR CALENDARIO
    // ==========================================
    const scheduleStep = await executeStep('check_schedule', steps, async () => {
      console.log('📅 PASO 1: Verificando calendario...');

      const shouldPublish = shouldPublishToday();
      const daysUntil = getDaysUntilNextPublication();
      const preferredDays = getPreferredDaysFormatted();

      console.log(`   ¿Publicar hoy?: ${shouldPublish ? 'Sí ✅' : 'No ❌'}`);
      console.log(`   Días preferidos: ${preferredDays}`);
      console.log(`   Días hasta próxima publicación: ${daysUntil}`);

      // Permitir ejecución si es día de publicación, dry run o force
      if (!shouldPublish && !finalConfig.dryRun && !finalConfig.forceRun) {
        throw new Error(
          `Hoy no es día de publicación. Próxima publicación en ${daysUntil} días. ` +
          `Use --dry o --force para ejecutar de todos modos.`
        );
      }

      if (finalConfig.forceRun && !shouldPublish) {
        console.log('   ⚠️  Ejecución forzada (--force)');
      }

      return { shouldPublish, daysUntil };
    });

    // ==========================================
    // PASO 2: RECOLECTAR NOTICIAS
    // ==========================================
    const newsStep = await executeStep('collect_news', steps, async () => {
      console.log('📰 PASO 2: Recolectando noticias...');

      // TODO: Implementar en Prompt 15 con NewsData.io API
      // const news = await collectNews({ hoursBack: 48 });

      // Mock por ahora - noticias de ejemplo
      const mockNews: NewsItem[] = getMockNews();

      console.log(`   ✅ ${mockNews.length} noticias recolectadas (mock)`);
      return mockNews;
    });

    // ==========================================
    // PASO 3: RANKEAR Y SELECCIONAR TOP
    // ==========================================
    const topNewsStep = await executeStep('select_top', steps, async () => {
      console.log('🎯 PASO 3: Rankeando y seleccionando top noticia...');

      const newsItems = newsStep.data as NewsItem[];
      const topResult = selectTopNews(newsItems);

      if (!topResult) {
        throw new Error('No hay noticias para procesar');
      }

      const { news, score } = topResult;

      console.log(`   🏆 Noticia seleccionada (Score: ${score.totalScore}):`);
      console.log(`      "${news.title}"`);
      console.log(`      Empresa: ${news.company || 'N/A'}`);
      console.log(`      Tipo: ${news.type || 'N/A'}`);
      console.log('');
      console.log('   📊 Desglose del score:');
      console.log(`      - Empresa: ${score.breakdown.companyRelevance} pts`);
      console.log(`      - Tipo: ${score.breakdown.newsType} pts`);
      console.log(`      - Engagement: ${score.breakdown.engagement} pts`);
      console.log(`      - Frescura: ${score.breakdown.freshness} pts`);
      console.log(`      - Impacto: ${score.breakdown.impact} pts`);

      return { news, score };
    });

    // ==========================================
    // PASO 4: GENERAR SCRIPT (Gemini API Real - Prompt 15)
    // ==========================================
    const scriptStep = await executeStep('generate_script', steps, async () => {
      console.log('📝 PASO 4: Generando script con Gemini API...');

      const { news } = topNewsStep.data as { news: NewsItem; score: NewsScore };

      // Usar ScriptGenerator real con validacion de compliance
      const scriptGenerator = new ScriptGenerator();
      const generatedScript = await scriptGenerator.generateScript(news);

      // Log de compliance info
      if (generatedScript.complianceReport) {
        console.log(`   📊 Compliance Score: ${generatedScript.complianceReport.humanScore}/6`);
        console.log(`   ${generatedScript.complianceReport.passed ? '✅' : '⚠️ '} Compliance: ${generatedScript.complianceReport.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}`);

        if (!generatedScript.complianceReport.passed) {
          console.log('   ⚠️  Script tiene warnings de compliance pero continua...');
          console.log(`   Issues: ${generatedScript.complianceReport.issues.slice(0, 2).join(', ')}`);
        }
      }

      // Construir script completo para TTS
      const fullScript = `${generatedScript.hook} ${generatedScript.body} ${generatedScript.opinion} ${generatedScript.cta}`;

      console.log(`   ✅ Script generado (${fullScript.length} caracteres)`);
      console.log(`   📝 Hook: "${generatedScript.hook.substring(0, 50)}..."`);

      return { generatedScript, fullScript };
    });

    // ==========================================
    // PASO 5: BUSCAR IMÁGENES DINÁMICAS POR SEGMENTO (Prompt 19.1)
    // ==========================================
    const imagesStep = await executeStep('search_images', steps, async () => {
      console.log('🖼️  PASO 5: Buscando imágenes dinámicas por segmento...');

      const { news } = topNewsStep.data as { news: NewsItem; score: NewsScore };
      const { generatedScript } = scriptStep.data as { generatedScript: GeneratedScript; fullScript: string };

      // Estimar duración basada en el script (usaremos ~55s por defecto)
      const estimatedDuration = generatedScript.duration || 55;

      // Segmentar script y extraer keywords
      const segmenter = new SceneSegmenterService();
      const segments = segmenter.segmentScript(generatedScript, estimatedDuration, news.company);

      console.log(`   📊 ${segments.length} segmentos creados`);

      // Buscar 1 imagen por segmento
      const imageOrchestrator = new ImageOrchestrationService();
      const dynamicImages = await imageOrchestrator.orchestrate(segments);

      console.log(`   ✅ Imágenes encontradas: ${dynamicImages.scenes.length}`);
      dynamicImages.scenes.forEach((scene, i) => {
        console.log(`      - Segmento ${i}: ${scene.source} (${scene.startSecond}-${scene.endSecond}s)`);
      });

      // Para mantener compatibilidad con código existente, también generamos formato legacy
      const legacyImages: ImageSearchResult = {
        hero: {
          url: dynamicImages.scenes[0]?.imageUrl || 'https://ui-avatars.com/api/?name=AI&size=400&background=00F0FF',
          source: (dynamicImages.scenes[0]?.source as 'clearbit' | 'logodev' | 'google' | 'unsplash' | 'ui-avatars') || 'ui-avatars',
          cached: false,
        },
        context: dynamicImages.scenes[1] ? {
          url: dynamicImages.scenes[1].imageUrl,
          source: (dynamicImages.scenes[1].source as 'google' | 'unsplash' | 'opengraph' | 'hero-duplicate') || 'google',
          cached: false,
        } : undefined,
      };

      return { dynamicImages, legacyImages };
    });

    // ==========================================
    // PASO 6: GENERAR AUDIO (ElevenLabs TTS - Prompt 16)
    // ==========================================
    const audioStep = await executeStep('generate_audio', steps, async () => {
      console.log('🎵 PASO 6: Generando audio TTS...');

      const { fullScript, generatedScript } = scriptStep.data as { generatedScript: GeneratedScript; fullScript: string };

      // Verificar cuota antes de generar
      const quotaStatus = await ttsService.getQuotaStatus();
      console.log(`   📊 Cuota TTS: ${quotaStatus.used}/${quotaStatus.limit} chars (${quotaStatus.percentageUsed.toFixed(1)}%)`);

      if (quotaStatus.nearLimit) {
        console.log('   ⚠️  Cerca del límite de cuota mensual');
      }

      // Generar audio con TTS Service
      const ttsResult = await ttsService.generateAudio({
        text: fullScript,
        outputFileName: `narration_${Date.now()}.mp3`,
      });

      console.log(`   ✅ Audio generado: ${ttsResult.audioPath}`);
      console.log(`   🎙️  Proveedor: ${ttsResult.provider}`);
      console.log(`   ⏱️  Duración: ${ttsResult.durationSeconds.toFixed(1)}s`);
      console.log(`   📦 Cache: ${ttsResult.fromCache ? 'Sí' : 'No'}`);
      console.log(`   📊 Caracteres: ${ttsResult.charactersUsed}`);

      return {
        audioPath: ttsResult.audioPath,
        durationSeconds: ttsResult.durationSeconds,
        provider: ttsResult.provider,
        fromCache: ttsResult.fromCache,
      };
    });

    // ==========================================
    // PASO 7: RENDERIZAR VIDEO (REAL - Prompt 19)
    // ==========================================
    const videoStep = await executeStep('render_video', steps, async () => {
      console.log('🎬 PASO 7: Renderizando video con Remotion...');

      const { news, score } = topNewsStep.data as { news: NewsItem; score: NewsScore };
      const { generatedScript, fullScript } = scriptStep.data as { generatedScript: GeneratedScript; fullScript: string };
      const { dynamicImages, legacyImages } = imagesStep.data as { dynamicImages: DynamicImagesResult; legacyImages: ImageSearchResult };
      const images = legacyImages; // Formato legacy para compatibilidad
      const audioData = audioStep.data as { audioPath: string; durationSeconds: number; provider: string; fromCache: boolean };

      // Generar videoId único
      const videoId = crypto.randomBytes(8).toString('hex');

      // Si es dry run puro (no dryReal), usar mock
      if (finalConfig.dryRun && !finalConfig.dryReal) {
        const mockVideoPath = 'output/videos/video_mock.mp4';
        console.log(`   ✅ Video renderizado (MOCK - dry run): ${mockVideoPath}`);
        console.log(`   📐 Resolución: 1080x1920 (9:16)`);
        console.log(`   ⏱️  Duración: ${generatedScript.duration}s`);

        const metadata: VideoMetadata = {
          newsItem: news,
          score,
          images,
          script: fullScript,
          generatedScript,
          audioUrl: audioData.audioPath,
          audioDuration: audioData.durationSeconds,
          audioProvider: audioData.provider,
          duration: audioData.durationSeconds || generatedScript.duration || 55,
          generatedAt: new Date(),
          youtubeTitle: generateYouTubeTitle(news),
          youtubeDescription: generateYouTubeDescription(news, fullScript),
          youtubeTags: generateYouTubeTags(news),
        };

        return { videoPath: mockVideoPath, metadata, videoId };
      }

      // Renderizar video REAL con VideoRenderingService
      console.log('   🎯 Iniciando renderizado REAL con Remotion...');
      console.log(`   📊 Audio duración: ${audioData.durationSeconds}s`);

      const renderResult = await videoRenderingService.renderVideo({
        videoId,
        title: news.title,
        script: fullScript,
        audioPath: audioData.audioPath,
        imagePath: images.hero.url,
        topic: news.company || 'Tech',
        newsSource: news.source,
        audioDuration: audioData.durationSeconds,
        hook: generatedScript.hook,
        body: generatedScript.body,
        cta: generatedScript.cta,
        company: news.company,
        newsType: news.type,
      });

      if (!renderResult.success) {
        throw new Error(`Error en renderizado: ${renderResult.error}`);
      }

      console.log(`   ✅ Video renderizado: ${renderResult.videoPath}`);
      console.log(`   📐 Resolución: ${renderResult.metadata.resolution}`);
      console.log(`   📦 Tamaño: ${renderResult.fileSizeFormatted}`);
      console.log(`   ⏱️  Duración: ${renderResult.durationSeconds}s`);
      console.log(`   🔄 Tiempo de render: ${renderResult.renderTimeSeconds.toFixed(1)}s`);

      // Construir metadata completa
      const metadata: VideoMetadata = {
        newsItem: news,
        score,
        images,
        script: fullScript,
        generatedScript,
        audioUrl: audioData.audioPath,
        audioDuration: audioData.durationSeconds,
        audioProvider: audioData.provider,
        duration: renderResult.durationSeconds,
        generatedAt: new Date(),
        youtubeTitle: generateYouTubeTitle(news),
        youtubeDescription: generateYouTubeDescription(news, fullScript),
        youtubeTags: generateYouTubeTags(news),
      };

      return { videoPath: renderResult.videoPath, metadata, videoId };
    });

    // ==========================================
    // PASO 7.5: GUARDAR OUTPUTS (Prompt 19)
    // ==========================================
    let outputSummary: OutputSummary | undefined;

    // Solo guardar outputs si se generó video real (no dry run puro)
    if (!finalConfig.dryRun || finalConfig.dryReal) {
      const saveOutputsStep = await executeStep('save_outputs', steps, async () => {
        console.log('💾 PASO 7.5: Guardando outputs organizados...');

        const { news, score } = topNewsStep.data as { news: NewsItem; score: NewsScore };
        const { generatedScript, fullScript } = scriptStep.data as { generatedScript: GeneratedScript; fullScript: string };
        const { dynamicImages, legacyImages } = imagesStep.data as { dynamicImages: DynamicImagesResult; legacyImages: ImageSearchResult };
        const audioData = audioStep.data as { audioPath: string; durationSeconds: number };
        const { videoPath, metadata } = videoStep.data;

        const outputData: OutputData = {
          news,
          score,
          generatedScript,
          fullScript,
          images: legacyImages,
          dynamicImages, // Nuevo formato Prompt 19.1
          audioPath: audioData.audioPath,
          metadata,
          videoPath,
        };

        outputSummary = await outputManager.saveAllOutputs(outputData);

        console.log(`   ✅ Outputs guardados en: ${outputSummary.folderName}`);
        console.log(`   📁 Path: ${outputSummary.outputFolder}`);
        console.log(`   📦 Tamaño total: ${outputSummary.totalSizeFormatted}`);
        console.log(`   📱 TikTok: ${outputSummary.tiktokPath}`);

        return outputSummary;
      });
    } else {
      console.log('');
      console.log('⏭️  PASO 7.5: Guardado de outputs omitido (dry run)');
      console.log('');
    }

    // ==========================================
    // PASO 8: ENVIAR NOTIFICACIONES
    // ==========================================
    // No enviar notificaciones si es dry run (simulado o real)
    if (areNotificationsEnabled() && !finalConfig.dryRun && !finalConfig.dryReal) {
      await executeStep('send_notifications', steps, async () => {
        console.log('📢 PASO 8: Enviando notificaciones...');

        const { videoPath, metadata } = videoStep.data;

        // Generar ID único para el video
        const videoId = crypto.randomBytes(16).toString('hex');
        generatedVideoId = videoId;

        // ASEGURAR que directorio existe (usa path absoluto desde STORAGE_CONFIG)
        const tempDir = STORAGE_CONFIG.tempPath;
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
          console.log(`   📁 Directorio creado: ${tempDir}`);
        }

        // Guardar metadata temporal
        const metadataPath = path.join(tempDir, `${videoId}.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        console.log(`   ✅ Video ID: ${videoId}`);
        console.log(`   ✅ Metadata guardado en: ${metadataPath}`);
        console.log(`   ✅ Archivo existe: ${fs.existsSync(metadataPath)}`);
        console.log('');

        // Enviar notificaciones (email + Telegram)
        const notificationResult = await notifyVideoReady({
          video: metadata,
          videoId,
        });

        return { videoId, notificationResult };
      });
    } else if (!areNotificationsEnabled()) {
      console.log('');
      console.log('⏭️  PASO 8: Notificaciones omitidas (no configuradas)');
      console.log('');
    } else if (finalConfig.dryReal) {
      console.log('');
      console.log('⏭️  PASO 8: Notificaciones omitidas (dry-real: video sin publicar)');
      console.log('');
    } else {
      console.log('');
      console.log('⏭️  PASO 8: Notificaciones omitidas (dry run)');
      console.log('');
    }

    // ==========================================
    // PASO 9: APROBACIÓN MANUAL (si está habilitado y no es dryReal)
    // ==========================================
    if (finalConfig.requireManualApproval && !finalConfig.dryReal) {
      await executeStep('manual_approval', steps, async () => {
        console.log('👀 PASO 9: Esperando aprobación manual...');
        console.log('');
        console.log('   📹 Video generado y listo para revisión');
        console.log('   🌐 Preview: npm run dev (Remotion Studio)');
        console.log('   ✅ Aprobar para publicar');
        console.log('   ❌ Rechazar para regenerar');
        console.log('');

        if (generatedVideoId) {
          console.log(`   📧 Revisa tu email o Telegram para aprobar`);
          console.log(`   🔗 Video ID: ${generatedVideoId}`);
        } else {
          console.log('   (Configura .env para recibir notificaciones)');
        }

        // Mock: auto-aprobar por ahora
        return { approved: true };
      });
    }

    // ==========================================
    // PASO 10: PUBLICAR (manual por ahora)
    // ==========================================
    if (!finalConfig.dryRun && !finalConfig.dryReal) {
      await executeStep('publish', steps, async () => {
        console.log('📤 PASO 10: Publicación...');

        // TODO: Integrar YouTubeUploadService (Prompt 18)
        console.log('   ⏭️  Publicación manual (YouTube API pendiente integración)');
        console.log('   📁 Video disponible en: ' + videoStep.data.videoPath);
        console.log('   📋 Siguiente paso: Subir manualmente a YouTube');

        // Actualizar calendario
        updateLastPublished();

        return { published: false, manual: true };
      });
    } else if (finalConfig.dryReal) {
      console.log('');
      console.log('⏭️  PASO 10: Publicación omitida (dry-real: video generado para revisión)');
      if (outputSummary) {
        console.log(`   📁 Video disponible en: ${outputSummary.files.video}`);
        console.log(`   📱 TikTok: ${outputSummary.tiktokPath}`);
      }
    } else {
      console.log('');
      console.log('⏭️  PASO 10: Publicación omitida (dry run)');
    }

    // ==========================================
    // PIPELINE COMPLETADO
    // ==========================================
    const endTime = new Date();
    result.success = true;
    result.videoPath = videoStep.data.videoPath;
    result.metadata = videoStep.data.metadata;
    result.outputSummary = outputSummary;
    result.completedAt = endTime;
    result.totalDuration = endTime.getTime() - startTime.getTime();

    printSuccess(result);

  } catch (error: unknown) {
    const endTime = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('');
    console.error('❌ ========================================');
    console.error('❌ ERROR EN PIPELINE');
    console.error('❌ ========================================');
    console.error(`   ${errorMessage}`);
    console.error('');

    result.success = false;
    result.error = errorMessage;
    result.completedAt = endTime;
    result.totalDuration = endTime.getTime() - startTime.getTime();

    // Enviar notificación de error (si está configurado)
    if (areNotificationsEnabled() && !finalConfig.dryRun) {
      const failedStep = steps.find(s => s.status === 'failed');
      await notifyPipelineError(errorMessage, failedStep?.name || 'unknown');
    }
  }

  return result;
}

// =============================================================================
// FUNCIONES AUXILIARES DE EJECUCIÓN
// =============================================================================

/**
 * Ejecuta un paso del pipeline con manejo de errores y timing
 *
 * @param name - Nombre del paso
 * @param steps - Array de pasos (se modifica)
 * @param executor - Función a ejecutar
 * @returns Resultado con datos del paso
 */
async function executeStep<T>(
  name: PipelineStepName,
  steps: PipelineStep[],
  executor: () => Promise<T>
): Promise<{ data: T }> {
  const step: PipelineStep = {
    name,
    status: 'running',
    startedAt: new Date(),
  };

  steps.push(step);

  try {
    const data = await executor();

    step.status = 'success';
    step.completedAt = new Date();
    step.duration = step.completedAt.getTime() - step.startedAt!.getTime();
    step.data = data;

    console.log(`   ⏱️  Duración: ${step.duration}ms`);
    console.log('');

    return { data };
  } catch (error: unknown) {
    step.status = 'failed';
    step.completedAt = new Date();
    step.duration = step.completedAt.getTime() - step.startedAt!.getTime();
    step.error = error instanceof Error ? error.message : String(error);

    throw error;
  }
}

// =============================================================================
// FUNCIONES DE GENERACIÓN DE CONTENIDO (MOCKS)
// =============================================================================

/**
 * Genera noticias mock para testing
 *
 * TODO: Reemplazar con NewsData.io API real en Prompt 16+
 */
function getMockNews(): NewsItem[] {
  return [
    {
      id: '1',
      title: 'Google DeepMind presenta Project Genie 2',
      description:
        'Un modelo de IA capaz de generar mundos virtuales interactivos a partir de una sola imagen. ' +
        'Esta tecnología revolucionaria podría transformar la industria de los videojuegos y la creación de contenido digital. ' +
        'Genie 2 puede crear entornos 3D consistentes y físicamente plausibles que responden a las acciones del usuario.',
      company: 'Google',
      type: 'product-launch',
      publishedAt: new Date(),
      source: 'Google Blog',
      url: 'https://deepmind.google/discover/blog/genie-2-a-large-scale-foundation-world-model/',
      metrics: {
        views: 189800,  // Refactored Prompt 17-A: genérico en lugar de twitterViews
      },
    },
    {
      id: '2',
      title: 'OpenAI recibe $6.6B en nueva ronda de financiamiento',
      description: 'Nueva inversión eleva valuación a $157B, convirtiéndola en la startup más valiosa del mundo.',
      company: 'OpenAI',
      type: 'funding',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
      source: 'TechCrunch',
    },
    {
      id: '3',
      title: 'Anthropic lanza Claude 3.5 Sonnet mejorado',
      description: 'Nueva versión con capacidades de código y razonamiento significativamente mejoradas.',
      company: 'Anthropic',
      type: 'product-launch',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // Hace 12 horas
      source: 'Anthropic Blog',
    },
  ];
}

// NOTE: generateMockScript eliminado en Prompt 15 - ahora usa ScriptGenerator real

/**
 * Extrae topics de una noticia
 */
function extractTopics(news: NewsItem): string[] {
  const topics: string[] = [];

  if (news.company) {
    topics.push(news.company);
  }

  // Extraer palabras significativas del título
  const titleWords = news.title
    .split(' ')
    .filter(word => word.length > 4 && /^[A-Z]/.test(word))
    .slice(0, 3);

  topics.push(...titleWords);

  return topics.filter(Boolean);
}

/**
 * Extrae nombre de producto del título
 */
function extractProductName(title: string): string | undefined {
  // Patrones comunes: "presenta X", "lanza X", "anuncia X"
  const patterns = [
    /presenta\s+([A-Z][a-zA-Z0-9\s]+)/i,
    /lanza\s+([A-Z][a-zA-Z0-9\s]+)/i,
    /anuncia\s+([A-Z][a-zA-Z0-9\s]+)/i,
    /launches?\s+([A-Z][a-zA-Z0-9\s]+)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Genera título para YouTube
 */
function generateYouTubeTitle(news: NewsItem): string {
  const emoji = news.type === 'product-launch' ? '🚀' : '💡';
  return `${emoji} ${news.title} #IA #Tech`;
}

/**
 * Genera descripción para YouTube
 */
function generateYouTubeDescription(news: NewsItem, script: string): string {
  return (
    `${script.substring(0, 200)}...\n\n` +
    `📰 Fuente: ${news.source}\n` +
    `🔗 Más info: ${news.url || 'N/A'}\n\n` +
    `#InteligenciaArtificial #IA #AI #Tech #Noticias\n\n` +
    `---\n` +
    `Generado con Sintaxis IA`
  );
}

/**
 * Genera tags para YouTube
 */
function generateYouTubeTags(news: NewsItem): string[] {
  const baseTags = ['IA', 'AI', 'Inteligencia Artificial', 'Tech', 'Noticias'];
  const customTags: string[] = [];

  if (news.company) {
    customTags.push(news.company);
  }

  if (news.type) {
    customTags.push(news.type);
  }

  return [...baseTags, ...customTags];
}

// =============================================================================
// FUNCIONES DE IMPRESIÓN
// =============================================================================

/**
 * Imprime header del pipeline
 */
function printHeader(config: OrchestratorConfig): void {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 SINTAXIS IA - PIPELINE DE GENERACIÓN');
  console.log('🚀 ========================================');
  console.log(`   Modo: ${config.mode}`);
  if (config.dryRun) {
    console.log(`   Dry run: Sí (simulado)`);
  } else if (config.dryReal) {
    console.log(`   Dry run: Sí (VIDEO REAL - sin publicar)`);
  } else {
    console.log(`   Dry run: No`);
  }
  console.log(`   Aprobación manual: ${config.requireManualApproval ? 'Sí' : 'No'}`);
  console.log(`   Forzar: ${config.forceRun ? 'Sí' : 'No'}`);
  console.log('');
}

/**
 * Imprime resumen de éxito del pipeline
 */
function printSuccess(result: PipelineResult): void {
  console.log('');
  console.log('✅ ========================================');
  console.log('✅ PIPELINE COMPLETADO EXITOSAMENTE');
  console.log('✅ ========================================');
  console.log('');

  printSummary(result);
}

/**
 * Imprime resumen del pipeline
 */
function printSummary(result: PipelineResult): void {
  console.log('📊 RESUMEN DEL PIPELINE:');
  console.log('');

  result.steps.forEach(step => {
    const icon =
      step.status === 'success' ? '✅' :
      step.status === 'failed' ? '❌' :
      step.status === 'running' ? '⏳' : '⏭️';

    console.log(`${icon} ${step.name}: ${step.status} (${step.duration || 0}ms)`);
  });

  console.log('');
  console.log(`⏱️  Duración total: ${result.totalDuration || 0}ms`);

  if (result.metadata?.newsItem) {
    console.log('');
    console.log('📹 VIDEO GENERADO:');
    console.log(`   Título: ${result.metadata.newsItem.title}`);
    console.log(`   Empresa: ${result.metadata.newsItem.company || 'N/A'}`);
    console.log(`   Score: ${result.metadata.score?.totalScore || 0} pts`);
    console.log(`   Duración: ${result.metadata.duration}s`);
  }

  // Mostrar resumen de outputs (Prompt 19)
  if (result.outputSummary) {
    console.log('');
    console.log('📁 OUTPUTS GUARDADOS:');
    console.log(`   Carpeta: ${result.outputSummary.folderName}`);
    console.log(`   Path: ${result.outputSummary.outputFolder}`);
    console.log(`   Tamaño: ${result.outputSummary.totalSizeFormatted}`);
    console.log('');
    console.log('   Archivos:');
    Object.entries(result.outputSummary.files).forEach(([key, filePath]) => {
      const fileName = filePath.split(/[/\\]/).pop();
      console.log(`     - ${key}: ${fileName}`);
    });
    console.log('');
    console.log(`   📱 TikTok: ${result.outputSummary.tiktokPath}`);
  }

  console.log('');
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  runPipeline,
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  runPipeline({ mode: 'development', dryRun: false })
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}
