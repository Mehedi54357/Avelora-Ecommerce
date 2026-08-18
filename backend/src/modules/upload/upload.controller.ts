import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AuthGuard)
  @Post('image')
  async uploadImage(@Body() body: { image: string; folder?: string }) {
    if (!body.image) {
      throw new BadRequestException('Image data (base64/URL) is required');
    }
    const result = await this.uploadService.uploadImage(body.image, body.folder || 'avelora/products');
    return result;
  }
}
