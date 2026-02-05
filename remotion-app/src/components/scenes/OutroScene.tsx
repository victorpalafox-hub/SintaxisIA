/**
 * @fileoverview OutroScene - Branding Claro
 *
 * Escena de cierre con branding fuerte y CTA claro.
 *
 * Duración: 5 segundos (150 frames a 30fps)
 * Reducida de 10s en Prompt 19.4 para eliminar silencio al final
 *
 * Elementos:
 * - Logo "Sintaxis IA" grande y centrado
 * - CTA claro ("Síguenos para más noticias IA")
 * - SIN hashtags visibles (van solo en título YouTube)
 *
 * NOTA CRITICA: Los hashtags NO se renderizan en esta escena.
 * Aunque se reciben en props, solo son metadata para YouTube.
 *
 * @author Sintaxis IA
 * @version 2.2.0
 * @since Prompt 13
 * @updated Prompt 19.4 - Duración reducida de 10s a 5s
 * @updated Prompt 19.9 - Fade-out final, glow cíclico, Easing, textShadow, config centralizada
 * @updated Prompt 19.10 - Glow intensificado: multi-layer boxShadow, brand name mejorado
 * @updated Prompt 19.11 - Crossfade: useVideoConfig, fade-in sincronizado con sceneTransition
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
import { colors, spacing, outroAnimation, sceneTransition } from '../../styles/themes';
import type { OutroSceneProps } from '../../types/video.types';

/**
 * OUTRO SCENE - Branding Claro
 *
 * Cierre memorable con:
 * - Logo zoom in con pulse
 * - Glow pulsante animado
 * - CTA fade in
 * - SIN hashtags (solo metadata)
 *
 * @example
 * <OutroScene
 *   hashtags={["#IA", "#AI"]}  // NO SE RENDERIZAN
 *   fps={30}
 * />
 */
export const OutroScene: React.FC<OutroSceneProps> = ({
  // hashtags recibidos pero NO RENDERIZADOS (solo metadata para YouTube)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hashtags,
  fps,
}) => {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();

  // Duración de OutroScene en frames (Prompt 19.11: usa Sequence duration con crossfade)
  const { durationInFrames } = useVideoConfig();

  // ==========================================
  // ANIMACIONES DE ENTRADA (Prompt 19.9: Easing)
  // ==========================================

  // Crossfade desde ContentScene (Prompt 19.11: sincronizado con crossfadeFrames)
  const sceneOpacity = interpolate(
    frame,
    [0, sceneTransition.crossfadeFrames],
    [0, 1],
    {
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  // Fade-out suave en último segundo (Prompt 19.9)
  const fadeOut = interpolate(
    frame,
    [durationInFrames - outroAnimation.fadeOutFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Opacidad final: fade-in * fade-out
  const finalOpacity = sceneOpacity * fadeOut;

  // Logo zoom in con spring bounce
  const logoAnimation = spring({
    frame,
    fps: videoFps,
    config: {
      damping: outroAnimation.springDamping,
      stiffness: outroAnimation.springStiffness,
    },
  });

  const logoScale = interpolate(logoAnimation, [0, 1], [0.8, 1]);

  // ==========================================
  // EFECTOS DE GLOW (Prompt 19.9: cíclico full-duration)
  // ==========================================

  // Glow pulsante cíclico del logo (patrón Prompt 19.8)
  // Ciclo cada 3 segundos, cubre toda la duración de la escena
  const glowIntensity = interpolate(
    frame % outroAnimation.glowCycle,
    [0, outroAnimation.glowCycle / 2, outroAnimation.glowCycle],
    [20, outroAnimation.glowMax, 20],
    { extrapolateRight: 'clamp' }
  );

  // ==========================================
  // ANIMACION CTA (Prompt 19.9: Easing + config)
  // ==========================================

  // CTA fade in con easing suave
  const ctaOpacity = interpolate(
    frame,
    [outroAnimation.ctaDelayFrames, outroAnimation.ctaDelayFrames + outroAnimation.ctaFadeDuration],
    [0, 1],
    {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
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
          ${colors.background.darker} 100%)`,
        opacity: finalOpacity,
      }}
    >
      {/* Contenedor centrado */}
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
        {/* LOGO "SINTAXIS IA" - Cuadrado con iniciales */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            width: 280,
            height: 280,
            borderRadius: 24,
            backgroundColor: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, Arial Black, sans-serif',
            fontWeight: 900,
            fontSize: 64,
            color: colors.background.darker,
            // Box shadow multi-capa con glow dinámico (Prompt 19.10)
            boxShadow: `
              0 0 ${glowIntensity}px ${colors.primary},
              0 0 ${glowIntensity * 2}px ${colors.primary}40,
              0 20px 60px rgba(0, 0, 0, 0.6)
            `,
            letterSpacing: 2,
          }}
        >
          SI
        </div>

        {/* NOMBRE COMPLETO (Prompt 19.9: textShadow con glow) */}
        <div
          style={{
            opacity: ctaOpacity,
            fontFamily: 'Inter, Arial Black, sans-serif',
            fontWeight: 800,
            fontSize: 48,
            color: colors.text.primary,
            textAlign: 'center',
            letterSpacing: 1,
            textShadow: `0 0 ${glowIntensity * 0.7}px ${colors.primary}, 0 4px 8px rgba(0, 0, 0, 0.8)`,
          }}
        >
          SINTAXIS IA
        </div>

        {/* CTA - Call to Action */}
        <div
          style={{
            opacity: ctaOpacity,
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
            fontWeight: 500,
            fontSize: 28,
            color: colors.text.secondary,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Síguenos para más noticias de Inteligencia Artificial
        </div>

        {/*
          ============================================
          NOTA CRITICA - HASHTAGS NO SE RENDERIZAN
          ============================================

          Los hashtags NO se muestran en el video.
          Solo van en el título de YouTube (metadata).

          El array hashtags se recibe en props pero
          se ignora intencionalmente para evitar
          contenido visual que distraiga del branding.

          Para SEO, los hashtags van en:
          - Título de YouTube
          - Descripción del video
          - Tags de YouTube

          NUNCA en el video visible.
        */}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default OutroScene;
