/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Modern IMDb-inspired color palette
        gray: {
          900: '#0D0D0D', // Primary background - deep charcoal, pure dark
          800: '#1A1A1A',
          700: '#262626',
          600: '#404040',
          500: '#666666',
          400: '#999999',
          300: '#B3B3B3', // Text secondary - muted for subtitles/overviews
        },
        yellow: {
          400: '#F5C518', // Primary accent - IMDb gold
          300: '#FFDF6C', // Secondary accent - soft gold highlight for hovers
          500: '#e6b800',
        },
        white: '#FFFFFF', // Text primary - high contrast white
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'projector-spin': 'projectorSpin 3s linear infinite',
        'flip': 'flip 0.6s ease-in-out',
        'cinema-reel': 'cinemaReel 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        projectorSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg) scale(1.1)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        cinemaReel: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.line-clamp-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-3': {
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.glassmorphism': {
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.card-hover': {
          background: 'rgba(255, 255, 255, 0.05)',
        },
      });
    },
  ],
};