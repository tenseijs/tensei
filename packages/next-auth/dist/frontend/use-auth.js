"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProvider = exports.useAuth = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const utils_1 = require("../utils");
const UserContextDefaultData = {
    loading: true,
    setAuth() { },
    logout() { },
    config: {
        loginPath: utils_1.getLoginUrl()
    }
};
const UserContext = react_1.createContext(UserContextDefaultData);
const useAuth = () => {
    return react_1.useContext(UserContext);
};
exports.useAuth = useAuth;
const UserProvider = ({ children }) => {
    const [loading, setLoading] = react_1.useState(true);
    const [auth, setAuth] = react_1.useState();
    const checkSession = () => {
        fetch('/api/auth/check-session')
            .then(response => response.json())
            .then((data) => {
            // Set an interval to dynamically call the API and call /api/auth/check-session
            setAuth(Object.assign(Object.assign({}, auth), data));
            setLoading(false);
        });
    };
    const logout = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield fetch('/api/auth/logout');
        setAuth(Object.assign(Object.assign({}, auth), { access_token: undefined, expires_in: undefined, user: undefined }));
    });
    react_1.useEffect(() => {
        checkSession();
    }, []);
    const delay = (auth === null || auth === void 0 ? void 0 : auth.expires_in) ? (auth.expires_in - 10) * 1000 : 60 * 14 * 1000;
    useInterval(() => {
        checkSession();
        // Stop the interval if there's no user.
    }, (auth === null || auth === void 0 ? void 0 : auth.user) ? delay : null);
    return (react_1.default.createElement(UserContext.Provider, { value: Object.assign(Object.assign({}, auth), { loading,
            setAuth,
            logout }) }, children));
};
exports.UserProvider = UserProvider;
function useInterval(callback, delay) {
    const savedCallback = react_1.useRef(callback);
    // Remember the latest callback if it changes.
    react_1.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    // Set up the interval.
    react_1.useEffect(() => {
        // Don't schedule if no delay is specified.
        if (delay === null) {
            return undefined;
        }
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}
exports.default = useInterval;
//# sourceMappingURL=use-auth.js.map