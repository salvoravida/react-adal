'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticationContext = undefined;
exports.adalGetToken = adalGetToken;
exports.runWithAdal = runWithAdal;
exports.adalFetch = adalFetch;

var _adal = require('./adal');

var _adal2 = _interopRequireDefault(_adal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AuthenticationContext = exports.AuthenticationContext = _adal2.default;

function adalGetToken(authContext, resourceGuiId) {
  return new Promise(function (resolve, reject) {
    authContext.acquireToken(resourceGuiId, function (message, token, msg) {
      if (!msg) resolve(token);
      // eslint-disable-next-line
      else reject({ message: message, msg: msg });
    });
  });
}

function runWithAdal(authContext, app) {
  //it must run in iframe to for refreshToken (parsing hash and get token)
  authContext.handleWindowCallback();

  //prevent iframe double app !!!
  if (window === window.parent) {
    if (!authContext.isCallback(window.location.hash)) {
      if (!authContext.getCachedToken(authContext.config.clientId) || !authContext.getCachedUser()) {
        authContext.login();
      } else {
        app();
      }
    }
  }
}

function adalFetch(authContext, resourceGuiId, fetch, url, options) {
  return adalGetToken(authContext, resourceGuiId).then(function (token) {
    var o = options;
    if (!o.headers) o.headers = {};
    o.headers.Authorization = 'Bearer ' + token;
    return fetch(url, options);
  });
}