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

function adalGetToken(authContext, resourceGuiId) {
  return new Promise(function (resolve, reject) {
    authContext.acquireToken(resourceGuiId, function (message, token, msg) {
      if (!msg) resolve(token);
      // eslint-disable-next-line
      else reject({ message: message, msg: msg });
    });
  });
}

function runWithAdal(authContext, app, doNotLogin) {
  //it must run in iframe to for refreshToken (parsing hash and get token)
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

        _this.componentWillMount = function () {
          adalGetToken(authContext, resourceId).then(function () {
            return _this.setState({ logged: true });
          }).catch(function (error) {
            var msg = error.msg;

            console.log(error);
            if (msg === 'login required') {
              authContext.login();
            } else {
              _this.setState({ error: error });
            }
          });
        };

        _this.state = {
          logged: false,
          error: null
        };
        return _this;
      }

      _createClass(_class2, [{
        key: 'render',
        value: function render() {
          if (this.state.logged) return _react2.default.createElement(WrappedComponent, this.props);
          if (this.state.error) return typeof renderError === 'function' ? renderError(this.state.error) : null;
          return typeof renderLoading === 'function' ? renderLoading() : null;
        }
      }]);

      return _class2;
    }(_react2.default.Component);
  };
};