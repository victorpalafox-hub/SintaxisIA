/**
 * @fileoverview SafeImage - Componente con Fallback Automatico
 *
 * Maneja errores de CORS y carga de imagenes externas.
 * Si la imagen principal falla, usa placeholder automaticamente.
 *
 * Problema resuelto: Error CORS con imagenes de Clearbit, etc. en Remotion Preview
 * Solucion: Fallback automatico a UI Avatars cuando hay error de carga
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 13.1
 */

import React, { useState } from 'react';
import { Img } from 'remotion';

// =============================================================================
// INTERFACES
// =============================================================================

interface SafeImageProps {
  /** URL de la imagen principal */
  src: string;
  /** URL de fallback si la imagen principal falla (opcional) */
  fallbackSrc?: string;
  /** Estilos CSS para la imagen */
  style?: React.CSSProperties;
  /** Texto alternativo para accesibilidad */
  alt?: string;
  /** Ancho de la imagen (para generar placeholder) */
  width?: number;
  /** Alto de la imagen (para generar placeholder) */
  height?: number;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

/**
 * SafeImage - Componente de imagen con manejo de errores
 *
 * Caracteristicas:
 * - Fallback automatico si la imagen falla (CORS, 404, etc.)
 * - Genera placeholder dinamico basado en el URL original
 * - Compatible con Remotion (usa <Img> internamente)
 * - Estilo cyberpunk en placeholders (cyan/negro)
 *
 * @example
 * // Uso basico
 * <SafeImage
 *   src="https://logo.clearbit.com/google.com"
 *   width={400}
 *   height={400}
 * />
 *
 * @example
 * // Con fallback personalizado
 * <SafeImage
 *   src="https://example.com/image.png"
 *   fallbackSrc="https://example.com/fallback.png"
 *   style={{ borderRadius: 16 }}
 * />
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc,
  style,
  alt = '',
  width = 400,
  height = 400,
}) => {
  // Estado para manejar el cambio de URL cuando hay error
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Generar placeholder si no hay fallback personalizado
  const defaultFallback = generatePlaceholder(src, width, height);
  const finalFallback = fallbackSrc || defaultFallback;

  /**
   * Manejador de error de carga de imagen
   * Cambia al fallback cuando la imagen principal falla
   */
  const handleError = () => {
    if (!hasError) {
      console.warn(`[SafeImage] Error loading image: ${src}, using fallback`);
      setImageSrc(finalFallback);
      setHasError(true);
    }
  };

  return (
    <Img
      src={imageSrc}
      onError={handleError}
      style={style}
      alt={alt}
    />
  );
};

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Genera placeholder dinamico basado en el URL original
 *
 * Extrae informacion del URL para crear un placeholder personalizado:
 * - Clearbit: Extrae la inicial del dominio (google.com -> G)
 * - Otros: Usa "AI" como default
 *
 * @param originalSrc - URL original de la imagen
 * @param width - Ancho deseado del placeholder
 * @param height - Alto deseado del placeholder
 * @returns URL de UI Avatars con estilo cyberpunk
 */
function generatePlaceholder(
  originalSrc: string,
  width: number = 400,
  height: number = 400
): string {
  // Extraer inicial del nombre/dominio
  let initial = 'AI';

  // Detectar Clearbit y extraer dominio
  if (originalSrc.includes('clearbit.com')) {
    // "logo.clearbit.com/google.com" -> "google" -> "G"
    const match = originalSrc.match(/clearbit\.com\/([^/.]+)/);
    if (match && match[1]) {
      initial = match[1][0].toUpperCase();
    }
  }
  // Detectar Logo.dev
  else if (originalSrc.includes('logo.dev')) {
    const match = originalSrc.match(/logo\.dev\/([^/.?]+)/);
    if (match && match[1]) {
      initial = match[1][0].toUpperCase();
    }
  }
  // Detectar picsum (placeholder generico)
  else if (originalSrc.includes('picsum.photos')) {
    initial = 'IMG';
  }

  // Generar URL de UI Avatars con estilo cyberpunk
  const size = Math.max(width, height);

  return (
    `https://ui-avatars.com/api/?` +
    `name=${encodeURIComponent(initial)}` +
    `&size=${size}` +
    `&background=00F0FF` + // Cyan cyberpunk
    `&color=000000` + // Negro
    `&bold=true` +
    `&format=png`
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default SafeImage;
