/**
 * @fileoverview Video Rendering Service - Prompt 17
 *
 * Servicio para renderizar videos usando Remotion CLI.
 * Prepara assets, genera data.json, y ejecuta el rendering.
 *
 * @example
 * ```typescript
 * import { videoRenderingService } from './services/video-rendering.service';
 *
 * const result = await videoRenderingService.renderVideo({
 *   videoId: 'abc123',
 *   title: 'OpenAI lanza GPT-5',
 *   script: 'Este es el script completo...',
 *   audioPath: './temp/audio.mp3',
 *   imagePath: 'https://example.com/image.jpg',
 *   topic: 'OpenAI',
 *   newsSource: 'TechCrunch',
 *   audioDuration: 45,
 * });
 * ```
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 17
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';
import * as https from 'https';
import * as http from 'http';

import { VIDEO_CONFIG } from '../config/video.config';
import {
  VideoRenderRequest,
  VideoRenderResponse,
  VideoRenderOptions,
  VideoRenderStatus,
  SetupVerificationResult,
  RemotionDataContract,
  SubtitleWord,
  VideoSection,
  formatFileSize,
  secondsToFrames,
  VIDEO_QUALITY_PRESETS,
} from '../types/video.types';

// =============================================================================
// VIDEO RENDERING SERVICE
// =============================================================================

/**
 * Servicio de renderizado de video con Remotion
 *
 * Maneja todo el proceso de preparación de assets, generación de
 * data.json, y ejecución del rendering con Remotion CLI.
 */
class VideoRenderingService {
  private status: VideoRenderStatus = {
    isRendering: false,
    progress: 0,
    phase: 'idle',
    message: 'Listo',
    elapsedTime: 0,
  };

  // ===========================================================================
  // MAIN RENDER METHOD
  // ===========================================================================

