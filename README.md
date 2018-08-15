# Fortune localForage

[![npm Version](https://img.shields.io/npm/v/fortune-localforage.svg?style=flat-square)](https://www.npmjs.com/package/fortune-localforage)
[![License](https://img.shields.io/npm/l/fortune-localforage.svg?style=flat-square)](https://raw.githubusercontent.com/fortunejs/fortune-localforage/master/LICENSE)

This is an adapter for Fortune.js that uses [localForage](https://github.com/localForage/localForage), so it wraps IndexedDB, WebSQL, or localStorage. There is also a [localForage-cordovaSQLiteDriver](https://github.com/thgreasi/localForage-cordovaSQLiteDriver).

```sh
$ npm install localforage fortune-localforage
```


## Usage

This module works in web browsers only

```js
const fortune = require('fortune')
const localForageAdapter = require('fortune-localforage')

const store = fortune(recordTypes, {
  adapter: [localForageAdapter, {
      // Name of the IndexedDB database to use. Defaults to `fortune`.
      name: 'fortune',      
      // localforage config
      config: {
        // allowed drivers and prioerty, same as using driver
        driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
        version     : 1.0,
        size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
        storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
        description : 'some description'
      }
      // or just send driver
      driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
    }]
})
```


## License

This software is licensed under the [MIT license](https://raw.githubusercontent.com/genie-team/fortune-localforage/master/LICENSE).
