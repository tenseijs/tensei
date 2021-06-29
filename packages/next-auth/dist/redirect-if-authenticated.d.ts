import { ComponentType } from 'react';
import { GetServerSideProps } from 'next';
export declare type MustBeAuthenticatedOptions = {
    getServerSideProps?: GetServerSideProps;
};
export declare const redirectIfAuthenticated: (optsOrComponent: ComponentType<any> | MustBeAuthenticatedOptions) => import("./utils").NextIronHandler | import("react").FC<Omit<any, "user">>;
//# sourceMappingURL=redirect-if-authenticated.d.ts.map