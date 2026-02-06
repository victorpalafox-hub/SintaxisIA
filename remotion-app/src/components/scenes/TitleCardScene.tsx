/**
 * @fileoverview TitleCardScene - Title Card Overlay para YouTube Thumbnail
 *
 * Overlay de 0.5s (15 frames @ 30fps) que aparece encima de HeroScene.
 * NO cambia timing de otras escenas, solo se renderiza por encima.
 *
 * Layout:
 * - Badge (top-left): "NUEVO" / "MODELO" / etc.
 * - Title (center): Título corto (max 7 palabras)
 * - Branding (bottom-right): "@SintaxisIA"
 * - Background: Hero image semi-transparente + gradient overlay
 *
 * Animations:
 * - Fade in: 0-6 frames (0-0.2s)
 * - Micro zoom: 1.00 → 1.02 (sutil)
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 32
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion';
import { titleCard, colors, layout, editorialShadow } from '../../styles/themes';
import { SafeImage } from '../elements/SafeImage';
import type { TitleCardProps } from '../../types/video.types';

/**
 * TitleCardScene - Overlay de portada topic-aware
 *
 * Se renderiza durante 15 frames encima de HeroScene.
 * El primer frame ya es "thumbnail-ready" para YouTube.
 *
 * @example
 * <TitleCardScene
 *   titleText="Google lanza Genie 2: IA que..."
 *   badge="NUEVO"
 *   backgroundImage="https://logo.clearbit.com/google.com"
 *   fps={30}
 * />
 */
export const TitleCardScene: React.FC<TitleCardProps> = ({
  titleText,
  badge,
  backgroundImage,
  fps,
}) => {
  const frame = useCurrentFrame();

  // ==========================================
  // ANIMACIONES
  // ==========================================

  // Fade in rápido (0-6 frames)
  const opacity = interpolate(
    frame,
    [0, titleCard.fadeInFrames],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.ease }
  );

  // Micro zoom sutil (1.00 → 1.02)
  const scale = interpolate(
    frame,
    [0, titleCard.durationFrames],
    [titleCard.zoomRange[0], titleCard.zoomRange[1]],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  // ==========================================
  // SAFE ZONES (YouTube UI overlay protection)
  // ==========================================

  const safeZone = layout.safeZone;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* CAPA 1: Background Image (hero) semi-transparente */}
      <AbsoluteFill>
        <SafeImage
          src={backgroundImage}
          width={1080}
          height={1920}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: titleCard.backgroundImageOpacity,
          }}
        />
        {/* Gradient overlay para legibilidad del texto */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${titleCard.gradientOverlay.start} 0%, ${titleCard.gradientOverlay.end} 100%)`,
          }}
        />
      </AbsoluteFill>

      {/* CAPA 2: Contenido (badge + título + branding) */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: `${safeZone.y}px ${safeZone.x}px`,
        }}
      >
        {/* BADGE (top-left) */}
        <div
          style={{
            alignSelf: 'flex-start',
            backgroundColor: `${colors.primary}20`,
            color: colors.primary,
            fontSize: titleCard.badge.fontSize,
            fontWeight: titleCard.badge.fontWeight,
            letterSpacing: titleCard.badge.letterSpacing,
            padding: `${titleCard.badge.paddingV}px ${titleCard.badge.paddingH}px`,
            borderRadius: titleCard.badge.borderRadius,
            textShadow: editorialShadow.textDepth,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
          }}
        >
          {badge}
        </div>

        {/* TITLE (center) */}
        <div
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            maxWidth: titleCard.title.maxWidth,
            color: colors.text.primary,
            fontSize: titleCard.title.fontSize,
            fontWeight: titleCard.title.fontWeight,
            lineHeight: titleCard.title.lineHeight,
            textShadow: editorialShadow.textDepth,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
          }}
        >
          {titleText}
        </div>

        {/* BRANDING (bottom-right) */}
        <div
          style={{
            alignSelf: 'flex-end',
            color: colors.text.muted,
            fontSize: titleCard.branding.fontSize,
            fontWeight: titleCard.branding.fontWeight,
            textShadow: editorialShadow.textDepth,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
          }}
        >
          @SintaxisIA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default TitleCardScene;
