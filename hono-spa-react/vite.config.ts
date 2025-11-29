import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  plugins: command === 'serve' ? [devServer({ entry: 'src/app.tsx' })] : [],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './src/client.tsx',
      output: {
        entryFileNames: 'static/client.js',
        chunkFileNames: 'static/[name].js',
        assetFileNames: 'static/[name][extname]'
      }
    }
  }
}))
