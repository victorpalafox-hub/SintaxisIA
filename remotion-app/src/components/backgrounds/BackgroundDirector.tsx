/**
 * @fileoverview BackgroundDirector - Fondo animado persistente
 *
 * Orquestador único del fondo del video. Se renderiza como primera
 * capa dentro de AINewsShort y permanece visible durante todo el video,
 * incluyendo los crossfades entre escenas.
 *
 * 6 capas visuales (orden natural de z-index):
 * 1. Base gradient con drift angular sutil
 * 2. Parallax blob primario (radial gradient + blur)
 * 3. Parallax blob secundario (velocidad diferente)
 * 4. GrainOverlay (textura SVG feTurbulence)
 * 5. LightSweep (barrido periódico)
 * 6. Vignette (oscurecimiento en bordes)
 *
 * La intensidad del parallax varía por sección:
 * - Hero (0-8s): 1.5x (más energía)
 * - Content (7-45s): 0.8x (calma)
 * - Outro (44-50s): 0.3x (limpio)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 20
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, backgroundAnimation } from '../../styles/themes';
import { GrainOverlay } from './GrainOverlay';
import { LightSweep } from './LightSweep';

// ==========================================
// CONSTANTES DE SECCIÓN (timing de escenas)
// ==========================================

/** Frame donde empieza la sección Content (8s * 30fps = 240) */
const CONTENT_START = 240;
/** Frame donde empieza la sección Outro (44s * 30fps = 1320) */
const OUTRO_START = 1320;

/**
 * BackgroundDirector - Fondo animado persistente
 *
 * Se posiciona como primera capa dentro de la composición.
 * Las escenas encima son transparentes (sin gradient propio)
 * y el contenido se desvanece con opacity durante crossfades
 * mientras este fondo permanece continuo.
 *
 * @example
 * <AbsoluteFill>
 *   <BackgroundDirector />
 *   <Sequence name="Hero"><HeroScene /></Sequence>
 *   <Sequence name="Content"><ContentScene /></Sequence>
 *   <Sequence name="Outro"><OutroScene /></Sequence>
 * </AbsoluteFill>
 */
export const BackgroundDirector: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // ==========================================
  // MULTIPLICADOR POR SECCIÓN
  // ==========================================

  // Determinar multiplicador de parallax basado en la sección actual
  const sectionMultiplier = frame < CONTENT_START
    ? backgroundAnimation.sectionMultiplier.hero
    : frame < OUTRO_START
    ? backgroundAnimation.sectionMultiplier.content
    : backgroundAnimation.sectionMultiplier.outro;

  // ==========================================
  // CAPA 1: BASE GRADIENT (drift angular)
  // ==========================================

  // Ángulo que varía lentamente de 0° a 15° durante todo el video
  const gradientAngle = interpolate(
    frame,
    [0, durationInFrames],
    backgroundAnimation.gradientAngleDrift,
    { extrapolateRight: 'clamp' }
  );

  // ==========================================
  // CAPA 2: PARALLAX BLOB PRIMARIO
  // ==========================================

  // Movimiento sinusoidal suave (posición relativa al viewport)
  const blob1X = Math.sin(frame * backgroundAnimation.parallaxSpeed * sectionMultiplier) * 20;
  const blob1Y = Math.cos(frame * backgroundAnimation.parallaxSpeed * sectionMultiplier * 0.7) * 15;

  // ==========================================
  // CAPA 3: PARALLAX BLOB SECUNDARIO
  // ==========================================

  // Velocidad diferente para efecto de profundidad
  const blob2X = Math.sin(frame * backgroundAnimation.parallaxSpeedSecondary * sectionMultiplier + 2) * 15;
  const blob2Y = Math.cos(frame * backgroundAnimation.parallaxSpeedSecondary * sectionMultiplier * 0.8 + 1) * 12;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AbsoluteFill>
      {/* CAPA 1: Base gradient con drift angular */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${180 + gradientAngle}deg,
            ${colors.background.gradient.start} 0%,
            ${colors.background.gradient.middle} 50%,
            ${colors.background.gradient.end} 100%)`,
        }}
      />

      {/* CAPA 2: Parallax blob primario */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.primary}18 0%, transparent 70%)`,
            filter: `blur(${backgroundAnimation.blobBlur}px)`,
            opacity: backgroundAnimation.blobPrimaryOpacity,
            transform: `translate(${blob1X}%, ${blob1Y}%)`,
          }}
        />
      </AbsoluteFill>

      {/* CAPA 3: Parallax blob secundario */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '5%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.secondary}15 0%, transparent 70%)`,
            filter: `blur(${backgroundAnimation.blobBlur}px)`,
            opacity: backgroundAnimation.blobSecondaryOpacity,
            transform: `translate(${blob2X}%, ${blob2Y}%)`,
          }}
        />
      </AbsoluteFill>

      {/* CAPA 4: Grain overlay */}
      <GrainOverlay />

      {/* CAPA 5: Light sweep periódico */}
      <LightSweep />

      {/* CAPA 6: Vignette */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: `radial-gradient(ellipse at center, transparent 40%, ${colors.background.darker}B3 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export default BackgroundDirector;
