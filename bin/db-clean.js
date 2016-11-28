const mysql = require('mysql');
const promisify = require('../lib/utils').promisify;

require('dotenv').config({ silent: true });

if (process.env.NODE_ENV.toLowerCase() === 'production') {
  console.log('BEWARE! You are about to clean the DB!');
  console.log('exiting...');
  process.exit(1);
} else {
  const connectionData = {
    host: process.env.MYSQL_HOST_TEST || process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT_TEST || process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME_TEST || process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD_TEST || process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_TEST || process.env.MYSQL_DATABASE,
  };
  const connection = mysql.createConnection(connectionData);

  let tableNames;
  const query = connection.query.bind(connection);
  let exitCode = 0;

  console.log('Starting DB cleanup');
  promisify(connection.connect.bind(connection), [])
    .then(() => promisify(query, [`USE ${connectionData.database};`]))
    .then(() => promisify(query, ['SHOW TABLES;']))
    .then((tables) => {
      const propertyKey = `Tables_in_${connectionData.database}`;

      tableNames = tables.map((table) => table[propertyKey]);

      return promisify(query, ['SET FOREIGN_KEY_CHECKS = 0;']);
    })
    .then(() => global.Promise.all(tableNames.map(tableName => promisify(query, [`DROP TABLE ${tableName}`]))))
    .catch((err) => {
      console.log('There was an error cleaning the database');
      console.log(err.stack);
      exitCode = 1;
    })
    .then(() => promisify(query, ['SET FOREIGN_KEY_CHECKS = 1;']))
    .then(() => {
      connection.destroy();
      console.log('DB cleanup complete');
      process.exit(exitCode);
    });
}
