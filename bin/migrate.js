const fs = require('fs');

const dbNameFlag = process.argv.indexOf('--datasource');
const dbName = (dbNameFlag > -1) ? process.argv[dbNameFlag + 1] : 'db';
const dateSinceFlag = process.argv.indexOf('--since');
const dateSinceFilter = (dateSinceFlag > -1) ? process.argv[dateSinceFlag + 1] : '';
const migrationsFolder = `${process.cwd()}/migrations/`;
const dbMigrationsFolder = migrationsFolder + dbName;
/* eslint-disable import/no-dynamic-require */
const datasource = require(`${process.cwd()}/server/server.js`).dataSources[dbName];

if (!datasource) {
  console.log(`datasource '${dbName}' not found!`);
  process.exit(1);
}

const migrationSkeleton = "var async = require('async');\n\n" +
  'module.exports = {\n' +
  '  up: function(dataSource, next) {\n' +
  '    var queries = [];\n' +
  '    async.eachSeries(queries, function iterator(item, done) { dataSource.connector.query(item, done); }, next);\n' +
  '  },\n' +
  '  down: function(dataSource, next) {\n' +
  '    var queries = [];\n' +
  '    async.eachSeries(queries, function iterator(item, done) { dataSource.connector.query(item, done); }, next);\n' +
  '  }\n' +
  '};';

datasource.createModel('Migration',
  {
    name: {
      id: true,
      type: 'String',
      required: true,
      length: 100,
      index: {
        unique: true,
      },
    },
    db: {
      type: 'String',
      length: 100,
      required: true,
    },
    created: {
      type: 'Date',
      required: true,
    },
  },
  {
    mysql: {
      table: 'migrations',
    },
    postgresql: {
      table: 'migrations',
    },
  });

// make migration folders if they don't exist
if (!fs.existsSync(migrationsFolder)) {
  try {
    fs.mkdirSync(migrationsFolder);
  } catch (e) {
    console.error(e.stack);
  }
}
if (!fs.existsSync(dbMigrationsFolder)) {
  try {
    fs.mkdirSync(dbMigrationsFolder);
  } catch (e) {
    console.error(e.stack);
  }
}

function mapScriptObjName(scriptObj) {
  return scriptObj.name;
}

function findScriptsToRun(upOrDown, cb) {
  const filters = {
    where: {
      name: { gte: `${dateSinceFilter}` || '' },
    },
    order: (upOrDown === 'up') ? 'name ASC' : 'name DESC',
  };

  // get all local scripts and filter for only .js files
  const localScriptNames = fs.readdirSync(dbMigrationsFolder).filter((fileName) => fileName.substring(fileName.length - 3, fileName.length) === '.js');

  // create table if not exists
  datasource.autoupdate('Migration', (err) => {
    if (err) {
      console.log('Error retrieving migrations:');
      console.log(err.stack);
      process.exit(1);
    }

    // get all scripts that have been run from DB
    datasource.models.Migration.find(filters, (err, scriptsRun) => {
      if (err) {
        console.log('Error retrieving migrations:');
        console.log(err.stack);
        process.exit(1);
      }

      if (upOrDown === 'up') {
        const runScriptsNames = scriptsRun.map(mapScriptObjName);

        // return scripts that exist on disk but not in the db
        cb(localScriptNames.filter((scriptName) => runScriptsNames.indexOf(scriptName) < 0));
      } else {
        // return all db script names
        cb(scriptsRun.map(mapScriptObjName));
      }
    });
  });
}

