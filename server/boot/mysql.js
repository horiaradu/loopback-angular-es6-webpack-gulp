var MySQL = require('loopback-connector-mysql').MySQL;

// Handle tables and column names as snake case
var cachedDbName = {};
MySQL.prototype.dbName = function (name) {
  if (cachedDbName[name]) {
    return cachedDbName[name];
  } else {
    return cachedDbName[name] = name.replace(/\.?([A-Z]+)/g, function (x, y) {
      return '_' + y.toLowerCase();
    }).replace(/^_/, '');
  }
};
