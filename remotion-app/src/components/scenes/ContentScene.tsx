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
 * @updated Prompt 28 - Imágenes editoriales grandes (920x520), crossfade real con imagen previa
 * @updated Prompt 33 - Texto editorial con jerarquía (headline/support/punch), bloques agrupados
 * @updated Prompt 34 - Énfasis visual: scale, dimming, letterSpacing en momentos de impacto
 * @updated Prompt 35 - Handle imageUrl null (sin imagen genérica, null → undefined)
 * @updated Prompt 38-Fix2 - Regla dura: no reutilizar imagen previa, null = no imagen
 */

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { colors, spacing, textAnimation, imageAnimation, contentTextStyle, contentAnimation, sceneTransition, editorialShadow, editorialText, visualEmphasis } from '../../styles/themes';
import { ProgressBar } from '../ui/ProgressBar';
import { SafeImage } from '../elements/SafeImage';
import { splitIntoReadablePhrases, getPhraseTiming, getBlockTiming, buildEditorialBlocks, detectEmphasis, getEmphasisForBlock } from '../../utils';
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
   * Obtiene imagen actual y previa con progreso de crossfade (Prompt 28)
   *
   * Retorna AMBAS imágenes (previa y actual) para un crossfade real:
   * la imagen previa hace fade-out mientras la actual hace fade-in.
   * Usa imageAnimation.crossfadeFrames en vez de hardcoded /20.
   */
  const getImageWithTransition = (): {
    currentUrl: string | undefined;
    previousUrl: string | undefined;
    transitionProgress: number;
  } => {
    if (!dynamicScenes || dynamicScenes.length === 0) {
      return { currentUrl: images?.context || images?.hero, previousUrl: undefined, transitionProgress: 1 };
    }

    const currentSceneIndex = dynamicScenes.findIndex(
      scene => currentSecond >= scene.startSecond && currentSecond < scene.endSecond
    );

    if (currentSceneIndex === -1) {
      const lastScene = dynamicScenes[dynamicScenes.length - 1];
      // Prompt 35: imageUrl puede ser null, convertir a undefined
      const url = currentSecond >= lastScene.endSecond
        ? lastScene.imageUrl ?? undefined
        : dynamicScenes[0].imageUrl ?? undefined;
      return { currentUrl: url, previousUrl: undefined, transitionProgress: 1 };
    }

    const currentScene = dynamicScenes[currentSceneIndex];
    // Prompt 28: Imagen previa para crossfade real
    const previousScene = currentSceneIndex > 0 ? dynamicScenes[currentSceneIndex - 1] : undefined;

    // Prompt 28: Usar imageAnimation.crossfadeFrames (era hardcoded /20)
    const segmentFrame = (currentSecond - currentScene.startSecond) * fps;
    const transitionProgress = Math.min(1, segmentFrame / imageAnimation.crossfadeFrames);

    return {
      // Prompt 35: imageUrl puede ser null, convertir a undefined
      currentUrl: currentScene.imageUrl ?? undefined,
      previousUrl: previousScene?.imageUrl ?? undefined,
      transitionProgress,
    };
  };

  // Prompt 28: Imagen actual y previa para crossfade real
  const { currentUrl: contextImage, previousUrl: previousImage, transitionProgress } = getImageWithTransition();

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

  // ==========================================
  // BLOQUES EDITORIALES (Prompt 33)
  // ==========================================

  // Construir bloques editoriales que agrupan frases cercanas y cortas
  // con jerarquía visual (headline/support/punch)
  const blocks = useMemo(() => {
    if (audioSync?.phraseTimestamps && audioSync.phraseTimestamps.length > 0) {
      return buildEditorialBlocks(audioSync.phraseTimestamps, fps);
    }
    // Fallback sin Whisper: cada frase = 1 bloque support (comportamiento pre-Prompt 33)
    return phrases.map((p, i) => ({
      lines: [p.text],
      weight: 'support' as const,
      phraseIndices: [i],
      startSeconds: 0,
      endSeconds: 0,
    }));
  }, [audioSync, phrases, fps]);

  // ==========================================
  // ÉNFASIS VISUAL (Prompt 34)
  // ==========================================

  // Detectar momentos de énfasis una sola vez (determinístico, sin IA)
  const emphasisMap = useMemo(() => detectEmphasis(blocks), [blocks]);

  // Timing: con Whisper usa getBlockTiming, sin Whisper usa getPhraseTiming (fallback)
  const hasWhisper = !!(audioSync?.phraseTimestamps && audioSync.phraseTimestamps.length > 0);

  const timingConfig = {
    fadeInFrames: textAnimation.fadeInFrames,
    fadeOutFrames: textAnimation.fadeOutFrames,
    phraseTimestamps: audioSync?.phraseTimestamps,
    fps,
    sceneOffsetSeconds: sceneStartSecond,
    captionLeadMs: 200,
    captionLagMs: 150,
  };

  // Prompt 33: Block timing para bloques editoriales (con Whisper)
  const blockTiming = hasWhisper
    ? getBlockTiming(frame, blocks, sceneDurationFrames, timingConfig)
    : null;

  // Fallback: phrase timing uniforme (sin Whisper, compatible pre-Prompt 33)
  const phraseTiming = !hasWhisper
    ? getPhraseTiming(frame, sceneDurationFrames, phrases.length, timingConfig)
    : null;

  // Bloque o frase actual
  const currentBlockIndex = blockTiming?.currentBlockIndex ?? phraseTiming?.currentPhraseIndex ?? 0;
  const currentBlock = blocks[currentBlockIndex];
  const currentStartFrame = blockTiming?.blockStartFrame ?? phraseTiming?.phraseStartFrame ?? 0;
  const currentOpacity = blockTiming?.opacity ?? phraseTiming?.opacity ?? 1;

  // Estilo editorial basado en el peso del bloque
  const blockStyle = editorialText[currentBlock?.weight ?? 'support'];

  // ==========================================
  // EFECTOS DE TEXTO (Prompt 19.8 + Prompt 33)
  // ==========================================

  // Per-block slide-up: cada bloque entra con su propio slide-up
  // Prompt 40-Fix4: Slide y easing diferenciados por peso editorial
  const blockRelativeFrame = frame - currentStartFrame;
  const blockWeight = currentBlock?.weight || 'headline';
  const weightSlideDistance = editorialText[blockWeight]?.slideDistance ?? editorialText.slideDistance;
  const weightSlideFrames = editorialText[blockWeight]?.slideFrames ?? editorialText.slideFrames;

  // Easing diferenciado: punch explosivo, support suave, headline estándar
  const slideEasing = blockWeight === 'punch'
    ? Easing.bezier(0.22, 1.2, 0.36, 1)   // Overshoot sutil — punch "explota"
    : blockWeight === 'support'
    ? Easing.bezier(0.25, 0.1, 0.25, 1)    // Ease-out suave — support "se desliza"
    : Easing.bezier(0.16, 1, 0.3, 1);      // Original — headline

  const blockTextY = dynamicEffects
    ? interpolate(
        blockRelativeFrame,
        [0, weightSlideFrames],
        [weightSlideDistance, 0],
        {
          extrapolateRight: 'clamp',
          easing: slideEasing,
        }
      )
    : 0;

  // Énfasis visual del bloque actual (Prompt 34)
  const currentEmphasis = getEmphasisForBlock(emphasisMap, currentBlockIndex);
  const emphasisConfig = currentEmphasis !== 'none'
    ? visualEmphasis[currentEmphasis]
    : null;

  // Ramp: transición suave al entrar en bloque con énfasis
  const emphasisRamp = emphasisConfig && dynamicEffects
    ? interpolate(
        blockRelativeFrame,
        [0, emphasisConfig.rampFrames],
        [0, 1],
        { extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1) }
      )
    : 0;

  const emphasisScale = emphasisConfig
    ? interpolate(emphasisRamp, [0, 1], [1, emphasisConfig.scale])
    : 1;

  const emphasisDimOpacity = emphasisConfig
    ? emphasisRamp * emphasisConfig.bgDimOpacity
    : 0;

  const emphasisLetterSpacing = emphasisConfig?.letterSpacing ?? null;

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

  // Opacity final: combina fade de escena con transición de bloque
  const descriptionOpacity = baseOpacity * currentOpacity;

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
      {/* Overlay de dimming para énfasis visual (Prompt 34) */}
      {emphasisDimOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: `rgba(0, 0, 0, ${emphasisDimOpacity})`,
            zIndex: visualEmphasis.dimZIndex,
            pointerEvents: 'none' as const,
          }}
        />
      )}

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
        {/* IMAGEN CONTEXT - Prompt 28: Editorial grande (920x520) + crossfade real */}
        {/* Prompt 38-Fix2: Solo renderizar si hay imagen actual.
            Nunca reutilizar imagen previa como fallback — null = no imagen. */}
        {contextImage && (
          <div
            style={{
              position: 'relative',
              width: imageAnimation.width,
              height: imageAnimation.height,
              transform: `translateY(${parallaxY}px) scale(${imageScale})`,
            }}
          >
            {/* Imagen PREVIA (fade-out durante crossfade) - Prompt 28 */}
            {previousImage && transitionProgress < 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: imageAnimation.width,
                  height: imageAnimation.height,
                  opacity: imageOpacity * (1 - transitionProgress),
                  borderRadius: imageAnimation.borderRadius,
                  overflow: 'hidden',
                  boxShadow: editorialShadow.imageElevation,
                }}
              >
                <SafeImage
                  src={previousImage}
                  width={imageAnimation.width}
                  height={imageAnimation.height}
                  style={{
                    width: imageAnimation.width,
                    height: imageAnimation.height,
                    objectFit: 'cover',
                  }}
                />
                {/* Prompt 36: Overlay editorial para integración visual */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.55))',
                    borderRadius: imageAnimation.borderRadius,
                  }}
                />
              </div>
            )}
            {/* Imagen ACTUAL (fade-in durante crossfade) */}
            {contextImage && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: imageAnimation.width,
                  height: imageAnimation.height,
                  opacity: imageOpacity * transitionProgress,
                  borderRadius: imageAnimation.borderRadius,
                  overflow: 'hidden',
                  boxShadow: editorialShadow.imageElevation,
                }}
              >
                <SafeImage
                  src={contextImage}
                  width={imageAnimation.width}
                  height={imageAnimation.height}
                  style={{
                    width: imageAnimation.width,
                    height: imageAnimation.height,
                    objectFit: 'cover',
                  }}
                />
                {/* Prompt 36: Overlay editorial para integración visual */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.55))',
                    borderRadius: imageAnimation.borderRadius,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* DESCRIPCION - Bloques Editoriales (Prompt 33, antes: Texto Secuencial Prompt 19.2) */}
        <div
          style={{
            transform: `translateY(${blockTextY}px) scale(${emphasisScale})`,
            opacity: descriptionOpacity,
            textAlign: 'center',
            // Prompt 36: Solo headline/punch tienen shadow, support sin shadow (body text limpio)
            textShadow: currentBlock?.weight !== 'support' ? editorialShadow.textDepth : 'none',
            maxWidth: contextImage
              ? contentTextStyle.maxWidthWithImage
              : contentTextStyle.maxWidthWithoutImage,
            padding: `0 ${contentTextStyle.paddingHorizontal}px`,
            minHeight: contentTextStyle.minHeight,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: contextImage
              ? contentTextStyle.marginBottomWithImage
              : contentTextStyle.marginBottomWithoutImage,
          }}
        >
          {/* Prompt 33: Renderizar líneas del bloque editorial con estilo por peso */}
          {currentBlock?.lines.map((line, i) => (
            <div
              key={`${currentBlockIndex}-${i}`}
              style={{
                fontFamily: contentTextStyle.fontFamily,
                fontSize: blockStyle.fontSize,
                fontWeight: blockStyle.fontWeight,
                color: blockStyle.color,
                letterSpacing: emphasisLetterSpacing ?? blockStyle.letterSpacing,
                lineHeight: 1.3,
              }}
            >
              {line}
            </div>
          )) || description}
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
