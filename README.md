# react-adal
Azure Active Directory (ADAL) support for ReactJS


# install

```
npm install react-adal
```

# your app index.js

```javascript

import App from './App';
import { runWithAdal } from 'react-adal';
import { authContext } from './adalConfig';

runWithAdal(authContext, () => {

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );

});

```

# your app adalConfig.js

```javascript

import { AuthenticationContext, adalGetToken, adalFetch } from 'react-adal';

export const adalConfig = {
  tenant: '14d71d65-f596-4eae-be30-27f079bf8d4b',
  clientId: '14d71d65-f596-4eae-be30-27f079bf8d4b',
  endpoints: {
    api: '14d71d65-f596-4eae-be30-27f079bf8d4b',
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



```

