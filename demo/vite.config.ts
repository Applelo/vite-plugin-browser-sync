import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  server: {
    port: 3000,
  },
  plugins: [
    VitePluginBrowserSync({
      preview: {
        enable: true,
      },
      // buildWatch: {
      //   enable: true,
      //   mode: 'snippet',
      // },
      // buildWatch: {
      //   enable: false,
      // },
    }),
  ],
}
