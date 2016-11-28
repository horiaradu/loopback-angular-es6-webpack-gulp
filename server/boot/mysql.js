const MySQL = require('loopback-connector-mysql').MySQL;

// Handle tables and column names as snake case
const cachedDbName = {};
MySQL.prototype.dbName = (name) => {
  if (!cachedDbName[name]) {
    cachedDbName[name] = name
      .replace(/\.?([A-Z]+)/g, (x, y) => `_${y.toLowerCase()}`)
      .replace(/^_/, '');
  }

  return cachedDbName[name];
};
