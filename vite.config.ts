import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@lib': '/src/lib',
      '@src': '/src',
    },
  },
  plugins: [svelte()],
})
