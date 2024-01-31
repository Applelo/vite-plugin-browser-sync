import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  build: {
    watch: {},
  },
  // preview: {
  //   port: 3000,
  // },
  plugins: [
    VitePluginBrowserSync({
      preview: {
        enable: true,
        // bs: {
        //   proxy: 'http://localhost:3000',
        // },
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
