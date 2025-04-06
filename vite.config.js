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
    historyApiFallback: true // Enable history mode routing support
  },
  assetsInclude: ['**/*.woff2']
})
