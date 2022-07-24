import type { Plugin, HtmlTagDescriptor, ResolvedConfig } from 'vite'
import browserSync from 'browser-sync'

type OptionsType = 'snippet' | 'proxy'

interface Options {
  mode?: OptionsType
  bs?: browserSync.Options
}

const getBsClientUrl = (options: browserSync.Options) => {
  const https = typeof options.https !== 'undefined' && options.https !== false

  return `${https ? 'https' : 'http'}://${
    options.host ? options.host : 'localhost'
  }:${options.port ? options.port : 3000}`
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

      // TODO: Fix websocket of vitejs
      // if no hrm client port specify and proxy mode enabled => redirect port to server port
      if (
        mode === 'proxy' &&
        !(
          typeof config.server?.hmr === 'object' && config.server.hmr.clientPort
        )
      ) {
        if (!config.server) {
          config.server = {}
          // config.server.strictPort = true
        }
        if (typeof config.server.hmr !== 'object') {
          config.server.hmr = {}
          config.server.hmr.port = 11111
        }
      }

      return config
    },
    configResolved(_config) {
      config = _config
    },
    configureServer(server) {
      bs = browserSync.create(name)

      // prepare browser sync options
      if (typeof bsOptions.logPrefix === 'undefined') {
        bsOptions.logPrefix = name
      }

      if (typeof bsOptions.open === 'undefined') {
        bsOptions.open = typeof config.server.open !== 'undefined'
      }

      if (mode === 'snippet') {
        // disable log snippet because it is handle by the plugin
        bsOptions.logSnippet = false
        // @ts-ignore Exist in the documentation but not in the type definition
        bsOptions.snippet = false
      }

      if (mode === 'proxy' && !bsOptions.proxy) {
        console.log(server.resolvedUrls)
        bsOptions.proxy =
          server.resolvedUrls?.local[0] ||
          `${config.server.https ? 'https' : 'http'}://localhost:${
            config.server.port || '5173'
          }/`
      }

      bs.init(bsOptions)
    },
    transformIndexHtml: {
      enforce: 'post',
      transform: (html, ctx) => {
        const server = ctx.server
        if (mode !== 'snippet' || !bs.active || !server) return html

        const bsScript: HtmlTagDescriptor = {
          tag: 'script',
          attrs: {
            async: '',
            src: `${getBsClientUrl(
              bsOptions
            )}/browser-sync/browser-sync-client.js?v=${bsClientVersion}`
          },
          injectTo: 'body'
        }

        return [bsScript]
      }
    }
  }
}
