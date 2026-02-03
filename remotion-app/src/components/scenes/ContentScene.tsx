/**
 * @fileoverview ContentScene - Explicacion Completa con Parallax
 *
 * Escena principal de contenido con efectos dinámicos.
 *
 * Duración: 37 segundos (1110 frames a 30fps)
 *
 * Elementos:
 * - Imagen CONTEXT (screenshot/demo) con parallax
 * - Texto descriptivo secuencial (frases que cambian cada ~12s) - Prompt 19.2
 * - Bullet points con fade in escalonado
 * - Barra de progreso continua
 *
 * Layout flexible: con imagen o sin imagen
 *
 * @author Sintaxis IA
 * @version 2.2.0
 * @since Prompt 13
 * @updated Prompt 19.2 - Texto secuencial
 * @updated Prompt 19.2.6 - Bullet points eliminados
 */

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion';
import { colors, spacing, textAnimation, imageAnimation } from '../../styles/themes';
import { ProgressBar } from '../ui/ProgressBar';
import { SafeImage } from '../elements/SafeImage';
import { splitIntoReadablePhrases, getPhraseTiming } from '../../utils';
import type { ContentSceneProps } from '../../types/video.types';

/**
 * CONTENT SCENE - Explicación Completa
 *
 * Muestra el contenido principal de la noticia con efectos:
 * - Parallax en imagen (movimiento vertical sutil)
 * - Zoom sutil (1.0 -> 1.05)
 * - Fade in escalonado de bullet points
 * - Imágenes dinámicas que cambian cada ~15s (Prompt 19.1)
 *
 * @example
 * <ContentScene
 *   description="Google presenta una IA revolucionaria..."
 *   details={["Genera mundos 3D", "Usa transformers", "Open source"]}
 *   images={{ context: "https://example.com/screenshot.png" }}
 *   dynamicScenes={[{ sceneIndex: 0, startSecond: 8, endSecond: 23, imageUrl: "...", ... }]}
 *   sceneStartSecond={8}
 *   totalDuration={1650}
 *   fps={30}
 *   dynamicEffects={true}
 * />
 */
