/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        clinical: {
          25: '#f6fbff',
          50: '#eef7ff',
          100: '#d9edff',
          200: '#b7dcff',
          300: '#86c3ff',
          400: '#4ea2f8',
          500: '#1a73e8',
          600: '#1557b0',
          700: '#0f3f86',
          800: '#0c326b',
          900: '#0b2447'
        },
        emerald: {
          25: '#f4fbf7'
        },
        success: '#34a853',
        warning: '#fbbc04',
        danger: '#ea4335',
        ink: '#101828'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 14px 40px rgba(15, 23, 42, 0.08)',
        panel: '0 24px 70px rgba(15, 23, 42, 0.16)',
        lift: '0 18px 45px rgba(26, 115, 232, 0.14)',
        insetline: 'inset 0 1px 0 rgba(255,255,255,0.75)'
      },
      backgroundImage: {
        'app-radial': 'radial-gradient(circle at top left, rgba(26,115,232,0.12), transparent 30%), radial-gradient(circle at 80% 20%, rgba(52,168,83,0.10), transparent 28%)',
        'card-sheen': 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,251,255,0.88))'
      }
    }
  },
  plugins: []
};
