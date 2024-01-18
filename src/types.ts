import type { Options as BrowserSyncOptions } from 'browser-sync'
import type { PreviewServer, ViteDevServer } from 'vite'

export type BsMode = 'snippet' | 'proxy'
export type Env = 'buildWatch' | 'dev' | 'preview'
export type BsOptions = Partial<Record<Env, BrowserSyncOptions>>
export type ViteServer = ViteDevServer | PreviewServer

export interface Options {
  /**
   * proxy (default): Browsersync will wrap your vhost with a proxy URL to view your site.
   * snippet: Inject Browsersync inside your html page
   */
  mode?: BsMode
  /**
   * BrowserSync options
   * @see  https://browsersync.io/docs/options
   */
  bs?: BsOptions
  /**
   * Activate BrowserSync on dev
   * @default {dev: true}
   */
  runOn?: Partial<Record<Env, boolean>>
}
