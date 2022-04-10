import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  root: '../doclea/src/',
  server: {
    port: 8080
  },
  resolve: {
    alias: {
      '@lib': '/src/lib',
      '@src': '/src'
    }
  },
  //@ts-ignore
  test: {
    testTimeout: false,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    environment: 'happy-dom'
  }
})
