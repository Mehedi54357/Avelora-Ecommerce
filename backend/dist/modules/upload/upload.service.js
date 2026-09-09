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
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let UploadService = UploadService_1 = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UploadService_1.name);
        this.isConfigured = false;
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        if (cloudName && apiKey && apiSecret && apiKey !== 'your_api_key') {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            this.isConfigured = true;
            this.logger.log('Cloudinary initialized successfully');
        }
        else {
            this.logger.warn('Cloudinary credentials not provided or using defaults. Fallback local/data storage enabled.');
        }
    }
    async uploadImage(fileData, folder = 'avelora/products') {
        try {
            if (this.isConfigured) {
                const result = await cloudinary_1.v2.uploader.upload(fileData, {
                    folder,
                    resource_type: 'image',
                    quality: 'auto:good',
                    fetch_format: 'auto',
                });
                return {
                    url: result.secure_url,
                    public_id: result.public_id,
                };
            }
            else {
                return {
                    url: fileData,
                    public_id: `fallback_${Date.now()}`,
                };
            }
        }
        catch (error) {
            this.logger.error('Error uploading image to Cloudinary:', error);
            return {
                url: fileData,
                public_id: `fallback_${Date.now()}`,
            };
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map