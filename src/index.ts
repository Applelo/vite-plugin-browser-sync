import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import type { Env, Options } from './types'
import { Server } from './server'

export default function VitePluginBrowserSync(options?: Options): Plugin {
  const name = 'vite-plugin-browser-sync'
  const bsClientVersion = '3.0.2'
  let config: ResolvedConfig
  let env: Env = 'dev'
  let bsServer: Server | null = null
  let started = false

  return {
    name,
    apply(_config, env) {
      const applyOnDev = env.command === 'serve' && env.isPreview === false
        && options?.runOn?.dev !== false
      const applyOnPreview = env.command === 'serve'
        && env.isPreview === true
        && options?.runOn?.preview === true
      const applyOnBuild = env.command === 'build'
        && _config.build?.watch !== null
        && options?.runOn?.buildWatch === true

      return applyOnDev || applyOnPreview || applyOnBuild
    },
    configResolved(_config) {
      config = _config
    },
    buildStart() {
      if (started)
        return
      env = 'buildWatch'
      bsServer = new Server({
        env,
        name,
        options,
        config,
      })
      started = true
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
      bsServer = new Server({
        env,
        name,
        server,
        options,
        config,
      })
    },
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
