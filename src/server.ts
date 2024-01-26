import process from 'node:process'
import type { BrowserSyncInstance, Options as BrowserSyncOptions } from 'browser-sync'
import { create } from 'browser-sync'
import type { ResolvedConfig } from 'vite'
import { bold, lightYellow } from 'kolorist'
import type { BsMode, Env, Options, OptionsBuildWatch, OptionsDev, OptionsPreview, ViteServer } from './types'

const defaultPorts: Record<Env, number | null> = {
  dev: 5173,
  preview: 4173,
  buildWatch: null,
}

export class Server {
  private name: string
  private server?: ViteServer
  private options?: Options
  private config: ResolvedConfig
  private env: Env
  private bsServer: BrowserSyncInstance

  constructor(obj: {
    name: string
    server?: ViteServer
    options?: Options
    config: ResolvedConfig
    env: Env
  }) {
    const { name, server, config, options, env } = obj
    this.name = name
    this.server = server
    this.config = config
    this.options = options
    this.env = env

    this.bsServer = create(this.name)

    this.registerInit()
    this.registerClose()
  }

  public get mode() {
    if (this.env === 'preview')
      return 'proxy'
    let mode: BsMode = this.userOptions
      && 'mode' in this.userOptions
      && this.userOptions.mode
      ? this.userOptions.mode
      : 'proxy'

    if (this.userBsOptions.proxy)
      mode = 'proxy'

    return mode
  }

  public get bs() {
    return this.bsServer
  }

  private get logged() {
    return typeof this.userBsOptions.logLevel === 'undefined'
  }

  private get port() {
    if (this.env === 'buildWatch' || !this.server)
      return null
    const defaultPort = defaultPorts[this.env]
    const configPort = this.env === 'dev'
      ? this.config.server.port
      : this.config.preview.port
    return configPort || defaultPort
  }

  private get userOptions(): OptionsPreview | OptionsBuildWatch | OptionsDev | undefined {
    return this.options && this.env in this.options
      ? this.options[this.env]
      : {}
  }

  private get userBsOptions(): BrowserSyncOptions {
    return this.userOptions && this.userOptions.bs ? this.userOptions.bs : {}
  }

  private get bsOptions() {
    const bsOptions = this.userBsOptions

    if (typeof bsOptions.logLevel === 'undefined')
      bsOptions.logLevel = 'silent'

    if (typeof bsOptions.open === 'undefined')
      bsOptions.open = typeof this.config.server.open !== 'undefined'

    // Handle by vite so we disable it
    if (typeof bsOptions.codeSync === 'undefined')
      bsOptions.codeSync = false

    if (this.mode === 'snippet') {
      // disable log snippet because it is handle by the plugin
      bsOptions.logSnippet = false
      bsOptions.snippet = false
    }

    bsOptions.online
      = bsOptions.online === true
      || typeof this.config.server.host !== 'undefined'
      || false

    if (this.mode === 'proxy') {
      const target
          = this.server?.resolvedUrls?.local[0]
          || `${this.config.server.https ? 'https' : 'http'}://localhost:${
            this.port
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

    return bsOptions
  }

  private init() {
    return new Promise<boolean>((resolve) => {
      this.bsServer.init(this.bsOptions, () => {
        resolve(true)
      })
    })
  }

  /* c8 ignore start */
  private log() {
    const colorUrl = (url: string) =>
      lightYellow(url.replace(/:(\d+)$/, (_, port) => `:${bold(port)}/`))

    const urls: Record<string, string> = this.bsServer.getOption('urls').toJS()
    const consoleTexts: Record<string, string>
            = this.mode === 'snippet'
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
          this.config.logger.info(
                  `  ${lightYellow('➜')}  ${bold(
                    `BrowserSync - ${text}`,
                  )}: ${colorUrl(urls[key])}`,
          )
        }
      }
    }
  }

  private registerLog() {
    if (!this.logged)
      return

    if (this.server && this.env === 'dev') {
      const _print = this.server.printUrls
      this.server.printUrls = () => {
        _print()
        this.log()
      }
    }
    else {
      this.log()
    }
  }
  /* c8 ignore stop */

  private async registerInit() {
    if (this.server && 'listen' in this.server) {
      const _listen = this.server.listen
      this.server.listen = async () => {
        const out = await _listen()
        await this.init()
        return out
      }
    }
    else if (this.server) {
      await new Promise((resolve) => {
        this.server?.httpServer?.once('listening', () => {
          resolve(true)
        })
      })
      await this.init()
    }
    else {
      await this.init()
    }
    this.registerLog()
  }

  private registerClose() {
    if (this.server && 'close' in this.server) {
      const _close = this.server.close
      this.server.close = async () => {
        this.bsServer.exit()
        await _close()
      }
    }
    else if (this.server) {
      this.server?.httpServer?.on('close', () => {
        this.bsServer.exit()
      })
    }

    process.once('SIGINT', () => {
      this.bsServer.exit()
    })
  }
}
