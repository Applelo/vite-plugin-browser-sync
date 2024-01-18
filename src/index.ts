import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import type { Env, Options } from './types'
import { Server } from './server'

export default function VitePluginBrowserSync(options?: Options): Plugin {
  const name = 'vite-plugin-browser-sync'
  const bsClientVersion = '3.0.2'
  let config: ResolvedConfig
  let env: Env = 'dev'
  let bsServer: Server | null = null

  return {
    name,
    apply: 'serve',
    configResolved(_config) {
      config = _config
    },
    async configureServer(server) {
      env = 'dev'
      bsServer = new Server({
        env,
        name,
        server,
        options,
        config,
      })
    },
    async configurePreviewServer(server) {
      env = 'preview'
      if (!options?.runOn?.preview)
        return
      bsServer = new Server({
        env,
        name,
        server,
        options,
        config,
      })
    },
    // buildStart: async () => {
    //   if (!options?.runOn?.build)
    //     return
    //   if (['preview', 'dev'].includes(env))
    //     return
    //   env = 'build'
    //   await initBsServer({
    //     env,
    //     name,
    //     options,
    //     config,
    //   })
    // },
    transformIndexHtml: {
      order: 'post',
      handler: (html, ctx) => {
        const server = ctx.server
        if (!bsServer || bsServer.mode !== 'snippet' || !bsServer.bs.active || !server)
          return html
        const urls: Record<string, string> = bsServer.bs.getOption('urls').toJS()

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
