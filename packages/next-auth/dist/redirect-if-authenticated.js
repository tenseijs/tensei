"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectIfAuthenticated = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const redirect_if_authenticated_1 = require("./frontend/redirect-if-authenticated");
const redirectIfAuthenticated = (optsOrComponent) => {
    if (typeof optsOrComponent === 'function') {
        return redirect_if_authenticated_1.redirectIfAuthenticated(optsOrComponent);
    }
    const { getServerSideProps } = optsOrComponent || {};
    return utils_1.withSession(function (ctx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const auth = ctx.req.session.get('auth');
            if (auth) {
                // user is not authentication
                return {
                    redirect: {
                        statusCode: 301,
                        destination: utils_1.getProfileUrl(),
                    },
                };
            }
            let response = {
                props: {},
            };
            if (getServerSideProps) {
                response = yield getServerSideProps(ctx);
            }
            return response;
        });
    });
};
exports.redirectIfAuthenticated = redirectIfAuthenticated;
//# sourceMappingURL=redirect-if-authenticated.js.map