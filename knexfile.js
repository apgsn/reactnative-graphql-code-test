require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
  },
};
