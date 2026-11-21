/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict Required Palette:
        // Deep Navy: #142B45
        // Primary Teal: #087F8C
        // Electric Cyan: #19B8D5
        // Healthcare Green: #20A675
        // Background: #F4F8FC
        // White: #FFFFFF
        // Soft Blue: #EAF3FA
        // Maternal Pink: #E879A9
        // Emergency Red: #D94343
        // Warning Amber: #F2B84B

        navy: {
          DEFAULT: '#142B45',
          deep: '#142B45',
          50: '#F4F7FB',
          100: '#EAF3FA', // Soft Blue
          200: '#CBDCEB',
          300: '#9FBED8',
          400: '#6A9BC0',
          500: '#3D77A2',
          600: '#2A5A80',
          700: '#1E4260',
          800: '#183550',
          900: '#142B45', // Deep Navy
          950: '#0C1C2E',
        },
        primary: {
          DEFAULT: '#087F8C', // Primary Teal
          hover: '#066B76',
          active: '#055760',
          50: '#F0F9FA',
          100: '#D9F1EA',
          200: '#B2E4D9',
          500: '#087F8C',
          600: '#066B76',
          700: '#055760',
          800: '#044249',
          900: '#032D32',
        },
        teal: {
          DEFAULT: '#087F8C',
          50: '#F0F9FA',
          100: '#D9F1EA',
          200: '#B2E4D9',
          500: '#087F8C',
          600: '#066B76',
          700: '#055760',
        },
        cyan: {
          DEFAULT: '#19B8D5', // Electric Cyan
          light: '#E2F8FC',
          hover: '#149EBA',
          50: '#F0FAFC',
          100: '#E2F8FC',
          200: '#BBEFF7',
          300: '#8CE2F1',
          400: '#52D0E8',
          500: '#19B8D5',
          600: '#149EBA',
          700: '#107F96',
        },
        healthcare: {
          DEFAULT: '#20A675', // Healthcare Green
          hover: '#1B8C63',
          light: '#E8F7F1',
          50: '#E8F7F1',
          100: '#C8EEDD',
          500: '#20A675',
          600: '#1B8C63',
          700: '#156F4E',
        },
        emerald: {
          50: '#E8F7F1',
          100: '#C8EEDD',
          500: '#20A675',
          600: '#1B8C63',
        },
        softblue: {
          DEFAULT: '#EAF3FA', // Soft Blue
          50: '#F4F8FC',
          100: '#EAF3FA',
          200: '#D5E7F5',
        },
        pink: {
          DEFAULT: '#E879A9', // Maternal Pink
          light: '#FCEEF4',
          50: '#FDF4F8',
          100: '#FCEEF4',
          200: '#F8D2E2',
          300: '#F2AAC8',
          400: '#ED8FB6',
          500: '#E879A9',
          600: '#D2578D',
          700: '#B23F72',
        },
        maternal: {
          DEFAULT: '#E879A9',
          light: '#FCEEF4',
          border: '#F8D2E2',
        },
        emergency: {
          DEFAULT: '#D94343', // Emergency Red
          hover: '#BF3535',
          50: '#FCF1F1',
          100: '#F8DADA',
          200: '#F2B3B3',
          500: '#E25959',
          600: '#D94343',
          700: '#B82E2E',
        },
        warning: {
          DEFAULT: '#F2B84B', // Warning Amber
          hover: '#DE9F31',
          50: '#FEF9EF',
          100: '#FDF1D7',
          500: '#F2B84B',
          600: '#DE9F31',
          700: '#B87E1D',
        },
        amber: {
          50: '#FEF9EF',
          100: '#FDF1D7',
          500: '#F2B84B',
          600: '#DE9F31',
        },
        appbg: '#F4F8FC',
      },
      fontFamily: {
        kannada: ['"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
        sans: ['Poppins', '"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        'decelerate': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(20, 43, 69, 0.04), 0 1px 2px 0 rgba(20, 43, 69, 0.02)',
        'card': '0 4px 16px 0 rgba(20, 43, 69, 0.06), 0 1px 3px 0 rgba(20, 43, 69, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(20, 43, 69, 0.1), 0 4px 6px -2px rgba(20, 43, 69, 0.05)',
        'touch': '0 4px 16px 0 rgba(8, 127, 140, 0.25)',
        'cyan': '0 4px 20px 0 rgba(25, 184, 213, 0.30)',
        'emergency': '0 4px 20px 0 rgba(217, 67, 67, 0.28)',
        'pink': '0 4px 16px 0 rgba(232, 121, 169, 0.25)',
      }
    },
  },
  plugins: [],
}
