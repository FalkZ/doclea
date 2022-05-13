import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  server: { hmr: false },
  resolve: {
    alias: {
      '@src': '/src',
      '@ui': '/src/ui'
    }
  },
  plugins: [svelte()]
})
