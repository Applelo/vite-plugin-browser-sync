import { resolve } from 'path'
import { Browser, chromium, Page } from 'playwright'
import {
  it,
  expect,
  describe,
  afterAll,
  beforeAll,
  afterEach,
  beforeEach
} from 'vitest'
import { createServer, UserConfig } from 'vite'
import VitePluginBrowserSync, { Options } from '../src'

let browser: Browser
let page: Page

beforeAll(async () => {
  browser = await chromium.launch()
})
afterAll(async () => {
  await browser.close()
})
beforeEach(async () => {
  page = await browser.newPage()
})
afterEach(async () => {
  await page.close()
})

interface TestConfig {
  vite: UserConfig
  plugin: Options
  url: string
}

const config: Record<string, TestConfig> = {
  default: {
    vite: {},
    plugin: {},
    url: 'http://localhost:3000'
  },
  'custom vitejs port': {
    vite: {
      server: {
        port: 3000
      }
    },
    plugin: {},
    url: 'http://localhost:3002'
  },
  'custom browsersync proxy': {
    vite: {},
    plugin: { bs: { proxy: 'http://localhost:5173' } },
    url: 'http://localhost:3000'
  },
  'custom browsersync proxy and vitejs port': {
    vite: {
      server: {
        port: 3000
      }
    },
    plugin: { bs: { proxy: 'http://localhost:3000', port: 5174 } },
    url: 'http://localhost:5174'
  }
}

describe('proxy option', () => {
  for (const [name, { vite, plugin, url }] of Object.entries(config)) {
    it(name, async () => {
      const server = await createServer({
        // any valid user config options, plus `mode` and `configFile`
        configFile: false,
        root: resolve(__dirname, './../demo'),
        plugins: [VitePluginBrowserSync(plugin)],
        ...vite
      })
      await server.listen()

      // need to use playwright to test the proxy
      await page.goto(url)
      const title = await page.title()
      const content = await page.content()

      server.close()
      expect(title).toBe('Vite Plugin Browser Sync')
      expect(content).matchSnapshot()
    })
  }
})
