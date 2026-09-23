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
          primary: {
            DEFAULT: '#16483D',
            light: '#1e5e50',
            dark: '#0e332b',
            hover: '#123c32'
          },
          accent: {
            DEFAULT: '#D7ED68',
            hover: '#c6dc53',
            muted: '#a3b83b',
            glow: 'rgba(215, 237, 104, 0.25)'
          },
          dark: {
            bg: '#0a0e17',
            card: '#0f172a',
            subtle: '#1e293b',
            hover: '#273549'
          },
          light: {
            bg: '#F5F7F6',
            card: '#ffffff',
            subtle: '#e2e8f0'
          },
          border: {
            subtle: 'rgba(255, 255, 255, 0.08)',
            active: 'rgba(215, 237, 104, 0.4)',
            strong: 'rgba(255, 255, 255, 0.16)'
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
        'pill': '9999px'
      },
      boxShadow: {
        'rally-card': '0 4px 20px rgba(0, 0, 0, 0.35)',
        'rally-hover': '0 8px 30px rgba(0, 0, 0, 0.5)',
        'rally-glow': '0 0 20px rgba(215, 237, 104, 0.25)',
        'rally-green': '0 4px 16px rgba(22, 72, 61, 0.4)'
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
