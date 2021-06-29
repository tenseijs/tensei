"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectIfAuthenticated = exports.mustBeAuthenticated = exports.useAuth = exports.UserProvider = exports.handleAuth = void 0;
var auth_1 = require("./handlers/auth");
Object.defineProperty(exports, "handleAuth", { enumerable: true, get: function () { return auth_1.handleAuth; } });
// export { UserContext } from './frontend/use-user'
var use_auth_1 = require("./frontend/use-auth");
Object.defineProperty(exports, "UserProvider", { enumerable: true, get: function () { return use_auth_1.UserProvider; } });
Object.defineProperty(exports, "useAuth", { enumerable: true, get: function () { return use_auth_1.useAuth; } });
var must_be_authenticated_1 = require("./must-be-authenticated");
Object.defineProperty(exports, "mustBeAuthenticated", { enumerable: true, get: function () { return must_be_authenticated_1.mustBeAuthenticated; } });
var redirect_if_authenticated_1 = require("./redirect-if-authenticated");
Object.defineProperty(exports, "redirectIfAuthenticated", { enumerable: true, get: function () { return redirect_if_authenticated_1.redirectIfAuthenticated; } });
//# sourceMappingURL=index.js.map