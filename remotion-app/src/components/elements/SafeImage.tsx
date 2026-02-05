/**
 * @fileoverview SafeImage - Componente con Preload y Fallback
 *
 * Maneja carga de imágenes externas con preload obligatorio.
 * Usa delayRender() de Remotion para pausar render hasta carga completa.
 *
 * Problema resuelto: Glitches visuales (flash blanco) al inicio de cada imagen
 * Solución: Preload con useDelayRender que pausa Remotion hasta carga completa
 *
 * @author Sintaxis IA
 * @version 1.1.0
 * @since Prompt 13.1
 * @updated Prompt 19.3.2 - Agregado preload con useDelayRender
 */

import React, { useState, useEffect, useRef } from 'react';
import { Img, delayRender, continueRender } from 'remotion';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/** Timeout para carga de imagen (ms) - 8s para imágenes remotas */
const IMAGE_LOAD_TIMEOUT = 8000;

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
 * SafeImage - Componente de imagen con preload obligatorio
 *
 * Características:
 * - Preload con delayRender (Remotion espera carga completa)
 * - Fallback automático si imagen falla
 * - Timeout de seguridad (8 segundos)
 * - Opacity transition para transición suave
 * - Compatible con imágenes externas (Pexels, etc)
 *
 * @example
 * // Uso básico
 * <SafeImage
 *   src="https://images.pexels.com/photos/123456/..."
 *   width={600}
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
  // Estado del componente
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);

  // Refs para evitar múltiples llamadas a continueRender
  const handleRef = useRef<number | null>(null);
  const isCompleteRef = useRef(false);

  // Generar fallback si no hay fallback personalizado
  const defaultFallback = generatePlaceholder(src, width, height);
  const finalFallback = fallbackSrc || defaultFallback;

  /**
   * Effect: Preload de imagen ANTES de renderizar
   * Usa delayRender para que Remotion espere la carga
   */
  useEffect(() => {
    // Reset refs cuando cambia src
    isCompleteRef.current = false;
    setIsLoaded(false);

    // Crear handle de delayRender
    const handle = delayRender(`Loading image: ${src.substring(0, 50)}...`);
    handleRef.current = handle;

    const img = new Image();

    /**
     * Función para completar el render (solo una vez)
     * Evita múltiples llamadas a continueRender
     */
    const complete = (success: boolean, finalSrc: string) => {
      if (isCompleteRef.current) return;
      isCompleteRef.current = true;

      setImageSrc(finalSrc);
      setIsLoaded(true);
      continueRender(handle);

      if (!success) {
        console.warn(`[SafeImage] Using fallback for: ${src.substring(0, 50)}...`);
      }
    };

    // onload: Imagen cargada correctamente
    img.onload = () => complete(true, src);

    // onerror: Imagen falló, usar fallback
    img.onerror = () => complete(false, finalFallback);

    // Timeout de seguridad para evitar bloqueo indefinido
    const timeoutId = setTimeout(() => {
      if (!isCompleteRef.current) {
        console.warn(`[SafeImage] Timeout (${IMAGE_LOAD_TIMEOUT}ms): ${src.substring(0, 50)}...`);
        complete(false, finalFallback);
      }
    }, IMAGE_LOAD_TIMEOUT);

    // Iniciar carga de la imagen
    img.src = src;

    // Cleanup: Limpiar timeout y asegurar continueRender si unmount
    return () => {
      clearTimeout(timeoutId);
      // Si el componente se desmonta antes de completar, continuar render
      if (!isCompleteRef.current && handleRef.current !== null) {
        isCompleteRef.current = true;
        continueRender(handleRef.current);
      }
    };
  }, [src, finalFallback]);

  return (
    <Img
      src={imageSrc}
      style={{
        ...style,
        // Ocultar hasta que esté cargado para evitar flash
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.1s ease-in',
      }}
      alt={alt}
    />
  );
};

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Genera placeholder dinámico basado en el URL original
 *
 * Extrae información del URL para crear un placeholder personalizado:
 * - Clearbit: Extrae la inicial del dominio (google.com -> G)
 * - Logo.dev: Extrae la inicial del dominio
 * - Picsum: Usa "IMG" como default
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
  // Detectar picsum (placeholder genérico)
  else if (originalSrc.includes('picsum.photos')) {
    initial = 'IMG';
  }

  // Generar URL de UI Avatars con estilo editorial
  const size = Math.max(width, height);

  return (
    `https://ui-avatars.com/api/?` +
    `name=${encodeURIComponent(initial)}` +
    `&size=${size}` +
    `&background=4A9EFF` + // Azul editorial
    `&color=000000` + // Negro
    `&bold=true` +
    `&format=png`
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default SafeImage;
