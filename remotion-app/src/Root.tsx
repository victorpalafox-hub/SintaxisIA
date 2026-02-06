// ===================================
// ROOT - Configuración raíz de Remotion
// ===================================

import { Composition } from 'remotion';
import type { CalculateMetadataFunction } from 'remotion';
import { AINewsShort } from './compositions/AINewsShort';
import { theme } from './theme';
import type { VideoProps } from './types/video.types';

// =============================================================================
// CALCULATE METADATA - Duración dinámica (Prompt 30)
// =============================================================================

/**
 * Calcula la duración real del video basándose en config.duration de los props.
 *
 * Antes de Prompt 30, la Composition tenía durationInFrames fijo (50*fps = 1500).
 * Esto causaba que videos con audio > 37s se cortaran abruptamente porque
 * Remotion SOLO renderiza hasta el durationInFrames de la Composition.
 *
 * Ahora: video-rendering.service.ts calcula la duración correcta y la pasa
 * via props.config.duration. calculateMetadata la lee y ajusta la Composition.
 *
 * @since Prompt 30
 */
const calculateMetadata: CalculateMetadataFunction<Partial<VideoProps>> = async ({ props }) => {
  const fps = props.config?.fps ?? 30;
  const duration = props.config?.duration ?? 50;
  return {
    durationInFrames: duration * fps,
    fps,
  };
};

/**
 * Root component que define todas las composiciones disponibles
 * Este es el punto de entrada para Remotion
 *
 * Composiciones disponibles (Prompt 13.2 - Limpieza):
 * - AINewsShort: Video optimizado dinámico (1 noticia con efectos)
 * - AINewsShort-Preview: Preview de 10s para desarrollo rápido
 *
 * Composiciones eliminadas (obsoletas):
 * - SintaxisIA (viejo - múltiples noticias)
 * - SintaxisIA-Preview (viejo)
 * - SintaxisIA-LowRes (viejo)
 *
 * @updated Prompt 30 - calculateMetadata para duración dinámica
 */
export const RemotionRoot: React.FC = () => {
  const { video } = theme;

  // Props por defecto para AINewsShort (usado en desarrollo/preview)
  const defaultAINewsProps: VideoProps = {
    news: {
      title: 'Google Genie: IA que Crea Mundos Virtuales',
      description:
        'Google DeepMind presenta Project Genie, un modelo de IA capaz de generar mundos virtuales interactivos a partir de una sola imagen. Esta tecnología revolucionaria podría transformar la industria de los videojuegos y la creación de contenido digital.',
      details: [
        'Genera mundos 3D interactivos',
        'Usa arquitectura transformer',
        'Entrenado con 30,000 horas de video',
      ],
      source: 'Google DeepMind Blog',
      publishedAt: '2026-01-29',
    },
    images: {
      hero: 'https://logo.clearbit.com/google.com',
      context: 'https://picsum.photos/600/400',
    },
    topics: ['Google', 'DeepMind', 'Genie', 'AI Gaming'],
    hashtags: ['#IA', '#AI', '#Google', '#Genie', '#Gaming'],
    newsType: 'product-launch',
    audio: {
      voice: {
        src: 'audio/sample-voice.mp3',
        volume: 1.0,
      },
    },
    config: {
      duration: 50,
      fps: 30,
      enhancedEffects: true,
    },
  };

  return (
    <>
      {/* ==========================================
          COMPOSICIONES ACTIVAS (AINewsShort.tsx)
          Prompt 13: Video optimizado para 1 noticia
          ========================================== */}

      {/* AINewsShort: Video con duración dinámica - PRODUCCION (Prompt 30)
          calculateMetadata lee config.duration de props y ajusta durationInFrames.
          El default de 50*fps solo aplica en Remotion Studio sin props custom. */}
      <Composition
        id="AINewsShort"
        component={AINewsShort}
        durationInFrames={50 * video.fps}
        fps={video.fps}
        width={video.width}
        height={video.height}
        defaultProps={defaultAINewsProps}
        calculateMetadata={calculateMetadata}
      />

      {/* AINewsShort Preview: Solo 10 segundos - DESARROLLO */}
      <Composition
        id="AINewsShort-Preview"
        component={AINewsShort}
        durationInFrames={10 * video.fps}
        fps={video.fps}
        width={video.width}
        height={video.height}
        defaultProps={defaultAINewsProps}
      />
    </>
  );
};

export default RemotionRoot;
