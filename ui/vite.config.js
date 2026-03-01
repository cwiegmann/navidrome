import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const frontendPort = parseInt(process.env.PORT) || 4533
const backendPort = frontendPort + 100
const backendUrl = process.env.ND_BACKEND_URL || ('http://localhost:' + backendPort)

function goTemplatePlugin() {
  return {
    name: 'go-template-replace',
    transformIndexHtml(html) {
      return html
        .replace('{{ .AppConfig }}', JSON.stringify({}))
        .replace('{{ .ShareInfo }}', JSON.stringify({}))
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    goTemplatePlugin(),
    VitePWA({
      manifest: manifest(),
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: true,
    port: frontendPort,
    proxy: {
      '^/(auth|api|rest|backgrounds)/.*': {
        target: backendUrl,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  base: './',
  define: {
    'process.env': JSON.stringify({}),
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [],
    },
  },
})

function manifest() {
  return {
    name: 'Navidrome',
    short_name: 'Navidrome',
    description: 'Navidrome, an open source web-based music collection server and streamer',
    categories: ['music', 'entertainment'],
    display: 'standalone',
    start_url: './',
    background_color: 'white',
    theme_color: 'blue',
    icons: [
      { src: './android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: './android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
