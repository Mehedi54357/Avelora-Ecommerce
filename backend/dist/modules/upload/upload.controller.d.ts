import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadImage(body: {
        image: string;
        folder?: string;
    }): Promise<{
        url: string;
        public_id: string;
    }>;
}
