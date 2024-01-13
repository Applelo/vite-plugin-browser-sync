import type { Options as BsOptions } from 'browser-sync'
import type { ResolvedConfig } from 'vite'
import type { Options, ViteServer } from './types'

export function getOptions(obj: { config: ResolvedConfig, server: ViteServer, options?: Options }) {
  const { config, options, server } = obj
  let log = false
  let mode: Options['mode'] = options?.mode || 'proxy'
  const bsOptions: BsOptions = options?.bs || {}

  if (typeof bsOptions.logLevel === 'undefined') {
    bsOptions.logLevel = 'silent'
    log = true
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

  return {
    log,
    mode,
    bsOptions,
  }
}
