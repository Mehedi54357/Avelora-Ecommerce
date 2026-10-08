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
        mobile?: string;
    }, req: any): Promise<{
        success: boolean;
        isAuthorized: boolean;
        authorizationType: "ADMIN" | "CUSTOMER" | "ANONYMOUS";
        allowedActions: string[];
        order: any;
        orderSummary: any;
    }>;
}
