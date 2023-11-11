import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import browserSync from 'browser-sync'
import { bold, lightYellow } from 'kolorist'

type OptionsType = 'snippet' | 'proxy'

export interface Options {
  mode?: OptionsType
  bs?: browserSync.Options
}

// "snippet" exists in the doc but not in the type def
interface OptionsBS extends browserSync.Options {
  snippet: boolean
}

export default function VitePluginBrowserSync(options?: Options): Plugin {
  const name = 'vite-plugin-browser-sync'
  const bsClientVersion = '2.29.3'
  let bs: browserSync.BrowserSyncInstance
  let config: ResolvedConfig
  let mode: OptionsType = options?.mode || 'proxy'
  const bsOptions = (options?.bs as OptionsBS) || {}

  return {
    name,
    apply: 'serve',
    configResolved(_config) {
      config = _config
    },
    configureServer(server) {
      let viteJSLog = false
      bs = browserSync.create(name)

      if (typeof bsOptions.logLevel === 'undefined') {
        bsOptions.logLevel = 'silent'
        viteJSLog = true
      }

      if (typeof bsOptions.open === 'undefined')
        bsOptions.open = typeof config.server.open !== 'undefined'

      // Handle by vite so we disable it
      if (typeof bsOptions.codeSync === 'undefined')
        bsOptions.codeSync = false

      if (mode === 'snippet') {
        // disable log snippet because it is handle by the plugin
        bsOptions.logSnippet = false
        bsOptions.snippet = false
      }

      if (bsOptions.proxy)
        mode = 'proxy'

      bsOptions.online
        = bsOptions.online === true
        || typeof config.server.host !== 'undefined'
        || false

      const _listen = server.listen
      server.listen = async () => {
        const out = await _listen()

        if (mode === 'proxy') {
          const target
            = server.resolvedUrls?.local[0]
            || `${config.server.https ? 'https' : 'http'}://localhost:${
              config.server.port || 5173
            }/`

          if (!bsOptions.proxy) {
            bsOptions.proxy = {
              target,
              ws: true,
            }
          }
          else if (typeof bsOptions.proxy === 'string') {
            bsOptions.proxy = {
              target: bsOptions.proxy,
              ws: true,
            }
          }
          else if (
            typeof bsOptions.proxy === 'object'
            && !bsOptions.proxy.ws
          ) {
            bsOptions.proxy.ws = true
          }
        }

        await new Promise((resolve) => {
          bs.init(bsOptions, () => {
            resolve(true)
          })
        })
        return out
      }

      /* c8 ignore start */
      if (viteJSLog) {
        const _print = server.printUrls

        const colorUrl = (url: string) =>
          lightYellow(url.replace(/:(\d+)$/, (_, port) => `:${bold(port)}/`))
        server.printUrls = () => {
          const urls: Record<string, string> = bs.getOption('urls').toJS()
          _print()

          const consoleTexts: Record<string, string>
            = mode === 'snippet'
              ? { ui: 'UI' }
              : {
                  'local': 'Local',
                  'external': 'External',
                  'ui': 'UI',
                  'ui-external': 'UI External',
                }
          for (const key in consoleTexts) {
            if (Object.prototype.hasOwnProperty.call(consoleTexts, key)) {
              const text = consoleTexts[key]
              if (Object.prototype.hasOwnProperty.call(urls, key)) {
                config.logger.info(
                  `  ${lightYellow('➜')}  ${bold(
                    `BrowserSync - ${text}`,
                  )}: ${colorUrl(urls[key])}`,
                )
              }
            }
          }
        }
      }
      /* c8 ignore stop */

      const _close = server.close
      server.close = async () => {
        bs.exit()
        await _close()
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler: (html, ctx) => {
        const server = ctx.server
        if (mode !== 'snippet' || !bs.active || !server)
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
