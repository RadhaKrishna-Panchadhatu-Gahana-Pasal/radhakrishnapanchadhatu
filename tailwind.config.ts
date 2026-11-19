import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: '#F7F5F0',
        surface: '#FFFFFF',
        gold: '#B08A45',
        'gold-deep': '#80612F',
        ink: '#25231F',
        muted: '#77736B',
        line: '#E9E5DC',
        success: '#26734D',
        warning: '#A66B18',
        danger: '#B43B35',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(37, 35, 31, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
