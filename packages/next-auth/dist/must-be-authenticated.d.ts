import { ComponentType } from 'react';
import { GetServerSideProps } from 'next';
export declare type MustBeAuthenticatedOptions = {
    getServerSideProps?: GetServerSideProps;
};
export declare const mustBeAuthenticated: (optsOrComponent: ComponentType<any> | MustBeAuthenticatedOptions) => import("./utils").NextIronHandler | import("react").FC<Omit<any, "user">>;
//# sourceMappingURL=must-be-authenticated.d.ts.map