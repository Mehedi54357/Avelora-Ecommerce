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
exports.CourierController = void 0;
const common_1 = require("@nestjs/common");
const pathao_service_1 = require("./pathao.service");
const auth_guard_1 = require("../auth/auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_schema_1 = require("../../schemas/user.schema");
let CourierController = class CourierController {
    constructor(pathaoService) {
        this.pathaoService = pathaoService;
    }
    async getConfig() {
        return this.pathaoService.getConfig();
    }
    async updateConfig(body, req) {
        const actorEmail = req.user?.email || 'ADMIN';
        return this.pathaoService.updateConfig(body, actorEmail);
    }
    async syncStores(req) {
        const actorEmail = req.user?.email || 'ADMIN';
        return this.pathaoService.syncStores(actorEmail);
    }
    async toggleIntegration(body, req) {
        const actorEmail = req.user?.email || 'ADMIN';
        return this.pathaoService.toggleIntegration(body.enabled, actorEmail);
    }
    async setDefaultStore(body, req) {
        const actorEmail = req.user?.email || 'ADMIN';
        return this.pathaoService.setDefaultStore(body.storeId, body.storeName, actorEmail);
    }
    async testConnection() {
        return this.pathaoService.testConnection();
    }
    async getStores() {
        return this.pathaoService.getStores();
    }
    async getCities() {
        return this.pathaoService.getCities();
    }
    async getZones(cityId) {
        return this.pathaoService.getZones(cityId);
    }
    async getAreas(zoneId) {
        return this.pathaoService.getAreas(zoneId);
    }
    async calculatePricePlan(body) {
        return this.pathaoService.calculatePricePlan(body);
    }
    async bookOrder(orderId, body, req) {
        const actorEmail = req.user?.email || 'ADMIN';
        return this.pathaoService.createOrder(orderId, body, actorEmail);
    }
    async syncOrderStatus(orderId, req) {
        const actorEmail = req.user?.email || 'ADMIN';
        return this.pathaoService.syncConsignmentStatus(orderId, actorEmail);
    }
};
exports.CourierController = CourierController;
__decorate([
    (0, common_1.Get)('pathao/config'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('pathao/config'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Post)('pathao/sync-stores'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "syncStores", null);
__decorate([
    (0, common_1.Post)('pathao/toggle'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "toggleIntegration", null);
__decorate([
    (0, common_1.Post)('pathao/default-store'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "setDefaultStore", null);
__decorate([
    (0, common_1.Post)('pathao/test'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Get)('pathao/stores'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "getStores", null);
__decorate([
    (0, common_1.Get)('pathao/cities'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "getCities", null);
__decorate([
    (0, common_1.Get)('pathao/cities/:cityId/zones'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('cityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "getZones", null);
__decorate([
    (0, common_1.Get)('pathao/zones/:zoneId/areas'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "getAreas", null);
__decorate([
    (0, common_1.Post)('pathao/price-plan'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "calculatePricePlan", null);
__decorate([
    (0, common_1.Post)('pathao/orders/:orderId/book'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "bookOrder", null);
__decorate([
    (0, common_1.Post)('pathao/orders/:orderId/sync'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "syncOrderStatus", null);
exports.CourierController = CourierController = __decorate([
    (0, common_1.Controller)('admin/courier'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [pathao_service_1.PathaoService])
], CourierController);
//# sourceMappingURL=courier.controller.js.map