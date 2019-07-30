import React from "react";
import ReactDOM from "react-dom";
import { RunWithAdal } from "../../src/react-adal";
import { authContext } from "./adalConfig";

const loginEvent = () => {
  authContext.login();
};

const App = () => (
  <div>
    <RunWithAdal context={authContext} doNotLogin>
      <p>Test App with Login</p>
      <button onClick={loginEvent} type="button">
        Login me!
      </button>
    </RunWithAdal>
  </div>
);

ReactDOM.render(<App />, document.getElementById("root"));
