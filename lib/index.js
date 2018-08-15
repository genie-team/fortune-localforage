'use strict';

const localforage = require('localforage');
const helpers = require('./helpers');
const commonAdapter = require('fortune/lib/adapter/adapters/common');
const inputRecord = helpers.inputRecord;
const outputRecord = helpers.outputRecord;
const toString = helpers.toString;

/**
 * IndexedDB adapter. Available options:
 *
 * - `name`: Name of the database to connect to. Default: `db`.
 */
module.exports = function (Adapter) {
	const MemoryAdapter = Adapter.DefaultAdapter;

	function LocalForageAdapter(properties) {
		MemoryAdapter.call(this, properties);
		if (!this.options.name) this.options.name = 'fortune';
		if (this.options.config) {
			delete this.options.config.name;
		}

		// allow as many records as possible.
		delete this.options.recordsPerType;
	}

	LocalForageAdapter.prototype = Object.create(MemoryAdapter.prototype);


	LocalForageAdapter.prototype.connect = function () {
		const self = this;
		const assign = self.common.assign;
		const typesArray = Object.keys(self.recordTypes);

		return MemoryAdapter.prototype.connect.call(self)
			.then(function () {
				typesArray.forEach(type => {
					self.db[type] = localforage.createInstance({
						name: self.options.name + '_' + type
					});
					if (self.options.driver) {
						self.db[type].setDriver(self.options.driver);
					}
					if (self.options.config) {
						self.db[type].config(self.options.config);
					}
				});
			})
			// Warning and fallback to memory adapter.
			.catch(function (error) {
				console.warn(error.message); // eslint-disable-line no-console

				// Assign instance methods of the memory adapter.
				assign(self, MemoryAdapter.prototype);
			});
	};

	LocalForageAdapter.prototype.create = function (type, records, meta) {
		const self = this;
		const Promise = this.Promise;
		const message = self.message;
		const primaryKey = self.keys.primary;
		const ConflictError = self.errors.ConflictError;
		const collection = type in self.db ? self.db[type] : type;
		let i;
		let j;
		let language;

		if (!meta) meta = {};
		language = meta.language;

		records = records.map(function (record) {
			return inputRecord.call(self, type, record);
		});

		return new Promise((resolve, reject) => {
			const collisionsPromises = [];
			const createPromises = [];
			// First check for collisions.
			for (i = 0, j = records.length; i < j; i++) {
				const record = records[i];
				const id = record[primaryKey];

				collisionsPromises.push(new Promise((resolve, reject) => {
					collection.getItem(toString(id)).then(function (record) {
						if (record) {
							reject(new ConflictError(
								message('RecordExists', language, {
									id
								})));
						} else {
							resolve();
						}
					}).catch(function () {
						resolve();
					});
				}));
			}
			Promise.all(collisionsPromises).catch(error => {
				reject(error);
			}).then(() => {
				// Then save it
				for (i = 0, j = records.length; i < j; i++) {
					const record = records[i];
					const id = record[primaryKey];
					createPromises.push(collection.setItem(toString(id), record));
				}
				Promise.all(createPromises).then(records => {
					resolve(records.map(function (record) {
						return outputRecord.call(self, type, record);
					}));
				}).catch(error => {
					reject(error);
				});
			});
		});
	};


	LocalForageAdapter.prototype.find = function (type, ids, options, meta) {
		// Handle no-op.
		if (ids && !ids.length) return Adapter.prototype.find.call(this);
		const self = this;
		const Promise = this.Promise;
		const collection = type in self.db ? self.db[type] : type;
		const applyOptions = commonAdapter.applyOptions;
		const fields = self.recordTypes[type];

		return new Promise(function (resolve, reject) {
			// get requested based on ids
			if (ids && ids.length > 0) {
				const recordPromises = [];
				ids.forEach(id => {
					recordPromises.push(collection.getItem(toString(id)));
				});
				Promise.all(recordPromises).then(records => {
					resolve(records);
				}).catch(err => {
					reject(err);
				});
			} else {
				// no records so lets iterate
				const records = [];
				const iterateFn = (value) => {
					records.push(value);
				};
				collection.iterate(iterateFn).then(() => {
					resolve(records);
				}).catch(error => {
					reject(error);
				});
			}
		}).then(function (records) {
			records = records.filter(record => record !== undefined && record !== null)
			.map(function (record) {
				return outputRecord.call(self, type, record);
			});
			records = applyOptions(fields, records, options, meta);
			return records;
		});
	};


	LocalForageAdapter.prototype.update = function (type, updates) {
		const self = this;
		const Promise = self.Promise;
		const primaryKey = self.keys.primary;
		const collection = type in self.db ? self.db[type] : type;
		const applyUpdate = self.common.applyUpdate;
		let i;
		let j;
		let numUpdates = 0;
		if (!updates || !updates.length) return Adapter.prototype.update.call(self);

		return new Promise(function (resolve, reject) {
			const updatePromises = [];
			for (i = 0, j = updates.length; i < j; i++) {
				const update = updates[i];
				const id = update[primaryKey];
				updatePromises.push(collection.getItem(toString(id)).then(record => {
					if (!record) return;
					numUpdates++;
					record = outputRecord.call(self, type, record);
					applyUpdate(record, update);
					return collection.setItem(toString(id), record);
				}));
			}
			Promise.all(updatePromises).then(records => {
				resolve(numUpdates);
			}).catch(err => {
				reject(err);
			});
		});
	};


	LocalForageAdapter.prototype.delete = function (type, ids) {
		const self = this;
		const Promise = self.Promise;
		const collection = type in self.db ? self.db[type] : type;
		let i;
		let j;
		let numDeleted = 0;
		if (ids && !ids.length) return Adapter.prototype.delete.call(this);

		return new Promise(function (resolve, reject) {
			if (ids) {
				const deletePromises = [];
				for (i = 0, j = ids.length; i < j; i++) {
					const id = ids[i];
					deletePromises.push(collection.getItem(toString(id)).then(record => {
						if (record) {
							numDeleted++;
							return collection.removeItem(toString(id));
						}
					}));
				}
				Promise.all(deletePromises).then(() => {
					resolve(numDeleted);
				}).catch(error => {
					reject(error);
				});
			} else {
				collection.length().then(count => {
					numDeleted = count;
					return collection.clear();
				}).then(() => {
					resolve(numDeleted);
				}).catch(error => {
					reject(error);
				});
			}
		});
	};

	return LocalForageAdapter;
};
