#86 (thanks to @balanza)
Adal SDK update to latest (1.0.18). Furthermore, I included a simple script to automatically fetch latest from github and clone it in our code.

Allow extra parameters while fetching token. This is to comply with SDK's acquireTokenRedirect and acquireTokenPopup signatures (with the latter being broken before the fix).

Using loginResource to check login token instead of clientId. This because SDK's AuthenticationContext constructor already handles missing loginResource by value it as clientId. Thus it can now cover both scenario: with both loginResource and clientId and only clientId provided.


#33 https://github.com/salvoravida/react-adal/issues/33

login ok - permission failed fix
