"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProvider = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const UserContextDefaultData = {};
const UserContext = react_1.createContext(UserContextDefaultData);
const UserProvider = ({ children }) => {
    const checkSession = () => {
        fetch('/api/auth/check-session')
            .then(response => response.json())
            .then((data) => {
            console.log('@@@@@@', data);
        });
    };
    react_1.useEffect(() => {
        checkSession();
    }, []);
    return (react_1.default.createElement(UserContext.Provider, { value: {} }, children));
};
exports.UserProvider = UserProvider;
//# sourceMappingURL=use-user.js.map