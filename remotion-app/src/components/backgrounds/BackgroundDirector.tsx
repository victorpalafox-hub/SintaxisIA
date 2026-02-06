/**
 * @fileoverview BackgroundDirector - Fondo animado persistente
 *
 * Orquestador único del fondo del video. Se renderiza como primera
 * capa dentro de AINewsShort y permanece visible durante todo el video,
 * incluyendo los crossfades entre escenas.
 *
 * 7 capas visuales (orden natural de z-index):
 * 1. Base gradient con drift angular sutil
 * 2. Parallax blob primario (radial gradient + blur)
 * 3. Parallax blob secundario (velocidad diferente)
 * 4. SubtleGrid (grid tech con drift)
 * 5. GrainOverlay (textura SVG feTurbulence)
 * 6. LightSweep (barrido periódico)
 * 7. Vignette (oscurecimiento en bordes, reducido)
 *
 * La intensidad del parallax varía por sección:
 * - Hero (0-8s): 1.5x (más energía)
 * - Content (7-45s): 1.0x (vida constante)
 * - Outro (44-50s): 0.5x (calma)
 *
 * Prompt 20.1 - Fix double alpha, micro-zoom, SubtleGrid, transition boost
 * Prompt 31 - Color pulse, accent glow, secciones dinámicas, boost general
 *
 * @author Sintaxis IA
 * @version 3.0.0
 * @since Prompt 20
 * @updated Prompt 20.1 - Background revival (fix visibilidad)
 * @updated Prompt 31 - Premium background: color pulse, accent glow, secciones dinámicas
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, backgroundAnimation, premiumBackground } from '../../styles/themes';
import { GrainOverlay } from './GrainOverlay';
import { LightSweep } from './LightSweep';
import { SubtleGrid } from './SubtleGrid';

// ==========================================
// FRACCIONES DE SECCIÓN (Prompt 31: dinámicas, no hardcoded)
// ==========================================

/** Fracción de la duración total dedicada a Hero (~8s de 50s = 16%) */
const HERO_DURATION_FRACTION = 0.16;
/** Fracción de la duración total dedicada a Outro (~5s de 50s = 10%) */
const OUTRO_FRACTION = 0.10;

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
  // SECCIONES DINÁMICAS (Prompt 31: compatible con Prompt 30 duración dinámica)
  // ==========================================

  const contentStart = Math.round(durationInFrames * HERO_DURATION_FRACTION);
  const outroStart = Math.round(durationInFrames * (1 - OUTRO_FRACTION));

  // ==========================================
  // MULTIPLICADOR POR SECCIÓN
  // ==========================================

  // Determinar multiplicador de parallax basado en la sección actual
  const sectionMultiplier = frame < contentStart
    ? backgroundAnimation.sectionMultiplier.hero
    : frame < outroStart
    ? backgroundAnimation.sectionMultiplier.content
    : backgroundAnimation.sectionMultiplier.outro;

  // ==========================================
  // CAPA 1: BASE GRADIENT (drift angular)
  // ==========================================

  // Ángulo que varía lentamente de 0° a 25° durante todo el video (Prompt 20.1: +67%)
  const gradientAngle = interpolate(
    frame,
    [0, durationInFrames],
    backgroundAnimation.gradientAngleDrift,
    { extrapolateRight: 'clamp' }
  );

  // ==========================================
  // CAPA 2: PARALLAX BLOB PRIMARIO
  // ==========================================

  // Drift amplitude centralizado en config (Prompt 20.1: era 20/15 hardcoded)
  const { blobDriftAmplitude } = backgroundAnimation;

  // Movimiento sinusoidal suave (posición relativa al viewport)
  const blob1X = Math.sin(frame * backgroundAnimation.parallaxSpeed * sectionMultiplier) * blobDriftAmplitude.x;
  const blob1Y = Math.cos(frame * backgroundAnimation.parallaxSpeed * sectionMultiplier * 0.7) * blobDriftAmplitude.y;

  // ==========================================
  // CAPA 3: PARALLAX BLOB SECUNDARIO
  // ==========================================

  // Velocidad diferente para efecto de profundidad
  const blob2X = Math.sin(frame * backgroundAnimation.parallaxSpeedSecondary * sectionMultiplier + 2) * (blobDriftAmplitude.x * 0.6);
  const blob2Y = Math.cos(frame * backgroundAnimation.parallaxSpeedSecondary * sectionMultiplier * 0.8 + 1) * (blobDriftAmplitude.y * 0.67);

  // ==========================================
  // TRANSITION BOOST (punch en transición a outro)
  // ==========================================

  // Prompt 31: boost en transición a outro (usa secciones dinámicas)
  const { transitionBoost } = backgroundAnimation;
  const boostOpacity = interpolate(
    frame,
    [outroStart - transitionBoost.durationFrames, outroStart, outroStart + transitionBoost.durationFrames],
    [0, transitionBoost.amount, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Opacidad de blobs con boost aplicado
  const blob1Opacity = backgroundAnimation.blobPrimaryOpacity + boostOpacity;
  const blob2Opacity = backgroundAnimation.blobSecondaryOpacity + boostOpacity;

  // ==========================================
  // MICRO-ZOOM SENOIDAL (Prompt 20.1)
  // ==========================================

  // Scale que oscila 1.0 → 1.03 en ciclos de 12s para efecto de "respiración"
  const { microZoom } = backgroundAnimation;
  const zoomScale = interpolate(
    Math.sin((frame / microZoom.cycleDuration) * Math.PI * 2),
    [-1, 1],
    [microZoom.min, microZoom.max]
  );

  // ==========================================
  // COLOR PULSE - hue shift sutil en blobs (Prompt 31)
  // ==========================================

  // Hue-rotate que oscila ±colorPulseRange grados para dar vida al color
  const colorShift = Math.sin(frame * premiumBackground.colorPulseSpeed) * premiumBackground.colorPulseRange;

  // ==========================================
  // ACCENT GLOW SPOT - tercer blob de acento (Prompt 31)
  // ==========================================

  // Punto de luz que orbita lentamente dando profundidad
  const accentX = 50 + Math.sin(frame * 0.005) * premiumBackground.accentGlowOrbit.x;
  const accentY = 50 + Math.cos(frame * 0.004) * premiumBackground.accentGlowOrbit.y;

  // ==========================================
  // VIGNETTE ALPHA (desde config - Prompt 20.1)
  // ==========================================

  // Computar alpha hex desde vignetteStrength (0-1 → 00-FF)
  const vignetteAlpha = Math.round(backgroundAnimation.vignetteStrength * 255)
    .toString(16)
    .padStart(2, '0');

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AbsoluteFill style={{ transform: `scale(${zoomScale})` }}>
      {/* CAPA 1: Base gradient con drift angular */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${180 + gradientAngle}deg,
            ${colors.background.gradient.start} 0%,
            ${colors.background.gradient.middle} 50%,
            ${colors.background.gradient.end} 100%)`,
        }}
      />

      {/* CAPA 2: Parallax blob primario - color pulse (Prompt 31) */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
            filter: `blur(${backgroundAnimation.blobBlur}px) hue-rotate(${colorShift}deg)`,
            opacity: blob1Opacity,
            transform: `translate(${blob1X}%, ${blob1Y}%)`,
          }}
        />
      </AbsoluteFill>

      {/* CAPA 3: Parallax blob secundario - color pulse (Prompt 31) */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '5%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            // Prompt 32.1: accent en vez de secondary (gris → sky blue vibrante)
            background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`,
            filter: `blur(${backgroundAnimation.blobBlur}px) hue-rotate(${colorShift}deg)`,
            opacity: blob2Opacity,
            transform: `translate(${blob2X}%, ${blob2Y}%)`,
          }}
        />
      </AbsoluteFill>

      {/* CAPA 3.5: Accent glow spot - profundidad visual (Prompt 31) */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: `${accentY}%`,
            left: `${accentX}%`,
            width: `${premiumBackground.accentGlowSize}%`,
            height: `${premiumBackground.accentGlowSize}%`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`,
            filter: `blur(${premiumBackground.accentGlowBlur}px)`,
            opacity: premiumBackground.accentGlowOpacity,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </AbsoluteFill>

      {/* CAPA 4: Subtle grid (Prompt 20.1) */}
      <SubtleGrid />

      {/* CAPA 5: Grain overlay */}
      <GrainOverlay />

      {/* CAPA 6: Light sweep periódico */}
      <LightSweep />

      {/* CAPA 7: Vignette - reducido (Prompt 20.1: 55% centro, 55% alpha bordes) */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: `radial-gradient(ellipse at center, transparent ${backgroundAnimation.vignetteTransparentStop}%, ${colors.background.darker}${vignetteAlpha} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export default BackgroundDirector;
