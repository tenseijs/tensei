"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("../utils");
function handleLogout(request, response) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        request.session.destroy();
        yield utils_1.tensei.auth().logout();
        response.status(204).json({});
    });
}
exports.default = handleLogout;
//# sourceMappingURL=logout.js.map