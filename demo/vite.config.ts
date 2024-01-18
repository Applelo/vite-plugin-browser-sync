import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  server: {
    port: 3000,
  },
  plugins: [
    VitePluginBrowserSync({
      runOn: {
        preview: true,
      },
    }),
  ],
}
