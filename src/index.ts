import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import type { BrowserSyncInstance } from 'browser-sync'
import type { BsMode, Env, Options } from './types'
import { initBsServer } from './server'

export default function VitePluginBrowserSync(options?: Options): Plugin {
  const name = 'vite-plugin-browser-sync'
  const bsClientVersion = '3.0.2'
  let bs: BrowserSyncInstance
  let config: ResolvedConfig
  let bsMode: BsMode = 'proxy'
  let env: Env = 'dev'

  return {
    name,
    apply: 'serve',
    configResolved(_config) {
      config = _config
    },
    async configureServer(server) {
      env = 'dev'
      const { bs: browserSync, bsMode: mode } = await initBsServer({
        env,
        name,
        server,
        bsMode,
        options,
        config,
      })
      bs = browserSync
      bsMode = mode
    },
    async configurePreviewServer(server) {
      env = 'preview'
      if (!options?.runOn?.preview)
        return
      const { bs: browserSync, bsMode: mode } = await initBsServer({
        env,
        name,
        server,
        bsMode,
        options,
        config,
      })
      bs = browserSync
      bsMode = mode
    },
    buildStart: async () => {
      if (!options?.runOn?.build)
        return
      if (['preview', 'dev'].includes(env))
        return
      env = 'build'
      const { bs: browserSync, bsMode: mode } = await initBsServer({
        env,
        name,
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
