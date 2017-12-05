import { AuthenticationContext, adalGetToken, adalFetch } from '../src/react-adal';

export const adalConfig = {
  tenant: '35235325325325',
  clientId: '4362762373457',
  //important redirect to http[s]://host
  redirectUri: window.location.origin,
  endpoints: {
    api: '35325132515',
  },
  cacheLocation: 'localStorage',
};

export const authContext = new AuthenticationContext(adalConfig);

// eslint-disable-next-line
export const adalGetApiToken = () => isProd ? null :
  adalGetToken(authContext, adalConfig.endpoints.api);

// eslint-disable-next-line
export const adalApiFetch = (fetch, url, options) => isProd ? fetch(url, options) :
  adalFetch(authContext, adalConfig.endpoints.api, fetch, url, options);

