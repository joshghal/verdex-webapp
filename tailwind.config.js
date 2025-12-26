/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Verdex Brand - Primary Green
        verdex: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Finance Navy - Secondary
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        // Gold Accent - Premium
        gold: {
          300: '#fcd34d',
          400: '#f6c343',
          500: '#d4a012',
          600: '#b8860b',
          700: '#92400e',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Geograph', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'verdex': '0 4px 14px 0 rgba(4, 120, 87, 0.15)',
        'verdex-lg': '0 10px 40px 0 rgba(4, 120, 87, 0.2)',
        'verdex-sm': '0 2px 8px 0 rgba(4, 120, 87, 0.1)',
        'verdex-xl': '0 20px 50px 0 rgba(4, 120, 87, 0.15)',
        'gold': '0 4px 14px 0 rgba(212, 160, 18, 0.25)',
        'glass': '0 8px 32px rgba(5, 150, 105, 0.08)',
        'glass-hover': '0 16px 48px rgba(5, 150, 105, 0.12)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 25%, #d1fae5 50%, #f0fdf4 75%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
};