function migrateScripts(upOrDown) {
  return function findAndRunScripts() {
    findScriptsToRun(upOrDown, (scriptsToRun) => {
      const migrationCallStack = [];
      let migrationCallIndex = 0;

      scriptsToRun.forEach((localScriptName) => {
        migrationCallStack.push(() => {
          // keep calling scripts recursively until we are done, then exit
          function runNextScript(err) {
            if (err) {
              console.log('Error saving migration', localScriptName, 'to database!');
              console.log(err.stack);
              process.exit(1);
            }

            console.log(localScriptName, 'finished sucessfully.');
            migrationCallIndex += 1;
            if (migrationCallIndex < migrationCallStack.length) {
              migrationCallStack[migrationCallIndex]();
            } else {
              process.exit();
            }
          }

          try {
            // include the script, run the up/down function,
            // update the migrations table, and continue
            console.log(localScriptName, 'running.');
            /* eslint-disable global-require */
            require(`${dbMigrationsFolder}/${localScriptName}`)[upOrDown](datasource, (err) => {
              if (err) {
                console.log(localScriptName, 'error:');
                console.log(err.stack);
                process.exit(1);
              } else if (upOrDown === 'up') {
                datasource.models.Migration.create({
                  name: localScriptName,
                  db: dbName,
                  created: new Date(),
                }, runNextScript);
              } else {
                datasource.models.Migration.destroyAll({
                  name: localScriptName,
                }, runNextScript);
              }
            });
          } catch (e) {
            console.log('Error running migration', localScriptName);
            console.log(e.stack);
            process.exit(1);
          }
        });
      });

      // kick off recursive calls
      if (migrationCallStack.length) {
        migrationCallStack[migrationCallIndex]();
      } else {
        console.log('No new migrations to run.');
        process.exit();
      }
    });
  };
}

function stringifyAndPadLeading(num) {
  const str = `${num}`;
  return (str.length === 1) ? `0${str}` : str;
}

function newMigrationFineName() {
  const d = new Date();
  const year = `${d.getFullYear()}`;
  const month = stringifyAndPadLeading(d.getMonth() + 1);
  const day = stringifyAndPadLeading(d.getDate());
  const hours = stringifyAndPadLeading(d.getHours());
  const minutes = stringifyAndPadLeading(d.getMinutes());
  const seconds = stringifyAndPadLeading(d.getSeconds());
  const dateString = year + month + day + hours + minutes + seconds;
  return `/${dateString}.js`;
}

const cmds = {
  up: migrateScripts('up'),
  down: migrateScripts('down'),
  create: function create(name) {
    fs.writeFileSync(dbMigrationsFolder + newMigrationFineName(), migrationSkeleton);
    process.exit();
  },
  diff: function diff(name) {
    // create table if not exists
    datasource.autoupdate('Migration', (err) => {
      if (err) {
        console.log('Error retrieving migrations:');
        console.log(err.stack);
        process.exit(1);
      }

      datasource.connector.migrationDiff((err, sql) => {
        if (err) {
          console.log('Error extracting diff:');
          console.log(err.stack);
          process.exit(1);
        }

        if (!sql || !((sql.up && sql.up.length) || (sql.down && sql.down.length))) {
          console.log('No migration file generated');
          process.exit();
        }

        const skeleton = migrationSkeleton.split('[];');
        let upQuery = '[];';
        let downQuery = '[];';

        if (sql.up && sql.up.length) {
          upQuery = queryString(sql.up);
        }
        if (sql.down && sql.down.length) {
          downQuery = queryString(sql.down);
        }

        fs.writeFileSync(dbMigrationsFolder + newMigrationFineName(),
          skeleton[0] + upQuery + skeleton[1] + downQuery + skeleton[2]);

        console.log('Migration file generated');
        process.exit();
      });
    });

    function queryString(sqlArr) {
      const sql = [];
      const lineStart = '\n      \'';
      sqlArr.forEach((query) => {
        sql.push(query.replace(/\n/g, ' ').replace(/ +/g, ' ').replace(' ;', ';'));
      });
      return `[${lineStart}${sql.join(`',${lineStart}`)}'\n    ];`;
    }
  },
};

const cmdNames = Object.keys(cmds);

for (let i = 0; i < cmdNames.length; i += 1) {
  if (process.argv.indexOf(cmdNames[i]) > -1) {
    cmds[cmdNames[i]]();
    break;
  }
}
