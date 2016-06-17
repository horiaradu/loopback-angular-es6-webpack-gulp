var moment = require('moment');

var utils = module.exports = {};

utils.convertNullToNotFoundError = function (ctx, cb) {
  if (ctx.result !== null) {
    return cb();
  }

  var modelName = ctx.method.sharedClass.name;
  var id = ctx.getArgByName('id');
  var msg = 'Unknown "' + modelName + '" id "' + id + '".';
  var error = new Error(msg);
  error.statusCode = error.status = 404;
  error.code = 'MODEL_NOT_FOUND';
  cb(error);
};

utils.daysPassed = function (start, end) {
  var days = null;
  if (start && end) {
    try {
      days = moment.utc(end).diff(moment.utc(start), 'days', true);
    } catch (e) {
      days = null;
    }
  }
  return (days !== null && days >= 0) ? Math.ceil(days) : null;
};

utils.parseTimeStringToFloat = function (str) {
  str = str.split(':');

  return parseFloat(str[0]) + parseFloat(str[1] / 60);
};

utils.promisifyRestCall = promisifyRestCall;

/**
 * The rest-builder inside loopback-connector-rest does not treat 4XX responses as errors. This means that using simple
 * promises or simple callbacks (with error and data) will result in treating such a response as a success. Use this if
 * you want to receive a promise which will fail in case of 4XX or 5XX.
 *
 * @param restCall - function which performs a REST call.
 * @param args - an array of arguments which are passed to the restCall function.
 * @returns a Promise which will be fulfilled when the rest call is finished. The promise fails when there is an error,
 * or when the response status code is 4xx or 5xx.
 */
function promisifyRestCall(restCall, args) {
  return new global.Promise(function (resolve, reject) {
    restCall.apply(this, args.concat(function (err, data, response) {
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

utils.matches = function (value, criteria) {
  return !criteria || criteria.length === 0 || criteria.indexOf(value) !== -1;
};
