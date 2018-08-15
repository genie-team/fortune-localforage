const fortune = require('fortune');
const localForageAdapter = require('../lib');
const localforage = require('localforage');
const store = fortune({
  person: {
    name: String,
    friends: [Array('person'), 'friends']
  }
}, {
  adapter: [localForageAdapter, {
    // Name of the IndexedDB database to use. Defaults to `fortune`.
		name: 'fortune',
		driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
	}]
});

store.connect().then(function () {
  return store.adapter.delete('person');
}).then(function () {
  return store.create('person', {
    id: 1,
    name: 'A'
  });
}).then(function (result) {
  let record = result.payload.records[0];
  return store.create('person', {
    id: 2,
    name: 'B',
    friends: [record.id]
  });
}).then(function () {
  return store.find('person');
}).then(function (result) {
	console.log('result :', result); // eslint-disable-line no-console
  document.write('<pre>' + JSON.stringify(result, null, 2) + '</pre>');
});
