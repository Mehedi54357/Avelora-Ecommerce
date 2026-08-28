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
exports.QrAdminController = void 0;
const common_1 = require("@nestjs/common");
const qr_service_1 = require("./qr.service");
const auth_guard_1 = require("../auth/auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_schema_1 = require("../../schemas/user.schema");
const orders_service_1 = require("../orders/orders.service");
let QrAdminController = class QrAdminController {
    constructor(qrService, ordersService) {
        this.qrService = qrService;
        this.ordersService = ordersService;
    }
    async getProductQr(id) {
        return this.qrService.getOrCreateProductQr(id);
    }
    async issueOrderFulfillmentQr(id, req) {
        const adminId = req.user?.sub;
        return this.qrService.issueOrderFulfillmentQr(id, adminId);
    }
    async issueCustomerTrackingQr(id) {
        return this.qrService.issueCustomerTrackingQr(id);
    }
    async verifyScannedQr(body) {
        if (!body?.raw) {
            throw new common_1.BadRequestException('Scanned QR data is required');
        }
        return this.qrService.verifyScannedQr(body.raw);
    }
    async fulfillOrder(body, idempotencyKey, req) {
        if (!body?.raw) {
            throw new common_1.BadRequestException('Scanned QR payload is required');
        }
        const actorId = req.user?.sub;
        const actorRole = req.user?.role || 'STAFF';
        return this.qrService.fulfillOrderQr(body.raw, body.action || 'MARK_SHIPPED', actorId, actorRole, idempotencyKey, (orderId, nextStatus, actor, note) => this.ordersService.updateOrderStatus(orderId, nextStatus, undefined, actor, note));
    }
    async getScanEvents(limit, entityId, actorId) {
        return this.qrService.getScanEvents({ limit, entityId, actorId });
    }
};
exports.QrAdminController = QrAdminController;
__decorate([
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    (0, common_1.Post)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QrAdminController.prototype, "getProductQr", null);
__decorate([
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    (0, common_1.Post)('orders/:id/fulfillment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QrAdminController.prototype, "issueOrderFulfillmentQr", null);
__decorate([
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    (0, common_1.Post)('orders/:id/tracking'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QrAdminController.prototype, "issueCustomerTrackingQr", null);
__decorate([
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QrAdminController.prototype, "verifyScannedQr", null);
__decorate([
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    (0, common_1.Post)('fulfill'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('idempotency-key')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], QrAdminController.prototype, "fulfillOrder", null);
__decorate([
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('entityId')),
    __param(2, (0, common_1.Query)('actorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], QrAdminController.prototype, "getScanEvents", null);
exports.QrAdminController = QrAdminController = __decorate([
    (0, common_1.Controller)('admin/qr'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [qr_service_1.QrService,
        orders_service_1.OrdersService])
], QrAdminController);
//# sourceMappingURL=qr-admin.controller.js.map