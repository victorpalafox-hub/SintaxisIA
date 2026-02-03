/**
 * @fileoverview Output Manager Service - Prompt 19
 *
 * Servicio para organizar y guardar todos los outputs del pipeline.
 * Crea estructura de carpetas, guarda archivos JSON y copia assets.
 *
 * Estructura de output:
 * output/YYYY-MM-DD_slug-del-titulo/
 * ├── news.json          # Noticia original
 * ├── score.json         # Score calculado
 * ├── script.json        # Script estructurado
 * ├── script.txt         # Script legible para revisión humana
 * ├── images.json        # Imágenes encontradas
 * ├── audio.mp3          # Audio TTS (copia)
 * ├── metadata.json      # Metadata completa
 * └── video-final.mp4    # Video renderizado
 *
 * También copia el video a:
 * output/tiktok-manual/YYYY-MM-DD_slug.mp4
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 19
 */

import * as fs from 'fs';
import * as path from 'path';
import { NewsItem } from '../types/news.types';
import { NewsScore } from '../types/scoring.types';
import { GeneratedScript } from '../types/script.types';
import { ImageSearchResult } from '../types/image.types';
import { VideoMetadata, OutputSummary } from '../types/orchestrator.types';
import { OUTPUT_CONFIG, OUTPUT_PATHS, OUTPUT_FORMAT, OUTPUT_FILES, SCRIPT_FORMAT } from '../config/output.config';

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Datos de entrada para guardar outputs
 */
export interface OutputData {
  /** Noticia original */
  news: NewsItem;
  /** Score calculado */
  score: NewsScore;
  /** Script estructurado con compliance */
  generatedScript: GeneratedScript;
  /** Script completo (texto para TTS) */
  fullScript: string;
  /** Imágenes encontradas */
  images: ImageSearchResult;
  /** Path del archivo de audio */
  audioPath: string;
  /** Metadata completa del video */
  metadata: VideoMetadata;
  /** Path del video renderizado */
  videoPath: string;
}

// =============================================================================
// OUTPUT MANAGER SERVICE
// =============================================================================

/**
 * Servicio de gestión de outputs del pipeline
 *
 * Organiza y guarda todos los archivos generados por el pipeline
 * en una estructura de carpetas organizada por fecha.
 */
class OutputManagerService {
  // ===========================================================================
  // MÉTODOS PÚBLICOS
  // ===========================================================================

  /**
   * Guarda todos los outputs del pipeline
   *
   * Crea la estructura de carpetas, guarda todos los archivos
   * y copia el video a la carpeta de TikTok.
   *
   * @param data - Datos de todos los pasos del pipeline
   * @returns Resumen de los outputs guardados
   */
  async saveAllOutputs(data: OutputData): Promise<OutputSummary> {
    const now = new Date();
    const folderName = this.createFolderName(now, data.news.title);
    const outputFolder = OUTPUT_PATHS.getOutputFolder(folderName);

    // Crear directorios necesarios
    this.ensureDirectoryExists(outputFolder);
    this.ensureDirectoryExists(OUTPUT_PATHS.tiktokManual);

    // Guardar todos los archivos
    const files = {
      news: await this.saveNewsJson(outputFolder, data.news),
      score: await this.saveScoreJson(outputFolder, data.score),
      scriptJson: await this.saveScriptJson(outputFolder, data.generatedScript),
      scriptTxt: await this.saveScriptTxt(outputFolder, data.generatedScript, data.news, data.score),
      images: await this.saveImagesJson(outputFolder, data.images),
      audio: await this.copyAudioFile(outputFolder, data.audioPath),
      metadata: await this.saveMetadataJson(outputFolder, data.metadata),
      video: await this.copyVideoFile(outputFolder, data.videoPath),
    };

    // Copiar video a carpeta de TikTok
    const tiktokFileName = this.createTiktokFileName(now, data.news.title);
    const tiktokPath = await this.copyToTikTokManual(data.videoPath, tiktokFileName);

    // Calcular tamaño total
    const totalSizeBytes = this.calculateTotalSize(Object.values(files));
    const totalSizeFormatted = this.formatFileSize(totalSizeBytes);

    return {
      outputFolder,
      folderName,
      files,
      tiktokPath,
      totalSizeBytes,
      totalSizeFormatted,
      savedAt: now,
    };
  }

