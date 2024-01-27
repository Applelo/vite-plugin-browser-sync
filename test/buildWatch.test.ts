import { resolve } from 'node:path'
import {
  expect,
  it,
} from 'vitest'
import { build } from 'vite'
import VitePluginBrowserSync from '../src'

it('snippet option', async () => {
  const res = await build({
    configFile: false,
    root: resolve(__dirname, './../demo'),
    build: {
      emptyOutDir: true,
      outDir: resolve(__dirname, './dist/buildWatch_snippet'),
    },
    plugins: [VitePluginBrowserSync({
      buildWatch: {
        enable: true,
        mode: 'snippet',
      },
    })],
  })

  const asset = 'output' in res
    ? res.output.find(item => item.fileName === 'index.html')
    : null
  const indexSource = asset && 'source' in asset ? asset.source : null

  expect(indexSource).not.toBeNull()
  expect(indexSource).toContain('<script async="" src="http://localhost:3000/browser-sync/browser-sync-client.js?v=')
})
