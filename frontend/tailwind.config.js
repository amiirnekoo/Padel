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
            DEFAULT: '#0284C7', // Padel Cobalt Court Blue
            light: '#0EA5E9',   // Electric Sky Blue
            dark: '#0369A1',    // Deep Court Navy
            hover: '#0274B3'
          },
          accent: {
            DEFAULT: '#38BDF8', // Court Line Cyan Accent
            hover: '#0EA5E9',
            muted: '#7DD3FC',
            glow: 'rgba(56, 189, 248, 0.25)'
          },
          charcoal: {
            DEFAULT: '#0F172A', // Midnight Slate
            muted: '#334155',
            light: '#64748B'
          },
          dark: {
            bg: '#0F172A',
            card: '#1E293B',
            subtle: '#1E3A8A',
            hover: '#1D4ED8'
          },
          light: {
            bg: '#F8FAFC',     // Clean Ice/Court White
            card: '#FFFFFF',    // Crisp White
            subtle: '#F0F9FF',  // Subtle Ice Blue Tint
            border: '#E2E8F0'
          },
          border: {
            subtle: '#E2E8F0',
            active: '#38BDF8',
            strong: '#0284C7'
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
