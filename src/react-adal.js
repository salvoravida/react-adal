// eslint-disable-next-line
import React from 'react';
import AuthenticationContext_ from './adal.mod';

const isSSR = typeof window === 'undefined';

// fake context on SSR
export const AuthenticationContext = isSSR ? () => {} : AuthenticationContext_;

const redirectMessages = [
  'AADSTS16002', // old sid - https://github.com/salvoravida/react-adal/issues/46
  'AADSTS50076', // MFA support - https://github.com/salvoravida/react-adal/pull/45
  'AADSTS50079' // MFA support
];

function shouldAcquireNewToken(message) {
  return redirectMessages.some(v => message.indexOf(v) !== -1);
}

function parseResourceInfo(resourceInfo) {
  return typeof resourceInfo === 'string'
    ? { resourceGuiId: resourceInfo }
    : resourceInfo;
}

export function adalGetToken(authContext, resourceInfo, callback) {
  const { resourceGuiId, extraQueryParameters, claims } = parseResourceInfo(
    resourceInfo
  );

  return new Promise((resolve, reject) => {
    authContext.acquireToken(resourceGuiId, (message, token, msg) => {
      if (!msg) {
        resolve(token);
      } else if (shouldAcquireNewToken(message)) {
        // Default to redirect for multi-factor authentication
        // but allow using popup if a callback is provided
        if (callback) {
          authContext.acquireTokenPopup(
            resourceGuiId,
            extraQueryParameters,
            claims,
            callback
          );
        } else {
          authContext.acquireTokenRedirect(
            resourceGuiId,
            extraQueryParameters,
            claims
          );
        }
      } else reject({ message, msg }); // eslint-disable-line
    });
  });
}

export function runWithAdal(authContext, app, doNotLogin) {
  // SSR support
  if (isSSR) {
    if (doNotLogin) app();
    return;
  }
  // it must run in iframe too for refreshToken (parsing hash and get token)
  authContext.handleWindowCallback();

  // Clear the resource cache on new login
  // https://github.com/salvoravida/react-adal/issues/68
  authContext.invalidateResourceTokens();

  // prevent iframe double app !!!
  if (window === window.parent) {
    if (!authContext.isCallback(window.location.hash)) {
      // adal sdk assigns clientId if loginResource is not provided
      const resource = authContext.config.loginResource;
      const token = authContext.getCachedToken(resource);
      const user = authContext.getCachedUser();

      if (!token || !user) {
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

export function adalFetch(authContext, resourceInfo, fetch, url, options) {
  return adalGetToken(authContext, resourceInfo).then(token => {
    const o = options || {};
    if (!o.headers) o.headers = {};
    o.headers.Authorization = `Bearer ${token}`;
    return fetch(url, o);
  });
}

// eslint-disable-next-line
export const withAdalLogin = (authContext, resourceInfo) => {
  // eslint-disable-next-line
  return function(WrappedComponent, renderLoading, renderError) {
    return class extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          logged: false,
          error: null
        };

        // #67 Using react-adal with Server Side Rendering(Next.js)
        if (!isSSR) {
          adalGetToken(authContext, resourceInfo)
            .then(() => {
              this.safeSetState({ logged: true });
            })
            .catch(error => {
              const { msg } = error;
              console.log('adalGetToken', error); // eslint-disable-line

              // Avoid the infinite loop when access_denied
              // https://github.com/salvoravida/react-adal/issues/33
              const loginError = authContext.getLoginError();
              const loginWasTriedButFailed =
                loginError !== undefined &&
                loginError !== null &&
                loginError !== '';

              if (loginWasTriedButFailed) {
                this.safeSetState({ error: loginError });
              } else if (msg === 'login required') {
                authContext.login();
              } else {
                this.safeSetState({ error });
              }
            });
        }
      }

      safeSetState = state => {
        if (this.mounted) {
          this.setState(state);
        } else {
          this.todoSetState = state;
        }
      };

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
        if (isSSR) return null;
        const { logged, error } = this.state;
        if (logged) return <WrappedComponent {...this.props} />;
        if (error)
          return typeof renderError === 'function' ? renderError(error) : null;
        return typeof renderLoading === 'function' ? renderLoading() : null;
      }
    };
  };
};
