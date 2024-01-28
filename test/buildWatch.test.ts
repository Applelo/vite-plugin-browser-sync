import path from 'node:path'
import { promises as fs } from 'node:fs'
import {
  expect,
  it,
} from 'vitest'
import { build } from 'vite'
import type { RollupWatcher } from 'rollup'
import VitePluginBrowserSync from '../src'

it('snippet option', async () => {
  const watcher = await new Promise<RollupWatcher>((resolve) => {
    const watcher = build({
      configFile: false,
      root: path.resolve(__dirname, './../demo'),
      build: {
        watch: {},
        emptyOutDir: true,
        outDir: path.resolve(__dirname, './dist/buildWatch_snippet'),
      },
      plugins: [
        VitePluginBrowserSync({
          buildWatch: {
            enable: true,
            mode: 'snippet',
          },
        }),
        {
          enforce: 'post',
          name: 'test',
          closeBundle() {
            resolve(watcher as any as RollupWatcher)
          },
        },
      ],
    })
  })

  const html = await fs.readFile(path.resolve(__dirname, './dist/buildWatch_snippet/index.html'))
  expect(html).not.toBeNull()
  expect(html.toString()).toMatch(/<script async="" src="http:\/\/localhost:\d{4}\/browser-sync\/browser-sync-client\.js\?v=/g)
  await watcher.close()
})
