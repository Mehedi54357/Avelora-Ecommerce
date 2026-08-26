"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const qr_token_service_1 = require("./qr-token.service");
const qr_service_1 = require("./qr.service");
const qr_controller_1 = require("./qr.controller");
const qr_admin_controller_1 = require("./qr-admin.controller");
const qr_token_schema_1 = require("../../schemas/qr-token.schema");
const qr_scan_event_schema_1 = require("../../schemas/qr-scan-event.schema");
const idempotency_key_schema_1 = require("../../schemas/idempotency-key.schema");
const product_schema_1 = require("../../schemas/product.schema");
const order_schema_1 = require("../../schemas/order.schema");
const orders_module_1 = require("../orders/orders.module");
const auth_module_1 = require("../auth/auth.module");
let QrModule = class QrModule {
};
exports.QrModule = QrModule;
exports.QrModule = QrModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: qr_token_schema_1.QrToken.name, schema: qr_token_schema_1.QrTokenSchema },
                { name: qr_scan_event_schema_1.QrScanEvent.name, schema: qr_scan_event_schema_1.QrScanEventSchema },
                { name: idempotency_key_schema_1.IdempotencyKey.name, schema: idempotency_key_schema_1.IdempotencyKeySchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
            ]),
            (0, common_1.forwardRef)(() => orders_module_1.OrdersModule),
            auth_module_1.AuthModule,
        ],
        providers: [qr_token_service_1.QrTokenService, qr_service_1.QrService],
        controllers: [qr_controller_1.QrController, qr_admin_controller_1.QrAdminController],
        exports: [qr_token_service_1.QrTokenService, qr_service_1.QrService],
    })
], QrModule);
//# sourceMappingURL=qr.module.js.map