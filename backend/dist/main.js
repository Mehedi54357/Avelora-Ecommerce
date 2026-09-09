"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const helmet_1 = __importDefault(require("helmet"));
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
                imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://images.unsplash.com'],
                connectSrc: ["'self'", 'https://res.cloudinary.com', 'http://localhost:*', 'https://*.vercel.app'],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    const frontendEnv = process.env.FRONTEND_URL || 'http://localhost:3000';
    const configuredOrigins = frontendEnv
        .split(',')
        .map((u) => u.trim().replace(/\/+$/, ''))
        .filter(Boolean);
    const allowedOriginsSet = new Set(configuredOrigins);
    allowedOriginsSet.add('http://localhost:3000');
    allowedOriginsSet.add('http://127.0.0.1:3000');
    allowedOriginsSet.add('https://avelora-ecommerce.vercel.app');
    for (const origin of configuredOrigins) {
        if (origin.startsWith('https://') && !origin.includes('localhost')) {
            if (origin.startsWith('https://www.')) {
                allowedOriginsSet.add(origin.replace('https://www.', 'https://'));
            }
            else {
                allowedOriginsSet.add(origin.replace('https://', 'https://www.'));
            }
        }
    }
    const allowedOrigins = Array.from(allowedOriginsSet);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            try {
                const originUrl = new URL(origin);
                if (originUrl.hostname.endsWith('.vercel.app') ||
                    originUrl.hostname === 'localhost' ||
                    originUrl.hostname === '127.0.0.1') {
                    return callback(null, true);
                }
                for (const allowed of allowedOrigins) {
                    if (allowed.startsWith('https://')) {
                        const allowedUrl = new URL(allowed);
                        if (originUrl.hostname === allowedUrl.hostname || originUrl.hostname.endsWith(`.${allowedUrl.hostname}`)) {
                            return callback(null, true);
                        }
                    }
                }
            }
            catch { }
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cookie',
            'X-Requested-With',
            'Accept',
            'Idempotency-Key',
            'idempotency-key',
        ],
        exposedHeaders: ['Set-Cookie', 'Idempotency-Key'],
    });
    app.setGlobalPrefix('api', {
        exclude: ['health'],
    });
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`AVELORA Backend API listening on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map