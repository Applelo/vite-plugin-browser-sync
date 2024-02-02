import path from 'node:path'
import { promises as fs } from 'node:fs'
import {
  expect,
  it,
} from 'vitest'
import { buildWatchServer } from './_helper'

it('snippet option', async () => {
  const { close } = await buildWatchServer('snippet', { mode: 'snippet' })
  const html = await fs.readFile(path.resolve(__dirname, './dist/buildWatch_snippet/index.html'))
  expect(html).not.toBeNull()
  expect(html.toString()).toMatch(/<script async="" src="http:\/\/localhost:\d{4}\/browser-sync\/browser-sync-client\.js\?v=/g)
  await close()
})
