const R = require('ramda');
const loopback = require('loopback');
const moment = require('moment');

module.exports = {
  convertNullToNotFoundError,
  parseTimeStringToFloat,
  promisify,
  promisifyRestCall,
  matches,
  deleteEntities,
  withinTransaction,
  getCollectionRelation,
  createErrorResponse,
  rejectIfInstanceDoesNotExist,
  getFileNameWithSuffix,
  promisifyFileStreams,
  isWithinRangeByDateUnit,
  isGreaterThanByDateUnit,
  isLessOrEqualThanByDateUnit,
};

function convertNullToNotFoundError(ctx, cb) {
  if (ctx.result !== null) {
    return cb();
  }

  const modelName = ctx.method.sharedClass.name;
  const id = ctx.getArgByName('id');
  const msg = `Unknown "${modelName}" id "${id}".`;
  const error = new Error(msg);
  error.statusCode = error.status = 404;
  error.code = 'MODEL_NOT_FOUND';
  return cb(error);
}

function parseTimeStringToFloat(str) {
  const splitted = str.split(':');

  return parseFloat(splitted[0]) + parseFloat(splitted[1] / 60);
}

/**
 * The rest-builder inside loopback-connector-rest does not treat 4XX responses as errors.
 * This means that using simple
 * promises or simple callbacks (with error and data) will result in treating
 * such a response as a success. Use this if
 * you want to receive a promise which will fail in case of 4XX or 5XX.
 *
 * @param restCall - function which performs a REST call.
 * @param args - an array of arguments which are passed to the restCall function.
 * @param context - the "this" to be used when making the call.
 * @returns a Promise which will be fulfilled when the rest call is finished.
 * The promise fails when there is an error, or when the response status code is 4xx or 5xx.
 */
function promisifyRestCall(restCall, args, context = null) {
  return new global.Promise((resolve, reject) => {
    restCall.apply(context || this, args.concat((err, data, response) => {
      if (err) {
        reject(err);
      } else if (response.statusCode >= 400) {
        reject(data);
      } else {
        resolve(data);
      }
    }));
  });
}


function matches(value, criteria) {
  return !criteria || criteria.length === 0 || criteria.indexOf(value) !== -1;
}

function deleteEntities(Model, entities, opts = {}) {
  const ids = R.pluck('id', entities);

  if (ids.length > 0) {
    return Model.deleteAll({ id: { inq: ids } }, R.pick(['transaction'], opts));
  } else {
    return global.Promise.resolve([]);
  }
}

/**
 * Opens a transaction and the calls a the "work" function with this transaction. Uppon completion, the transaction
 * is committed and the result of "work" is returned. If an error occurred, the transaction is rolled back.
 *
 * @param Model - the model on which you will call begin transaction
 * @param work - function which performs the actual computation/work within the transaction. This will be called
 * with a single parameter: the newly opened transaction
 * @returns the result of the "work" function.
 */
function withinTransaction(Model, work) {
  let transaction;
  let ctx;

  return Model.beginTransaction({ isolationLevel: Model.Transaction.READ_COMMITTED })
    .then((tx) => {
      transaction = tx;
      ctx = loopback.getCurrentContext() || {};
      ctx.options = ctx.options || {};
      ctx.options.transaction = tx;
      return work(tx);
    })
    .then((result) => {
      delete ctx.options.transaction;

      return transaction.commit().then(() => result);
    })
    .catch((err) => {
      delete ctx.options.transaction;

      return transaction.rollback()
        .then(() => {
          throw err;
        });
    });
}

function getCollectionRelation(collection, relationshipName) {
  return R.pipe(
    R.pluck(relationshipName),
    R.flatten,
    R.reject(R.isNil)
  )(collection);
}

function promisify(method, args, context = null) {
  return new global.Promise((resolve, reject) => {
    method.apply(context || this, args.concat((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    }));
  });
}

function createErrorResponse(response, errorMessage, errorCode, statusCode) {
  const error = new Error(errorMessage);
  if (response) {
    // eslint-disable-next-line no-param-reassign
    response.statusCode = error.status = statusCode;
  }
  error.code = errorCode;
  return error;
}

function rejectIfInstanceDoesNotExist(instance, lookupValue, response, opts) {
  const options = Object.assign({}, { modelName: 'Model', propertyName: 'id' }, opts);
  if (!instance) {
    const errorMessage = `${options.modelName} with ${options.propertyName}: ${lookupValue} doesn't exist.`;
    const errorCode = `${options.modelName} not found`;
    return global.Promise.reject(createErrorResponse(response, errorMessage, errorCode, 404));
  } else {
    return global.Promise.resolve(true);
  }
}

function getFileNameWithSuffix(file, suffix) {
  const fileArr = file.name.split('.');
  const fileExtension = fileArr.pop();
  const name = fileArr.join('.');
  return `${name}-${suffix}.${fileExtension}`;
}

function promisifyFileStreams(readStream, writeStream, resolveData) {
  return new global.Promise(
    (resolve, reject) => {
      readStream.on('end', () => {
        writeStream.end();
      });

      readStream.on('error', (err) => {
        writeStream.close();
        reject(err);
      });

      readStream.on('data', (data) => {
        writeStream.write(data);
      });


      writeStream.on('success', () => {
        resolve(resolveData);
      });
    }
  );
}

/**
 * Check if the difference (by dateUnit) between given date and current date is within months range by time unit.
 *
 * @param {Object} date
 * @param {Object} limits
 * @param {number} limits.lowerLimit - lower limit of the range
 * @param {number} limits.upperLimit - higher limit of the range
 * @param {String} [dateUnit]
 * @return {boolean}
 */
function isWithinRangeByDateUnit(date, limits, dateUnit) {
  const unit = dateUnit || 'months';
  const now = moment.utc();
  const expire = moment.utc(date);
  if (date && expire.isValid()) {
    const differenceInMonths = expire.diff(now, unit, true);
    return (differenceInMonths > limits.lowerLimit) && (differenceInMonths <= limits.upperLimit);
  } else {
    return false;
  }
}

/**
 * Check if the difference (by dateUnit) between given date and current date is greater than the given time unit number.
 *
 * @param {Object} date
 * @param {number} limit - number used to make the check
 * @param {String} [dateUnit]
 * @return {boolean}
 */
function isGreaterThanByDateUnit(date, limit, dateUnit) {
  const unit = dateUnit || 'months';
  const now = moment.utc();
  const expire = moment.utc(date);
  if (date && expire.isValid()) {
    const differenceInMonths = expire.diff(now, unit, true);
    return differenceInMonths > limit;
  } else {
    return false;
  }
}

/**
 * Check if the difference (by dateUnit) between given date and current date is less than the given time unit number.
 *
 * @param {Object} date
 * @param {number} limit - number used to make the check
 * @param {String} [dateUnit]
 * @return {boolean}
 */
function isLessOrEqualThanByDateUnit(date, limit, dateUnit) {
  const unit = dateUnit || 'months';
  const now = moment.utc();
  const expire = moment.utc(date);
  if (date && expire.isValid()) {
    const differenceInMonths = expire.diff(now, unit, true);
    return differenceInMonths < limit;
  } else {
    return false;
  }
}
