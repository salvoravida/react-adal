v. 0.5.0
-
+ update adal.js to 1.0.18

[PR86 (thanks to @balanza)](https://github.com/salvoravida/react-adal/pull/86)
* Adal SDK update to latest (1.0.18). Furthermore, I included a simple script to automatically fetch latest from github and clone it in our code.
* Allow extra parameters while fetching token. This is to comply with SDK's acquireTokenRedirect and acquireTokenPopup signatures (with the latter being broken before the fix).
* Using loginResource to check login token instead of clientId. This because SDK's AuthenticationContext constructor already handles missing loginResource by value it as clientId. Thus it can now cover both scenario: with both loginResource and clientId and only clientId provided.

[#33](https://github.com/salvoravida/react-adal/issues/33)
login ok - permission failed fix infinite loop

[#67](https://github.com/salvoravida/react-adal/issues/67)
fix SSR support withAdalLogin Hoc

[#68](https://github.com/salvoravida/react-adal/issues/68)
Clear the resource cache on new login  

```
v0.4.24
+upgrade to babel 7
+SSR support
+fix ie10

v0.4.22
!support old sid #issue 7
!withAdalLogin HOC componentWillMount deprecated removed
!withAdalLogin HOC check mounted before setState

v0.4.19
+support MFA redirect - merged pr

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
