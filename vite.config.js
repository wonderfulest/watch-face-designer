import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: 'vue/dist/vue.esm-bundler.js', // 使用包含模板编译器的版本
    }
  },
  // 添加以下配置来处理字体文件
  assetsInclude: ['**/*.woff2']
}) 