// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu(
  {},
  {
    files: ['package.json'],
    rules: {
      'pnpm/json-enforce-catalog': ['error', {
        ignores: [
          '@types/browser-sync',
          'browser-sync',
          'kolorist',
        ],
      }],
    },
  },
)
