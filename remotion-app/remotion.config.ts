// ===================================
// REMOTION CONFIG - Configuración de renderizado
// ===================================

import { Config } from '@remotion/cli/config';

/**
 * Configuración de Remotion para Sintaxis IA
 *
 * Formato: YouTube Shorts (vertical 9:16)
 * - Resolución: 1080x1920
 * - FPS: 30
 * - Duración: 60 segundos (1800 frames)
 * - Codec: H.264 para máxima compatibilidad
 *
 * Nota: En Remotion v4, las opciones de codec, crf, etc.
 * se pasan como flags en la CLI:
 * --codec=h264 --crf=18 --audio-codec=aac
 */

// Configuración de webpack (si es necesario)
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      // Alias para imports más limpios
      alias: {
        ...config.resolve?.alias,
        '@components': './src/components',
        '@backgrounds': './src/components/backgrounds',
        '@effects': './src/components/effects',
        '@sequences': './src/components/sequences',
        '@ui': './src/components/ui'
      }
    }
  };
});
