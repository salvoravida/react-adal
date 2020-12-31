import AuthenticationContext from './adal';

/**
 * Validates each resource token in cache againt current user
 */
AuthenticationContext.prototype.invalidateResourceTokens = function () {
  if (!this.config.endpoints) {
    return;
  }
  const idToken = this._getItem(this.CONSTANTS.STORAGE.IDTOKEN);
  if (!idToken) {
    return;
  }
  const { upn } = this._extractIdToken(idToken);
  const resources = Object.values(this.config.endpoints);

  resources.forEach((r) => this._clearStaleResourceToken(r, upn));
};

/**
 * Clears cache for the given resource if it doesn't belong to current user's UPN
 * @param {string} currentUserUpn Unique user identifier
 * @param {string} resource a URI that identifies the resource
 */
AuthenticationContext.prototype._clearStaleResourceToken = function (
  resource,
  currentUserUpn
) {
  const resourceToken = this.getCachedToken(resource);
  if (resourceToken) {
    const { upn } = this._extractIdToken(resourceToken);
    if (
      typeof upn == 'string' &&
      typeof currentUserUpn == 'string' &&
      upn.toLowerCase() !== currentUserUpn.toLowerCase()
    ) {
      this.info(`Clearing invalid cache of resource ${resource}`);
      this.clearCacheForResource(resource);
    }
  }
};

export default AuthenticationContext;
