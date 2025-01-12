import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/', // Ensure base URL is set to root
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: 'vue/dist/vue.esm-bundler.js',
    }
  },
  server: {
    historyApiFallback: true, // Enable history mode routing support
  },
  assetsInclude: ['**/*.woff2']
})