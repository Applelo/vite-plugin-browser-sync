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
  },
})
