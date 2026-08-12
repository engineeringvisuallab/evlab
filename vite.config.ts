import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // For GitHub Pages project sites (username.github.io/repo-name), the app
  // is served from a sub-path. The deploy workflow sets VITE_BASE_PATH to
  // "/<repo-name>/" automatically at build time. Locally (npm run dev /
  // npm run build without the env var) this defaults to "/".
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
