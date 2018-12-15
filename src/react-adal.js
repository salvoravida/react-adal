// eslint-disable-next-line
import React from 'react';
import AuthenticationContext_ from './adal';

export const AuthenticationContext = AuthenticationContext_;

const redirectMessages = [
  'AADSTS16002', // old sid - https://github.com/salvoravida/react-adal/issues/46
  'AADSTS50076', // MFA support - https://github.com/salvoravida/react-adal/pull/45
  'AADSTS50079', // MFA support
];

function shouldAcquireNewToken(message) {
  return redirectMessages.reduce((a, v) => a || message.includes(v), false);
}

export function adalGetToken(authContext, resourceGuiId, callback) {
  return new Promise((resolve, reject) => {
    authContext.acquireToken(resourceGuiId, (message, token, msg) => {
      if (!msg) {
        resolve(token);
      } else
      if (shouldAcquireNewToken(message)) {
        // Default to redirect for multi-factor authentication
        // but allow using popup if a callback is provided
        if (callback) {
          authContext.acquireTokenPopup(resourceGuiId, callback);
        } else {
          authContext.acquireTokenRedirect(resourceGuiId);
        }
      } else reject({ message, msg });  // eslint-disable-line
    });
  });
}

export function runWithAdal(authContext, app, doNotLogin) {
  //it must run in iframe too for refreshToken (parsing hash and get token)
  authContext.handleWindowCallback();

  //prevent iframe double app !!!
  if (window === window.parent) {
    if (!authContext.isCallback(window.location.hash)) {
      if (!authContext.getCachedToken(authContext.config.clientId)
          || !authContext.getCachedUser()) {
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
    o.headers.append("Authorization", `Bearer ${token}`)
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

        adalGetToken(authContext, resourceId)
          .then(() => {
            if (this.mounted) {
              this.setState({ logged: true });
            } else {
              this.todoSetState = { logged: true };
            }
          })
          .catch((error) => {
            const { msg } = error;
            console.log(error);  // eslint-disable-line
            if (msg === 'login required') {
              authContext.login();
            } else if (this.mounted) {
              this.setState({ error });
            } else {
              this.todoSetState = { error };
            }
          });
      }

      componentDidMount = () => {
        this.mounted = true;
        if (this.todoSetState) {
          this.setState(this.todoSetState);
        }
      };

      componentWillUnmount = () => {
        this.mounted = false;
      };

      render() {
        const { logged, error } = this.state;
        if (logged) return <WrappedComponent {...this.props} />;
        if (error) return typeof renderError === 'function' ? renderError(error) : null;
        return typeof renderLoading === 'function' ? renderLoading() : null;
      }
    };
  };
};
