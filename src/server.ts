import process from 'node:process'
import { create } from 'browser-sync'
import type { ResolvedConfig } from 'vite'
import type { BsMode, Env, Options, ViteServer } from './types'
import { displayLog } from './log'
import { getOptions } from './options'

export async function initBsServer(obj: {
  name: string
  server?: ViteServer
  bsMode: BsMode
  options?: Options
  config: ResolvedConfig
  env: Env
}) {
  let viteJSLog = false
  let bsMode = obj.bsMode
  const { name, server, config, options, env } = obj
  const bs = create(name)
  const { log, mode, bsOptions } = getOptions({
    config,
    server,
    options,
    env,
  })
  bsMode = mode
  viteJSLog = log

  await new Promise((resolve) => {
    bs.init(bsOptions, () => {
      resolve(true)
    })
  })

  if (viteJSLog) {
    displayLog({
      server,
      bs,
      mode: bsMode,
      logger: config.logger,
    })
  }

  if (server && 'close' in server) {
    const _close = server.close
    server.close = async () => {
      bs.exit()
      await _close()
    }
  }
  else {
    process.on('SIGINT', () => {
      bs.exit()
      process.exit(0)
    })
  }

  return {
    bs,
    bsMode,
  }
}
