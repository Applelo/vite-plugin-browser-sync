import VitePluginBrowserSync from 'vite-plugin-browser-sync'
import { defineConfig } from 'vite'

export default defineConfig({
  // build: {
  //   watch: {},
  // },
  plugins: [
    VitePluginBrowserSync({
      preview: {
        enable: true,
        bs: {
          proxy: 'http://localhost:3000',
        },
      },
      buildWatch: {
        enable: true,
        // mode: 'snippet',
        bs: {
          // server: 'dist',
          // proxy: 'http://localhost:3000',
          // proxy: {
          //   target: 'http://localhost:3000',
          // },
        },
      },
    }),
  ],
})
