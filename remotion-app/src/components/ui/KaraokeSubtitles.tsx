// ===================================
// KARAOKE SUBTITLES - Subtítulos animados
// ===================================

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { theme, HIGHLIGHT_KEYWORDS } from '../../theme';

interface SubtitleWord {
  word: string;
  startFrame: number;
  endFrame: number;
}

interface KaraokeSubtitlesProps {
  subtitles: SubtitleWord[];
  activeColor?: string;
  inactiveColor?: string;
  keywordColor?: string;
}

export const KaraokeSubtitles: React.FC<KaraokeSubtitlesProps> = ({
  subtitles,
  activeColor = theme.colors.primary,
  inactiveColor = theme.colors.textMuted,
  keywordColor = theme.colors.gold,
}) => {
  const frame = useCurrentFrame();

  // Encontrar palabras visibles en el frame actual
  const visibleWords = subtitles.filter(
    (word) => frame >= word.startFrame && frame <= word.endFrame
  );

  // Encontrar palabra activa (la que está sonando)
  const activeWordIndex = subtitles.findIndex(
    (word) => frame >= word.startFrame && frame <= word.endFrame
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '15%',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: `0 ${theme.sizes.paddingLg}px`,
      }}
    >
      {visibleWords.map((wordData) => {
        const isActive = activeWordIndex === subtitles.indexOf(wordData);

        // Opacidad simplificada
        const opacity = 1;

        // Escala simplificada
        const scale = isActive ? 1.15 : 0.95;

        // Color especial para palabras clave (usando keywords del theme)
        const isKeyword = HIGHLIGHT_KEYWORDS.some(
          (keyword) => wordData.word.toLowerCase().includes(keyword.toLowerCase())
        );

        return (
          <div
            key={`${wordData.word}-${wordData.startFrame}`}
            style={{
              fontFamily: theme.fonts.subtitle,
              fontSize: isActive ? theme.fontSizes.xxl : theme.fontSizes.xl,
              fontWeight: 'bold',
              color: isActive
                ? activeColor
                : isKeyword
                ? keywordColor
                : inactiveColor,
              textTransform: 'uppercase',
              opacity,
              transform: `scale(${scale})`,
              transition: `all ${theme.animation.transitionDuration}s ease`,
              textShadow: isActive
                ? theme.shadows.subtle(activeColor)
                : theme.shadows.text,
              backgroundColor: isActive
                ? `${activeColor}1A`
                : 'transparent',
              padding: `${theme.sizes.paddingSm}px ${theme.sizes.paddingMd + 5}px`,
              borderRadius: theme.sizes.borderRadius,
            }}
          >
            {wordData.word}
          </div>
        );
      })}
    </div>
  );
};

export default KaraokeSubtitles;
