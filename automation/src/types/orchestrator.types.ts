/**
 * @fileoverview Types para Orchestrator
 *
 * Define interfaces para el pipeline de generación de videos.
 * El orchestrator coordina todos los servicios del sistema.
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 14
 */

import { NewsItem } from './news.types';
import { NewsScore } from './scoring.types';
import { ImageSearchResult } from './image.types';
import { GeneratedScript } from './script.types';

// =============================================================================
// CONFIGURACIÓN DEL ORCHESTRATOR
// =============================================================================

/**
 * Configuración del Orchestrator
 *
 * Controla el comportamiento del pipeline de generación.
 */
export interface OrchestratorConfig {
  /**
   * Modo de ejecución
   * - development: Logs verbosos, mocks habilitados
   * - production: Logs mínimos, servicios reales
   */
  mode: 'development' | 'production';

  /**
   * Requiere aprobación manual antes de publicar
   * Si true, el pipeline se detiene para revisión humana
   */
  requireManualApproval: boolean;

  /**
   * Dry run - no ejecuta acciones reales
   * Útil para testing sin consumir APIs o publicar
   */
  dryRun: boolean;

  /**
   * Límite de noticias a procesar
   * Reduce carga en desarrollo
   */
  maxNewsToFetch?: number;

  /**
   * Forzar ejecución aunque no sea día de publicación
   * Útil para testing
   */
  forceRun?: boolean;

  /**
   * Dry run REAL: genera video pero no publica ni notifica
   * Útil para verificar el pipeline completo sin publicar
   * @since Prompt 19
   */
  dryReal?: boolean;
}

// =============================================================================
// RESULTADO DEL PIPELINE
// =============================================================================

/**
 * Resultado completo del pipeline de generación
 */
export interface PipelineResult {
  /** Si el pipeline completó exitosamente */
  success: boolean;

  /** Path del video generado (si success=true) */
  videoPath?: string;

  /** Mensaje de error (si success=false) */
  error?: string;

  /** Historial de pasos ejecutados */
  steps: PipelineStep[];

  /** Metadata del video generado */
  metadata: VideoMetadata;

  /** Duración total del pipeline en ms */
  totalDuration?: number;

  /** Timestamp de inicio */
  startedAt?: Date;

  /** Timestamp de fin */
  completedAt?: Date;

  /**
   * Resumen de outputs guardados
   * @since Prompt 19
   */
  outputSummary?: OutputSummary;
}

/**
 * Paso individual del pipeline
 */
export interface PipelineStep {
  /** Nombre del paso */
  name: PipelineStepName;

  /** Estado actual del paso */
  status: PipelineStepStatus;

  /** Timestamp de inicio */
  startedAt?: Date;

  /** Timestamp de fin */
  completedAt?: Date;

  /** Duración en milisegundos */
  duration?: number;

  /** Mensaje de error (si status='failed') */
  error?: string;

  /** Datos producidos por el paso */
  data?: unknown;
}

/**
 * Estados posibles de un paso del pipeline
 */
export type PipelineStepStatus =
  | 'pending'   // Esperando ejecución
  | 'running'   // En progreso
  | 'success'   // Completado exitosamente
  | 'failed'    // Error
  | 'skipped';  // Omitido (ej: dry run)

/**
 * Nombres de los pasos del pipeline
 *
 * Orden de ejecución:
 * 1. check_schedule - Verificar si es día de publicación
 * 2. collect_news - Recolectar noticias de APIs
 * 3. score_news - Calcular scores
 * 4. select_top - Seleccionar mejor noticia
 * 5. generate_script - Generar guión con Gemini
 * 6. search_images - Buscar imágenes relevantes
 * 7. generate_audio - Generar audio con ElevenLabs
 * 8. render_video - Renderizar con Remotion
 * 8.5. save_outputs - Guardar todos los outputs organizados (Prompt 19)
 * 9. send_notifications - Enviar notificaciones (email + Telegram)
 * 10. manual_approval - Esperar aprobación humana
 * 11. publish - Publicar en YouTube
 */
