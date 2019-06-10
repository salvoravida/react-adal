"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _adal = _interopRequireDefault(require("./adal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Validates each resource token in cache againt current user
 */
_adal["default"].prototype.invalidateResourceTokens = function () {
  var _this = this;

  var idToken = this._getItem(this.CONSTANTS.STORAGE.IDTOKEN);

  if (!idToken) {
    return;
  }

  var _this$_extractIdToken = this._extractIdToken(idToken),
      upn = _this$_extractIdToken.upn;

  var resources = Object.values(this.config.endpoints);
  resources.forEach(function (r) {
    return _this._clearStaleResourceToken(r, upn);
  });
};
/**
 * Clears cache for the given resource if it doesn't belong to current user's UPN
 * @param {string} currentUserUpn Unique user identifier
 * @param {string} resource a URI that identifies the resource
 */


_adal["default"].prototype._clearStaleResourceToken = function (resource, currentUserUpn) {
  var resourceToken = this.getCachedToken(resource);

  if (resourceToken) {
    var _this$_extractIdToken2 = this._extractIdToken(resourceToken),
        upn = _this$_extractIdToken2.upn;

    if (upn !== currentUserUpn) {
      this.info("Clearing invalid cache of resource ".concat(resource));
      this.clearCacheForResource(resource);
    }
  }
};

var _default = _adal["default"];
exports["default"] = _default;