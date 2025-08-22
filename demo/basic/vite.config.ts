import { defineConfig } from 'vite'
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default defineConfig({
  // build: {
  //   watch: {},
  // },
  plugins: [
    VitePluginBrowserSync(),
  ],
})
