import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Disable React StrictMode to avoid Fluent UI warnings
    jsxRuntime: 'automatic',
  })],
  server: {
    port: 3000,
    host: "127.0.0.1"
  },
  define: {
    // Suppress React warnings in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
})
