'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withAdalLogin = exports.AuthenticationContext = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.adalGetToken = adalGetToken;
exports.runWithAdal = runWithAdal;
exports.adalFetch = adalFetch;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _adal = require('./adal');

var _adal2 = _interopRequireDefault(_adal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-next-line


var AuthenticationContext = exports.AuthenticationContext = _adal2.default;

var redirectMessages = ['AADSTS16002', // old sid - https://github.com/salvoravida/react-adal/issues/46
'AADSTS50076', // MFA support - https://github.com/salvoravida/react-adal/pull/45
'AADSTS50079'];

function shouldAcquireNewToken(message) {
  return redirectMessages.reduce(function (a, v) {
    return a || message.includes(v);
  }, false);
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
      } else reject({ message: message, msg: msg }); // eslint-disable-line
    });
  });
}

function runWithAdal(authContext, app, doNotLogin) {
  //it must run in iframe too for refreshToken (parsing hash and get token)
  authContext.handleWindowCallback();

  //prevent iframe double app !!!
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
    o.headers.Authorization = 'Bearer ' + token;
    return fetch(url, o);
  });
}

// eslint-disable-next-line
var withAdalLogin = exports.withAdalLogin = function withAdalLogin(authContext, resourceId) {
  // eslint-disable-next-line
  return function (WrappedComponent, renderLoading, renderError) {
    return function (_React$Component) {
      _inherits(_class2, _React$Component);

      function _class2(props) {
        _classCallCheck(this, _class2);

        var _this = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this, props));

        _this.componentDidMount = function () {
          _this.mounted = true;
          if (_this.todoSetState) {
            _this.setState(_this.todoSetState);
          }
        };

        _this.componentWillUnmount = function () {
          _this.mounted = false;
        };

        _this.state = {
          logged: false,
          error: null
        };

        adalGetToken(authContext, resourceId).then(function () {
          if (_this.mounted) {
            _this.setState({ logged: true });
          } else {
            _this.todoSetState = { logged: true };
          }
        }).catch(function (error) {
          var msg = error.msg;

          console.log(error); // eslint-disable-line
          if (msg === 'login required') {
            authContext.login();
          } else if (_this.mounted) {
            _this.setState({ error: error });
          } else {
            _this.todoSetState = { error: error };
          }
        });
        return _this;
      }

      _createClass(_class2, [{
        key: 'render',
        value: function render() {
          var _state = this.state,
              logged = _state.logged,
              error = _state.error;

          if (logged) return _react2.default.createElement(WrappedComponent, this.props);
          if (error) return typeof renderError === 'function' ? renderError(error) : null;
          return typeof renderLoading === 'function' ? renderLoading() : null;
        }
      }]);

      return _class2;
    }(_react2.default.Component);
  };
};