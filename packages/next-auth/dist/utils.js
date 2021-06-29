"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSession = exports.wrapErrorHandling = exports.getProfileUrl = exports.getLoginUrl = exports.tensei = exports.getAccessTokenExpiryTimeStamp = exports.prepareAuthData = void 0;
const tslib_1 = require("tslib");
const sdk_1 = require("@tensei/sdk");
const next_iron_session_1 = require("next-iron-session");
const prepareAuthData = (payload) => {
    const { refresh_token } = payload, rest = tslib_1.__rest(payload, ["refresh_token"]);
    return rest;
};
exports.prepareAuthData = prepareAuthData;
const getAccessTokenExpiryTimeStamp = (seconds) => {
    const now = new Date();
    now.setSeconds(now.getSeconds() + seconds);
    return now;
};
exports.getAccessTokenExpiryTimeStamp = getAccessTokenExpiryTimeStamp;
exports.tensei = sdk_1.sdk({
    url: process.env.TENSEI_API_URL,
});
function getLoginUrl() {
    return process.env.NEXT_LOGIN_PATH || '/login';
}
exports.getLoginUrl = getLoginUrl;
function getProfileUrl() {
    return process.env.NEXT_REDIRECT_IF_AUTHENTICATED_PATH || '/profile';
}
exports.getProfileUrl = getProfileUrl;
const wrapErrorHandling = (fn) => {
    return (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            yield fn(req, res);
        }
        catch (error) {
            console.error(error);
            res
                .status(((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) || error.status || 500)
                .json(((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            res.end();
        }
    });
};
exports.wrapErrorHandling = wrapErrorHandling;
const withSession = (handler) => {
    return next_iron_session_1.withIronSession(handler, {
        password: process.env.SECRET_COOKIE_PASSWORD,
        cookieName: 'session/tensei',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
        },
    });
};
exports.withSession = withSession;
//# sourceMappingURL=utils.js.map