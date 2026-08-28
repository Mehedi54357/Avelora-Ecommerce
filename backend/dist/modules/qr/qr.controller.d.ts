import { QrService } from './qr.service';
export declare class QrController {
    private readonly qrService;
    constructor(qrService: QrService);
    resolveProduct(publicCode: string): Promise<{
        id: string;
        name: string;
        slug: string;
    }>;
    resolveOrderTracking(body: {
        token: string;
    }): Promise<{
        success: boolean;
        order: any;
    }>;
}
