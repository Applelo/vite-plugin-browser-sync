import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  // build: {
  //   watch: {},
  // },
  plugins: [
    VitePluginBrowserSync({
      // preview: {
      //   enable: true,
      //   bs: {
      //     proxy: 'http://localhost:3000',
      //   },
      // },
      buildWatch: {
        enable: true,
        mode: 'snippet',
        bs: {
          server: 'dist',
        },
      },
    }),
  ],
}
