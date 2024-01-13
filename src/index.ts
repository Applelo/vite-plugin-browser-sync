import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import type { BrowserSyncInstance } from 'browser-sync'
import type { BsMode, Options } from './types'
import { initBsServer } from './server'

export default function VitePluginBrowserSync(options?: Options): Plugin {
  const name = 'vite-plugin-browser-sync'
  const bsClientVersion = '3.0.2'
  let bs: BrowserSyncInstance
  let config: ResolvedConfig
  let bsMode: BsMode = 'proxy'

  return {
    name,
    apply: 'serve',
    configResolved(_config) {
      config = _config
    },
    configureServer(server) {
      const { bs: browserSync, bsMode: mode } = initBsServer({
        name,
        server,
        bsMode,
        options,
        config,
      })
      bs = browserSync
      bsMode = mode
    },
    configurePreviewServer(server) {
      if (!options?.preview)
        return
      const { bs: browserSync, bsMode: mode } = initBsServer({
        name,
        server,
        bsMode,
        options,
        config,
      })
      bs = browserSync
      bsMode = mode
    },
    transformIndexHtml: {
      order: 'post',
      handler: (html, ctx) => {
        const server = ctx.server
        if (bsMode !== 'snippet' || !bs.active || !server)
          return html
        const urls: Record<string, string> = bs.getOption('urls').toJS()

        const bsScript: HtmlTagDescriptor = {
          tag: 'script',
          attrs: {
            async: '',
            src: `${urls.local}/browser-sync/browser-sync-client.js?v=${bsClientVersion}`,
          },
          injectTo: 'body',
        }

        return [bsScript]
      },
    },
  }
}
