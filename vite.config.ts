import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@lib': './src/lib',
      '@src': './src',
    },
  },
  plugins: [svelte()],
})
