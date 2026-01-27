// ===================================
// ROOT - Configuración raíz de Remotion
// ===================================

import { Composition } from 'remotion';
import { Video } from './Video';
import { theme } from './theme';

/**
 * Root component que define todas las composiciones disponibles
 * Este es el punto de entrada para Remotion
 */
export const RemotionRoot: React.FC = () => {
  const { video } = theme;

  return (
    <>
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
    </>
  );
};

export default RemotionRoot;
