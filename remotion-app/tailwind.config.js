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
      // Colores del tema Sintaxis IA (Tech Editorial - Prompt 20)
      colors: {
        'sintaxis': {
          'blue': '#4A9EFF',
          'slate': '#64748B',
          'sky': '#38BDF8',
          'dark': '#0F1419',
          'gold': '#ffd700',
          'red': '#ff3366'
        },
        // Aliases para uso rápido
        'brand-blue': '#4A9EFF',
        'brand-slate': '#64748B',
        'brand-sky': '#38BDF8',
        'bg-dark': '#0F1419',
        'accent-gold': '#ffd700',
        'accent-red': '#ff3366'
      },
      // Sombras editoriales sutiles (Prompt 20)
      boxShadow: {
        'editorial-blue': '0 2px 12px #4A9EFF20',
        'editorial-slate': '0 2px 12px #64748B20',
        'elevation-sm': '0 2px 8px rgba(0,0,0,0.2)',
        'elevation-md': '0 4px 24px rgba(0,0,0,0.3)',
        'elevation-lg': '0 8px 32px rgba(0,0,0,0.4)'
      },
      // Animaciones personalizadas
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sweep': 'sweep 8s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        sweep: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '50%': { opacity: '0.05' },
          '100%': { opacity: '0', transform: 'translateX(200%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      // Fuentes
      fontFamily: {
        'display': ['Inter', 'Arial Black', 'sans-serif'],
        'body': ['Inter', 'Roboto', 'Arial', 'sans-serif']
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
