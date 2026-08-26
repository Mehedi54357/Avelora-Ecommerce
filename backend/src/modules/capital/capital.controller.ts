import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CapitalService } from './capital.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('api/admin/capital')
@UseGuards(AuthGuard, RolesGuard)
export class CapitalController {
  constructor(private readonly capitalService: CapitalService) {}

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getSummary() {
    return this.capitalService.getCapitalSummary();
  }

  @Get('transactions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getTransactions(@Query() query: any) {
    return this.capitalService.getTransactions(query);
  }

  @Post('transactions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createTransaction(@Body() body: any, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.capitalService.createTransaction(body, actor);
  }

  @Delete('transactions/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteTransaction(@Param('id') id: string, @Request() req: any) {
    const actor = req.user?.email || 'ADMIN';
    return this.capitalService.deleteTransaction(id, actor);
  }
}
