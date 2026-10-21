import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from the host's root (Netlify) rather than a GitHub Pages
  // project subpath, so no base prefix is needed.
  base: '/',
})
