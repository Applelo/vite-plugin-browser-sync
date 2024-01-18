import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  plugins: [
    VitePluginBrowserSync({
      runOn: {
        preview: true,
        buildWatch: true,
        dev: true,
      },
    }),
  ],
}
