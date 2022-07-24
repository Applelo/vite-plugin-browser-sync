import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import VitePluginBrowserSync from '../src'

export default defineConfig({
  plugins: [VitePluginBrowserSync(), Inspect()]
})
