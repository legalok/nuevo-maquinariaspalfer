import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8001'

  return {
    plugins: [react()],
    base: '/',
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      // Allow Emergent's preview hostnames in dev mode
      allowedHosts: true,
      hmr: {
        clientPort: 443,
        protocol: 'wss',
      },
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
