[![npm](https://img.shields.io/npm/v/vite-plugin-browser-sync)](https://github.com/Applelo/vite-plugin-browser-sync) [![node-current](https://img.shields.io/node/v/vite-plugin-browser-sync)](https://nodejs.org/)

# vite-plugin-browser-sync

Easily use BrowserSync in your Vite project

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

If you want to manage BrowserSync or override default behavior of this plugin (see below), you can pass a `bs` object with your [BrowserSync options](https://browsersync.io/docs/options) in it :

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

This plugin also supports the `snippet` mode of BrowserSync by injecting the script automatically on dev mode.

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

This plugin overrides default options from BrowserSync to don't duplicate behavior already managed by ViteJS.

| Option                                                                    | Why                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [logPrefix](https://browsersync.io/docs/options#option-logPrefix)         | Use `vite-plugin-browser-sync` to harmonize log outputs                               |
| [open](https://browsersync.io/docs/options#option-open)                   | Apply ViteJS [open option](https://vitejs.dev/config/server-options.html#server-open) |
| [codeSync](https://browsersync.io/docs/options#option-codeSync)           | Already managed by ViteJS                                                             |
| [injectChanges](https://browsersync.io/docs/options#option-injectChanges) | Already managed by ViteJS                                                             |

### For `proxy` mode

| Option                                                    | Why                              |
| --------------------------------------------------------- | -------------------------------- |
| [proxy](https://browsersync.io/docs/options#option-proxy) | Inject the right url from ViteJS |

### For `snippet` mode

| Option                                                              | Why                                                       |
| ------------------------------------------------------------------- | --------------------------------------------------------- |
| [logSnippet](https://browsersync.io/docs/options#option-logSnippet) | Manage by the plugin so don't need to display the snippet |
| [snippet](https://browsersync.io/docs/options#option-snippet)       | The injection is managed by the plugin                    |

## 👨‍💼 Licence

GPL-3.0
