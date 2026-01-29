// ===================================
// ROOT - Configuración raíz de Remotion
// ===================================

import { Composition } from 'remotion';
import { Video } from './Video';
import { AINewsShort } from './compositions/AINewsShort';
import { theme } from './theme';
import type { VideoProps } from './types/video.types';

/**
 * Root component que define todas las composiciones disponibles
 * Este es el punto de entrada para Remotion
 *
 * Composiciones disponibles:
 * - SintaxisIA: Video original de 60s (múltiples noticias)
 * - SintaxisIA-Preview: Preview de 10s
 * - SintaxisIA-LowRes: Baja resolución para testing
 * - AINewsShort: Video optimizado de 55s (1 noticia) [NUEVO Prompt 13]
 * - AINewsShort-Preview: Preview del video optimizado
 */
export const RemotionRoot: React.FC = () => {
  const { video } = theme;

  // Props por defecto para AINewsShort (usado en desarrollo/preview)
  const defaultAINewsProps: VideoProps = {
    news: {
      title: 'Google Genie: IA que Crea Mundos Virtuales',
      description: 'Google DeepMind presenta Project Genie, un modelo de IA capaz de generar mundos virtuales interactivos a partir de una sola imagen. Esta tecnología revolucionaria podría transformar la industria de los videojuegos y la creación de contenido digital.',
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
      duration: 55,
      fps: 30,
      enhancedEffects: true,
    },
  };

  return (
    <>
      {/* ==========================================
          COMPOSICIONES ORIGINALES (Video.tsx)
          ========================================== */}

      {/* Composición principal: Video Short de 60 segundos */}
      <Composition
        id="SintaxisIA"
        component={Video}
        durationInFrames={video.durationFrames}
        fps={video.fps}
        width={video.width}
        height={video.height}
      />

      {/* Composición de prueba: Solo 10 segundos para desarrollo */}
      <Composition
        id="SintaxisIA-Preview"
        component={Video}
        durationInFrames={video.preview.durationFrames}
        fps={video.fps}
        width={video.width}
        height={video.height}
      />

      {/* Composición de baja resolución para pruebas rápidas */}
      <Composition
        id="SintaxisIA-LowRes"
        component={Video}
        durationInFrames={video.durationFrames}
        fps={video.fps}
        width={video.lowRes.width}
        height={video.lowRes.height}
      />

      {/* ==========================================
          COMPOSICIONES OPTIMIZADAS (AINewsShort.tsx)
          Prompt 13: Video para 1 noticia con efectos
          ========================================== */}

      {/* AINewsShort: Video optimizado de 55 segundos */}
      <Composition
        id="AINewsShort"
        component={AINewsShort}
        durationInFrames={55 * video.fps}
        fps={video.fps}
        width={video.width}
        height={video.height}
        defaultProps={defaultAINewsProps}
      />

      {/* AINewsShort Preview: Solo 10 segundos para desarrollo */}
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
