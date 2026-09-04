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
var DataManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../../schemas/product.schema");
const order_schema_1 = require("../../schemas/order.schema");
const inventory_transaction_schema_1 = require("../../schemas/inventory-transaction.schema");
const payment_schema_1 = require("../../schemas/payment.schema");
const return_request_schema_1 = require("../../schemas/return-request.schema");
const inventory_service_1 = require("../inventory/inventory.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let DataManagementService = DataManagementService_1 = class DataManagementService {
    constructor(productModel, orderModel, txnModel, paymentModel, returnModel, inventoryService, auditLogService) {
        this.productModel = productModel;
        this.orderModel = orderModel;
        this.txnModel = txnModel;
        this.paymentModel = paymentModel;
        this.returnModel = returnModel;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
        this.logger = new common_1.Logger(DataManagementService_1.name);
    }
    async getTestDataSummary() {
        const testProducts = await this.productModel
            .find({ dataMode: 'TEST' })
            .select('name slug salePrice status variants createdAt')
            .lean()
            .exec();
        const testOrders = await this.orderModel
            .find({ dataMode: 'TEST' })
            .select('orderId status paymentStatus fulfillmentMethod totalAmount paidAmount dueAmount createdAt')
            .lean()
            .exec();
        const testProductIds = testProducts.map((p) => p._id);
        const testOrderIds = testOrders.map((o) => o._id);
        const testOrderStrings = testOrders.map((o) => o.orderId);
        const [txnCount, paymentCount, returnCount] = await Promise.all([
            this.txnModel.countDocuments({
                $or: [
                    { productId: { $in: testProductIds } },
                    { orderId: { $in: testOrderStrings } },
                ],
            }).exec(),
            this.paymentModel.countDocuments({ orderId: { $in: testOrderIds } }).exec(),
            this.returnModel.countDocuments({ 'items.productId': { $in: testProductIds } }).exec(),
        ]);
        let testReservationsCount = 0;
        testProducts.forEach((p) => {
            (p.variants || []).forEach((v) => {
                testReservationsCount += Number(v.reservedQuantity || 0);
            });
        });
        return {
            testProductsCount: testProducts.length,
            testOrdersCount: testOrders.length,
            testTxnsCount: txnCount,
            testReservationsCount,
            testPaymentsCount: paymentCount,
            testReturnsCount: returnCount,
            testProducts,
            testOrders,
        };
    }
    async cleanupTestData(payload, actorId) {
        if (!payload.confirmationText || payload.confirmationText.trim() !== 'DELETE TEST DATA') {
            throw new common_1.BadRequestException('Confirmation text mismatch. You must type "DELETE TEST DATA" to proceed.');
        }
        let targetOrders = [];
        let targetProducts = [];
        if (payload.cleanAll) {
            targetOrders = await this.orderModel.find({ dataMode: 'TEST' }).exec();
            targetProducts = await this.productModel.find({ dataMode: 'TEST' }).exec();
        }
        else {
            if (Array.isArray(payload.selectedOrderIds) && payload.selectedOrderIds.length > 0) {
                targetOrders = await this.orderModel
                    .find({ _id: { $in: payload.selectedOrderIds }, dataMode: 'TEST' })
                    .exec();
            }
            if (Array.isArray(payload.selectedProductIds) && payload.selectedProductIds.length > 0) {
                targetProducts = await this.productModel
                    .find({ _id: { $in: payload.selectedProductIds }, dataMode: 'TEST' })
                    .exec();
            }
        }
        const deletedOrderIds = [];
        const deletedProductIds = [];
        for (const order of targetOrders) {
            for (const item of order.items) {
                try {
                    await this.inventoryService.releaseReservation(item.productId.toString(), item.sku, item.quantity, order.orderId);
                }
                catch (resErr) {
                    this.logger.warn(`Reservation release notice on test cleanup: ${resErr.message}`);
                }
            }
            await this.paymentModel.deleteMany({ orderId: order._id }).exec();
            await this.orderModel.findByIdAndDelete(order._id).exec();
            deletedOrderIds.push(order.orderId);
        }
        for (const product of targetProducts) {
            await this.txnModel.deleteMany({ productId: product._id }).exec();
            await this.productModel.findByIdAndDelete(product._id).exec();
            deletedProductIds.push(product.slug);
        }
        await this.auditLogService.logAction({
            adminId: actorId,
            action: 'TEST_DATA_BULK_CLEANUP',
            entityType: 'DATA_MANAGEMENT',
            entityId: 'TEST_DATA_STORE',
            oldData: {
                deletedOrders: deletedOrderIds,
                deletedProducts: deletedProductIds,
            },
        });
        return {
            success: true,
            deletedOrdersCount: deletedOrderIds.length,
            deletedProductsCount: deletedProductIds.length,
            message: `Cleaned up ${deletedOrdersCount(deletedOrderIds)} test orders and ${deletedProductsCount(deletedProductIds)} test products. Stock reservations reconciled.`,
        };
    }
};
exports.DataManagementService = DataManagementService;
exports.DataManagementService = DataManagementService = DataManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(2, (0, mongoose_1.InjectModel)(inventory_transaction_schema_1.InventoryTransaction.name)),
    __param(3, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(4, (0, mongoose_1.InjectModel)(return_request_schema_1.ReturnRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        inventory_service_1.InventoryService,
        audit_log_service_1.AuditLogService])
], DataManagementService);
function deletedOrdersCount(arr) {
    return arr.length;
}
function deletedProductsCount(arr) {
    return arr.length;
}
//# sourceMappingURL=data-management.service.js.map