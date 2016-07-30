'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config');
const errors = require('../errors');

const db = require('../services/db.service');
const hat = require('../services/hat.service');
const market = require('../services/market.service');
const update = require('../services/update.service');

router.get('/', (req, res, next) => {
  return res.render('dataPlugLanding', { hatHost: req.query.hat });
});

router.post('/hat', (req, res, next) => {
  if (!req.body['hat_url']) return res.render('dataPlugLanding', { hatHost: req.query.hat });

  req.session.hatUrl = req.body['hat_url'];

  market.connectHat(req.session.hatUrl, (err) => {
    if (err) {
      console.log('[ERROR]', err);
      req.dataplug = { statusCode: '502' };
      return next();
    }

    hat.getAccessToken(req.session.hatUrl, (err, hatAccessToken) => {
      if (err) {
        console.log('[ERROR]', err);
        req.dataplug = { statusCode: '401' };
        return next();
      }

      req.session.hatAccessToken = hatAccessToken;

      db.countDataSources(req.session.hatUrl, (err, count) => {
        if (err) {
          console.log('[ERROR]', err);
          req.dataplug = { statusCode: '500' };
          return next();
        }

        if (count === 0) {
          return res.render('fbAuthoriseLanding', {
            facebookAppId: config.fb.appID,
            fbAccessScope: config.fb.accessScope,
            redirectUri: config.webServerURL + '/facebook/authenticate',
          });
        } else {
          return res.render('dataPlugStats');
        }
      });
    });
  });

}, errors.renderErrorPage);

router.get('/options', (req, res, next) => {
  res.render('syncOptions');
});

router.post('/options', (req, res, next) => {
  var dataSources = req.body['data_source'];

  if (!dataSources) return res.redirect('/dataplug/options');
  if (!Array.isArray(dataSources)) dataSources = [dataSources];

  dataSources.push('profile_picture');

  db.createDataSources(dataSources,
                       'facebook',
                       req.session.hatUrl,
                       req.session.sourceAccessToken,
                       (err, savedEntries) => {
    if (err) { req.dataplug = { statusCode: '500' }; return next(); }

      db.createUpdateJobs(savedEntries, (err, savedJobs) => {
        if (err) { req.dataplug = { statusCode: '500' }; return next(); }

        update.addInitJobs(savedEntries);
        return res.render('confirmation');
      });

  }, errors.renderErrorPage);

});

module.exports = router;