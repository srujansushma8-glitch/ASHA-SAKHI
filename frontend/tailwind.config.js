/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Palette:
        // Deep Teal/Emerald Primary: #0A5C5A / #087F8C / #20A675
        // Warm Saffron Accent: #FF9933 / #E67E22 / #F2994A
        // Soft Cream Background: #FAF9F5
        // Dark Mode Background: #0B1926

        cream: {
          50: '#FDFCF9',
          100: '#FAF9F5', // Soft Cream
          200: '#F3EFE6',
          300: '#E7E2D5',
        },
        saffron: {
          50: '#FFF7EB',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          DEFAULT: '#FF9933', // Warm Saffron
          600: '#EA580C',
          700: '#C2410C',
          hover: '#E67E22',
        },
        teal: {
          DEFAULT: '#087F8C',
          deep: '#0A5C5A',
          50: '#F0F9FA',
          100: '#D9F1EA',
          200: '#B2E4D9',
          500: '#087F8C',
          600: '#066B76',
          700: '#0A5C5A', // Deep Teal
          800: '#074644',
          900: '#042E2D',
        },
        primary: {
          DEFAULT: '#087F8C',
          deep: '#0A5C5A',
          hover: '#066B76',
          active: '#055760',
          50: '#F0F9FA',
          100: '#D9F1EA',
          200: '#B2E4D9',
          500: '#087F8C',
          600: '#066B76',
          700: '#0A5C5A',
        },
        healthcare: {
          DEFAULT: '#20A675', // Healthcare Green
          hover: '#1B8C63',
          light: '#E8F7F1',
          50: '#E8F7F1',
          100: '#C8EEDD',
          500: '#20A675',
          600: '#1B8C63',
        },
        cyan: {
          DEFAULT: '#19B8D5',
          hover: '#149EBA',
          50: '#F0FAFC',
          100: '#E2F8FC',
          200: '#BBEFF7',
          500: '#19B8D5',
        },
        navy: {
          DEFAULT: '#142B45',
          deep: '#142B45',
          darkest: '#0B1926',
          50: '#F4F7FB',
          100: '#EAF3FA',
          200: '#CBDCEB',
          300: '#9FBED8',
          400: '#6A9BC0',
          500: '#3D77A2',
          600: '#2A5A80',
          700: '#1E4260',
          800: '#183550',
          900: '#142B45',
          950: '#0B1926', // Dark Mode Base
        },
        pink: {
          DEFAULT: '#E879A9',
          light: '#FCEEF4',
          50: '#FDF4F8',
          100: '#FCEEF4',
          500: '#E879A9',
        },
        emergency: {
          DEFAULT: '#D94343',
          hover: '#BF3535',
          50: '#FCF1F1',
          100: '#F8DADA',
          500: '#E25959',
          600: '#D94343',
        },
        warning: {
          DEFAULT: '#F2B84B',
          50: '#FEF9EF',
          100: '#FDF1D7',
          500: '#F2B84B',
        },
        softblue: {
          DEFAULT: '#EAF3FA',
          50: '#F4F8FC',
          100: '#EAF3FA',
          200: '#D5E7F5',
        },
        appbg: '#FAF9F5',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Poppins', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        hindi: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      transitionTimingFunction: {
        'decelerate': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(20, 43, 69, 0.04), 0 1px 2px 0 rgba(20, 43, 69, 0.02)',
        'card': '0 4px 20px 0 rgba(20, 43, 69, 0.06), 0 1px 3px 0 rgba(20, 43, 69, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(20, 43, 69, 0.12), 0 4px 6px -2px rgba(20, 43, 69, 0.05)',
        'glass': '0 8px 32px 0 rgba(10, 92, 90, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'touch': '0 4px 16px 0 rgba(8, 127, 140, 0.25)',
        'saffron': '0 4px 20px 0 rgba(255, 153, 51, 0.35)',
        'cyan': '0 4px 20px 0 rgba(25, 184, 213, 0.30)',
        'emergency': '0 4px 20px 0 rgba(217, 67, 67, 0.28)',
      }
    },
  },
  plugins: [],
}
