import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@storage-framework': 'http://localhost:8080/src',
      '@src': '/src',
    },
  },
  plugins: [svelte()],
})
