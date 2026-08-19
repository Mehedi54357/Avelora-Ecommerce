import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { Product } from '../../schemas/product.schema';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public Endpoints
  @Get('products')
  async getPublicProducts(@Query() query: any) {
    return this.productsService.findPublic(query);
  }

  @Get('products/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // Admin Endpoints
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @Get('admin/products')
  async getAdminProducts(@Query() query: any) {
    return this.productsService.findAdminAll(query);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @Get('admin/products/:id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @Post('admin/products')
  async createProduct(@Body() body: Partial<Product>) {
    return this.productsService.create(body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @Put('admin/products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: Partial<Product>) {
    return this.productsService.update(id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/products-clear-all')
  async clearAllProducts() {
    return this.productsService.clearAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
