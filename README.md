# Fortune localForage

[![npm Version](https://img.shields.io/npm/v/fortune-localforage.svg?style=flat-square)](https://www.npmjs.com/package/fortune-localforage)
[![License](https://img.shields.io/npm/l/fortune-localforage.svg?style=flat-square)](https://raw.githubusercontent.com/fortunejs/fortune-localforage/master/LICENSE)

[![donate](http://img.shields.io/liberapay/receives/aCoreyJ.svg?logo=liberapay)](https://liberapay.com/aCoreyJ/donate) 
[![patreon](https://img.shields.io/badge/patreon-donate-orange.svg)](https://www.patreon.com/acoreyj/overview) 
[![paypal](https://img.shields.io/badge/paypal-donate-blue.svg)](https://www.paypal.com/pools/c/872dOkFVLP)

This is an adapter for [Fortune.js](https://github.com/fortunejs/fortune) that uses [localForage](https://github.com/localForage/localForage) which wraps IndexedDB, WebSQL, or localStorage. There is also a [Cordova SQLite Driver](https://github.com/thgreasi/localForage-cordovaSQLiteDriver).

```sh
$ npm install localforage fortune-localforage
```


## Usage

This module works in web browsers only

```js
const fortune = require('fortune')
const localForageAdapter = require('fortune-localforage')

const localForage = require('localforage') 

const store = fortune(recordTypes, {
  adapter: [localForageAdapter, {
      // Name of the IndexedDB database to use. Defaults to `fortune`.
      name: 'fortune',      
      // localforage config
      config: {
        // allowed drivers and priority, same as using driver
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


## Contribute or Donate
* Code Contributions
	* Fork
	* Make Changes
	* Run the following and make sure no failures or errors
		* npm run test
		* npm run lint
		* npm run build
	* Open pull request
* Donate 
	* Genie and other genie-team products are outcomes of a hobby and receive no other funding, any and all support would be greatly appreciated if you find Genie products useful. Your support will result in faster development of bug fixes, new features and new products.
	* [![donate](http://img.shields.io/liberapay/receives/aCoreyJ.svg?logo=liberapay)](https://liberapay.com/aCoreyJ/donate) (preferred)
	* [![patreon](https://img.shields.io/badge/patreon-donate-orange.svg)](https://www.patreon.com/acoreyj/overview) 
	* [![paypal](https://img.shields.io/badge/paypal-donate-blue.svg)](https://www.paypal.com/pools/c/872dOkFVLP) 
