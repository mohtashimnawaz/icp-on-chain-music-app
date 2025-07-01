import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': JSON.stringify({}),
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.version': JSON.stringify(''),
    'process.versions': JSON.stringify({}),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/candid', '@dfinity/principal'],
  },
})
