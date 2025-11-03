/**
 * This entry file is for the plugin.
 * @module
 */

import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import type { Env, Options } from './types'
import { red } from 'kolorist'
import { Server } from './server'

/**
 * Vite plugin
 *
 * @example <caption>Basic Usage</caption>
 * ```ts
 * // vite.config.js / vite.config.ts
 * import VitePluginBrowserSync from 'vite-plugin-browser-sync'
 *
 * export default {
 *   plugins: [VitePluginBrowserSync()]
 * }
 * ```
 * @example <caption>With options</caption>
 * ```ts
 * // vite.config.js / vite.config.ts
 * import VitePluginBrowserSync from 'vite-plugin-browser-sync'
 *
 * export default {
 *  plugins: [
 *     VitePluginBrowserSync({
 *       dev: {
 *         bs: {
 *           ui: {
 *             port: 8080
 *           },
 *           notify: false
 *         }
 *       }
 *     })
 *   ]
 * }
 * ```
 */
export default function VitePluginBrowserSync(options?: Options): Plugin {
  const name = 'vite-plugin-browser-sync'
  const bsClientVersion = import.meta.env.BS_VERSION
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
      applyOnDev = env.command === 'serve'
        && (typeof env.isPreview === 'undefined' || env.isPreview === false)
        && options?.dev?.enable !== false

      applyOnPreview = env.command === 'serve'
        && env.isPreview === true
        && options?.preview?.enable === true

      applyOnBuildWatch = env.command === 'build'
      // @ts-expect-error true exist on config object with CLI
        && (_config.build?.watch === true || typeof _config.build?.watch === 'object')
        && options?.buildWatch?.enable === true

      if (
        applyOnBuildWatch
        && options?.buildWatch?.mode !== 'snippet'
        && typeof options?.buildWatch?.bs?.proxy !== 'string'
        && typeof options?.buildWatch?.bs?.proxy?.target !== 'string'
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
        const applySnippet = applyOnDev || applyOnBuildWatch
        if (!bsServer || bsServer.mode !== 'snippet' || !applySnippet)
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
