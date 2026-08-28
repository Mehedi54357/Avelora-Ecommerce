"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = exports.JwtAuthGuard = void 0;
const auth_guard_1 = require("./auth.guard");
Object.defineProperty(exports, "AuthGuard", { enumerable: true, get: function () { return auth_guard_1.AuthGuard; } });
class JwtAuthGuard extends auth_guard_1.AuthGuard {
}
exports.JwtAuthGuard = JwtAuthGuard;
//# sourceMappingURL=jwt-auth.guard.js.map