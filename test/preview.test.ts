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
  plugin: Options['preview']
  url: string
}

const configProxy: Record<string, TestConfig> = {
  'default': {
    vite: {},
    plugin: {},
    url: 'http://localhost:3000',
  },
  'custom vitejs port': {
    vite: {
      preview: {
        port: 3000,
      },
    },
    plugin: {},
    url: 'http://localhost:3001',
  },
  'custom browsersync proxy': {
    vite: {},
    plugin: {
      bs: {
        proxy: 'http://localhost:4173',
      },
    },
    url: 'http://localhost:3000',
  },
  'custom browsersync proxy object': {
    vite: {},
    plugin: {
      bs: {
        proxy: { target: 'http://localhost:4173' },
      },
    },
    url: 'http://localhost:3000',
  },
  'custom browsersync proxy and vitejs port': {
    vite: {
      preview: {
        port: 3000,
      },
    },
    plugin: {
      bs: {
        proxy: 'http://localhost:3000',
        port: 4173,
      },

    },
    url: 'http://localhost:4173',
  },
}

describe('proxy option', () => {
  for (const [name, { vite, plugin, url }] of Object.entries(configProxy)) {
    it(name, async () => {
      const previewServer = await preview({
        configFile: false,
        root: resolve(__dirname, './../demo'),
        plugins: [
          VitePluginBrowserSync({
            preview: {
              enable: true,
              ...plugin,
            },
          }),
        ],
        ...vite,
      })

      previewServer.printUrls()
      await page.waitForTimeout(100)

      await page.goto(url)
      const script = page.locator(
        'script[src^="/browser-sync/browser-sync-client.js?v="]',
      )
      const closePromise = new Promise(
        resolve => previewServer.httpServer.on('close', () => {
          resolve(true)
        }),
      )

      expect(script).not.toBeNull()
      previewServer.httpServer.close()
      await closePromise
    })
  }
})
