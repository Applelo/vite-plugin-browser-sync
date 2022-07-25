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
import { createServer } from 'vite'
import VitePluginBrowserSync from '../src'

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

describe('proxy option', () => {
  it('default', async () => {
    const server = await createServer({
      // any valid user config options, plus `mode` and `configFile`
      configFile: false,
      root: resolve(__dirname, './../demo'),
      plugins: [VitePluginBrowserSync()]
    })
    await server.listen()

    // need to use playwright to test the proxy
    await page.goto('http://localhost:3000')
    const content = await page.content()

    server.close()
    expect(content).matchSnapshot()
  })
})
