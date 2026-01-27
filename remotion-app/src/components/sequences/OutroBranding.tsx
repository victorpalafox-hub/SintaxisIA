// ===================================
// OUTRO BRANDING - Cierre con CTA 55-60s
// ===================================

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig
} from 'remotion';
import { NeonBorder, NeonLine } from '../effects/NeonBorder';

interface OutroBrandingProps {
  cta: string;
  channelName?: string;
  logoUrl?: string;
  themeColor?: string;
}

/**
 * Secuencia de cierre con call to action
 * Duración: 150 frames (5 segundos a 30fps)
 * - Logo del canal
 * - Call to action animado
 * - Iconos de seguir/suscribir
 */
export const OutroBranding: React.FC<OutroBrandingProps> = ({
  cta,
  channelName = 'SINTAXIS IA',
  logoUrl,
  themeColor = '#00f0ff'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animación de entrada del logo
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 }
  });

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Animación del CTA
  const ctaY = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 80 }
  });

  const ctaOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Pulso del botón de seguir
  const buttonPulse = interpolate(
    Math.sin(frame * 0.12),
    [-1, 1],
    [0.95, 1.05]
  );

  // Animación de los iconos sociales
  const iconsOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Glow pulsante del fondo
  const bgGlow = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.5]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f' }}>
      {/* Fondo con glow */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center,
            ${themeColor}${Math.floor(bgGlow * 25).toString(16).padStart(2, '0')} 0%,
            transparent 70%)`
        }}
      />

      {/* Logo y nombre del canal */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${logoScale})`,
          opacity: logoOpacity
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={channelName}
            style={{ width: 150, height: 150, marginBottom: 20 }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${themeColor}, #ff0099)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              boxShadow: `0 0 40px ${themeColor}80`
            }}
          >
            <span style={{ fontSize: 60 }}>🤖</span>
          </div>
        )}

        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: 'Arial Black, sans-serif',
            textShadow: `0 0 20px ${themeColor}`,
            margin: 0
          }}
        >
          {channelName}
        </h1>
      </div>

      {/* Línea decorativa */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          width: '60%',
          left: '20%',
          opacity: ctaOpacity
        }}
      >
        <NeonLine color={themeColor} />
      </div>

      {/* Call to Action */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          width: '100%',
          textAlign: 'center',
          transform: `translateY(${interpolate(ctaY, [0, 1], [50, 0])}px)`,
          opacity: ctaOpacity
        }}
      >
        <p
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            padding: '0 40px',
            lineHeight: 1.4
          }}
        >
          {cta}
        </p>
      </div>

      {/* Botón de seguir */}
      <div
        style={{
          position: 'absolute',
          top: '72%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: ctaOpacity
        }}
      >
        <div style={{ transform: `scale(${buttonPulse})` }}>
          <NeonBorder
            color="#ff0099"
            secondaryColor={themeColor}
            thickness={3}
            borderRadius={50}
            glowIntensity={1.5}
          >
            <div
              style={{
                padding: '18px 60px',
                fontSize: 32,
                fontWeight: 'bold',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: 2
              }}
            >
              ⚡ SEGUIR
            </div>
          </NeonBorder>
        </div>
      </div>

      {/* Iconos de redes sociales */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          opacity: iconsOpacity
        }}
      >
        {['📱', '🔔', '❤️'].map((icon, index) => (
          <div
            key={index}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#1a1a2e',
              border: `2px solid ${themeColor}40`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 30,
              transform: `translateY(${Math.sin((frame + index * 20) * 0.1) * 5}px)`
            }}
          >
            {icon}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default OutroBranding;
