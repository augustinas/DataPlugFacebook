'use strict';

const mongoose = require('mongoose');
const config = require('../config');

const options = {
  server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } }
}

module.exports = function() {
  let db = mongoose.connect(config.dbURL, options);

  mongoose.connection.on('connected', () => {
    console.log('[DB] Server successfully connected to MongoDB');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[DB] Server has disconnected from MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.log('[ERROR] Error occured while processing database request: ', err);
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('[DB] Database connection terminated due to app termination');
      process.exit(0);
    });
  });

  return db;
}