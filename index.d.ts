import * as AuthenticationContext from 'adal-angular';

declare module 'react-adal' {

    export function withAdalLogin (
        authContext: AuthenticationContext,
        resourceId: string
    ): any;  // TODO import React and set the return type to include 3 `React.Component`s.  

    export function runWithAdal(authContext: AuthenticationContext, callback: () => void, shouldLogin?: boolean): void; 
}