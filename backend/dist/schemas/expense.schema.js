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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseSchema = exports.Expense = exports.ExpenseCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["DELIVERY_COST"] = "Delivery Cost";
    ExpenseCategory["PACKAGING_COST"] = "Packaging Cost";
    ExpenseCategory["PAYMENT_FEE"] = "Payment Fee";
    ExpenseCategory["MARKETING_EXPENSE"] = "Marketing Expense";
    ExpenseCategory["OTHER_EXPENSE"] = "Other Operating Expense";
})(ExpenseCategory || (exports.ExpenseCategory = ExpenseCategory = {}));
let Expense = class Expense {
    title;
    category;
    amount;
    date;
    description;
};
exports.Expense = Expense;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Expense.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ExpenseCategory, default: ExpenseCategory.OTHER_EXPENSE }),
    __metadata("design:type", String)
], Expense.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Expense.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Expense.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Expense.prototype, "description", void 0);
exports.Expense = Expense = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Expense);
exports.ExpenseSchema = mongoose_1.SchemaFactory.createForClass(Expense);
exports.ExpenseSchema.index({ date: -1 });
exports.ExpenseSchema.index({ category: 1 });
//# sourceMappingURL=expense.schema.js.map