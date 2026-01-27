// ===================================
// WATERMARK - Marca de agua de Sintaxis IA
// ===================================

import React from 'react';
import { Img, staticFile } from 'remotion';
import { theme } from '../../theme';

interface WatermarkProps {
  opacity?: number;
  size?: number;
  margin?: number;
}

/**
 * Componente de marca de agua para videos de Sintaxis IA
 * Se posiciona en la esquina inferior derecha
 * Usa valores del theme por defecto
 */
export const Watermark: React.FC<WatermarkProps> = ({
  opacity = theme.sizes.watermarkOpacity,
  size = theme.sizes.logoWidth,
  margin = theme.sizes.watermarkMargin,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: margin,
        right: margin,
        width: size,
        height: size,
        zIndex: 9999,
        opacity: opacity,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={staticFile('assets/logo/marcaaguatransparente.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default Watermark;
