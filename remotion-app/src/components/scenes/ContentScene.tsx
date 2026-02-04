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
 * @version 2.3.0
 * @since Prompt 13
 * @updated Prompt 19.2 - Texto secuencial
 * @updated Prompt 19.2.6 - Bullet points eliminados
 * @updated Prompt 19.2.7 - Aumentar tamaño de texto (72px)
 * @updated Prompt 19.8 - Animaciones dinámicas: parallax/zoom full-duration, per-phrase slide, glow pulse
 */

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion';
import { colors, spacing, textAnimation, imageAnimation, contentTextStyle, contentAnimation } from '../../styles/themes';
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
  audioSync,
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

  // Duración de ContentScene en frames (necesario antes de usarlo en animaciones)
  const sceneDurationFrames = 37 * fps;

  // ==========================================
  // EFECTOS DINÁMICOS DE IMAGEN (Prompt 19.8)
  // ==========================================

  // Parallax: movimiento vertical orgánico durante toda la escena
  // Multi-point keyframe: sube, baja un poco, vuelve a subir (movimiento natural)
  const parallaxY = dynamicEffects && contextImage
    ? interpolate(
        frame,
        [0, sceneDurationFrames * 0.33, sceneDurationFrames * 0.66, sceneDurationFrames],
        contentAnimation.parallaxKeyframes,
        {
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.33, 1, 0.68, 1),
        }
      )
    : 0;

  // Zoom in sutil (1.0 → 1.05) durante toda la escena
  const imageScale = dynamicEffects && contextImage
    ? interpolate(
        frame,
        [0, sceneDurationFrames],
        contentAnimation.zoomRange,
        {
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.ease),
        }
      )
    : 1.0;

  // Glow pulse en contenedor de imagen (Prompt 19.8)
  // Ciclo sutil cada 6 segundos, consistente con HeroScene
  const imageGlow = dynamicEffects && contextImage
    ? interpolate(
        frame % contentAnimation.imageGlowCycle,
        [0, contentAnimation.imageGlowCycle / 2, contentAnimation.imageGlowCycle],
        [0, contentAnimation.imageGlowMax, 0],
        { extrapolateRight: 'clamp' }
      )
    : 0;

  // Fade in de imagen (Prompt 19.3 - transición más suave)
  const imageOpacity = contextImage
    ? interpolate(frame, [0, imageAnimation.fadeInFrames], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  // ==========================================
  // TEXTO SECUENCIAL (Prompt 19.2)
  // ==========================================

  // Dividir descripción en frases legibles
  const phrases = useMemo(
    () => splitIntoReadablePhrases(description, {
      maxCharsPerPhrase: textAnimation.maxCharsPerPhrase,
      minWordsPerPhrase: textAnimation.minWordsPerPhrase,
    }),
    [description]
  );

  // Calcular frase actual y opacity para transiciones
  // Prompt 19.7: Usa timestamps de Whisper si están disponibles para sincronización precisa
  const phraseTiming = getPhraseTiming(
    frame,
    sceneDurationFrames,
    phrases.length,
    {
      fadeInFrames: textAnimation.fadeInFrames,
      fadeOutFrames: textAnimation.fadeOutFrames,
      // Prompt 19.7: Timestamps de audio para sincronización real
      phraseTimestamps: audioSync?.phraseTimestamps,
      fps,
    }
  );

  // Obtener frase actual a mostrar
  const currentPhrase = phrases[phraseTiming.currentPhraseIndex];

  // ==========================================
  // EFECTOS DE TEXTO (Prompt 19.8)
  // ==========================================

  // Per-phrase slide-up: cada frase entra con su propio slide-up
  // Usa phraseStartFrame de getPhraseTiming() para animar relativo a cada frase
  const phraseRelativeFrame = frame - phraseTiming.phraseStartFrame;
  const phraseTextY = dynamicEffects
    ? interpolate(
        phraseRelativeFrame,
        [0, contentAnimation.phraseSlideFrames],
        [contentAnimation.phraseSlideDistance, 0],
        {
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }
      )
    : 0;

  // Opacity de entrada inicial de escena (fade in los primeros 40 frames)
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

  // Glow pulse en texto (Prompt 19.8)
  // Ciclo sutil cada 4 segundos, consistente con estética HeroScene
  const textGlow = dynamicEffects
    ? interpolate(
        frame % contentAnimation.textGlowCycle,
        [0, contentAnimation.textGlowCycle / 2, contentAnimation.textGlowCycle],
        [3, contentAnimation.textGlowMax, 3],
        { extrapolateRight: 'clamp' }
      )
    : 0;

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
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 ${imageGlow}px ${colors.primary}30`,
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

        {/* DESCRIPCION - Texto Secuencial (Prompt 19.2, actualizado 19.2.7) */}
        <div
          style={{
            transform: `translateY(${phraseTextY}px)`,
            opacity: descriptionOpacity,
            fontFamily: contentTextStyle.fontFamily,
            fontWeight: contentTextStyle.fontWeight,
            fontSize: contentTextStyle.fontSize,
            color: colors.text.secondary,
            textAlign: 'center',
            lineHeight: contentTextStyle.lineHeight,
            // Prompt 19.8: Glow pulse sutil en texto
            textShadow: `0 0 ${textGlow}px ${colors.primary}40, 0 2px 4px rgba(0, 0, 0, 0.6)`,
            // Más ancho si no hay imagen (centralizado en themes.ts Prompt 19.2.7)
            maxWidth: contextImage
              ? contentTextStyle.maxWidthWithImage
              : contentTextStyle.maxWidthWithoutImage,
            padding: `0 ${contentTextStyle.paddingHorizontal}px`,
            // Altura mínima calculada para 3 líneas (Prompt 19.2.7)
            minHeight: contentTextStyle.minHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Margen inferior (Prompt 19.2.7)
            marginBottom: contextImage
              ? contentTextStyle.marginBottomWithImage
              : contentTextStyle.marginBottomWithoutImage,
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
