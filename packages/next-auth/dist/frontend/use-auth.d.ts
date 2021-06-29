import { FunctionComponent } from 'react';
interface AuthConfig {
    loginPath?: string;
}
interface UserContextData {
    user?: import('@tensei/sdk').User;
    expires_in?: number;
    access_token?: string;
    loading: boolean;
    setAuth: (auth: UserContextData) => void;
    logout: () => void;
    config: AuthConfig;
}
export declare const useAuth: () => UserContextData;
export declare const UserProvider: FunctionComponent;
declare function useInterval(callback: () => void, delay: number | null): void;
export default useInterval;
//# sourceMappingURL=use-auth.d.ts.map