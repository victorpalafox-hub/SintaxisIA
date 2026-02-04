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
 * @version 2.1.0
 * @since Prompt 13
 * @updated Prompt 19.4 - Duración reducida de 10s a 5s
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { colors, spacing } from '../../styles/themes';
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

  // ==========================================
  // ANIMACIONES DE ENTRADA
  // ==========================================

  // Cross fade desde Content Scene
  const sceneOpacity = interpolate(
    frame,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Logo zoom in con spring bounce
  const logoAnimation = spring({
    frame,
    fps: videoFps,
    config: {
      damping: 80,    // Menos rebote que hero
      stiffness: 150,
    },
  });

  const logoScale = interpolate(logoAnimation, [0, 1], [0.8, 1]);

  // ==========================================
  // EFECTOS DE GLOW
  // ==========================================

  // Glow pulsante del logo con patrón irregular
  // Frame 0->30: 0->40, 30->60: 40->20, 60->90: 20->40, 90->120: 40->30
  const glowIntensity = interpolate(
    frame,
    [0, 30, 60, 90, 120],
    [0, 40, 20, 40, 30],
    {
      extrapolateRight: 'clamp',
    }
  );

  // ==========================================
  // ANIMACION CTA
  // ==========================================

  // CTA fade in (empieza frame 20)
  const ctaOpacity = interpolate(
    frame,
    [20, 50],
    [0, 1],
    { extrapolateRight: 'clamp' }
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
        opacity: sceneOpacity,
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
            // Box shadow con glow dinámico
            boxShadow: `
              0 0 ${glowIntensity}px ${colors.primary},
              0 20px 60px rgba(0, 0, 0, 0.6)
            `,
            letterSpacing: 2,
          }}
        >
          SI
        </div>

        {/* NOMBRE COMPLETO */}
        <div
          style={{
            opacity: ctaOpacity,
            fontFamily: 'Inter, Arial Black, sans-serif',
            fontWeight: 800,
            fontSize: 48,
            color: colors.text.primary,
            textAlign: 'center',
            letterSpacing: 1,
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
