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
 * @updated Prompt 19.11 - Fade-out para crossfade con OutroScene
 * @updated Prompt 20 - Migración a Tech Editorial: sombras sutiles, fondo transparente
 * @updated Prompt 25 - Audio sync: offset, timestamps como source of truth, crossfade imágenes
 */

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { colors, spacing, textAnimation, imageAnimation, contentTextStyle, contentAnimation, sceneTransition, editorialShadow } from '../../styles/themes';
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
  const { durationInFrames } = useVideoConfig();

  // ==========================================
  // EFECTOS DE ENTRADA Y SALIDA
  // ==========================================

  // Cross fade desde Hero Scene (primeros 30 frames)
  const sceneOpacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Fade-out para crossfade con OutroScene (Prompt 19.11)
  // Los últimos crossfadeFrames se desvanecen suavemente
  const fadeOut = interpolate(
    frame,
    [durationInFrames - sceneTransition.crossfadeFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Opacidad final: fade-in * fade-out (Prompt 19.11)
  const finalOpacity = sceneOpacity * fadeOut;

  // ==========================================
  // SELECCIÓN DE IMAGEN (Legacy vs Dinámico)
  // ==========================================

  // Calcular segundo actual del video
  const currentSecond = sceneStartSecond + (frame / fps);

  /**
   * Obtiene la imagen actual con progreso de transición crossfade (Prompt 25)
   *
   * Si hay imágenes dinámicas (Prompt 19.1), busca la imagen del segmento actual.
   * Si no, usa el comportamiento legacy (context image → hero fallback).
   * Retorna un progreso de transición (0-1) para crossfade suave entre cambios.
   */
  const getImageWithTransition = (): { url: string | undefined; transitionProgress: number } => {
    if (!dynamicScenes || dynamicScenes.length === 0) {
      return { url: images?.context || images?.hero, transitionProgress: 1 };
    }

    const currentScene = dynamicScenes.find(
      scene => currentSecond >= scene.startSecond && currentSecond < scene.endSecond
    );

    if (!currentScene) {
      const lastScene = dynamicScenes[dynamicScenes.length - 1];
      const url = currentSecond >= lastScene.endSecond
        ? lastScene.imageUrl
        : dynamicScenes[0].imageUrl;
      return { url, transitionProgress: 1 };
    }

    // Prompt 25: Crossfade suave en los primeros 20 frames de cada segmento
    const segmentFrame = (currentSecond - currentScene.startSecond) * fps;
    const transitionProgress = Math.min(1, segmentFrame / 20);

    return { url: currentScene.imageUrl, transitionProgress };
  };

  // Imagen actual a mostrar con su progreso de transición
  const { url: contextImage, transitionProgress } = getImageWithTransition();

  // Prompt 25: Usar durationInFrames real del Sequence (no hardcoded 37*fps)
  const sceneDurationFrames = durationInFrames;

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

  // Fade in de imagen (Prompt 19.3 - transición más suave)
  const imageOpacity = contextImage
    ? interpolate(frame, [0, imageAnimation.fadeInFrames], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  // ==========================================
  // TEXTO SECUENCIAL (Prompt 19.2)
  // ==========================================

  // Prompt 25: Dividir descripción en frases legibles
  // Si hay audioSync con timestamps, usar ESE texto como source of truth
  // Esto evita mismatch entre el split visual y el split de Whisper
  const phrases = useMemo(() => {
    if (audioSync?.phraseTimestamps && audioSync.phraseTimestamps.length > 0) {
      return audioSync.phraseTimestamps.map((ts, index) => ({
        text: ts.text,
        index,
        charCount: ts.text.length,
        wordCount: ts.text.split(/\s+/).length,
      }));
    }

    // Fallback: split visual uniforme (sin Whisper)
    return splitIntoReadablePhrases(description, {
      maxCharsPerPhrase: textAnimation.maxCharsPerPhrase,
      minWordsPerPhrase: textAnimation.minWordsPerPhrase,
    });
  }, [description, audioSync]);

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
      // Prompt 25: Offset para compensar que ContentScene empieza en segundo ~7
      // Sin esto, frame 0 = segundo 0, pero el audio ya está en segundo ~7
      sceneOffsetSeconds: sceneStartSecond,
      // Prompt 25.3: Lead/lag perceptual para sincronización broadcast-grade
      captionLeadMs: 200,
      captionLagMs: 150,
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

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AbsoluteFill
      style={{
        // Fondo transparente: BackgroundDirector proporciona el fondo (Prompt 20)
        background: 'transparent',
        opacity: finalOpacity,
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
              // Prompt 25: imageOpacity * transitionProgress para crossfade entre imágenes
              opacity: imageOpacity * transitionProgress,
              borderRadius: 16,
              overflow: 'hidden',
              // Sombra editorial de elevación (Prompt 20)
              boxShadow: editorialShadow.imageElevation,
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
            // Sombra editorial de profundidad (Prompt 20)
            textShadow: editorialShadow.textDepth,
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
