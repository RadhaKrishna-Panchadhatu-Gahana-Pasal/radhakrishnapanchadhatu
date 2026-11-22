import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Every colour reads from a CSS variable so the palette can flip between
      // the light and dark themes defined in app/globals.css.
      colors: {
        sand: 'rgb(var(--sand) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        field: 'rgb(var(--field) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-deep': 'rgb(var(--gold-deep) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgb(var(--shadow-color) / 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
