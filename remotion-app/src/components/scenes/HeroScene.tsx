/**
 * @fileoverview HeroScene - Hook Visual Mejorado
 *
 * Escena de apertura con efectos dinámicos para capturar atención.
 *
 * Duración: 8 segundos (240 frames a 30fps)
 *
 * Elementos:
 * - Imagen HERO (logo empresa) con zoom dramático
 * - Título grande con slide up + glow
 * - Efecto blur to focus en entrada
 *
 * Objetivo: Capturar atención en primeros 2 segundos
 *
 * @author Sintaxis IA
 * @version 2.0.0
 * @since Prompt 13
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';
import { colors, spacing } from '../../styles/themes';
import { SafeImage } from '../elements/SafeImage';
import type { HeroSceneProps } from '../../types/video.types';

/**
 * HERO SCENE - Hook Visual Mejorado
 *
 * Captura atención con efectos dinámicos:
 * - Zoom dramático del logo (0.8 -> 1.2)
 * - Blur to focus (20px -> 0px)
 * - Título con slide up y glow pulsante
 *
 * @example
 * <HeroScene
 *   title="Google Genie: IA que Crea Mundos"
 *   image="https://logo.clearbit.com/google.com"
 *   fps={30}
 *   enhanced={true}
 * />
 */
export const HeroScene: React.FC<HeroSceneProps> = ({
  title,
  image,
  fps,
  enhanced = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // ==========================================
  // ANIMACION SPRING (rebote natural)
  // ==========================================

  // Spring para animaciones suaves con rebote sutil
  const animation = spring({
    frame,
    fps,
    config: {
      damping: 100,   // Alto damping = menos rebote
      stiffness: 200, // Alta rigidez = más rápido
      mass: 0.5,      // Baja masa = más reactivo
    },
  });

  // ==========================================
  // EFECTOS DE IMAGEN
  // ==========================================

  // Zoom dramático (0.8 -> 1.2) con curva de anticipación
  // Easing.bezier crea sensación de "carga y disparo"
  const imageScale = interpolate(
    animation,
    [0, 1],
    [0.8, 1.2],
    {
      easing: Easing.bezier(0.68, -0.6, 0.32, 1.6),
    }
  );

  // Blur to focus (20px -> 0px) en primeros 30 frames
  // Solo si enhanced está activo
  const imageBlur = enhanced
    ? interpolate(frame, [0, 30], [20, 0], { extrapolateRight: 'clamp' })
    : 0;

  // Fade in de la imagen
  const imageOpacity = interpolate(
    frame,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // ==========================================
  // EFECTOS DE TITULO
  // ==========================================

  // Slide up desde 100px abajo hasta posición original
  const titleY = interpolate(
    animation,
    [0, 1],
    [100, 0],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1), // Ease out expo
    }
  );

  // Fade in del título sincronizado con animation
  const titleOpacity = interpolate(animation, [0, 1], [0, 1]);

  // Glow pulsante que crece, hace pico, y estabiliza
  // Frame 30: empieza | Frame 60: pico | Frame 90-120: estabiliza
  const glowIntensity = interpolate(
    frame,
    [30, 60, 90, 120],
    [0, 20, 10, 15],
    {
      extrapolateRight: 'clamp',
    }
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AbsoluteFill
      style={{
        // Gradiente de fondo oscuro con tonos del tema
        background: `linear-gradient(180deg,
          ${colors.background.gradient.start} 0%,
          ${colors.background.gradient.middle} 50%,
          ${colors.background.gradient.end} 100%)`,
      }}
    >
      {/* Contenedor centrado con safe zones */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.padding.xl,
          padding: `${spacing.safe.top}px ${spacing.safe.horizontal}px ${spacing.safe.bottom}px`,
        }}
      >
        {/* IMAGEN HERO (Logo empresa) */}
        <div
          style={{
            transform: `scale(${imageScale})`,
            opacity: imageOpacity,
            filter: `blur(${imageBlur}px)`,
            borderRadius: 24,
            overflow: 'hidden',
            // Sombra con glow del color primario
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 ${glowIntensity * 2}px ${colors.primary}
            `,
          }}
        >
          <SafeImage
            src={image}
            width={400}
            height={400}
            style={{
              width: 400,
              height: 400,
              objectFit: 'contain',
              backgroundColor: colors.background.darker,
            }}
          />
        </div>

        {/* TITULO PRINCIPAL */}
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
            fontWeight: 800,
            fontSize: 72,
            color: colors.text.primary,
            textAlign: 'center',
            // Text shadow con glow dinámico
            textShadow: `
              0 0 ${glowIntensity}px ${colors.primary},
              0 4px 8px rgba(0, 0, 0, 0.8)
            `,
            lineHeight: 1.2,
            maxWidth: 900,
            padding: '0 40px',
          }}
        >
          {title}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default HeroScene;
