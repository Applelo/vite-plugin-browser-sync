import type { Options } from '../../src/types'
import { red } from 'kolorist'
import {
  afterAll,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { buildWatchServer, devServer } from './../_helper'

const consoleMock = vi.spyOn(console, 'error').mockImplementation(() => undefined)

afterEach(async () => {
  consoleMock.mockClear()
})
afterAll(async () => {
  consoleMock.mockReset()
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
        open: false,
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
        open: false,
      },
    },
    expectFailed: false,
  },
}
describe('build --watch bs object', async () => {
  for (const [name, { options, expectFailed }] of Object.entries(buildOptions)) {
    it(name, async () => {
      const { close } = await buildWatchServer(`error_${name}`, options)
      await close()

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
