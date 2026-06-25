import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    assetsDir: 'SpeedGame/assets'
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
})
