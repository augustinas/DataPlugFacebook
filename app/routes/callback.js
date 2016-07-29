const express = require('express');
const router = express.Router();
const fb = require('../services/fb.service');
const errors = require('../errors');

router.get('/authenticate', (req, res, next) => {
  if (req.query.error === 'access_denied') return res.render('fbCancel');
  if (!req.query.code) { req.dataplug = { statusCode: '502' }; return next(); }

  fb.exchangeCodeForToken(req.query.code, (err, sourceAccessToken) => {
    if (err) { req.dataplug = { statusCode: '502' }; return next(); }

    req.session.sourceAccessToken = sourceAccessToken;

    req.session.save((err) => {
      res.redirect('/dataplug/options');
    });
  });
}, errors.renderErrorPage);

module.exports = router;