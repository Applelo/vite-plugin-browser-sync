import type { RollupWatcher } from 'rollup'
import type { UserConfig } from 'vite'
import type { Options } from '../src/types'
import path from 'node:path'
import { build, createServer, preview } from 'vite'
import VitePluginBrowserSync from '../src'

export async function devServer(
  plugin: Options = {},
  vite: UserConfig = {},
  demo: 'basic' | 'astro' = 'basic',
) {
  const server = await createServer({
    configFile: false,
    root: path.resolve(__dirname, `./../demo/${demo}`),
    plugins: [VitePluginBrowserSync(plugin)],
    ...vite,
  })
  await server.listen()

  return {
    printUrls: server.printUrls,
    close: server.close,
  }
}

export async function previewServer(
  plugin: Options['preview'] = {},
  vite: UserConfig = {},
) {
  const previewServer = await preview({
    configFile: false,
    root: path.resolve(__dirname, './../demo/basic'),
    plugins: [
      VitePluginBrowserSync({
        preview: {
          enable: true,
          ...plugin,
        },
      }),
    ],
    ...vite,
  })

  const closePromise = new Promise(
    resolve => previewServer.httpServer.on('close', () => {
      resolve(true)
    }),
  )

  const close = async () => {
    previewServer.httpServer.close()
    await closePromise
  }

  return {
    printUrls: previewServer.printUrls,
    close,
  }
}

export async function buildWatchServer(
  name: string,
  plugin: Options['buildWatch'] = {},
  vite: UserConfig = {},
) {
  const watcher = await new Promise<RollupWatcher>((resolve) => {
    const watcher = build({
      configFile: false,
      root: path.resolve(__dirname, './../demo/basic'),
      build: {
        watch: {},
        emptyOutDir: true,
        outDir: path.resolve(__dirname, `./dist/buildWatch_${name}`),
      },
      plugins: [
        VitePluginBrowserSync({
          buildWatch: {
            enable: true,
            ...plugin,
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
      ...vite,
    })
  })
  return {
    close: watcher.close,
  }
}
