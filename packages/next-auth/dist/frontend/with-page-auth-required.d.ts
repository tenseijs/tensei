import React, { ComponentType } from 'react';
export interface MustBeAuthenticatedOptions {
    redirectTo?: string;
}
export declare type MustBeAuthenticated = <P>(Component: ComponentType<P>, options?: MustBeAuthenticatedOptions) => React.FC<Omit<P, 'user'>>;
export declare const mustBeAuthenticated: MustBeAuthenticated;
//# sourceMappingURL=with-page-auth-required.d.ts.map