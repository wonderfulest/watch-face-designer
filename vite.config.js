import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 获取环境变量
const env = process.env.NODE_ENV
console.log('env', env)
export default defineConfig({
  plugins: [vue()],
  base: '/', // Ensure base URL is set to root
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  server: {
    proxy: {
      '/api': {
        // target: 'http://127.0.0.1:1338',
        target: 'https://api.garminface.com',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')  // 如果后端不需要 /api 前缀，可以启用这行
      }
    },
    historyApiFallback: true // Enable history mode routing support
  },
  assetsInclude: ['**/*.woff2']
})
