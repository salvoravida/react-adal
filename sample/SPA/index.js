import React from "react";
import ReactDOM from "react-dom";
import { runWithAdal } from "../../src/react-adal";
import { authContext } from "./adalConfig";

const loginEvent = () => {
  authContext.login();
};

const App = () => (
  <div>
    <p>Test App with Login</p>
    <button onClick={loginEvent} type="button">
      Login me!
    </button>
  </div>
);

runWithAdal(
  authContext,
  () => {
    ReactDOM.render(<App />, document.getElementById("root"));
  },
  true
);
