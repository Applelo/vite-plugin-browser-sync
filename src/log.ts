import type { BrowserSyncInstance } from 'browser-sync'
import { bold, lightYellow } from 'kolorist'
import type { Logger, PreviewServer, ViteDevServer } from 'vite'
import type { BsMode } from './types'

export function displayLog(obj: { server: ViteDevServer | PreviewServer, bs: BrowserSyncInstance, mode: BsMode, logger: Logger }) {
  /* c8 ignore start */
  const { server, bs, mode, logger } = obj
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
          logger.info(
                  `  ${lightYellow('➜')}  ${bold(
                    `BrowserSync - ${text}`,
                  )}: ${colorUrl(urls[key])}`,
          )
        }
      }
    }
  }
  /* c8 ignore stop */
}
