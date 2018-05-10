# react-adal
Azure Active Directory Library (ADAL) support for ReactJS

```
npm install react-adal
```

index.js

```javascript

import { runWithAdal } from 'react-adal';
import { authContext } from './adalConfig';

const DO_NOT_LOGIN = false;

runWithAdal(authContext, () => {

  // eslint-disable-next-line
  require('./indexApp.js');

},DO_NOT_LOGIN);

```

This index wrap is needed because ADAL use iframes for token silent refresh,
and we do not want to have duplicated ReactApp started on iframes too!

indexApp.js (your real app index as it already is)

```javascript

import 'babel-polyfill';
import 'matchmedia-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'normalize.css';
import { store } from './store';
import App from './App';

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );

```

adalConfig.js

```javascript

import { AuthenticationContext, adalFetch, withAdalLogin } from 'react-adal';

export const adalConfig = {
  tenant: '14d71d65-f596-4eae-be30-27f079bf8d4b',
  clientId: '14d71d65-f596-4eae-be30-27f079bf8d4b',
  endpoints: {
    api: '14d71d65-f596-4eae-be30-27f079bf8d4b',
  },
  cacheLocation: 'localStorage',
};

export const authContext = new AuthenticationContext(adalConfig);

export const adalApiFetch = (fetch, url, options) =>
  adalFetch(authContext, adalConfig.endpoints.api, fetch, url, options);

export const withAdalLoginApi = withAdalLogin(authContext, adalConfig.endpoints.api);

```

use adalApiFetch with your favorite "fetch" in your api call.

# withAdalLoginApi HOC

change DO_NOT_LOGIN to true on index.js to stop login on index.js

```javascript

import MyPage from './myPageComponent';
import Loading from './Loading';
import ErrorPage from './ErrorPage';

const MyProtectedPage = withAdalLoginApi(MyPage, () => <Loading />, (error) => <ErrorPage error={error}/>);

<Route 
   path="/onlyLoggedUsers"
   render={ ()=> <MyProtectedPage /> } 
/>

```
# changelog
```
v0.4.18
!adalFetch options fix
+es5 lib

v0.4.17
+update adal.js to 1.0.17
+added withAdalLogin HOC for login only on a single Route
+added example for single route login

v0.3.15
!fix eslint and packages dep
!fix devDependencies
+update readme

v0.1.15
+first release
+include AdalJS v.1.0.15
```
# inspired by

https://blog.mastykarz.nl/building-office-365-web-applications-react/

https://medium.com/@adpreg/react-with-redux-app-with-azure-ad-auth-and-net-core-starter-project-88b1bbdb7856

https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-implicit


# credits

That's all. Enjoy!
