import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep responsive media queries and JS syntax usable on older phone browsers.
  build: {
    target: ['chrome87', 'safari15', 'firefox78', 'edge88'],
    cssTarget: ['chrome87', 'safari15', 'firefox78', 'edge88'],
  },
})
