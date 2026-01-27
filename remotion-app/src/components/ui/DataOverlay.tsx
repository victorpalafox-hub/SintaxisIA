// ===================================
// DATA OVERLAY - Overlays de datos y estadísticas
// ===================================

import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface DataOverlayProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  animated?: boolean;
}

/**
 * Overlay para mostrar datos/estadísticas con animación
 */
export const DataOverlay: React.FC<DataOverlayProps> = ({
  label,
  value,
  unit = '',
  color = '#00f0ff',
  position = 'top-right',
  animated = true
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Posicionamiento
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 100, left: 40 },
    'top-right': { top: 100, right: 40 },
    'bottom-left': { bottom: 200, left: 40 },
    'bottom-right': { bottom: 200, right: 40 }
  };

  // Animación de entrada
  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 }
  });

  const scale = animated ? entryProgress : 1;
  const opacity = animated
    ? interpolate(entryProgress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' })
    : 1;

  // Animación del valor (contador)
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const displayValue = !isNaN(numericValue) && animated
    ? Math.floor(interpolate(frame, [0, 30], [0, numericValue], { extrapolateRight: 'clamp' }))
    : value;

  // Pulso del glow
  const glowPulse = animated
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.5, 1])
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles[position],
        transform: `scale(${scale})`,
        opacity,
        zIndex: 20
      }}
    >
      <div
        style={{
          padding: '15px 20px',
          backgroundColor: 'rgba(10, 10, 15, 0.9)',
          borderRadius: 12,
          border: `1px solid ${color}40`,
          boxShadow: `0 0 ${20 * glowPulse}px ${color}30`,
          backdropFilter: 'blur(5px)'
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#888888',
            fontFamily: 'Arial, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 5
          }}
        >
          {label}
        </div>

        {/* Valor */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color,
            fontFamily: 'Arial Black, sans-serif',
            textShadow: `0 0 10px ${color}50`
          }}
        >
          {displayValue}
          {unit && (
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginLeft: 5,
                color: '#ffffff'
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Barra de progreso animada
 */
export const ProgressBar: React.FC<{
  progress: number; // 0-100
  label?: string;
  color?: string;
  width?: number;
}> = ({ progress, label, color = '#00f0ff', width = 200 }) => {
  const frame = useCurrentFrame();

  // Animación del progreso
  const animatedProgress = interpolate(
    frame,
    [0, 60],
    [0, progress],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ width }}>
      {label && (
        <div
          style={{
            fontSize: 14,
            color: '#888888',
            fontFamily: 'Arial, sans-serif',
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>{label}</span>
          <span style={{ color }}>{Math.floor(animatedProgress)}%</span>
        </div>
      )}

      <div
        style={{
          height: 8,
          backgroundColor: '#1a1a2e',
          borderRadius: 4,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${animatedProgress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, #ff0099)`,
            borderRadius: 4,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      </div>
    </div>
  );
};

/**
 * Timer/Countdown display
 */
export const TimerDisplay: React.FC<{
  startFrame: number;
  endFrame: number;
  color?: string;
}> = ({ startFrame, endFrame, color = '#00f0ff' }) => {
  const frame = useCurrentFrame();

  const remainingFrames = Math.max(0, endFrame - frame);
  const seconds = Math.ceil(remainingFrames / 30);

  const progress = ((frame - startFrame) / (endFrame - startFrame)) * 100;

  // Pulso cuando queda poco tiempo
  const urgentPulse = seconds <= 5
    ? interpolate(Math.sin(frame * 0.3), [-1, 1], [0.9, 1.1])
    : 1;

  const displayColor = seconds <= 5 ? '#ff3366' : color;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        transform: `scale(${urgentPulse})`
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: displayColor,
          fontFamily: 'Arial Black, sans-serif',
          textShadow: `0 0 15px ${displayColor}`
        }}
      >
        {seconds}s
      </div>

      <div style={{ width: 100 }}>
        <ProgressBar progress={progress} color={displayColor} width={100} />
      </div>
    </div>
  );
};

export default DataOverlay;
