"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustBeAuthenticated = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const must_be_authenticated_1 = require("./frontend/must-be-authenticated");
const mustBeAuthenticated = (optsOrComponent) => {
    if (typeof optsOrComponent === 'function') {
        return must_be_authenticated_1.mustBeAuthenticated(optsOrComponent);
    }
    const { getServerSideProps } = optsOrComponent || {};
    return utils_1.withSession(function (ctx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const auth = ctx.req.session.get('auth');
            if (!auth) {
                // user is not authentication
                return {
                    redirect: {
                        statusCode: 301,
                        destination: utils_1.getLoginUrl(),
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
exports.mustBeAuthenticated = mustBeAuthenticated;
//# sourceMappingURL=must-be-authenticated.js.map