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
exports.AuthChallengeSchema = exports.AuthChallenge = exports.ChallengePurpose = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ChallengePurpose;
(function (ChallengePurpose) {
    ChallengePurpose["ADMIN_LOGIN_OTP"] = "ADMIN_LOGIN_OTP";
    ChallengePurpose["PASSWORD_RESET"] = "PASSWORD_RESET";
})(ChallengePurpose || (exports.ChallengePurpose = ChallengePurpose = {}));
let AuthChallenge = class AuthChallenge {
};
exports.AuthChallenge = AuthChallenge;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "challengeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AuthChallenge.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "otpHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ChallengePurpose, default: ChallengePurpose.ADMIN_LOGIN_OTP }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "purpose", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: { expires: 0 } }),
    __metadata("design:type", Date)
], AuthChallenge.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], AuthChallenge.prototype, "attempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 5 }),
    __metadata("design:type", Number)
], AuthChallenge.prototype, "maxAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], AuthChallenge.prototype, "resendAvailableAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], AuthChallenge.prototype, "isConsumed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], AuthChallenge.prototype, "consumedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "userAgent", void 0);
exports.AuthChallenge = AuthChallenge = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AuthChallenge);
exports.AuthChallengeSchema = mongoose_1.SchemaFactory.createForClass(AuthChallenge);
//# sourceMappingURL=auth-challenge.schema.js.map