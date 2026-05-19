import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    vue(),
    svgLoader({
      defaultImport: 'component',
      svgo: true,
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },

          // Убираем width/height из SVG,
          // чтобы размер задавался через Vue/CSS.
          'removeDimensions',

          // Не трогаем fill/stroke, потому что у тебя есть fill-иконки.
          {
            name: 'removeAttrs',
            params: {
              attrs: '(data-name)',
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  server: {
    host: '127.0.0.1',
    port: 5173,

    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3123',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})