"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("../utils");
function handleCheckSession(request, response) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const auth = request.session.get('auth');
        if (!auth || !auth.refresh_token) {
            return response.status(200).json({});
        }
        let apiResponse;
        try {
            apiResponse = yield utils_1.tensei.auth().refreshToken({
                token: auth.refresh_token,
            });
        }
        catch (error) {
            // Terminate the existing session.
            request.session.destroy();
            return response.status(200).json({});
        }
        request.session.set('auth', {
            refresh_token: apiResponse.data.data.refresh_token,
            access_token_expires_at: utils_1.getAccessTokenExpiryTimeStamp(apiResponse.data.data.expires_in),
        });
        yield request.session.save();
        return response.status(200).json(utils_1.prepareAuthData(apiResponse.data.data));
    });
}
exports.default = handleCheckSession;
//# sourceMappingURL=check-session.js.map