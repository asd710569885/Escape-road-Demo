import { fileURLToPath, URL } from 'node:url'
// import path from 'node:path' // 不再需要 path
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
// import Sitemap from 'vite-plugin-sitemap' // 暂时注释掉

// 不再需要 __dirname

// https://vite.dev/config/
// 改回同步函数
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    // Sitemap({
    //   hostname: 'https://escape-road-online.com',
    //   exclude: ['/admin/login', '/admin/dashboard'],
    // }) // 暂时注释掉
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  preview: {
    host: true,
    port: 4173
  },
  build: {
    outDir: 'dist', // 恢复 Vite 默认相对路径
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
})