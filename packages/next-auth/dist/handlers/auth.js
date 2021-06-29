"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAuth = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../utils");
const login_1 = tslib_1.__importDefault(require("./login"));
const logout_1 = tslib_1.__importDefault(require("./logout"));
const signup_1 = tslib_1.__importDefault(require("./signup"));
const check_session_1 = tslib_1.__importDefault(require("./check-session"));
const social_callback_1 = tslib_1.__importDefault(require("./social-callback"));
function handleAuth() {
    return function (request, response) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let { auth } = request.query;
            auth = Array.isArray(auth) ? auth[0] : auth;
            const invoke = (handler) => utils_1.wrapErrorHandling(utils_1.withSession(handler))(request, response);
            switch (auth) {
                case 'login':
                    return invoke(login_1.default);
                case 'logout':
                    return invoke(logout_1.default);
                case 'check-session':
                    return invoke(check_session_1.default);
                case 'signup':
                    return invoke(signup_1.default);
                case 'social':
                    return invoke(social_callback_1.default);
                default:
                    response.status(404).end();
            }
        });
    };
}
exports.handleAuth = handleAuth;
//# sourceMappingURL=auth.js.map