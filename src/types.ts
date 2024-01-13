import type browserSync from 'browser-sync'
import type { PreviewServer, ViteDevServer } from 'vite'

export type BsMode = 'snippet' | 'proxy'

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
  bs?: browserSync.Options
  /**
   * Activate BrowserSync on dev
   * @default true
   */
  dev?: boolean
  /**
   * Activate BrowserSync on build watch
   * @default false
   */
  build?: boolean
  /**
   * Activate BrowserSync on preview
   * @default false
   */
  preview?: boolean
}