export const ContentScene: React.FC<ContentSceneProps> = ({
  description,
  details,
  images,
  dynamicScenes,
  sceneStartSecond = 8,
  totalDuration,
  fps,
  dynamicEffects = true,
}) => {
  const frame = useCurrentFrame();

  // ==========================================
  // EFECTOS DE ENTRADA
  // ==========================================

  // Cross fade desde Hero Scene (primeros 30 frames)
  const sceneOpacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // ==========================================
  // SELECCIÓN DE IMAGEN (Legacy vs Dinámico)
  // ==========================================

  // Calcular segundo actual del video
  const currentSecond = sceneStartSecond + (frame / fps);

  /**
   * Obtiene la imagen actual basándose en el tiempo del video.
   *
   * Si hay imágenes dinámicas (Prompt 19.1), busca la imagen del segmento actual.
   * Si no, usa el comportamiento legacy (context image → hero fallback).
   */
  const getCurrentImage = (): string | undefined => {
    // Si hay imágenes dinámicas, buscar la del segmento actual
    if (dynamicScenes && dynamicScenes.length > 0) {
      const currentScene = dynamicScenes.find(
        scene => currentSecond >= scene.startSecond && currentSecond < scene.endSecond
      );
      // Si encontramos una escena, usar su imagen
      if (currentScene) {
        return currentScene.imageUrl;
      }
      // Si estamos fuera de rango, usar la última imagen disponible
      const lastScene = dynamicScenes[dynamicScenes.length - 1];
      if (currentSecond >= lastScene.endSecond) {
        return lastScene.imageUrl;
      }
      // Si estamos antes del primer segmento, usar la primera imagen
      return dynamicScenes[0].imageUrl;
    }

    // Fallback a comportamiento legacy
    return images?.context || images?.hero;
  };

  // Imagen actual a mostrar
  const contextImage = getCurrentImage();

  // Parallax: movimiento vertical sutil de 20px hacia arriba
  // Durante 10 segundos (300 frames a 30fps)
  const parallaxY = dynamicEffects && contextImage
    ? interpolate(
        frame,
        [0, 300],
        [0, -20],
        {
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.33, 1, 0.68, 1), // Ease out
        }
      )
    : 0;

  // Zoom in muy sutil (1.0 -> 1.05) para dar vida a la imagen
  const imageScale = dynamicEffects && contextImage
    ? interpolate(
        frame,
        [0, 300],
        [1.0, 1.05],
        {
          extrapolateRight: 'clamp',
          easing: Easing.linear,
        }
      )
    : 1.0;

  // Fade in de imagen (Prompt 19.3 - transición más suave)
  const imageOpacity = contextImage
    ? interpolate(frame, [0, imageAnimation.fadeInFrames], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  // ==========================================
  // TEXTO SECUENCIAL (Prompt 19.2)
  // ==========================================

  // Duración de ContentScene: 37 segundos
  const sceneDurationFrames = 37 * fps;

  // Dividir descripción en frases legibles
  const phrases = useMemo(
    () => splitIntoReadablePhrases(description, {
      maxCharsPerPhrase: textAnimation.maxCharsPerPhrase,
      minWordsPerPhrase: textAnimation.minWordsPerPhrase,
    }),
    [description]
  );

  // Calcular frase actual y opacity para transiciones
  const phraseTiming = getPhraseTiming(
    frame,
    sceneDurationFrames,
    phrases.length,
    {
      fadeInFrames: textAnimation.fadeInFrames,
      fadeOutFrames: textAnimation.fadeOutFrames,
    }
  );

  // Obtener frase actual a mostrar
  const currentPhrase = phrases[phraseTiming.currentPhraseIndex];

  // ==========================================
  // EFECTOS DE TEXTO
  // ==========================================

  // Slide up sutil del texto (30px -> 0px) - solo al inicio de la escena
  const textY = interpolate(
    frame,
    [10, 40],
    [30, 0],
    {
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  // Opacity combinada: fade inicial de escena + transición de frase
  const baseOpacity = interpolate(
    frame,
    [10, 40],
    [0, 1],
    {
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  // Opacity final: combina fade de escena con transición de frase
  const descriptionOpacity = baseOpacity * phraseTiming.opacity;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg,
          ${colors.background.gradient.start} 0%,
          ${colors.background.gradient.end} 100%)`,
        opacity: sceneOpacity,
      }}
    >
      {/* Contenedor principal con espacio para barra de progreso */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.padding.lg,
          // +60 en bottom para dejar espacio a la barra de progreso
          padding: `${spacing.safe.top}px ${spacing.safe.horizontal}px ${spacing.safe.bottom + 60}px`,
        }}
      >
        {/* IMAGEN CONTEXT (si existe) */}
        {contextImage && (
          <div
            style={{
              transform: `translateY(${parallaxY}px) scale(${imageScale})`,
              opacity: imageOpacity,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            <SafeImage
              src={contextImage}
              width={600}
              height={400}
              style={{
                width: 600,
                height: 400,
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* DESCRIPCION - Texto Secuencial (Prompt 19.2) */}
        <div
          style={{
            transform: `translateY(${textY}px)`,
            opacity: descriptionOpacity,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
            fontWeight: 500,
            fontSize: 32,
            color: colors.text.secondary,
            textAlign: 'center',
            lineHeight: 1.6,
            // Más ancho si no hay imagen
            maxWidth: contextImage ? 900 : 1000,
            padding: '0 40px',
            // Altura mínima para evitar saltos de layout
            // Aumentado a 150 en Prompt 19.2.6 al eliminar bullet points
            minHeight: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Espacio extra para compensar bullet points eliminados (Prompt 19.2.6)
            marginBottom: contextImage ? 40 : 60,
          }}
        >
          {/* Mostrar frase actual o descripción completa como fallback */}
          {currentPhrase?.text || description}
        </div>

        {/* BULLET POINTS eliminados en Prompt 19.2.6
           * Razón: Compiten visualmente con el texto secuencial (Prompt 19.2)
           * Los bullet points eran extractos del mismo script que ya se muestra
           * secuencialmente arriba. Eliminarlos simplifica el layout.
           */}
      </AbsoluteFill>

      {/* BARRA DE PROGRESO */}
      <ProgressBar color={colors.primary} />
    </AbsoluteFill>
  );
};

export default ContentScene;
