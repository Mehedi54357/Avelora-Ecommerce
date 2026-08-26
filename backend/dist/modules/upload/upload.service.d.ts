import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    private readonly logger;
    private isConfigured;
    constructor(configService: ConfigService);
    uploadImage(fileData: string, folder?: string): Promise<{
        url: string;
        public_id: string;
    }>;
}
