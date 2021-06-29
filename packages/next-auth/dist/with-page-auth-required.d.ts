import React, { ComponentType } from 'react';
export interface WithPageAuthRequiredOptions {
    redirectTo?: string;
}
export declare type WithPageAuthRequired = <P>(Component: ComponentType<P>, options?: WithPageAuthRequiredOptions) => React.FC<Omit<P, 'user'>>;
export declare const withPageAuthRequired: WithPageAuthRequired;
//# sourceMappingURL=with-page-auth-required.d.ts.map