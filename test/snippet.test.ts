import { resolve } from 'path'
import fetch from 'node-fetch'
import { it, expect } from 'vitest'
import { createServer } from 'vite'
import VitePluginBrowserSync from '../src'

it('snippet option', async () => {
  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    configFile: false,
    root: resolve(__dirname, './../demo'),
    plugins: [VitePluginBrowserSync({ mode: 'snippet' })]
  })
  await server.listen()

  const text = await fetch('http://127.0.0.1:5173/').then(res => res.text())

  server.close()
  expect(text).matchSnapshot()
})
