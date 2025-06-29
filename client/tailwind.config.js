// tailwind.config.js
import { defineConfig } from '@tailwindcss/oxide'
import { FilesystemPath } from '@tailwindcss/oxide'

export default defineConfig({
  engine: { oxide: { enable: true } },
  content: [
    FilesystemPath.of('src/**/*.{js,ts,jsx,tsx}').filter(),
    FilesystemPath.of('index.html').filter(),
  ],
  theme: {
    extend: {
      colors: {
        customLight: {
          DEFAULT: '#b2d8d8',
          50: '#f0f9f9',
          100: '#e0f3f3',
        },
      },
    },
  },
  plugins: [],
})