  /**
   * Sanitiza un título para usarlo como slug
   *
   * @param title - Título original
   * @param maxLength - Longitud máxima (default: configurable)
   * @returns Slug sanitizado
   */
  sanitizeSlug(title: string, maxLength: number = OUTPUT_FORMAT.slugMaxLength): string {
    if (!title || title.trim() === '') {
      return 'sin-titulo';
    }

    return title
      .toLowerCase()
      // Reemplazar acentos y caracteres especiales
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Reemplazar espacios y caracteres no permitidos
      .replace(/\s+/g, OUTPUT_FORMAT.wordSeparator)
      .replace(OUTPUT_FORMAT.allowedCharsRegex, '')
      // Eliminar guiones múltiples
      .replace(/-+/g, OUTPUT_FORMAT.wordSeparator)
      // Eliminar guiones al inicio y final
      .replace(/^-|-$/g, '')
      // Limitar longitud
      .substring(0, maxLength);
  }

  /**
   * Crea el nombre de la carpeta de output
   *
   * @param date - Fecha de generación
   * @param title - Título de la noticia
   * @returns Nombre de carpeta en formato YYYY-MM-DD_slug
   */
  createFolderName(date: Date, title: string): string {
    const dateStr = this.formatDate(date);
    const slug = this.sanitizeSlug(title);
    return `${dateStr}${OUTPUT_FORMAT.dateSeparator}${slug}`;
  }

  /**
   * Crea el nombre del archivo para TikTok
   *
   * @param date - Fecha de generación
   * @param title - Título de la noticia
   * @returns Nombre de archivo en formato YYYY-MM-DD_slug.mp4
   */
  createTiktokFileName(date: Date, title: string): string {
    const dateStr = this.formatDate(date);
    const slug = this.sanitizeSlug(title);
    return `${dateStr}${OUTPUT_FORMAT.dateSeparator}${slug}.mp4`;
  }

  // ===========================================================================
  // MÉTODOS DE GUARDADO DE ARCHIVOS
  // ===========================================================================

  /**
   * Guarda la noticia original como JSON
   */
  private async saveNewsJson(folder: string, news: NewsItem): Promise<string> {
    const filePath = path.join(folder, OUTPUT_FILES.news);
    await this.writeJsonFile(filePath, news);
    return filePath;
  }

  /**
   * Guarda el score como JSON
   */
  private async saveScoreJson(folder: string, score: NewsScore): Promise<string> {
    const filePath = path.join(folder, OUTPUT_FILES.score);
    await this.writeJsonFile(filePath, score);
    return filePath;
  }

  /**
   * Guarda el script estructurado como JSON
   */
  private async saveScriptJson(folder: string, script: GeneratedScript): Promise<string> {
    const filePath = path.join(folder, OUTPUT_FILES.scriptJson);
    await this.writeJsonFile(filePath, script);
    return filePath;
  }

  /**
   * Guarda el script en formato legible para revisión humana
   *
   * Incluye:
   * - Header con metadata
   * - Secciones HOOK, BODY, OPINION, CTA
   * - Reporte de compliance
   */
  private async saveScriptTxt(
    folder: string,
    script: GeneratedScript,
    news: NewsItem,
    score: NewsScore
  ): Promise<string> {
    const filePath = path.join(folder, OUTPUT_FILES.scriptTxt);
    const content = this.formatScriptTxt(script, news, score);
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Guarda las imágenes encontradas como JSON
   */
  private async saveImagesJson(folder: string, images: ImageSearchResult): Promise<string> {
    const filePath = path.join(folder, OUTPUT_FILES.images);
    await this.writeJsonFile(filePath, images);
    return filePath;
  }

  /**
   * Copia el archivo de audio a la carpeta de output
   */
  private async copyAudioFile(folder: string, audioPath: string): Promise<string> {
    const destPath = path.join(folder, OUTPUT_FILES.audio);

    // Si el audioPath es una URL, descargar
    if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
      // Por ahora, guardar referencia en lugar de descargar
      await this.writeJsonFile(destPath.replace('.mp3', '-ref.json'), { originalUrl: audioPath });
      return destPath.replace('.mp3', '-ref.json');
    }

    // Si es un archivo local, copiar
    if (fs.existsSync(audioPath)) {
      await fs.promises.copyFile(audioPath, destPath);
      return destPath;
    }

    // Si no existe, crear archivo placeholder
    await this.writeJsonFile(destPath.replace('.mp3', '-missing.json'), {
      error: 'Audio file not found',
      originalPath: audioPath,
    });
    return destPath.replace('.mp3', '-missing.json');
  }

  /**
   * Guarda la metadata completa como JSON
   */
  private async saveMetadataJson(folder: string, metadata: VideoMetadata): Promise<string> {
    const filePath = path.join(folder, OUTPUT_FILES.metadata);
    await this.writeJsonFile(filePath, metadata);
    return filePath;
  }

