import { Session } from 'next-iron-session';
import { NextApiRequest, NextApiResponse } from 'next';
export declare type NextIronRequest = NextApiRequest & {
    session: Session;
};
export declare type NextIronHandler = (req: NextIronRequest, res: NextApiResponse) => void | Promise<void>;
export declare const prepareAuthData: (payload: any) => any;
export declare const getAccessTokenExpiryTimeStamp: (seconds: number) => Date;
export declare const tensei: any;
export declare function getLoginUrl(): string;
export declare function getProfileUrl(): string;
export declare const wrapErrorHandling: (fn: NextIronHandler) => NextIronHandler;
export declare const withSession: (handler: NextIronHandler) => NextIronHandler;
//# sourceMappingURL=utils.d.ts.map