import { defineConfig } from 'tsup'
import pkg from 'browser-sync/package.json' with { type: 'json' }

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  format: ['cjs', 'esm'],
  dts: true,
  env: {
    BS_VERSION: pkg.version,
  },
  clean: true,
})
