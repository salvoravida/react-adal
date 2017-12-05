//----------------------------------------------------------------------
// react-adal v0.15.1  with adalJS v1.0.15
//
// Copyright (c) salvoravida
// All Rights Reserved
// Apache License 2.0
//----------------------------------------------------------------------

import AuthenticationContext_ from './adal';

export const AuthenticationContext = AuthenticationContext_;

export function adalGetToken(authContext, resourceGuiId) {
  return new Promise((resolve, reject) => {
    authContext.acquireToken(resourceGuiId, (message, token, msg) => {
      if (!msg) resolve(token);
      else reject({ message, msg });
    });
  });
}

export function runWithAdal(authContext, app) {
  //it must run in iframe to for refreshToken (parsing hash and get token)
  authContext.handleWindowCallback();

  //prevent iframe double app !!!
  if (window === window.parent) {
    if (!authContext.isCallback(window.location.hash)) {
      if (!authContext.getCachedToken(authContext.config.clientId) ||
          !authContext.getCachedUser()) {
        authContext.login();
      } else {
        app();
      }
    }
  }
}

export function adalFetch(authContext, resourceGuiId, fetch, url, options) {
  return adalGetToken(authContext, resourceGuiId).then((token) => {
    const o = options;
    if (!o.headers) o.headers = {};
    o.headers.Authorization = `Bearer ${token}`;
    return fetch(url, options);
  });
}
