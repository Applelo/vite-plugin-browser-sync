[![npm](https://img.shields.io/npm/v/vite-plugin-browser-sync)](https://www.npmjs.com/package/vite-plugin-browser-sync) [![JSR Package](https://jsr.io/badges/@applelo/vite-plugin-browser-sync)](https://jsr.io/@applelo/vite-plugin-browser-sync) [![node-current](https://img.shields.io/node/v/vite-plugin-browser-sync)](https://nodejs.org/) [![Coverage Status](https://coveralls.io/repos/github/Applelo/vite-plugin-browser-sync/badge.svg?branch=main)](https://coveralls.io/github/Applelo/vite-plugin-browser-sync?branch=main)

# vite-plugin-browser-sync

Add [BrowserSync](https://browsersync.io) to your Vite project.

> This plugin supports Vite 6 and 7.

<p align="center">
<a href="https://github.com/Applelo/vite-plugin-browser-sync/blob/main/screenshot.png?raw=true">
<img src="https://raw.githubusercontent.com/Applelo/vite-plugin-browser-sync/main/screenshot.png?raw=true"/>
</a>
</p>

## 🚀 Features

- ⚡ Fully integrated in your ViteJS environment
- 👌 Zero config available for common use cases
- ✨ All the [BrowserSync features](https://browsersync.io/)
- 🙌 Support for BrowserSync `proxy` and `snippet` mode
- 🔥 Freedom to manage BrowserSync options
- 🎛️ Can run on `dev`, `preview` or `build --watch`

## 📦 Install

```
npm i -D vite-plugin-browser-sync

# yarn
yarn add -D vite-plugin-browser-sync

# pnpm
pnpm add -D vite-plugin-browser-sync

# bun
bun add -D vite-plugin-browser-sync
```

## 👨‍💻 Usage

By default, BrowserSync will start alongside your Vite Server in `dev`. It uses the `proxy` mode of BrowserSync based on your Vite server options: no need to pass any options to make it work!

```js
// vite.config.js / vite.config.ts
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  plugins: [VitePluginBrowserSync()]
}
```

If you want to manage BrowserSync or [override default behavior of this plugin](https://github.com/Applelo/vite-plugin-browser-sync#vite-plugin-browser-sync-options-for-browsersync), you can pass a `bs` object with your [BrowserSync options](https://browsersync.io/docs/options) in it:

```js
// vite.config.js / vite.config.ts
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  plugins: [
    VitePluginBrowserSync({
      dev: {
        bs: {
          ui: {
            port: 8080
          },
          notify: false
        }
      }
    })
  ]
}
```

If you need the `snippet` mode of BrowserSync, the plugin supports it by injecting the script automatically.

```js
// vite.config.js / vite.config.ts
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  plugins: [
    VitePluginBrowserSync({
      dev: {
        mode: 'snippet'
      }
    })
  ]
}
```

You can also enable the plugin on `vite build --watch` mode and `vite preview` mode.

> [!IMPORTANT]
> - In `buildWatch`, if you use the default `proxy` mode you need to set the `bs` object.
> - `snippet` mode is available in `buildWatch` but it is not recommended to use since it updates your `index.html` file.
> - In `preview`, only the `proxy` mode is supported since it will not inject the `snippet`.

```js
// vite.config.js / vite.config.ts
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  plugins: [
    VitePluginBrowserSync({
      dev: {
        enable: false,
      },
      preview: {
        enable: true,
      },
      buildWatch: {
        enable: true,
        bs: {
          proxy: 'http://localhost:3000',
        }
      }
    })
  ]
}
```

> [!NOTE]
> For Astro users, this plugin does not work in preview mode because of [overrides made by Astro](https://github.com/withastro/astro/blob/a6c4e6754493e7af5c953b644c6a19461f15467b/packages/astro/src/core/preview/static-preview-server.ts#L40).

## vite-plugin-browser-sync options for BrowserSync

This plugin overrides default options from BrowserSync to avoid duplicating behaviors already handled by ViteJS. Furthermore, your ViteJS config is synced with BrowserSync.

If you want to change the overridden options you are free to do so via the `bs` object.

| Option                                                          | Why                                                                                                                            | dev | buildWatch | preview |
|-----------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|:---:|:----------:|:-------:|
| [logLevel](https://browsersync.io/docs/options#option-logLevel) | Set to `silent`, use ViteJS [printUrls](https://vitejs.dev/guide/api-javascript.html#createserver) to display BrowserSync info |  ✔️  |      ✔️     |    ✔️    |
| [open](https://browsersync.io/docs/options#option-open)         | Apply ViteJS [open option](https://vitejs.dev/config/server-options.html#server-open)                                          |  ✔️  |            |    ✔️    |
| [codeSync](https://browsersync.io/docs/options#option-codeSync) | Disabled because it is already handled by ViteJS                                                                               |  ✔️  |            |         |
| [online](https://browsersync.io/docs/options#option-online)     | Synced with the [server host option](https://vitejs.dev/config/server-options.html#server-host)                                |  ✔️  |            |    ✔️    |

### For `proxy` mode

| Option                                                           | Why                                           | dev | buildWatch | preview |
|------------------------------------------------------------------|-----------------------------------------------|:---:|------------|:-------:|
| [proxy.target](https://browsersync.io/docs/options#option-proxy) | Inject the right url from ViteJS              |  ✔️  |            |    ✔️    |
| [proxy.ws](https://browsersync.io/docs/options#option-proxy)     | Force websocket proxy to make ViteJS HMR work |  ✔️  |            |    ✔️    |

### For `snippet` mode

| Option                                                              | Why                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| [logSnippet](https://browsersync.io/docs/options#option-logSnippet) | Handled by the plugin so no need to display the snippet |
| [snippet](https://browsersync.io/docs/options#option-snippet)       | The snippet injection is handled by the plugin          |

## 👨‍💼 License

MIT
