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
  vi,
} from 'vitest'
import { build, createServer } from 'vite'
import { italic, red } from 'kolorist'
import VitePluginBrowserSync from '../src'
import type { Options } from '../src/types'

let browser: Browser
let page: Page

const consoleMock = vi.spyOn(console, 'error').mockImplementation(() => undefined)

beforeAll(async () => {
  browser = await chromium.launch()
})
beforeEach(async () => {
  page = await browser.newPage()
})
afterEach(async () => {
  await page.close()
  consoleMock.mockClear()
})
afterAll(async () => {
  consoleMock.mockReset()
  await browser.close()
})

it('deprecation', async () => {
  const server = await createServer({
    configFile: false,
    root: resolve(__dirname, './../demo'),
    plugins: [VitePluginBrowserSync({ bs: {} })],
  })
  await server.listen()
  expect(consoleMock).toHaveBeenCalledOnce()
  expect(consoleMock).toHaveBeenCalledWith(red(
    `[vite-plugin-browser-sync] Since 3.0, you should wrap your ${italic('bs')} option inside a ${italic('dev')} object.`,
  ))
  await server.close()
})

interface OptionsError {
  options: Options['buildWatch']
  expectFailed: boolean
}

const buildOptions: Record<string, OptionsError> = {
  empty: {
    options: {},
    expectFailed: true,
  },
  filled: {
    options: {
      bs: {
        proxy: {},
      },
    },
    expectFailed: true,
  },
  string: {
    options: {
      bs: {
        proxy: 'http://localhost:3000',
      },
    },
    expectFailed: false,
  },
  object: {
    options: {
      bs: {
        proxy: {
          target: 'http://localhost:3000',
        },
      },
    },
    expectFailed: false,
  },
}
describe('build --watch bs object', async () => {
  for (const [name, { options, expectFailed }] of Object.entries(buildOptions)) {
    it(name, async () => {
      await build({
        configFile: false,
        root: resolve(__dirname, './../demo'),
        build: {
          outDir: resolve(__dirname, `./dist/error_build_watch_${name}`),
          emptyOutDir: true,
          watch: {},
        },
        plugins: [VitePluginBrowserSync({
          buildWatch: {
            enable: true,
            ...options,
          },
        })],
      })

      if (expectFailed) {
        expect(consoleMock).toHaveBeenCalledOnce()
        expect(consoleMock).toHaveBeenCalledWith(red(
          '[vite-plugin-browser-sync] You need to set a browsersync target.',
        ))
      }
      else {
        expect(consoleMock).not.toHaveBeenCalledOnce()
      }
    })
  }
})