  /**
   * Renderiza un video completo
   *
   * @param request - Datos del video a renderizar
   * @param options - Opciones de configuración
   * @returns Resultado del renderizado
   */
  async renderVideo(
    request: VideoRenderRequest,
    options: VideoRenderOptions = {}
  ): Promise<VideoRenderResponse> {
    const startTime = Date.now();
    let attempts = 0;
    const maxRetries = options.retries ?? VIDEO_CONFIG.remotion.retries;

    // Actualizar estado
    this.updateStatus({
      isRendering: true,
      currentVideoId: request.videoId,
      progress: 0,
      phase: 'preparing',
      message: 'Iniciando renderizado...',
    });

    try {
      // Verificar setup
      console.log('🔍 Verificando setup de Remotion...');
      const setupResult = await this.verifyRemotionSetup();
      if (!setupResult.isValid) {
        throw new Error(`Setup inválido: ${setupResult.errors.join(', ')}`);
      }
      console.log('   ✅ Setup verificado');

      // Preparar directorios
      this.ensureDirectories(options);

      // Preparar assets
      this.updateStatus({ progress: 10, message: 'Preparando assets...' });
      const preparedAssets = await this.prepareAssets(request);
      console.log('   ✅ Assets preparados');

      // Generar subtítulos
      this.updateStatus({ progress: 20, message: 'Generando subtítulos...' });
      const subtitles = this.generateSubtitles(request.script, request.audioDuration);
      console.log(`   ✅ ${subtitles.length} palabras de subtítulos generadas`);

      // Generar secciones
      this.updateStatus({ progress: 30, message: 'Generando secciones...' });
      const sections = this.generateSections(request);
      console.log(`   ✅ ${sections.length} secciones generadas`);

      // Generar data.json
      this.updateStatus({ progress: 40, message: 'Generando data.json...' });
      const dataContract = this.generateDataContract(request, preparedAssets, subtitles, sections);
      await this.writeDataJson(dataContract);
      console.log('   ✅ data.json generado');

      // Ejecutar rendering con reintentos
      this.updateStatus({ phase: 'rendering', progress: 50, message: 'Renderizando video...' });

      let lastError: Error | null = null;
      while (attempts < maxRetries) {
        attempts++;
        try {
          const outputPath = await this.executeRemotionRender(request, options, preparedAssets);

          // Verificar resultado
          if (!fs.existsSync(outputPath)) {
            throw new Error('El archivo de video no fue generado');
          }

          const stats = fs.statSync(outputPath);
          const renderTime = (Date.now() - startTime) / 1000;

          // Actualizar estado final
          this.updateStatus({
            isRendering: false,
            progress: 100,
            phase: 'idle',
            message: 'Renderizado completado',
            elapsedTime: renderTime * 1000,
          });

          console.log(`   ✅ Video renderizado: ${outputPath}`);
          console.log(`   📐 Tamaño: ${formatFileSize(stats.size)}`);
          console.log(`   ⏱️  Tiempo: ${renderTime.toFixed(1)}s`);

          return {
            success: true,
            videoPath: outputPath,
            durationSeconds: request.audioDuration,
            fileSizeBytes: stats.size,
            fileSizeFormatted: formatFileSize(stats.size),
            renderTimeSeconds: renderTime,
            metadata: {
              compositionId: options.usePreview
                ? VIDEO_CONFIG.remotion.previewCompositionId
                : VIDEO_CONFIG.remotion.compositionId,
              resolution: `${VIDEO_CONFIG.specs.width}x${VIDEO_CONFIG.specs.height}`,
              fps: VIDEO_CONFIG.specs.fps,
              codec: VIDEO_CONFIG.specs.codec,
              crf: this.getCrf(options.quality),
              totalFrames: secondsToFrames(request.audioDuration, VIDEO_CONFIG.specs.fps),
              startedAt: new Date(startTime),
              completedAt: new Date(),
              attempts,
            },
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`   ❌ Intento ${attempts}/${maxRetries} falló: ${lastError.message}`);

          if (attempts < maxRetries) {
            console.log(`   ⏳ Reintentando en ${VIDEO_CONFIG.remotion.retryDelay / 1000}s...`);
            await this.delay(VIDEO_CONFIG.remotion.retryDelay);
          }
        }
      }

      // Si llegamos aquí, todos los intentos fallaron
      throw lastError || new Error('Renderizado falló después de todos los reintentos');
    } catch (error) {
      const renderTime = (Date.now() - startTime) / 1000;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.updateStatus({
        isRendering: false,
        progress: 0,
        phase: 'idle',
        message: `Error: ${errorMessage}`,
        elapsedTime: renderTime * 1000,
      });

      console.error(`   ❌ Error en renderizado: ${errorMessage}`);

      return {
        success: false,
        videoPath: '',
        durationSeconds: 0,
        fileSizeBytes: 0,
        fileSizeFormatted: '0 Bytes',
        renderTimeSeconds: renderTime,
        error: errorMessage,
        metadata: {
          compositionId: VIDEO_CONFIG.remotion.compositionId,
          resolution: `${VIDEO_CONFIG.specs.width}x${VIDEO_CONFIG.specs.height}`,
          fps: VIDEO_CONFIG.specs.fps,
          codec: VIDEO_CONFIG.specs.codec,
          crf: VIDEO_CONFIG.specs.crf,
          totalFrames: 0,
          startedAt: new Date(startTime),
          completedAt: new Date(),
          attempts,
        },
      };
    }
  }

  // ===========================================================================
  // SETUP VERIFICATION
  // ===========================================================================

  /**
   * Verifica que el setup de Remotion esté correcto
   */
  async verifyRemotionSetup(): Promise<SetupVerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar directorio de Remotion
    const remotionDirExists = fs.existsSync(VIDEO_CONFIG.paths.remotionApp);
    if (!remotionDirExists) {
      errors.push(`Directorio de Remotion no existe: ${VIDEO_CONFIG.paths.remotionApp}`);
    }

