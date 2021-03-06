'use strict';

const common = require('fortune/lib/adapter/adapters/common');
const generateId = common.generateId;

module.exports.inputRecord = function (type, record) {
  let recordTypes = this.recordTypes;
  let primaryKey = this.keys.primary;
  let isArrayKey = this.keys.isArray;
  let fields = recordTypes[type];
  let fieldsArray = Object.getOwnPropertyNames(fields);
  let result = {};
  let i; let j;

  // Ensure that ID exists on the record.
  result[primaryKey] = primaryKey in record ?
		record[primaryKey] : generateId();

  for (i = 0, j = fieldsArray.length; i < j; i++) {
    const field = fieldsArray[i];
    if (!record.hasOwnProperty(field)) {
      result[field] = fields[field][isArrayKey] ? [] : null;
      continue;
    }

    result[field] = record[field];
  }
  return result;
};


module.exports.outputRecord = function (type, record) {
  let recordTypes = this.recordTypes;
  let primaryKey = this.keys.primary;
  let isArrayKey = this.keys.isArray;
  let denormalizedInverseKey = this.keys.denormalizedInverse;
  let fields = recordTypes[type];
  let fieldsArray = Object.getOwnPropertyNames(fields);
  let result = {};
  let i; let j;

  // Ensure that ID exists on the record.
  result[primaryKey] = record[primaryKey];


  for (i = 0, j = fieldsArray.length; i < j; i++) {
		const field = fieldsArray[i];
    const hasField = record.hasOwnProperty(field);
    let value = hasField ? record[field] :
			fields[field][isArrayKey] ? [] : null;

		if (value && hasField && fields[field] && fields[field].type === Buffer) {
			if (fields[field][isArrayKey]) {
				value = value.map(el => el instanceof Buffer ? el : Buffer.from(el));
			} else if (!(value instanceof Buffer)) {
				value = Buffer.from(value);
			}
		}

		if (value && hasField && fields[field] && fields[field].type === Date) {
			if (fields[field][isArrayKey]) {
				value = value.map(el => el instanceof Date ? el : new Date(el));
			} else if (!(value instanceof Date)) {
				value = new Date(value);
			}
		}

    // Do not enumerate denormalized fields.
    if (fields[field][denormalizedInverseKey]) {
      Object.defineProperty(result, field, {
        configurable: true, writable: true, value: value
      });
      continue;
    }

    result[field] = value;
  }

  return result;
};
