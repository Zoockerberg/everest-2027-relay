import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://<user>.github.io/everest-2027-relay/ — asset URLs
  // need this subpath since it isn't a user/org root page.
  base: '/everest-2027-relay/',
})
