import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    'process.env.CANISTER_ID_ICP_MUSIC_PLATFORM_BACKEND': JSON.stringify(process.env.CANISTER_ID_ICP_MUSIC_PLATFORM_BACKEND),
    'process.env.CANISTER_ID_ICP_MUSIC_PLATFORM_FRONTEND': JSON.stringify(process.env.CANISTER_ID_ICP_MUSIC_PLATFORM_FRONTEND),
    'process.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'),
    'process.version': '""',
    'process.versions': '{}',
    'process.browser': 'true'
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
