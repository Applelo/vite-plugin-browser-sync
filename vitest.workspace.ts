import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: [
        'test/unit/**/*.{test,spec}.ts',
      ],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'browser',
      include: [
        'test/browser/**/*.{test,spec}.ts',
      ],
      maxConcurrency: 1,
      // browser: {
      //   enabled: true,
      //   provider: 'playwright',
      //   name: 'chrome',
      // },
    },
  },
])
