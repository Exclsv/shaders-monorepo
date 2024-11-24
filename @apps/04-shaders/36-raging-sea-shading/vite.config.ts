import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [glsl()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
