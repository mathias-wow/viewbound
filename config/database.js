'use strict';

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './viewbound-dev.sqlite',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
};
