import React from 'react';
import ReactDOM from 'react-dom';
import { runWithAdal } from '../src/react-adal';
import { authContext } from './adalConfig';

const App = () => (
  <div>
    <p>Test App with Login</p>
  </div>
);

runWithAdal(authContext, () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});
