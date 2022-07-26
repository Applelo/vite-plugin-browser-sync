import type { Plugin, HtmlTagDescriptor, ResolvedConfig } from 'vite'
import browserSync from 'browser-sync'

type OptionsType = 'snippet' | 'proxy'

export interface Options {
  mode?: OptionsType
  bs?: browserSync.Options
}

export default function VitePluginBrowserSync(options?: Options): Plugin {
  const name = 'vite-plugin-browser-sync'
  let bs: browserSync.BrowserSyncInstance
  const bsClientVersion = '2.27.10'
  let config: ResolvedConfig
  let mode: OptionsType = options?.mode || 'proxy'
  const bsOptions: browserSync.Options = options?.bs || {}

  return {
    name,
    apply: 'serve',
    config(config) {
      if (bsOptions.proxy) {
        mode = 'proxy'
      }

      // if no hrm client port specify and proxy mode enabled => redirect hmr client port to server port
      if (
        mode === 'proxy' &&
        !(
          typeof config.server?.hmr === 'object' && config.server.hmr.clientPort
        )
      ) {
        if (!config.server) {
          config.server = {}
          config.server.strictPort = true
        }
        if (typeof config.server.hmr !== 'object') {
          config.server.hmr = {}
          config.server.hmr.clientPort = config.server.port || 5173
        }
      }

      return config
    },
    configResolved(_config) {
      config = _config
    },
    async configureServer(server) {
      bs = browserSync.create(name)

      // prepare browser sync options
      if (typeof bsOptions.logPrefix === 'undefined') {
        bsOptions.logPrefix = name
      }

      if (typeof bsOptions.open === 'undefined') {
        bsOptions.open = typeof config.server.open !== 'undefined'
      }

      // Handle by vite so we disable it
      if (typeof bsOptions.codeSync === 'undefined') {
        bsOptions.codeSync = false
      }

      if (mode === 'snippet') {
        // disable log snippet because it is handle by the plugin
        bsOptions.logSnippet = false
        // @ts-ignore Exist in the documentation but not in the type definition
        bsOptions.snippet = false
      }

      if (mode === 'proxy' && !bsOptions.proxy) {
        bsOptions.proxy =
          server.resolvedUrls?.local[0] ||
          `${config.server.https ? 'https' : 'http'}://localhost:${
            config.server.port || 5173
          }/`
      }

      if (process.env.VITEST) {
        await new Promise(resolve => {
          bs.init(bsOptions, () => {
            resolve(true)
          })
        })
      } else {
        bs.init(bsOptions)
      }
    },
    transformIndexHtml: {
      enforce: 'post',
      transform: (html, ctx) => {
        const server = ctx.server
        if (mode !== 'snippet' || !bs.active || !server) return html

        const https =
          typeof bsOptions.https !== 'undefined' && bsOptions.https !== false

        const bsScript: HtmlTagDescriptor = {
          tag: 'script',
          attrs: {
            async: '',
            src: `${https ? 'https' : 'http'}://${
              bsOptions.host ? bsOptions.host : 'localhost'
            }:${
              bsOptions.port ? bsOptions.port : 3000
            }/browser-sync/browser-sync-client.js?v=${bsClientVersion}`
          },
          injectTo: 'body'
        }

        return [bsScript]
      }
    }
  }
}
