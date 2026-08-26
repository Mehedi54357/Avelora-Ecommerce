"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapitalController = void 0;
const common_1 = require("@nestjs/common");
const capital_service_1 = require("./capital.service");
const auth_guard_1 = require("../auth/auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_schema_1 = require("../../schemas/user.schema");
let CapitalController = class CapitalController {
    capitalService;
    constructor(capitalService) {
        this.capitalService = capitalService;
    }
    async getSummary() {
        return this.capitalService.getCapitalSummary();
    }
    async getTransactions(query) {
        return this.capitalService.getTransactions(query);
    }
    async createTransaction(body, req) {
        const actor = req.user?.email || 'ADMIN';
        return this.capitalService.createTransaction(body, actor);
    }
    async deleteTransaction(id, req) {
        const actor = req.user?.email || 'ADMIN';
        return this.capitalService.deleteTransaction(id, actor);
    }
};
exports.CapitalController = CapitalController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CapitalController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CapitalController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('transactions'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CapitalController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Delete)('transactions/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CapitalController.prototype, "deleteTransaction", null);
exports.CapitalController = CapitalController = __decorate([
    (0, common_1.Controller)('admin/capital'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [capital_service_1.CapitalService])
], CapitalController);
//# sourceMappingURL=capital.controller.js.map