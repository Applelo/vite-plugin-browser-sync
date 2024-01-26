import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  preview: {
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
