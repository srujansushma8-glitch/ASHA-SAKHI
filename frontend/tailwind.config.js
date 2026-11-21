/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme requirements: Professional white, teal, green and navy; Red reserved for emergency alerts
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          600: '#334E68',
          700: '#243B53',
          800: '#102A43',
          900: '#0B1D3A',
          950: '#071324',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        emergency: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        }
      },
      fontFamily: {
        kannada: ['"Noto Sans Kannada"', '"Baloo Tamma 2"', 'system-ui', 'sans-serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Noto Sans Kannada"', 'sans-serif'],
      },
      boxShadow: {
        'touch': '0 4px 14px 0 rgba(13, 148, 136, 0.25)',
        'emergency': '0 4px 20px 0 rgba(220, 38, 38, 0.35)',
      }
    },
  },
  plugins: [],
}
