import Inspect from 'vite-plugin-inspect'
import VitePluginBrowserSync from '../src'

export default {
  plugins: [VitePluginBrowserSync(), Inspect()]
}
