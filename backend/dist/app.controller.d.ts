import { AppService } from './app.service';
import { Connection } from 'mongoose';
export declare class AppController {
    private readonly appService;
    private readonly connection;
    constructor(appService: AppService, connection: Connection);
    getHello(): string;
    getHealth(): {
        status: string;
        service: string;
        database: string;
        timestamp: string;
        uptime: number;
    };
}
