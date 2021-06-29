import React, { ComponentType } from 'react';
export interface RedirectIfAuthenticatedOptions {
    redirectTo?: string;
}
export declare type RedirectIfAuthenticated = <P>(Component: ComponentType<P>, options?: RedirectIfAuthenticatedOptions) => React.FC<Omit<P, 'user'>>;
export declare const redirectIfAuthenticated: RedirectIfAuthenticated;
//# sourceMappingURL=redirect-if-authenticated.d.ts.map