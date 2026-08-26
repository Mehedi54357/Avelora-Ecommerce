"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const upload_module_1 = require("./modules/upload/upload.module");
const categories_module_1 = require("./modules/categories/categories.module");
const products_module_1 = require("./modules/products/products.module");
const orders_module_1 = require("./modules/orders/orders.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const customers_module_1 = require("./modules/customers/customers.module");
const finance_module_1 = require("./modules/finance/finance.module");
const seed_module_1 = require("./modules/seed/seed.module");
const qr_module_1 = require("./modules/qr/qr.module");
const coupons_module_1 = require("./modules/coupons/coupons.module");
const settings_module_1 = require("./modules/settings/settings.module");
const payments_module_1 = require("./modules/payments/payments.module");
const audit_log_module_1 = require("./modules/audit-log/audit-log.module");
const courier_module_1 = require("./modules/courier/courier.module");
const purchases_module_1 = require("./modules/purchases/purchases.module");
const capital_module_1 = require("./modules/capital/capital.module");
const user_schema_1 = require("./schemas/user.schema");
const customer_schema_1 = require("./schemas/customer.schema");
const category_schema_1 = require("./schemas/category.schema");
const product_schema_1 = require("./schemas/product.schema");
const order_schema_1 = require("./schemas/order.schema");
const payment_schema_1 = require("./schemas/payment.schema");
const audit_log_schema_1 = require("./schemas/audit-log.schema");
const inventory_transaction_schema_1 = require("./schemas/inventory-transaction.schema");
const expense_schema_1 = require("./schemas/expense.schema");
const qr_token_schema_1 = require("./schemas/qr-token.schema");
const qr_scan_event_schema_1 = require("./schemas/qr-scan-event.schema");
const idempotency_key_schema_1 = require("./schemas/idempotency-key.schema");
const coupon_schema_1 = require("./schemas/coupon.schema");
const delivery_zone_schema_1 = require("./schemas/delivery-zone.schema");
const settings_schema_1 = require("./schemas/settings.schema");
const return_request_schema_1 = require("./schemas/return-request.schema");
const supplier_schema_1 = require("./schemas/supplier.schema");
const purchase_schema_1 = require("./schemas/purchase.schema");
const capital_schema_1 = require("./schemas/capital.schema");
const courier_settlement_schema_1 = require("./schemas/courier-settlement.schema");
const pathao_token_schema_1 = require("./schemas/pathao-token.schema");
const review_schema_1 = require("./schemas/review.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 120,
                },
            ]),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('MONGO_URI') || 'mongodb://127.0.0.1:27017/avelora_dev',
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: customer_schema_1.Customer.name, schema: customer_schema_1.CustomerSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
                { name: audit_log_schema_1.AuditLog.name, schema: audit_log_schema_1.AuditLogSchema },
                { name: inventory_transaction_schema_1.InventoryTransaction.name, schema: inventory_transaction_schema_1.InventoryTransactionSchema },
                { name: expense_schema_1.Expense.name, schema: expense_schema_1.ExpenseSchema },
                { name: qr_token_schema_1.QrToken.name, schema: qr_token_schema_1.QrTokenSchema },
                { name: qr_scan_event_schema_1.QrScanEvent.name, schema: qr_scan_event_schema_1.QrScanEventSchema },
                { name: idempotency_key_schema_1.IdempotencyKey.name, schema: idempotency_key_schema_1.IdempotencyKeySchema },
                { name: coupon_schema_1.Coupon.name, schema: coupon_schema_1.CouponSchema },
                { name: delivery_zone_schema_1.DeliveryZone.name, schema: delivery_zone_schema_1.DeliveryZoneSchema },
                { name: settings_schema_1.Settings.name, schema: settings_schema_1.SettingsSchema },
                { name: return_request_schema_1.ReturnRequest.name, schema: return_request_schema_1.ReturnRequestSchema },
                { name: supplier_schema_1.Supplier.name, schema: supplier_schema_1.SupplierSchema },
                { name: purchase_schema_1.PurchaseOrder.name, schema: purchase_schema_1.PurchaseOrderSchema },
                { name: capital_schema_1.CapitalTransaction.name, schema: capital_schema_1.CapitalTransactionSchema },
                { name: courier_settlement_schema_1.CourierSettlement.name, schema: courier_settlement_schema_1.CourierSettlementSchema },
                { name: pathao_token_schema_1.PathaoToken.name, schema: pathao_token_schema_1.PathaoTokenSchema },
                { name: review_schema_1.Review.name, schema: review_schema_1.ReviewSchema },
            ]),
            audit_log_module_1.AuditLogModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            upload_module_1.UploadModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            inventory_module_1.InventoryModule,
            customers_module_1.CustomersModule,
            finance_module_1.FinanceModule,
            seed_module_1.SeedModule,
            qr_module_1.QrModule,
            coupons_module_1.CouponsModule,
            settings_module_1.SettingsModule,
            payments_module_1.PaymentsModule,
            courier_module_1.CourierModule,
            purchases_module_1.PurchasesModule,
            capital_module_1.CapitalModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map