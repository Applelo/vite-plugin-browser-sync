import type { BrowserSyncInstance, Options as BrowserSyncOptions } from 'browser-sync'
import type { ResolvedConfig } from 'vite'
import type { BsMode, Env, Options, OptionsBuildWatch, OptionsDev, OptionsPreview, ViteServer } from './types'
import process from 'node:process'
import { create } from 'browser-sync'
import { bold, lightYellow, red } from 'kolorist'

const defaultPorts: Record<Env, number | null> = {
  dev: 5173,
  preview: 4173,
  buildWatch: null,
}

/**
 * Hook browsersync server on vite
 */
export class Server {
  private name: string
  private server?: ViteServer
  private options?: Options
  private config: ResolvedConfig
  private env: Env
  private bsServer: BrowserSyncInstance
  private logged: boolean = false

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

    if (typeof this.userBsOptions.logLevel === 'undefined')
      this.logged = true

    this.registerInit()
    this.registerClose()
  }

  /**
   * Get browser sync mode
   * @readonly
   */
  public get mode(): BsMode {
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

  /**
   * Get browser sync instance
   * @readonly
   */
  public get bs(): BrowserSyncInstance {
    return this.bsServer
  }

  /**
   * Get vite server port
   * @readonly
   */
  private get port(): number | null {
    if (this.env === 'buildWatch' || !this.server)
      return null
    const defaultPort = defaultPorts[this.env]
    const configPort = this.env === 'dev'
      ? this.config.server.port
      : this.config.preview.port
    return configPort || defaultPort
  }

  /**
   * Get user options
   *  @readonly
   */
  private get userOptions(): OptionsPreview | OptionsBuildWatch | OptionsDev | undefined {
    return this.options && this.env in this.options
      ? this.options[this.env]
      : {}
  }

  /**
   * Get user browsersync options
   *  @readonly
   */
  private get userBsOptions(): BrowserSyncOptions {
    return this.userOptions && this.userOptions.bs ? this.userOptions.bs : {}
  }

  /**
   * Get Final browsersync options
   */
  private get bsOptions(): BrowserSyncOptions {
    const bsOptions = this.userBsOptions

    if (typeof bsOptions.logLevel === 'undefined')
      bsOptions.logLevel = 'silent'

    if (this.server && typeof bsOptions.open === 'undefined')
      bsOptions.open = typeof this.config.server.open !== 'undefined'

    // Handle by vite so we disable it
    if (this.env === 'dev' && typeof bsOptions.codeSync === 'undefined')
      bsOptions.codeSync = false

    if (this.mode === 'snippet') {
      // disable log snippet because it is handle by the plugin
      bsOptions.logSnippet = false
      bsOptions.snippet = false
    }

    bsOptions.online
      = bsOptions.online === true
      || (this.server && typeof this.config.server.host !== 'undefined')
      || false

    if (this.env === 'buildWatch')
      return bsOptions

    if (this.mode === 'proxy') {
      let target

      if (this.server?.resolvedUrls?.local[0]) {
        target = this.server?.resolvedUrls?.local[0]
      }
      else if (this.port) {
        const protocol = this.config.server.https ? 'https' : 'http'
        target = `${protocol}://localhost:${this.port}/`
      }

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

  /**
   * Init browsersync server
   */
  private init(): Promise<BrowserSyncInstance> {
    return new Promise<BrowserSyncInstance>((resolve, reject) => {
      this.bsServer.init(this.bsOptions, (error, bs) => {
        if (error) {
          this.config.logger.error(
            red(`[vite-plugin-browser-sync] ${error.name} ${error.message}`),
            { error },
          )
          reject(error)
        }
        resolve(bs)
      })
    })
  }

  /* c8 ignore start */
  /**
   * Log browsersync infos
   */
  private log() {
    const colorUrl = (url: string) =>
      lightYellow(url.replace(/:(\d+)$/, (_, port) => `:${bold(port)}/`))

    const urls: Record<string, string> = this.bsServer.getOption('urls').toJS()
    const consoleTexts: Record<string, string> = {
      'local': 'Local',
      'external': 'External',
      'ui': 'UI',
      'ui-external': 'UI External',
      'tunnel': 'Tunnel',
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

  /**
   * Register log function on vite
   */
  private registerLog() {
    if (!this.logged)
      return

    if (this.server && this.env === 'dev') {
      // Fix for Astro
      if ('pluginContainer' in this.server
        && this.server.environments.client.plugins.findIndex(
          plugin => plugin.name === 'astro:server',
        )
      ) {
        setTimeout(() => this.log(), 1000)
      }
      else {
        const _print = this.server.printUrls
        this.server.printUrls = () => {
          _print()
          this.log()
        }
      }
    }
    else {
      this.log()
    }
  }
  /* c8 ignore stop */

  /**
   * Register init
   */
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

  /**
   * Register close
   */
  private registerClose() {
    if (this.server) {
      const _close = this.server.close
      this.server.close = async () => {
        this.bsServer.exit()
        await _close()
      }

      this.server.httpServer?.on('close', () => {
        this.bsServer.exit()
      })
    }

    process.once('SIGINT', () => {
      this.bsServer.exit()
      process.exit()
    })
  }
}
