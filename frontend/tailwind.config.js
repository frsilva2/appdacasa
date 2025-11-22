/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores da marca Empório Tecidos
        primary: {
          DEFAULT: '#EE2B68',
          50: '#FFDCEA',
          100: '#FFC9E0',
          200: '#FFB3D6',
          300: '#FF9DCC',
          400: '#FF87C2',
          500: '#EE2B68',
          600: '#D81F5A',
          700: '#C2134C',
          800: '#AC073E',
          900: '#960030',
        },
        secondary: {
          DEFAULT: '#2F3685',
          50: '#E8E9F5',
          100: '#D1D3EB',
          200: '#A3A7D7',
          300: '#757BC3',
          400: '#474FAF',
          500: '#2F3685',
          600: '#262B6A',
          700: '#1D2050',
          800: '#141535',
          900: '#0B0A1B',
        },
        accent: {
          DEFAULT: '#FFDCEA',
          light: '#FFE9F4',
          dark: '#FFB3D6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fontes maiores para acessibilidade (usuários 50+)
        'xs': ['0.875rem', { lineHeight: '1.5' }],
        'sm': ['1rem', { lineHeight: '1.5' }],
        'base': ['1.125rem', { lineHeight: '1.6' }],
        'lg': ['1.25rem', { lineHeight: '1.6' }],
        'xl': ['1.5rem', { lineHeight: '1.6' }],
        '2xl': ['1.875rem', { lineHeight: '1.5' }],
        '3xl': ['2.25rem', { lineHeight: '1.4' }],
        '4xl': ['3rem', { lineHeight: '1.3' }],
      },
      spacing: {
        // Espaçamentos maiores para toque em mobile
        'touch': '48px',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}
