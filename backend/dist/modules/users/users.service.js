"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("../../schemas/user.schema");
let UsersService = UsersService_1 = class UsersService {
    userModel;
    configService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userModel, configService) {
        this.userModel = userModel;
        this.configService = configService;
    }
    async onModuleInit() {
        await this.seedSuperAdmin();
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
    }
    async findById(id) {
        return this.userModel.findById(id).select('-passwordHash').exec();
    }
    async findByEmailOrId(identifier) {
        if (identifier.includes('@')) {
            return this.userModel.findOne({ email: identifier.toLowerCase().trim() }).exec();
        }
        return this.userModel.findById(identifier).exec();
    }
    async findAllUsers() {
        return this.userModel.find().select('-passwordHash').sort({ createdAt: -1 }).exec();
    }
    async createUser(data) {
        const existing = await this.findByEmail(data.email);
        if (existing) {
            throw new Error(`User with email "${data.email}" already exists`);
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        return this.userModel.create({
            name: data.name,
            email: data.email.toLowerCase().trim(),
            phone: data.phone,
            passwordHash,
            role: data.role || user_schema_1.UserRole.STAFF,
            isActive: true,
        });
    }
    async updateUserRole(id, role) {
        return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash').exec();
    }
    async toggleUserActive(id, isActive) {
        return this.userModel.findByIdAndUpdate(id, { isActive }, { new: true }).select('-passwordHash').exec();
    }
    async seedSuperAdmin() {
        const existingAdmin = await this.userModel.findOne({ role: user_schema_1.UserRole.SUPER_ADMIN });
        if (!existingAdmin) {
            const email = this.configService.get('INITIAL_ADMIN_EMAIL') || 'admin@avelora.com';
            const password = this.configService.get('INITIAL_ADMIN_PASSWORD') || 'admin123';
            const passwordHash = await bcrypt.hash(password, 10);
            await this.userModel.create({
                name: 'Super Admin',
                email: email.toLowerCase().trim(),
                passwordHash,
                role: user_schema_1.UserRole.SUPER_ADMIN,
                isActive: true,
            });
            this.logger.log(`Initialized default SUPER_ADMIN account: ${email}`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map