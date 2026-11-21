/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mandatory Colour Palette
        primary: {
          DEFAULT: '#087F8C', // Primary Deep Teal
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
          50: '#F0F9FA',
          100: '#D9F1EA', // Mint Surface
          200: '#B2E4D9',
          300: '#8CE7D4',
          500: '#087F8C', // Primary Deep Teal
          600: '#087F8C',
          700: '#066B76',
          800: '#055760',
          900: '#032D32',
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
          700: '#156F4E',
        },
        ivory: {
          bg: '#F7F8F2', // Warm Ivory Background
          DEFAULT: '#F7F8F2',
        },
        navy: {
          DEFAULT: '#18364A', // Navy Text
          50: '#F4F7F9',
          100: '#E5ECF2',
          200: '#C7D7E3',
          300: '#A4BFD2',
          400: '#6E92AC',
          500: '#4A6F8A',
          600: '#34556E',
          700: '#244157',
          800: '#18364A',
          900: '#102635',
          950: '#0A1822',
        },
        mint: {
          surface: '#D9F1EA', // Mint Surface
          DEFAULT: '#D9F1EA',
          dark: '#BDE4D9',
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
          800: '#961E1E',
          900: '#751414',
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
          700: '#B87E1D',
        }
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
        'subtle': '0 1px 3px 0 rgba(24, 54, 74, 0.05), 0 1px 2px 0 rgba(24, 54, 74, 0.03)',
        'card': '0 4px 12px 0 rgba(24, 54, 74, 0.05), 0 1px 3px 0 rgba(24, 54, 74, 0.02)',
        'touch': '0 4px 14px 0 rgba(8, 127, 140, 0.20)',
        'emergency': '0 4px 20px 0 rgba(217, 67, 67, 0.28)',
      }
    },
  },
  plugins: [],
}
