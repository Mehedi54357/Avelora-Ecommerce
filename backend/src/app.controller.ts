import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Health Check Endpoint (Excluded from /api global prefix in main.ts)
  @Get('health')
  getHealth() {
    const mongoState = this.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const isDbConnected = mongoState === 1;

    return {
      status: isDbConnected ? 'ok' : 'degraded',
      service: 'AVELORA Luxury E-Commerce API',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
