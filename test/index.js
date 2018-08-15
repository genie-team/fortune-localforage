'use strict';

const testAdapter = require('fortune/test/adapter');
const localForageAdapter = require('../lib');

testAdapter(localForageAdapter, {
  name: 'fortune_test'
});
