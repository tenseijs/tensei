"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPageAuthRequired = void 0;
const tslib_1 = require("tslib");
const router_1 = require("next/router");
const react_1 = tslib_1.__importStar(require("react"));
const use_auth_1 = require("./frontend/use-auth");
const withPageAuthRequired = (Component, options = {}) => {
    return function withPageAuthRequired(props) {
        const { loading, user, config } = use_auth_1.useAuth();
        const router = router_1.useRouter();
        react_1.useEffect(() => {
            if (loading || user) {
                return;
            }
            router.push((options === null || options === void 0 ? void 0 : options.redirectTo) || config.loginPath);
        }, [loading, user]);
        if (user) {
            return (react_1.default.createElement(Component, Object.assign({ user: {} }, props)));
        }
        return null;
    };
};
exports.withPageAuthRequired = withPageAuthRequired;
//# sourceMappingURL=with-page-auth-required.js.map