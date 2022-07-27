[![npm](https://img.shields.io/npm/v/vite-plugin-browser-sync)](https://github.com/Applelo/vite-plugin-browser-sync) [![node-current](https://img.shields.io/node/v/vite-plugin-browser-sync)](https://nodejs.org/)

# vite-plugin-browser-sync

Add [BrowserSync](https://browsersync.io) in your Vite project

## 📦 Install

```
npm i -D vite-plugin-browser-sync

# yarn
yarn add -D vite-plugin-browser-sync

# pnpm
pnpm add -D vite-plugin-browser-sync
```

## 👨‍💻 Usage

Browsersync starts alongside with your Vite Server. By default, it uses the `proxy` mode of BrowserSync based on your Vite server options : no need to pass any options to make it works !

```js
// vite.config.js / vite.config.ts
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  plugins: [VitePluginBrowserSync()]
}
```

If you want to manage BrowserSync or [override default behavior of this plugin](https://github.com/Applelo/vite-plugin-browser-sync#vite-plugin-browser-sync-options-for-browsersync), you can pass a `bs` object with your [BrowserSync options](https://browsersync.io/docs/options) in it :

```js
// vite.config.js / vite.config.ts
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

export default {
  plugins: [
    VitePluginBrowserSync({
      bs: {
        ui: {
          port: 8080
        },
        notify: false
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
      mode: 'snippet'
    })
  ]
}
```

## vite-plugin-browser-sync options for BrowserSync

This plugin overrides default options from BrowserSync to doesn't duplicate behavior already managed by ViteJS and sync with ViteJS Config.

| Option                                                            | Why                                                                                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [logPrefix](https://browsersync.io/docs/options#option-logPrefix) | Use `vite-plugin-browser-sync` to harmonize log outputs                                                                        |
| [logLevel](https://browsersync.io/docs/options#option-logLevel)   | Set to `silent`, use ViteJS [printUrls](https://vitejs.dev/guide/api-javascript.html#createserver) to display BrowserSync info |
| [open](https://browsersync.io/docs/options#option-open)           | Apply ViteJS [open option](https://vitejs.dev/config/server-options.html#server-open)                                          |
| [codeSync](https://browsersync.io/docs/options#option-codeSync)   | Disable because it is already managed by ViteJS                                                                                |
| [online](https://browsersync.io/docs/options#option-online)       | Sync with the [server host option](https://vitejs.dev/config/server-options.html#server-host)                                  |

### For `proxy` mode

| Option                                                           | Why                                                |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| [proxy.target](https://browsersync.io/docs/options#option-proxy) | Inject the right url from ViteJS                   |
| [proxy.ws](https://browsersync.io/docs/options#option-proxy)     | Force websocket proxy to make work HMR from ViteJS |

### For `snippet` mode

| Option                                                              | Why                                                       |
| ------------------------------------------------------------------- | --------------------------------------------------------- |
| [logSnippet](https://browsersync.io/docs/options#option-logSnippet) | Manage by the plugin so don't need to display the snippet |
| [snippet](https://browsersync.io/docs/options#option-snippet)       | The injection is managed by the plugin                    |

## 👨‍💼 Licence

GPL-3.0
