import { resolve } from 'node:path'
import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import type { UserConfig } from 'vite'
import { preview } from 'vite'
import VitePluginBrowserSync from '../src'
import type { Options } from '../src/types'

let browser: Browser
let page: Page

beforeAll(async () => {
  browser = await chromium.launch()
})
beforeEach(async () => {
  page = await browser.newPage()
})
afterEach(async () => {
  await page.close()
})
afterAll(async () => {
  await browser.close()
})

interface TestConfig {
  vite: UserConfig
  plugin: Options
  url: string
}

const configProxy: Record<string, TestConfig> = {
  'default': {
    vite: {},
    plugin: {
      preview: {
        enable: true,
      },
    },
    url: 'http://localhost:3000',
  },
  'custom vitejs port': {
    vite: {
      preview: {
        port: 3000,
      },
    },
    plugin: {
      preview: {
        enable: true,
      },
    },
    url: 'http://localhost:3001',
  },
  'custom browsersync proxy': {
    vite: {},
    plugin: {
      preview: {
        enable: true,
        bs: {
          proxy: 'http://localhost:5173',
        },
      },
    },
    url: 'http://localhost:3000',
  },
  'custom browsersync proxy object': {
    vite: {},
    plugin: {
      preview: {
        enable: true,
        bs: {
          proxy: { target: 'http://localhost:4173' },
        },
      },
    },
    url: 'http://localhost:3000',
  },
  'custom browsersync proxy and vitejs port': {
    vite: {
      server: {
        port: 3000,
      },
    },
    plugin: {
      preview: {
        enable: true,
        bs: {
          proxy: 'http://localhost:3000',
          port: 4173,
        },
      },
    },
    url: 'http://localhost:4173',
  },
}

describe.todo('proxy option', () => {
  for (const [name, { vite, plugin, url }] of Object.entries(configProxy)) {
    it(name, async () => {
      const previewServer = await preview({
        configFile: false,
        root: resolve(__dirname, './../demo'),
        plugins: [VitePluginBrowserSync(plugin)],
        ...vite,
      })
      previewServer.printUrls()

      // need to use playwright to test the proxy
      await page.goto(url)
      const script = page.locator(
        'script[src^="/browser-sync/browser-sync-client.js?v="]',
      )

      expect(script).not.toBeNull()
      previewServer.httpServer.close()
    })
  }
})
