"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adalGetToken = adalGetToken;
exports.runWithAdal = runWithAdal;
exports.adalFetch = adalFetch;
exports.withAdalLogin = exports.AuthenticationContext = void 0;

var _react = _interopRequireDefault(require("react"));

var _adal = _interopRequireDefault(require("./adal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isSSR = typeof window === 'undefined'; //fake context on SSR

var AuthenticationContext = isSSR ? function () {} : _adal["default"];
exports.AuthenticationContext = AuthenticationContext;
var redirectMessages = ['AADSTS16002', // old sid - https://github.com/salvoravida/react-adal/issues/46
'AADSTS50076', // MFA support - https://github.com/salvoravida/react-adal/pull/45
'AADSTS50079'];

function shouldAcquireNewToken(message) {
  return redirectMessages.some(function (v) {
    return message.indexOf(v) !== -1;
  });
}

function adalGetToken(authContext, resourceGuiId, callback) {
  return new Promise(function (resolve, reject) {
    authContext.acquireToken(resourceGuiId, function (message, token, msg) {
      if (!msg) {
        resolve(token);
      } else if (shouldAcquireNewToken(message)) {
        // Default to redirect for multi-factor authentication
        // but allow using popup if a callback is provided
        if (callback) {
          authContext.acquireTokenPopup(resourceGuiId, callback);
        } else {
          authContext.acquireTokenRedirect(resourceGuiId);
        }
      } else reject({
        message: message,
        msg: msg
      }); // eslint-disable-line

    });
  });
}

function runWithAdal(authContext, app, doNotLogin) {
  //SSR support
  if (isSSR) {
    if (doNotLogin) app();
    return;
  } //it must run in iframe too for refreshToken (parsing hash and get token)


  authContext.handleWindowCallback(); //prevent iframe double app !!!

  if (window === window.parent) {
    if (!authContext.isCallback(window.location.hash)) {
      if (!authContext.getCachedToken(authContext.config.clientId) || !authContext.getCachedUser()) {
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

function adalFetch(authContext, resourceGuiId, fetch, url, options) {
  return adalGetToken(authContext, resourceGuiId).then(function (token) {
    var o = options || {};
    if (!o.headers) o.headers = {};
    o.headers.Authorization = "Bearer ".concat(token);
    return fetch(url, o);
  });
} // eslint-disable-next-line


var withAdalLogin = function withAdalLogin(authContext, resourceId) {
  // eslint-disable-next-line
  return function (WrappedComponent, renderLoading, renderError) {
    var _temp;

    return _temp =
    /*#__PURE__*/
    function (_React$Component) {
      _inherits(_temp, _React$Component);

      function _temp(props) {
        var _this;

        _classCallCheck(this, _temp);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(_temp).call(this, props));

        _defineProperty(_assertThisInitialized(_this), "componentDidMount", function () {
          _this.mounted = true;

          if (_this.todoSetState) {
            _this.setState(_this.todoSetState);
          }
        });

        _defineProperty(_assertThisInitialized(_this), "componentWillUnmount", function () {
          _this.mounted = false;
        });

        _this.state = {
          logged: false,
          error: null
        };
        adalGetToken(authContext, resourceId).then(function () {
          if (_this.mounted) {
            _this.setState({
              logged: true
            });
          } else {
            _this.todoSetState = {
              logged: true
            };
          }
        })["catch"](function (error) {
          var msg = error.msg;
          console.log(error); // eslint-disable-line

          if (msg === 'login required') {
            authContext.login();
          } else if (_this.mounted) {
            _this.setState({
              error: error
            });
          } else {
            _this.todoSetState = {
              error: error
            };
          }
        });
        return _this;
      }

      _createClass(_temp, [{
        key: "render",
        value: function render() {
          var _this$state = this.state,
              logged = _this$state.logged,
              error = _this$state.error;
          if (logged) return _react["default"].createElement(WrappedComponent, this.props);
          if (error) return typeof renderError === 'function' ? renderError(error) : null;
          return typeof renderLoading === 'function' ? renderLoading() : null;
        }
      }]);

      return _temp;
    }(_react["default"].Component), _temp;
  };
};

exports.withAdalLogin = withAdalLogin;