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
import type { Options } from '../src/types'
import { devServer } from './_helper'

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
  plugin: Options['dev']
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
      server: {
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
        proxy: 'http://localhost:5173',
      },
    },
    url: 'http://localhost:3000',
  },
  'custom browsersync proxy object': {
    vite: {},
    plugin: {
      bs: {
        proxy: { target: 'http://localhost:5173' },
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
      bs: {
        proxy: 'http://localhost:3000',
        port: 5174,
      },
    },
    url: 'http://localhost:5174',
  },
}

describe('proxy option', () => {
  const demos = ['basic', 'astro']
  demos.forEach((demo) => {
    for (const [name, { vite, plugin, url }] of Object.entries(configProxy)) {
      it(`${demo} - ${name}`, async () => {
        const { close } = await devServer({ dev: plugin }, vite, demo as 'basic' | 'astro')
        await page.waitForTimeout(100)
        // need to use playwright to test the proxy
        await page.goto(url)
        const script = page.locator(
          'script[src^="/browser-sync/browser-sync-client.js?v="]',
        )

        await close()
        expect(script).not.toBeNull()
      })
    }
  })
})

it('snippet option', async () => {
  const { close } = await devServer({ dev: { mode: 'snippet' } })

  await page.goto('http://localhost:5173')
  const script = page.locator(
    'script[src^="http://localhost:3000/browser-sync/browser-sync-client.js?v="]',
  )

  await close()
  expect(script).not.toBeNull()
})
