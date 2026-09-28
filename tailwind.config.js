/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Cream / off-white backgrounds
        cream: {
          DEFAULT: '#FFFBF6',
          50: '#FFFDFA',
          100: '#FFFBF6',
          200: '#FDF4EA',
        },
        // Readable dark navy text
        ink: {
          DEFAULT: '#2E2A47',
          soft: '#5A5378',
          muted: '#8B85A6',
        },
        // Baby pink
        pink: {
          50: '#FFF5F8',
          100: '#FFE7EF',
          200: '#FFD1E0',
          300: '#FFB3C7',
          400: '#FC8FAB',
          500: '#F76E97',
          600: '#E24E7C',
        },
        // Light lavender
        lavender: {
          50: '#F7F4FF',
          100: '#EFE9FE',
          200: '#E0D6FD',
          300: '#CBBDFA',
          400: '#B3A0F4',
          500: '#9B85EC',
        },
        // Soft purple
        grape: {
          100: '#EADFFB',
          200: '#D8C6F5',
          300: '#BFA6EC',
          400: '#A585DF',
          500: '#8B6BCB',
          600: '#7351AC',
        },
        // Sky blue
        sky: {
          50: '#F3FAFF',
          100: '#E3F3FD',
          200: '#C8E8F9',
          300: '#A6D8F2',
          400: '#7FC3E8',
          500: '#5CABDA',
        },
        // Soft yellow
        butter: {
          50: '#FFFBEB',
          100: '#FFF5CE',
          200: '#FFEBAA',
          300: '#FFDE84',
          400: '#F8CC5C',
          500: '#E8B33F',
        },
        // Mint accent (used sparingly for "Ready"/"Completed" states)
        mint: {
          100: '#DFF5E9',
          300: '#9EE0BF',
          500: '#4FC08D',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['Quicksand', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        'blob': '42% 58% 61% 39% / 45% 42% 58% 55%',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(46, 42, 71, 0.18)',
        card: '0 18px 45px -20px rgba(46, 42, 71, 0.28)',
        pop: '0 12px 0 0 rgba(46, 42, 71, 0.08)',
        'pop-sm': '0 6px 0 0 rgba(46, 42, 71, 0.07)',
        glow: '0 0 0 6px rgba(255, 179, 199, 0.28)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        floatySlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(10px, -18px) rotate(8deg)' },
          '66%': { transform: 'translate(-8px, -10px) rotate(-6deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        riseHeart: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.6)' },
          '15%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-140px) scale(1.15)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        floatySlow: 'floatySlow 7s ease-in-out infinite',
        drift: 'drift 14s ease-in-out infinite',
        twinkle: 'twinkle 3.4s ease-in-out infinite',
        riseHeart: 'riseHeart 7s linear infinite',
        wiggle: 'wiggle 2.6s ease-in-out infinite',
        popIn: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        marquee: 'marquee 28s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
