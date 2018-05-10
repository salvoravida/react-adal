// eslint-disable-next-line
import React from 'react';
import AuthenticationContext_ from './adal';

export const AuthenticationContext = AuthenticationContext_;

export function adalGetToken(authContext, resourceGuiId) {
  return new Promise((resolve, reject) => {
    authContext.acquireToken(resourceGuiId, (message, token, msg) => {
      if (!msg) resolve(token);
      // eslint-disable-next-line
      else reject({ message, msg });
    });
  });
}

export function runWithAdal(authContext, app, doNotLogin) {
  //it must run in iframe to for refreshToken (parsing hash and get token)
  authContext.handleWindowCallback();

  //prevent iframe double app !!!
  if (window === window.parent) {
    if (!authContext.isCallback(window.location.hash)) {
      if (!authContext.getCachedToken(authContext.config.clientId) ||
          !authContext.getCachedUser()) {
        if (doNotLogin) {
          app();
        } else {
          authContext.login();
        }
      } else {
        app();
      }
    }
  }
}

export function adalFetch(authContext, resourceGuiId, fetch, url, options) {
  return adalGetToken(authContext, resourceGuiId).then((token) => {
    const o = options || {};
    if (!o.headers) o.headers = {};
    o.headers.Authorization = `Bearer ${token}`;
    return fetch(url, o);
  });
}

// eslint-disable-next-line
export const withAdalLogin = (authContext, resourceId) => {
  // eslint-disable-next-line
  return function(WrappedComponent, renderLoading, renderError) {
    return class extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          logged: false,
          error: null,
        };
      }

      componentWillMount = () => {
        adalGetToken(authContext, resourceId)
          .then(() => this.setState({ logged: true }))
          .catch((error) => {
            const { msg } = error;
            console.log(error);
            if (msg === 'login required') {
              authContext.login();
            } else {
              this.setState({ error });
            }
          });
      };

      render() {
        if (this.state.logged) return <WrappedComponent {...this.props} />;
        if (this.state.error) return typeof renderError === 'function' ? renderError(this.state.error) : null;
        return typeof renderLoading === 'function' ? renderLoading() : null;
      }
    };
  };
};
