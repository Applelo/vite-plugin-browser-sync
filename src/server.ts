import { create } from 'browser-sync'
import type { ResolvedConfig } from 'vite'
import type { BsMode, Options, ViteServer } from './types'
import { displayLog } from './log'
import { getOptions } from './options'

export function initBsServer(obj: {
  name: string
  server: ViteServer
  bsMode: BsMode
  options?: Options
  config: ResolvedConfig
}) {
  let viteJSLog = false
  let bsMode = obj.bsMode
  const { name, server, config, options } = obj
  const bs = create(name)

  const listenCallback = async () => {
    const { log, mode, bsOptions } = getOptions({
      config,
      server,
      options,
    })
    bsMode = mode
    viteJSLog = log

    await new Promise((resolve) => {
      bs.init(bsOptions, () => {
        resolve(true)
      })
    })
  }

  if ('listen' in server) {
    const _listen = server.listen
    server.listen = async () => {
      const out = await _listen()
      await listenCallback()
      return out
    }
  }
  else {
    server.httpServer.prependListener('listening', async () => {
      await listenCallback()
    })
  }

  /* c8 ignore start */
  if (viteJSLog) {
    displayLog({
      server,
      bs,
      mode: bsMode,
      logger: config.logger,
    })
  }
  /* c8 ignore stop */

  if ('close' in server) {
    const _close = server.close
    server.close = async () => {
      bs.exit()
      await _close()
    }
  }
  else {
    server.httpServer.prependListener('close', () => {
      bs.exit()
    })
  }

  return {
    bs,
    bsMode,
  }
}
