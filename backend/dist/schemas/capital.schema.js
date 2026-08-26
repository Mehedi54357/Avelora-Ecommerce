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
exports.CapitalTransactionSchema = exports.CapitalTransaction = exports.CapitalTransactionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var CapitalTransactionType;
(function (CapitalTransactionType) {
    CapitalTransactionType["OWNER_CAPITAL_IN"] = "OWNER_CAPITAL_IN";
    CapitalTransactionType["OWNER_WITHDRAWAL"] = "OWNER_WITHDRAWAL";
    CapitalTransactionType["LOAN_IN"] = "LOAN_IN";
    CapitalTransactionType["LOAN_REPAYMENT"] = "LOAN_REPAYMENT";
})(CapitalTransactionType || (exports.CapitalTransactionType = CapitalTransactionType = {}));
let CapitalTransaction = class CapitalTransaction {
    type;
    amount;
    source;
    account;
    date;
    reference;
    notes;
    recordedBy;
};
exports.CapitalTransaction = CapitalTransaction;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(CapitalTransactionType),
        index: true,
    }),
    __metadata("design:type", String)
], CapitalTransaction.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], CapitalTransaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'Owner' }),
    __metadata("design:type", String)
], CapitalTransaction.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'Bank' }),
    __metadata("design:type", String)
], CapitalTransaction.prototype, "account", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], CapitalTransaction.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], CapitalTransaction.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], CapitalTransaction.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'ADMIN' }),
    __metadata("design:type", String)
], CapitalTransaction.prototype, "recordedBy", void 0);
exports.CapitalTransaction = CapitalTransaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CapitalTransaction);
exports.CapitalTransactionSchema = mongoose_1.SchemaFactory.createForClass(CapitalTransaction);
exports.CapitalTransactionSchema.index({ type: 1, date: -1 });
exports.CapitalTransactionSchema.index({ date: -1 });
//# sourceMappingURL=capital.schema.js.map