  /**
   * Copia el video renderizado a la carpeta de output
   */
  private async copyVideoFile(folder: string, videoPath: string): Promise<string> {
    const destPath = path.join(folder, OUTPUT_FILES.video);

    if (fs.existsSync(videoPath)) {
      await fs.promises.copyFile(videoPath, destPath);
      return destPath;
    }

    // Si no existe (ej: dry run), crear archivo placeholder
    await this.writeJsonFile(destPath.replace('.mp4', '-missing.json'), {
      error: 'Video file not found',
      originalPath: videoPath,
    });
    return destPath.replace('.mp4', '-missing.json');
  }

  /**
   * Copia el video a la carpeta de TikTok manual
   */
  private async copyToTikTokManual(videoPath: string, fileName: string): Promise<string> {
    const destPath = OUTPUT_PATHS.getTiktokPath(fileName);

    if (fs.existsSync(videoPath)) {
      await fs.promises.copyFile(videoPath, destPath);
      return destPath;
    }

    // Si no existe, retornar path esperado
    return destPath;
  }

  // ===========================================================================
  // MÉTODOS DE FORMATO
  // ===========================================================================

  /**
   * Formatea el script en texto legible
   */
  private formatScriptTxt(script: GeneratedScript, news: NewsItem, score: NewsScore): string {
    const sep = SCRIPT_FORMAT.mainSeparator;
    const secSep = SCRIPT_FORMAT.sectionSeparator;
    const sections = SCRIPT_FORMAT.sections;

    const lines: string[] = [
      sep,
      sections.header,
      sep,
      `Generado: ${new Date().toISOString().replace('T', ' ').split('.')[0]}`,
      `Noticia: ${news.title}`,
      `Empresa: ${news.company || 'N/A'}`,
      `Score: ${score.totalScore}/97 pts`,
      `Publicable: ${score.isPublishable ? 'SI' : 'NO'}`,
      sep,
      '',
      `--- ${sections.hook} ---`,
      script.hook || '[Sin hook]',
      '',
      `--- ${sections.body} ---`,
      script.body || '[Sin body]',
      '',
      `--- ${sections.opinion} ---`,
      script.opinion || '[Sin opinion]',
      '',
      `--- ${sections.cta} ---`,
      script.cta || '[Sin CTA]',
      '',
      sep,
      sections.compliance,
      sep,
    ];

    // Agregar reporte de compliance si existe
    if (script.complianceReport) {
      const cr = script.complianceReport;
      lines.push(`Score: ${cr.humanScore}/6 - ${cr.passed ? 'PASSED' : 'FAILED'}`);
      lines.push('Marcadores:');

      const markers = SCRIPT_FORMAT.complianceMarkers;
      const markerChecks = script.complianceReport.markers;

      lines.push(`  [${markerChecks.hasFirstPerson ? 'x' : ' '}] ${markers.hasFirstPerson}`);
      lines.push(`  [${markerChecks.hasOpinion ? 'x' : ' '}] ${markers.hasOpinion}`);
      lines.push(`  [${markerChecks.admitsUncertainty ? 'x' : ' '}] ${markers.admitsUncertainty}`);
      lines.push(`  [${markerChecks.hasReflectiveQuestion ? 'x' : ' '}] ${markers.hasReflectiveQuestion}`);
      lines.push(`  [${markerChecks.avoidsCorpSpeak ? 'x' : ' '}] ${markers.avoidsCorpSpeak}`);
      lines.push(`  [${markerChecks.hasAnalogy ? 'x' : ' '}] ${markers.hasAnalogy}`);

      if (cr.issues && cr.issues.length > 0) {
        lines.push('');
        lines.push('Issues:');
        cr.issues.forEach(issue => lines.push(`  - ${issue}`));
      }

      if (cr.strengths && cr.strengths.length > 0) {
        lines.push('');
        lines.push('Fortalezas:');
        cr.strengths.forEach(strength => lines.push(`  - ${strength}`));
      }
    } else {
      lines.push('[Sin reporte de compliance disponible]');
    }

    lines.push(sep);

    return lines.join('\n');
  }

  /**
   * Formatea una fecha en formato YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatea un tamaño de archivo en formato legible
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // ===========================================================================
  // MÉTODOS AUXILIARES
  // ===========================================================================

  /**
   * Asegura que un directorio exista, creándolo si es necesario
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Escribe un objeto como JSON a un archivo
   */
  private async writeJsonFile(filePath: string, data: unknown): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Calcula el tamaño total de una lista de archivos
   */
  private calculateTotalSize(filePaths: string[]): number {
    let totalSize = 0;

    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    }

    return totalSize;
  }
}

// =============================================================================
// EXPORTACIONES
// =============================================================================

/**
 * Instancia singleton del OutputManager
 */
export const outputManager = new OutputManagerService();

/**
 * Re-exportar configuración para conveniencia
 */
export { OUTPUT_CONFIG, OUTPUT_PATHS, OUTPUT_FORMAT, OUTPUT_FILES };