export type PipelineStepName =
  | 'check_schedule'
  | 'collect_news'
  | 'score_news'
  | 'select_top'
  | 'generate_script'
  | 'search_images'
  | 'generate_audio'
  | 'render_video'
  | 'save_outputs'
  | 'send_notifications'
  | 'manual_approval'
  | 'publish';

// =============================================================================
// METADATA DEL VIDEO
// =============================================================================

/**
 * Metadata completa del video generado
 *
 * Contiene toda la información necesaria para:
 * - Reproducir el proceso
 * - Debugging
 * - Analytics
 */
export interface VideoMetadata {
  /** Noticia original usada */
  newsItem: NewsItem;

  /** Score calculado de la noticia */
  score: NewsScore;

  /** Imágenes encontradas */
  images: ImageSearchResult;

  /** Guión generado (texto completo para TTS) */
  script: string;

  /**
   * Script estructurado con metadata y compliance
   * Incluye hook, body, opinion, cta y reporte de compliance
   * @since Prompt 15
   */
  generatedScript?: GeneratedScript;

  /** URL del audio generado */
  audioUrl?: string;

  /**
   * Duración del audio en segundos
   * @since Prompt 16
   */
  audioDuration?: number;

  /**
   * Proveedor de TTS usado (elevenlabs | edge-tts)
   * @since Prompt 16
   */
  audioProvider?: string;

  /** Duración del video en segundos */
  duration: number;

  /** Timestamp de generación */
  generatedAt: Date;

  /** Título para YouTube */
  youtubeTitle?: string;

  /** Descripción para YouTube */
  youtubeDescription?: string;

  /** Tags para YouTube */
  youtubeTags?: string[];
}

// =============================================================================
// OUTPUT SUMMARY (Prompt 19)
// =============================================================================

/**
 * Resumen de outputs guardados por el OutputManager
 *
 * Contiene información sobre todos los archivos generados
 * y su ubicación para fácil acceso.
 *
 * @since Prompt 19
 */
export interface OutputSummary {
  /** Carpeta principal de output (path completo) */
  outputFolder: string;

  /** Nombre de la carpeta (YYYY-MM-DD_slug) */
  folderName: string;

  /** Archivos guardados (paths completos) */
  files: {
    /** Noticia original (news.json) */
    news: string;
    /** Score calculado (score.json) */
    score: string;
    /** Script estructurado (script.json) */
    scriptJson: string;
    /** Script legible (script.txt) */
    scriptTxt: string;
    /** Imágenes (images.json) */
    images: string;
    /** Audio copiado (audio.mp3) */
    audio: string;
    /** Metadata completa (metadata.json) */
    metadata: string;
    /** Video final (video-final.mp4) */
    video: string;
  };

  /** Path de la copia para TikTok */
  tiktokPath: string;

  /** Tamaño total en bytes de todos los archivos */
  totalSizeBytes: number;

  /** Tamaño total formateado (ej: "45.2 MB") */
  totalSizeFormatted: string;

  /** Timestamp de guardado */
  savedAt: Date;
}

// =============================================================================
// TIPOS AUXILIARES
// =============================================================================

/**
 * Resultado de un paso ejecutado
 */
export interface StepExecutionResult<T = unknown> {
  /** Datos producidos por el paso */
  data: T;
}

/**
 * Opciones para ejecutar el CLI
 */
export interface CLIOptions {
  /** Ejecutar en modo dry run (simula sin generar video) */
  dry: boolean;

  /**
   * Ejecutar en modo dry run REAL (genera video pero no publica)
   * @since Prompt 19
   */
  dryReal: boolean;

  /** Ejecutar en modo producción */
  prod: boolean;

  /** Forzar ejecución */
  force: boolean;

  /** Mostrar ayuda */
  help: boolean;
}

/**
 * Estado de aprobación manual
 */
export interface ApprovalState {
  /** Si fue aprobado */
  approved: boolean;

  /** Comentarios del revisor */
  comments?: string;

  /** Timestamp de la decisión */
  decidedAt?: Date;

  /** ID del revisor */
  reviewerId?: string;
}
