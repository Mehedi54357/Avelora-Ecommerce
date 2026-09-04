"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const settings_service_1 = require("./settings.service");
const data_management_service_1 = require("./data-management.service");
const settings_controller_1 = require("./settings.controller");
const settings_schema_1 = require("../../schemas/settings.schema");
const delivery_zone_schema_1 = require("../../schemas/delivery-zone.schema");
const product_schema_1 = require("../../schemas/product.schema");
const order_schema_1 = require("../../schemas/order.schema");
const inventory_transaction_schema_1 = require("../../schemas/inventory-transaction.schema");
const payment_schema_1 = require("../../schemas/payment.schema");
const return_request_schema_1 = require("../../schemas/return-request.schema");
const auth_module_1 = require("../auth/auth.module");
const inventory_module_1 = require("../inventory/inventory.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
let SettingsModule = class SettingsModule {
};
exports.SettingsModule = SettingsModule;
exports.SettingsModule = SettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: settings_schema_1.Settings.name, schema: settings_schema_1.SettingsSchema },
                { name: delivery_zone_schema_1.DeliveryZone.name, schema: delivery_zone_schema_1.DeliveryZoneSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: inventory_transaction_schema_1.InventoryTransaction.name, schema: inventory_transaction_schema_1.InventoryTransactionSchema },
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
                { name: return_request_schema_1.ReturnRequest.name, schema: return_request_schema_1.ReturnRequestSchema },
            ]),
            auth_module_1.AuthModule,
            inventory_module_1.InventoryModule,
            audit_log_module_1.AuditLogModule,
        ],
        providers: [settings_service_1.SettingsService, data_management_service_1.DataManagementService],
        controllers: [settings_controller_1.SettingsController],
        exports: [settings_service_1.SettingsService, data_management_service_1.DataManagementService],
    })
], SettingsModule);
//# sourceMappingURL=settings.module.js.map