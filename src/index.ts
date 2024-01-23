import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import { italic, red } from 'kolorist'
import type { Env, Options } from './types'
import { Server } from './server'

export default function VitePluginBrowserSync(options?: Options): Plugin {
  const name = 'vite-plugin-browser-sync'
  // eslint-disable-next-line node/prefer-global/process
  const bsClientVersion = process.env.BS_VERSION
  let config: ResolvedConfig
  let env: Env = 'dev'
  let bsServer: Server | null = null
  let started = false
  let applyOnDev = false
  let applyOnPreview = false
  let applyOnBuildWatch = false

  return {
    name,
    apply(_config, env) {
      if (options?.bs) {
        console.error(
          red(
            `[vite-plugin-browser-sync] Since 3.0, you should wrap your ${italic('bs')} option inside a ${italic('dev')} object.`,
          ),
        )
        return false
      }

      applyOnDev = env.command === 'serve' && env.isPreview === false
      && options?.dev?.enable !== false
      applyOnPreview = env.command === 'serve'
      && env.isPreview === true
      && options?.preview?.enable === true
      applyOnBuildWatch = env.command === 'build'
      && _config.build?.watch !== null
      && options?.buildWatch?.enable === true

      if (
        applyOnBuildWatch
        && options?.buildWatch?.mode !== 'snippet'
        && (
          typeof options?.buildWatch?.bs?.proxy !== 'string'
          || typeof options.buildWatch?.bs.proxy !== 'object'
          || (
            typeof options.buildWatch?.bs.proxy === 'object'
            && 'target' in options.buildWatch?.bs.proxy
          )
        )
      ) {
        console.error(
          red(
            '[vite-plugin-browser-sync] You need to set a browsersync target.',
          ),
        )
        return false
      }

      return applyOnDev || applyOnPreview || applyOnBuildWatch
    },
    configResolved(_config) {
      config = _config
    },
    buildStart() {
      if (started || !applyOnBuildWatch)
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
      handler: (html) => {
        if (!bsServer || bsServer.mode !== 'snippet' || !bsServer.bs.active)
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
