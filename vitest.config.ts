import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './test/_global.ts',
    coverage: {
      include: ['src/*'],
      exclude: [
        'src/types.ts',
        'src/client.d.ts',
      ],
      reporter: ['lcov'],
    },
    fileParallelism: false,
    projects: [
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
        },
      },
    ],
  },
})
