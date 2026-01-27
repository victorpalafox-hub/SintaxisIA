// ===================================
// TAILWIND CONFIG - Tema Sintaxis IA
// ===================================

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Colores del tema Sintaxis IA
      colors: {
        'sintaxis': {
          'cyan': '#00f0ff',
          'magenta': '#ff0099',
          'purple': '#cc00ff',
          'dark': '#0a0a0f',
          'gold': '#ffd700',
          'red': '#ff3366'
        },
        // Aliases para uso rápido
        'neon-cyan': '#00f0ff',
        'neon-magenta': '#ff0099',
        'neon-purple': '#cc00ff',
        'bg-dark': '#0a0a0f',
        'accent-gold': '#ffd700',
        'accent-red': '#ff3366'
      },
      // Sombras con glow neón
      boxShadow: {
        'neon-cyan': '0 0 10px #00f0ff, 0 0 20px #00f0ff50',
        'neon-magenta': '0 0 10px #ff0099, 0 0 20px #ff009950',
        'neon-purple': '0 0 10px #cc00ff, 0 0 20px #cc00ff50',
        'neon-gold': '0 0 10px #ffd700, 0 0 20px #ffd70050'
      },
      // Animaciones personalizadas
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00f0ff, 0 0 10px #00f0ff50' },
          '100%': { boxShadow: '0 0 20px #00f0ff, 0 0 40px #00f0ff50' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      // Fuentes
      fontFamily: {
        'display': ['Arial Black', 'sans-serif'],
        'body': ['Arial', 'sans-serif']
      },
      // Tamaños para video vertical
      spacing: {
        'video-w': '1080px',
        'video-h': '1920px'
      }
    }
  },
  plugins: []
};
