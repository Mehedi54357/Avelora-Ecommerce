import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret && apiKey !== 'your_api_key') {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary initialized successfully');
    } else {
      this.logger.warn('Cloudinary credentials not provided or using defaults. Fallback local/data storage enabled.');
    }
  }

  async uploadImage(fileData: string, folder = 'avelora/products'): Promise<{ url: string; public_id: string }> {
    try {
      if (this.isConfigured) {
        const result = await cloudinary.uploader.upload(fileData, {
          folder,
          resource_type: 'image',
          quality: 'auto:good',
          fetch_format: 'auto',
        });
        return {
          url: result.secure_url,
          public_id: result.public_id,
        };
      } else {
        // Safe fallback if Cloudinary API is not configured with live credentials:
        // Returns the data URL or image URL directly
        return {
          url: fileData,
          public_id: `fallback_${Date.now()}`,
        };
      }
    } catch (error) {
      this.logger.error('Error uploading image to Cloudinary:', error);
      // Return the image data or error
      return {
        url: fileData,
        public_id: `fallback_${Date.now()}`,
      };
    }
  }
}
