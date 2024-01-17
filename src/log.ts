import type { BrowserSyncInstance } from 'browser-sync'
import { bold, lightYellow } from 'kolorist'
import type { Logger, PreviewServer, ViteDevServer } from 'vite'
import type { BsMode } from './types'

export function displayLog(obj: { server?: ViteDevServer | PreviewServer, bs: BrowserSyncInstance, mode: BsMode, logger: Logger }) {
  /* c8 ignore start */
  const { server, bs, mode, logger } = obj

  const colorUrl = (url: string) =>
    lightYellow(url.replace(/:(\d+)$/, (_, port) => `:${bold(port)}/`))
  const log = () => {
    const urls: Record<string, string> = bs.getOption('urls').toJS()
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

  if (server) {
    const _print = server.printUrls
    server.printUrls = () => {
      _print()
      log()
    }
  }
  else {
    log()
  }
  /* c8 ignore stop */
}
