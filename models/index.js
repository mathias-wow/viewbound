const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, dbConfig)
  : new Sequelize(dbConfig);

const db = { sequelize, Sequelize };

db.Place = require('./Place')(sequelize, Sequelize.DataTypes);

module.exports = db;
