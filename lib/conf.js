const path = require('path')

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ais',
    user: process.env.DB_USER || 'ais',
    password: process.env.DB_PWD || 'ais',
    queryDirectory: path.join(__dirname, '..', 'db', 'queries'),
    ssl: process.env.NODE_ENV === 'production'
  }, 
  server: {
    port: parseInt(process.env.PORT, 10) || 3000
  }
}