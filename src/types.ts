import type { Options as BrowserSyncOptions } from 'browser-sync'
import type { PreviewServer, ViteDevServer } from 'vite'

export type BsMode = 'snippet' | 'proxy'
export type BsOptions = BrowserSyncOptions
export type ViteServer = ViteDevServer | PreviewServer

interface PartOptions {
  /**
   * Activate BrowserSync
   * @default false
   */
  enable?: boolean
  /**
   * BrowserSync options
   * @see  https://browsersync.io/docs/options
   */
  bs?: BsOptions
}

interface PartOptionsMode {
  /**
   * proxy (default): Browsersync will wrap your vhost with a proxy URL to view your site.
   * snippet: Inject Browsersync inside your html page
   */
  mode?: BsMode
}

export interface OptionsBuildWatch extends PartOptions, PartOptionsMode {
  /**
   * Activate BrowserSync
   * @default true
   */
  enable?: boolean
}

export interface OptionsDev extends PartOptions, PartOptionsMode {
  /**
   * Activate BrowserSync
   * @default true
   */
  enable?: boolean
}

export interface OptionsPreview extends PartOptions {}

export interface Options {
  dev?: OptionsDev
  buildWatch?: OptionsBuildWatch
  preview?: OptionsPreview
  /**
   * @deprecated since version 3.0
   */
  bs?: BsOptions
}

export type Env = 'dev' | 'buildWatch' | 'preview'
