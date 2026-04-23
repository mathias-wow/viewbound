'use strict';

const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const placeFactory = require('./Place');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

let sequelize;
if (config.url) {
  sequelize = new Sequelize(config.url, config);
} else {
  sequelize = new Sequelize(config);
}

const Place = placeFactory(sequelize);

module.exports = { sequelize, Sequelize, Place };
