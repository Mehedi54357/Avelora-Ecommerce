"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const finance_service_1 = require("./finance.service");
const finance_controller_1 = require("./finance.controller");
const expense_schema_1 = require("../../schemas/expense.schema");
const order_schema_1 = require("../../schemas/order.schema");
const product_schema_1 = require("../../schemas/product.schema");
const supplier_schema_1 = require("../../schemas/supplier.schema");
const purchase_schema_1 = require("../../schemas/purchase.schema");
const capital_schema_1 = require("../../schemas/capital.schema");
const courier_settlement_schema_1 = require("../../schemas/courier-settlement.schema");
const payment_schema_1 = require("../../schemas/payment.schema");
const return_request_schema_1 = require("../../schemas/return-request.schema");
const category_schema_1 = require("../../schemas/category.schema");
const inventory_transaction_schema_1 = require("../../schemas/inventory-transaction.schema");
const auth_module_1 = require("../auth/auth.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
let FinanceModule = class FinanceModule {
};
exports.FinanceModule = FinanceModule;
exports.FinanceModule = FinanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: expense_schema_1.Expense.name, schema: expense_schema_1.ExpenseSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: supplier_schema_1.Supplier.name, schema: supplier_schema_1.SupplierSchema },
                { name: purchase_schema_1.PurchaseOrder.name, schema: purchase_schema_1.PurchaseOrderSchema },
                { name: capital_schema_1.CapitalTransaction.name, schema: capital_schema_1.CapitalTransactionSchema },
                { name: courier_settlement_schema_1.CourierSettlement.name, schema: courier_settlement_schema_1.CourierSettlementSchema },
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
                { name: return_request_schema_1.ReturnRequest.name, schema: return_request_schema_1.ReturnRequestSchema },
                { name: inventory_transaction_schema_1.InventoryTransaction.name, schema: inventory_transaction_schema_1.InventoryTransactionSchema },
            ]),
            auth_module_1.AuthModule,
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [finance_controller_1.FinanceController],
        providers: [finance_service_1.FinanceService],
        exports: [finance_service_1.FinanceService],
    })
], FinanceModule);
//# sourceMappingURL=finance.module.js.map