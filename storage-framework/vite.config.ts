import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@lib': '/src/lib',
      '@src': '/src',
    },
  },
  //@ts-ignore
  test: { testTimeout: false },
})