    // Verificar instalación de Remotion (package.json)
    let remotionInstalled = false;
    const packageJsonPath = path.join(VIDEO_CONFIG.paths.remotionApp, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        remotionInstalled = !!(packageJson.dependencies?.remotion || packageJson.devDependencies?.remotion);
        if (!remotionInstalled) {
          errors.push('Remotion no está instalado en remotion-app');
        }
      } catch {
        errors.push('No se pudo leer package.json de remotion-app');
      }
    }

    // Verificar FFmpeg
    let ffmpegAvailable = false;
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      ffmpegAvailable = true;
    } catch {
      warnings.push('FFmpeg no encontrado en PATH (puede afectar el rendering)');
    }

    // Verificar composición (Root.tsx)
    let compositionExists = false;
    const rootTsxPath = path.join(VIDEO_CONFIG.paths.remotionApp, 'src', 'Root.tsx');
    if (fs.existsSync(rootTsxPath)) {
      const rootContent = fs.readFileSync(rootTsxPath, 'utf-8');
      compositionExists = rootContent.includes(VIDEO_CONFIG.remotion.compositionId);
      if (!compositionExists) {
        errors.push(`Composición '${VIDEO_CONFIG.remotion.compositionId}' no encontrada en Root.tsx`);
      }
    }

    return {
      isValid: errors.length === 0,
      remotionInstalled,
      ffmpegAvailable,
      remotionDirExists,
      compositionExists,
      errors,
      warnings,
    };
  }

  // ===========================================================================
  // ASSET PREPARATION
  // ===========================================================================

  /**
   * Prepara todos los assets necesarios para el renderizado
   */
  private async prepareAssets(request: VideoRenderRequest): Promise<{
    audioPath: string;
    heroImage: string;
    contextImage: string;
    outroImage: string;
  }> {
    const publicDir = VIDEO_CONFIG.paths.publicAssets;

    // Asegurar directorio existe
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Copiar/descargar audio
    const audioFileName = `audio_${request.videoId}.mp3`;
    const audioDestPath = path.join(publicDir, audioFileName);

    if (request.audioPath.startsWith('http')) {
      await this.downloadFile(request.audioPath, audioDestPath);
    } else if (fs.existsSync(request.audioPath)) {
      fs.copyFileSync(request.audioPath, audioDestPath);
    } else {
      throw new Error(`Audio no encontrado: ${request.audioPath}`);
    }

    // Preparar imagen hero
    const heroFileName = `hero_${request.videoId}.jpg`;
    const heroDestPath = path.join(publicDir, heroFileName);

    if (request.imagePath.startsWith('http')) {
      await this.downloadFile(request.imagePath, heroDestPath);
    } else if (fs.existsSync(request.imagePath)) {
      fs.copyFileSync(request.imagePath, heroDestPath);
    } else {
      // Usar placeholder si no hay imagen
      console.log('   ⚠️  Imagen no encontrada, usando placeholder');
    }

    // Imagen de outro (hardcoded logo Sintaxis IA)
    const outroImage = 'sintaxis-logo.png';

    return {
      audioPath: audioFileName,
      heroImage: heroFileName,
      contextImage: heroFileName, // Usar misma imagen para contexto
      outroImage,
    };
  }

  /**
   * Descarga un archivo desde URL
   */
  private downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(destPath);

      protocol
        .get(url, response => {
          // Manejar redirects
          if (response.statusCode === 301 || response.statusCode === 302) {
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              this.downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
              return;
            }
          }

          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode} al descargar ${url}`));
            return;
          }

          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        })
        .on('error', error => {
          fs.unlink(destPath, () => {}); // Limpiar archivo parcial
          reject(error);
        });
    });
  }

  // ===========================================================================
  // SUBTITLE GENERATION
  // ===========================================================================

  /**
   * Genera subtítulos sincronizados palabra por palabra
   */
  generateSubtitles(script: string, durationSeconds: number): SubtitleWord[] {
    const words = script.split(/\s+/).filter(w => w.length > 0);
    const totalFrames = secondsToFrames(durationSeconds, VIDEO_CONFIG.specs.fps);
    const framesPerWord = totalFrames / words.length;

    return words.map((word, index) => {
      const startFrame = Math.round(index * framesPerWord);
      const endFrame = Math.round((index + 1) * framesPerWord) - VIDEO_CONFIG.subtitles.wordPadding;

      // Detectar inicio/fin de oración
      const isStartOfSentence = index === 0 || /[.!?]$/.test(words[index - 1]);
      const isEndOfSentence = /[.!?]$/.test(word);

      return {
        word: word.replace(/[.,!?;:]$/, ''), // Limpiar puntuación
        startFrame: Math.max(0, startFrame),
        endFrame: Math.min(totalFrames, endFrame),
        index,
        isStartOfSentence,
        isEndOfSentence,
      };
    });
  }

  // ===========================================================================
  // SECTION GENERATION
  // ===========================================================================

  /**
   * Genera las secciones del video con contenido
   */
  generateSections(request: VideoRenderRequest): VideoSection[] {
    const fps = VIDEO_CONFIG.specs.fps;
    const totalDuration = request.audioDuration;

    // Calcular duración proporcional de cada sección
    const hookDuration = Math.min(8, totalDuration * 0.15);
    const headlineDuration = Math.min(4, totalDuration * 0.07);
    const mainDuration = totalDuration * 0.55;
    const impactDuration = Math.min(5, totalDuration * 0.09);
    const outroDuration = totalDuration - hookDuration - headlineDuration - mainDuration - impactDuration;

    let currentFrame = 0;

    const sections: VideoSection[] = [
      {
        name: 'hook',
        startFrame: currentFrame,
        endFrame: (currentFrame += secondsToFrames(hookDuration, fps)),
        durationSeconds: hookDuration,
        content: request.hook || this.extractHook(request.script),
        effects: { zoomFactor: 1.2, transitionIn: 'zoom' },
      },
      {
        name: 'headline',
        startFrame: currentFrame,
        endFrame: (currentFrame += secondsToFrames(headlineDuration, fps)),
        durationSeconds: headlineDuration,
        content: request.title,
        image: request.imagePath,
        effects: { blurIntensity: 0.5, transitionIn: 'fade' },
      },
      {
        name: 'main',
        startFrame: currentFrame,
        endFrame: (currentFrame += secondsToFrames(mainDuration, fps)),
        durationSeconds: mainDuration,
        content: request.body || this.extractBody(request.script),
        image: request.imagePath,
        effects: { parallaxOffset: -20 },
      },
      {
        name: 'impact',
        startFrame: currentFrame,
        endFrame: (currentFrame += secondsToFrames(impactDuration, fps)),
        durationSeconds: impactDuration,
        content: this.extractImpact(request.script),
        effects: { glowIntensity: 0.8, zoomFactor: 1.1 },
      },
      {
        name: 'outro',
        startFrame: currentFrame,
        endFrame: secondsToFrames(totalDuration, fps),
        durationSeconds: outroDuration,
        content: request.cta || 'Síguenos para más noticias de IA',
        effects: { transitionOut: 'fade' },
      },
    ];

    return sections;
  }

  /**
   * Extrae el hook del script (primera oración)
   */
  private extractHook(script: string): string {
    const firstSentence = script.match(/^[^.!?]+[.!?]/);
    return firstSentence ? firstSentence[0].trim() : script.substring(0, 100);
  }

  /**
   * Extrae el body del script (contenido principal)
   */
  private extractBody(script: string): string {
    const sentences = script.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length <= 2) return script;
    return sentences.slice(1, -1).join('. ').trim() + '.';
  }

  /**
   * Extrae el impacto del script (penúltima oración)
   */
  private extractImpact(script: string): string {
    const sentences = script.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length < 2) return '';
    return sentences[sentences.length - 2].trim() + '.';
  }

  // ===========================================================================
  // DATA CONTRACT GENERATION
  // ===========================================================================

  /**
   * Genera el contrato de datos completo para Remotion
   */
  private generateDataContract(
    request: VideoRenderRequest,
    assets: { audioPath: string; heroImage: string; contextImage: string; outroImage: string },
    subtitles: SubtitleWord[],
    sections: VideoSection[]
  ): RemotionDataContract {
    const fps = VIDEO_CONFIG.specs.fps;
    const totalFrames = secondsToFrames(request.audioDuration, fps);

    return {
      meta: {
        videoId: request.videoId,
        title: request.title,
        topic: request.topic,
        source: request.newsSource,
        company: request.company,
        newsType: request.newsType,
        durationInFrames: totalFrames,
        fps,
        generatedAt: new Date().toISOString(),
      },
      content: {
        hook: request.hook || this.extractHook(request.script),
        headline: request.title,
        body: request.body || this.extractBody(request.script),
        impact: this.extractImpact(request.script),
        cta: request.cta || 'Síguenos para más noticias de IA',
        fullScript: request.script,
      },
      assets: {
        audioPath: assets.audioPath,
        audioDuration: request.audioDuration,
        heroImage: assets.heroImage,
        contextImage: assets.contextImage,
        outroImage: assets.outroImage,
        companyLogo: request.company ? `logos/${request.company.toLowerCase()}.png` : undefined,
      },
      subtitles,
      sections,
      style: {
        theme: 'cyberpunk',
        primaryColor: '#00FFFF',
        accentColor: '#FF00FF',
        showSubtitles: true,
        showProgressBar: true,
        effects: {
          zoom: true,
          blur: true,
          parallax: true,
          glow: true,
        },
      },
    };
  }

  /**
   * Escribe el data.json para Remotion
   */
  private async writeDataJson(data: RemotionDataContract): Promise<void> {
    const dataPath = VIDEO_CONFIG.paths.dataJson;
    const publicDir = path.dirname(dataPath);

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  }

  /**
   * Genera el archivo props.json en formato VideoProps para Remotion
   * Este formato coincide con lo que espera AINewsShort.tsx
   */
  private generateVideoProps(
    request: VideoRenderRequest,
    assets: { audioPath: string; heroImage: string; contextImage: string; outroImage: string }
  ): Record<string, unknown> {
    // Extraer detalles del script (bullet points)
    const details = request.script
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 150)
      .slice(0, 4);

    return {
      news: {
        title: request.title,
        description: request.body || request.script,
        details,
        source: request.newsSource || 'Sintaxis IA',
        publishedAt: new Date().toISOString().split('T')[0],
      },
      images: {
        hero: assets.heroImage,
        context: assets.contextImage,
      },
      topics: request.topic ? [request.topic, request.company || ''].filter(Boolean) : [],
      hashtags: ['#IA', '#AI', '#Tech'],
      newsType: request.newsType || 'other',
      audio: {
        voice: {
          src: assets.audioPath,
          volume: 1.0,
        },
      },
      config: {
        duration: Math.ceil(request.audioDuration) + 5, // Audio + 5s buffer
        fps: VIDEO_CONFIG.specs.fps,
        enhancedEffects: true,
      },
    };
  }

  /**
   * Escribe el props.json para pasar a Remotion CLI
   * Retorna la ruta absoluta del archivo
   */
  private writePropsJson(
    request: VideoRenderRequest,
    assets: { audioPath: string; heroImage: string; contextImage: string; outroImage: string }
  ): string {
    const props = this.generateVideoProps(request, assets);
    const propsPath = path.join(VIDEO_CONFIG.paths.remotionApp, 'props.json');

    fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));
    return propsPath;
  }

  // ===========================================================================
  // REMOTION EXECUTION
  // ===========================================================================

  /**
   * Ejecuta el comando de renderizado de Remotion
   */
  private async executeRemotionRender(
    request: VideoRenderRequest,
    options: VideoRenderOptions,
    assets: { audioPath: string; heroImage: string; contextImage: string; outroImage: string }
  ): Promise<string> {
    const compositionId = options.usePreview
      ? VIDEO_CONFIG.remotion.previewCompositionId
      : VIDEO_CONFIG.remotion.compositionId;

    const outputFileName = options.outputFileName || `video_${request.videoId}`;
    const outputDir = options.outputDir || VIDEO_CONFIG.paths.outputDir;

    // Asegurar directorio de salida existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${outputFileName}.mp4`);
    const crf = this.getCrf(options.quality);

    // Generar props.json con los datos dinámicos
    const propsPath = this.writePropsJson(request, assets);

    // Construir comando de Remotion
    // Nota: En Windows, paths con espacios deben ir entre comillas
    const remotionArgs = [
      'remotion',
      'render',
      compositionId,
      `"${outputPath}"`,
      `--props="${propsPath}"`,
      `--codec=${VIDEO_CONFIG.specs.codec}`,
      `--crf=${crf}`,
      `--pixel-format=${VIDEO_CONFIG.specs.pixelFormat}`,
    ];

    if (VIDEO_CONFIG.remotion.enableGpu) {
      remotionArgs.push('--gl=angle');
    }

    if (VIDEO_CONFIG.remotion.concurrency) {
      remotionArgs.push(`--concurrency=${VIDEO_CONFIG.remotion.concurrency}`);
    }

    console.log(`   🎬 Ejecutando: npx ${remotionArgs.join(' ')}`);

    return new Promise((resolve, reject) => {
      const timeout = options.timeout || VIDEO_CONFIG.remotion.timeout;
      let timedOut = false;

      const process = spawn('npx', remotionArgs, {
        cwd: VIDEO_CONFIG.paths.remotionApp,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const timeoutId = setTimeout(() => {
        timedOut = true;
        process.kill('SIGTERM');
        reject(new Error(`Timeout de rendering (${timeout / 1000}s)`));
      }, timeout);

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', data => {
        stdout += data.toString();
        // Parsear progreso si está disponible
        const progressMatch = data.toString().match(/(\d+)%/);
        if (progressMatch) {
          const progress = parseInt(progressMatch[1], 10);
          this.updateStatus({
            progress: 50 + progress * 0.4, // 50-90% durante rendering
            message: `Renderizando: ${progress}%`,
          });
        }
      });

      process.stderr?.on('data', data => {
        stderr += data.toString();
      });

      process.on('close', code => {
        clearTimeout(timeoutId);

        if (timedOut) return;

        if (code === 0) {
          this.updateStatus({ progress: 95, phase: 'finalizing', message: 'Finalizando...' });
          resolve(outputPath);
        } else {
          reject(new Error(`Remotion falló con código ${code}: ${stderr || stdout}`));
        }
      });

      process.on('error', error => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Obtiene el CRF basado en la calidad solicitada
   */
  private getCrf(quality?: 'low' | 'medium' | 'high' | 'ultra'): number {
    if (!quality) return VIDEO_CONFIG.specs.crf;
    return VIDEO_QUALITY_PRESETS[quality].crf;
  }

  /**
   * Asegura que los directorios necesarios existen
   */
  private ensureDirectories(options: VideoRenderOptions): void {
    const dirs = [
      VIDEO_CONFIG.paths.outputDir,
      VIDEO_CONFIG.paths.tempDir,
      VIDEO_CONFIG.paths.publicAssets,
      options.outputDir,
    ].filter(Boolean) as string[];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Actualiza el estado del servicio
   */
  private updateStatus(partial: Partial<VideoRenderStatus>): void {
    this.status = { ...this.status, ...partial };
  }

  /**
   * Obtiene el estado actual del servicio
   */
  getStatus(): VideoRenderStatus {
    return { ...this.status };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

/** Instancia singleton del servicio */
export const videoRenderingService = new VideoRenderingService();

export default videoRenderingService;
