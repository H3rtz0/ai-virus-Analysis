import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
    host: '0.0.0.0',
    https: true, // 启用 HTTPS
    allowedHosts: ['*'],
    proxy: {
      // 将 /vt-api 的请求代理到 VirusTotal
      '/vt-api': {
        target: 'https://www.virustotal.com',
        changeOrigin: true, // 必须设置为 true，否则请求可能失败
        rewrite: (path) => path.replace(/^\/vt-api/, ''), // 从请求路径中移除 /vt-api
      },
    },
  }
})