// ===================================
// ROOT - Configuración raíz de Remotion
// ===================================

import { Composition } from 'remotion';
import { AINewsShort } from './compositions/AINewsShort';
import { theme } from './theme';
import type { VideoProps } from './types/video.types';

/**
 * Root component que define todas las composiciones disponibles
 * Este es el punto de entrada para Remotion
 *
 * Composiciones disponibles (Prompt 13.2 - Limpieza):
 * - AINewsShort: Video optimizado de 50s (1 noticia con efectos)
 * - AINewsShort-Preview: Preview de 10s para desarrollo rápido
 *
 * Composiciones eliminadas (obsoletas):
 * - SintaxisIA (viejo - múltiples noticias)
 * - SintaxisIA-Preview (viejo)
 * - SintaxisIA-LowRes (viejo)
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

      {/* AINewsShort: Video optimizado de 50 segundos - PRODUCCION */}
      <Composition
        id="AINewsShort"
        component={AINewsShort}
        durationInFrames={50 * video.fps}
        fps={video.fps}
        width={video.width}
        height={video.height}
        defaultProps={defaultAINewsProps}
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
