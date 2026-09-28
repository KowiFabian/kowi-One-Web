import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#f5f7fa',
        accent: '#7c3aed',
      },
    },
  },
  plugins: [],
};

export default config;