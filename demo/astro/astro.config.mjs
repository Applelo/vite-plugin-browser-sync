import { defineConfig } from 'astro/config'
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      VitePluginBrowserSync({
        dev: {
          enable: true,
          bs: {
            online: true,
          },
        },
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
            proxy: 'http://localhost:3000',
            // proxy: {
            //   target: 'http://localhost:3000',
            // },
          },
        },
      }),
    ],
  },
})
