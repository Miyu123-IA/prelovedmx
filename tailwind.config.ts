import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        crema: {
          DEFAULT: '#F6EFE3',
          light: '#FBF7EF',
          dark: '#EAE0CB',
        },
        tierra: {
          DEFAULT: '#5B4632',
          light: '#7A6248',
          dark: '#3E3021',
        },
        olivo: {
          DEFAULT: '#6E6A46',
          light: '#8B8760',
          dark: '#4F4C31',
        },
        mostaza: {
          DEFAULT: '#D3A244',
          light: '#E4BC6C',
          dark: '#AD7F2E',
        },
        terracota: {
          DEFAULT: '#BC5A38',
          light: '#D67A56',
          dark: '#943F24',
        },
        tinta: '#2B2520',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 2px 10px -2px rgba(43, 37, 32, 0.15)',
      },
      keyframes: {
        fadein: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
