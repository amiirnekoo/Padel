/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rally: {
          teal: {
            DEFAULT: '#0E3D38', // Deep Mineral Teal
            dark: '#082522',
            light: '#14574F',
            hover: '#1B6960',
          },
          lime: {
            DEFAULT: '#D7ED68', // Electric Lime
            hover: '#C7DE54',
            light: '#E6F58D',
            glow: 'rgba(215, 237, 104, 0.35)',
          },
          ivory: {
            DEFAULT: '#F5F4EF', // Warm Ivory
            light: '#FAF9F5',
            dark: '#E8E6DD',
          },
          graphite: {
            DEFAULT: '#172320', // Graphite
            muted: '#253833',
            light: '#354E48',
          },
          softGray: '#66706D', // Secondary soft gray text
          primary: {
            DEFAULT: '#0E3D38', // Deep Mineral Teal as primary
            light: '#165B53',
            dark: '#082522',
            hover: '#1B6960'
          },
          accent: {
            DEFAULT: '#D7ED68', // Electric Lime Accent
            hover: '#C7DE54',
            muted: '#E6F58D',
            glow: 'rgba(215, 237, 104, 0.35)'
          },
          charcoal: {
            DEFAULT: '#172320',
            muted: '#253833',
            light: '#66706D'
          },
          dark: {
            bg: '#0E3D38',
            card: '#172320',
            subtle: '#253833',
            hover: '#354E48'
          },
          light: {
            bg: '#F5F4EF',
            card: '#FFFFFF',
            subtle: '#FAF9F5',
            border: '#E8E6DD'
          },
          border: {
            subtle: '#E2E8F0',
            active: '#D7ED68',
            strong: '#0E3D38'
          }
        }
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '10px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
        'pill': '9999px'
      },
      boxShadow: {
        'rally-card': '0 4px 20px rgba(2, 132, 199, 0.08)',
        'rally-hover': '0 8px 30px rgba(2, 132, 199, 0.16)',
        'rally-glow': '0 0 20px rgba(56, 189, 248, 0.25)',
        'rally-blue': '0 4px 16px rgba(2, 132, 199, 0.35)'
      },
      screens: {
        'xs': '400px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        'ultra': '114rem'
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Strict 8px grid scale
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      }
    },
  },
  plugins: [],
}
