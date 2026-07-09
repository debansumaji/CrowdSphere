import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0f',
        paper: '#f8f8fb',
        graphite: '#15151d',
        smoke: '#6d6a78',
        lilac: '#ede9fe',
        violet: '#7c3aed',
        violetDeep: '#5b21b6',
        line: '#d8d3e7',
      },
      boxShadow: {
        soft: '0 24px 70px rgba(12, 10, 18, 0.08)',
        focus: '0 0 0 4px rgba(124, 58, 237, 0.14)',
      },
      fontFamily: {
        display: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', 'serif'],
        body: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', 'sans-serif'],
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at top left, rgba(124, 58, 237, 0.18), transparent 24%), radial-gradient(circle at right, rgba(10, 10, 15, 0.08), transparent 28%), linear-gradient(180deg, #ffffff 0%, #f8f8fb 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
