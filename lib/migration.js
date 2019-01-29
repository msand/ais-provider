const path = require('path');
const Postgrator = require('postgrator');
const conf = require('./conf');

const migrationsFolder = path.join(__dirname, '..', 'db', 'schema');

function migrate(cb) {
  const postgrator = new Postgrator({
    driver: 'pg',
    migrationDirectory: migrationsFolder,
    // Database connection config
    host: conf.db.host,
    port: conf.db.port,
    database: conf.db.database,
    username: conf.db.user,
    password: conf.db.password,
    schemaTable: 'ais_schema_version',
    ssl: conf.db.ssl
  });

  return postgrator
    .migrate('005')
    .then(migrations => {
      if (migrations && migrations.length > 0) {
        console.info('Migration(s) run:', migrations.map(m => m.filename).join(','));
      } else {
        console.info('No migration to run');
      }
      if(cb) {
        cb()
      }
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

if (require.main === module) {
  migrate();
}

module.exports = migrate