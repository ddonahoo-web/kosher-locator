import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
  preview: {
    allowedHosts: ['kosher-locator-production-50f4.up.railway.app', 'kosherrestaurantlocator.com', 'www.kosherrestaurantlocator.com'],
  },
})
