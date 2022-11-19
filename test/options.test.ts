import { resolve } from 'node:path'
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

const configProxy: Record<string, TestConfig> = {
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
    url: 'http://localhost:3001'
  },
  'custom browsersync proxy': {
    vite: {},
    plugin: { bs: { proxy: 'http://localhost:5173' } },
    url: 'http://localhost:3000'
  },
  'custom browsersync proxy object': {
    vite: {},
    plugin: { bs: { proxy: { target: 'http://localhost:5173' } } },
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
  for (const [name, { vite, plugin, url }] of Object.entries(configProxy)) {
    it(name, async () => {
      const server = await createServer({
        // any valid user config options, plus `mode` and `configFile`
        configFile: false,
        root: resolve(__dirname, './../demo'),
        plugins: [VitePluginBrowserSync(plugin)],
        ...vite
      })
      await server.listen()
      // server.printUrls()

      // need to use playwright to test the proxy
      await page.goto(url)
      const script = await page.$(
        'script[src="/browser-sync/browser-sync-client.js?v=2.27.10"]'
      )

      server.close()
      expect(script).not.toBeNull()
    })
  }
})

it('snippet option', async () => {
  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    configFile: false,
    root: resolve(__dirname, './../demo'),
    plugins: [VitePluginBrowserSync({ mode: 'snippet' })]
  })
  await server.listen()

  await page.goto('http://127.0.0.1:5173/')
  const script = await page.$(
    'script[src="http://localhost:3000/browser-sync/browser-sync-client.js?v=2.27.10"]'
  )

  server.close()
  expect(script).not.toBeNull()
})
