'use strict';

var Cookie = require('express-session').Cookie;
var Session = require('express-session').Session;

var PrimusError = require('primus').PrimusError;

//
// Expose the configuration function.
//
module.exports = function configure(options) {
  var key = options.key || 'connect.sid'
    , store = options.store
    , primus = this;

  if (!store) {
    //
    // Throw an error when the session store is not passed.
    //
    var message = 'Session middleware configuration failed due to missing '
      + '`store` option';
    throw new PrimusError(message, this);
  }

  // Source: https://github.com/expressjs/session/blob/master/session/store.js#L76
  var createSession = function(req, sess){
    var expires = sess.cookie.expires
      , orig = sess.cookie.originalMaxAge;
    sess.cookie = new Cookie(sess.cookie);
    if ('string' == typeof expires) sess.cookie.expires = new Date(expires);
    sess.cookie.originalMaxAge = orig;
    req.session = new Session(req, sess);
    return req.session;
  };

  //
  // The actual session middleware. This middleware is async so we need 3
  // arguments.
  //
  function session(req, res, next) {
    //
    // The session id is stored in the cookies.
    // `req.signedCookies` is assigned by the `cookie-parser` middleware.
    //
    var sid = req.signedCookies[key];

    //
    // Default to an empty session.
    //
    req.session = {};

    // We need this for createSession() to work
    req.sessionID = sid;
    req.sessionStore = store;

    //
    // If we don't have a session id we are done.
    //
    if (!sid) return next();

    //
    // Pause the request before retrieving the session. This ensures that no
    // `data` event is lost while we perform our async call.
    //
    req.pause();

    //
    // Grab the session from the store.
    //
    store.get(sid, function (err, session) {
      //
      // At this point the request stream can resume emitting `data` events.
      //
      req.resume();

      //
      // We don't want to kill the connection when we get an error from the
      // session store so we just log the error.
      //
      if (err) {
        primus.emit('log', 'error', err);
        return next();
      }

      // if (session) req.session = session;
      if (session) req.session = createSession(req, session);
      // if (session) req.session = Store.createSession(req, session);

      next();
    });
  }

  return session;
};
