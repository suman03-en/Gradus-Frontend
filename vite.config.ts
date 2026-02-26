import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function djangoCsrfFriendlyProxy() {
  const target = 'http://127.0.0.1:8000'
  return {
    target,
    changeOrigin: true,
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => {
        // Django CSRF "Origin checking failed" happens when Origin is the Vite dev server.
        // Rewrite Origin to backend origin so Django accepts it in development.
        proxyReq.setHeader('origin', target)
        proxyReq.setHeader('referer', target + '/')
      })
    },
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Keep API calls on same origin (5173) to simplify cookies/CSRF in dev.
      '/api': djangoCsrfFriendlyProxy(),
      '/admin': djangoCsrfFriendlyProxy(),
      // Proxy media files so uploaded submissions are accessible.
      '/media': djangoCsrfFriendlyProxy(),
    },
  },
})
