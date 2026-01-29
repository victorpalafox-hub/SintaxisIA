/**
 * @fileoverview ContentScene - Explicacion Completa con Parallax
 *
 * Escena principal de contenido con efectos dinámicos.
 *
 * Duración: 37 segundos (1110 frames a 30fps)
 *
 * Elementos:
 * - Imagen CONTEXT (screenshot/demo) con parallax
 * - Texto descriptivo completo
 * - Bullet points con fade in escalonado
 * - Barra de progreso continua
 *
 * Layout flexible: con imagen o sin imagen
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 13
 */

import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion';
import { colors, spacing } from '../../styles/themes';
import { ProgressBar } from '../ui/ProgressBar';
import type { ContentSceneProps } from '../../types/video.types';

/**
 * CONTENT SCENE - Explicación Completa
 *
 * Muestra el contenido principal de la noticia con efectos:
 * - Parallax en imagen (movimiento vertical sutil)
 * - Zoom sutil (1.0 -> 1.05)
 * - Fade in escalonado de bullet points
 *
 * @example
 * <ContentScene
 *   description="Google presenta una IA revolucionaria..."
 *   details={["Genera mundos 3D", "Usa transformers", "Open source"]}
 *   images={{ context: "https://example.com/screenshot.png" }}
 *   totalDuration={1650}
 *   fps={30}
 *   dynamicEffects={true}
 * />
 */
export const ContentScene: React.FC<ContentSceneProps> = ({
  description,
  details,
  images,
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
  // EFECTOS DE IMAGEN CONTEXT
  // ==========================================

  // Usar context image, fallback a hero si no existe
  const contextImage = images?.context || images?.hero;

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

  // Fade in de imagen
  const imageOpacity = contextImage
    ? interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  // ==========================================
  // EFECTOS DE TEXTO
  // ==========================================

  // Fade in escalonado de descripción (empieza frame 10)
  const descriptionOpacity = interpolate(
    frame,
    [10, 40],
    [0, 1],
    {
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1), // Ease out expo
    }
  );

  // Slide up sutil del texto (30px -> 0px)
  const textY = interpolate(
    frame,
    [10, 40],
    [30, 0],
    {
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

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
            <Img
              src={contextImage}
              style={{
                width: 600,
                height: 400,
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* DESCRIPCION */}
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
          }}
        >
          {description}
        </div>

        {/* BULLET POINTS (si existen) */}
        {details && details.length > 0 && (
          <div
            style={{
              opacity: descriptionOpacity,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxWidth: 800,
              padding: '0 40px',
            }}
          >
            {details.map((detail, index) => {
              // Fade in escalonado: cada bullet point aparece 15 frames después del anterior
              // Empieza en frame 50
              const bulletOpacity = interpolate(
                frame,
                [50 + index * 15, 80 + index * 15],
                [0, 1],
                {
                  extrapolateRight: 'clamp',
                }
              );

              return (
                <div
                  key={index}
                  style={{
                    opacity: bulletOpacity,
                    fontFamily: 'Inter, Roboto, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: 24,
                    color: colors.text.secondary,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  {/* Bullet point con color primario */}
                  <span style={{ color: colors.primary, fontSize: 32 }}>
                    {'\u2022'}
                  </span>
                  <span>{detail}</span>
                </div>
              );
            })}
          </div>
        )}
      </AbsoluteFill>

      {/* BARRA DE PROGRESO */}
      <ProgressBar color={colors.primary} />
    </AbsoluteFill>
  );
};

export default ContentScene;
