import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

import polyfillNode from 'rollup-plugin-polyfill-node'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@github-adapter': path.resolve(__dirname, './src/github-adapter'),
    },
  },
  plugins: [svelte()],
  optimizeDeps: {
    exclude: ['@inrupt/solid-client'], // <- modules that needs shimming have to be excluded from dep optimization
  },
})
