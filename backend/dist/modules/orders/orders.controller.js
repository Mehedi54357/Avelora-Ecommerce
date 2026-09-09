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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const auth_guard_1 = require("../auth/auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_schema_1 = require("../../schemas/user.schema");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async checkout(body) {
        return this.ordersService.checkout(body);
    }
    async trackOrder(orderId, mobile) {
        return this.ordersService.trackOrder(orderId, mobile);
    }
    async getAdminOrders(status, paymentStatus, fulfillmentMethod, dataMode, courier, dateRange, startDate, endDate, search, page, limit) {
        return this.ordersService.getAdminOrders({
            status,
            paymentStatus,
            fulfillmentMethod,
            dataMode,
            courier,
            dateRange,
            startDate,
            endDate,
            search,
            page,
            limit,
        });
    }
    async getOrderById(id) {
        return this.ordersService.getOrderById(id);
    }
    async updateStatus(id, body, req) {
        const actor = req.user?.name || req.user?.role || 'STAFF';
        return this.ordersService.updateOrderStatus(id, body.status, body.paymentStatus, actor, body.note);
    }
    async updateFulfillmentMethod(id, body, req) {
        const actorId = req.user?.sub;
        const actor = req.user?.name || req.user?.role || 'ADMIN';
        return this.ordersService.updateFulfillmentMethod(id, body.fulfillmentMethod, actorId, actor);
    }
    async confirmDirectDelivery(id, body, req) {
        const actorId = req.user?.sub;
        const actor = req.user?.name || req.user?.role || 'ADMIN';
        return this.ordersService.confirmDirectDelivery(id, body, actorId, actor);
    }
    async confirmCustomerPickup(id, body, req) {
        const actorId = req.user?.sub;
        const actor = req.user?.name || req.user?.role || 'ADMIN';
        return this.ordersService.confirmCustomerPickup(id, body, actorId, actor);
    }
    async recordPayment(id, body, req) {
        const actorId = req.user?.sub;
        const actor = req.user?.name || req.user?.role || 'ADMIN';
        return this.ordersService.recordOrderPayment(id, body, actorId, actor);
    }
    async resetTestOrder(id, req) {
        const actorId = req.user?.sub;
        const actor = req.user?.name || req.user?.role || 'ADMIN';
        return this.ordersService.resetTestOrder(id, actorId, actor);
    }
    async deleteTestOrder(id, req) {
        const actorId = req.user?.sub;
        return this.ordersService.deleteTestOrder(id, actorId);
    }
    async updatePaymentDetails(id, body) {
        return this.ordersService.updatePaymentDetails(id, body);
    }
    async updateCourier(id, body) {
        return this.ordersService.updateCourierDetails(id, body);
    }
    async processReturn(id, body, req) {
        const actorId = req.user?.sub;
        return this.ordersService.processReturn(id, { ...body, actorId });
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "checkout", null);
__decorate([
    (0, common_1.Get)('track'),
    __param(0, (0, common_1.Query)('orderId')),
    __param(1, (0, common_1.Query)('mobile')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "trackOrder", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('paymentStatus')),
    __param(2, (0, common_1.Query)('fulfillmentMethod')),
    __param(3, (0, common_1.Query)('dataMode')),
    __param(4, (0, common_1.Query)('courier')),
    __param(5, (0, common_1.Query)('dateRange')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __param(8, (0, common_1.Query)('search')),
    __param(9, (0, common_1.Query)('page')),
    __param(10, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAdminOrders", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Patch)('admin/:id/status'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('admin/:id/fulfillment-method'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateFulfillmentMethod", null);
__decorate([
    (0, common_1.Post)('admin/:id/confirm-direct-delivery'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "confirmDirectDelivery", null);
__decorate([
    (0, common_1.Post)('admin/:id/confirm-customer-pickup'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "confirmCustomerPickup", null);
__decorate([
    (0, common_1.Post)('admin/:id/record-payment'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Post)('admin/:id/reset-test'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "resetTestOrder", null);
__decorate([
    (0, common_1.Delete)('admin/:id/test'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteTestOrder", null);
__decorate([
    (0, common_1.Patch)('admin/:id/payment'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updatePaymentDetails", null);
__decorate([
    (0, common_1.Patch)('admin/:id/courier'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER, user_schema_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateCourier", null);
__decorate([
    (0, common_1.Post)('admin/:id/return'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.SUPER_ADMIN, user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "processReturn", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map