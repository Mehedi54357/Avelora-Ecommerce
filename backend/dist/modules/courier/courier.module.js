"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourierModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const pathao_service_1 = require("./pathao.service");
const courier_controller_1 = require("./courier.controller");
const pathao_token_schema_1 = require("../../schemas/pathao-token.schema");
const order_schema_1 = require("../../schemas/order.schema");
const settings_schema_1 = require("../../schemas/settings.schema");
const audit_log_module_1 = require("../audit-log/audit-log.module");
let CourierModule = class CourierModule {
};
exports.CourierModule = CourierModule;
exports.CourierModule = CourierModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: pathao_token_schema_1.PathaoToken.name, schema: pathao_token_schema_1.PathaoTokenSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: settings_schema_1.Settings.name, schema: settings_schema_1.SettingsSchema },
            ]),
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [courier_controller_1.CourierController],
        providers: [pathao_service_1.PathaoService],
        exports: [pathao_service_1.PathaoService],
    })
], CourierModule);
//# sourceMappingURL=courier.module.js.map