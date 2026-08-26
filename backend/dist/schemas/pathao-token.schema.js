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
exports.PathaoTokenSchema = exports.PathaoToken = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let PathaoToken = class PathaoToken {
    key;
    accessToken;
    refreshToken;
    tokenType;
    expiresAt;
    selectedStore;
};
exports.PathaoToken = PathaoToken;
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'primary', unique: true }),
    __metadata("design:type", String)
], PathaoToken.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PathaoToken.prototype, "accessToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PathaoToken.prototype, "refreshToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PathaoToken.prototype, "tokenType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], PathaoToken.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: Object }),
    __metadata("design:type", Object)
], PathaoToken.prototype, "selectedStore", void 0);
exports.PathaoToken = PathaoToken = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PathaoToken);
exports.PathaoTokenSchema = mongoose_1.SchemaFactory.createForClass(PathaoToken);
//# sourceMappingURL=pathao-token.schema.js.map