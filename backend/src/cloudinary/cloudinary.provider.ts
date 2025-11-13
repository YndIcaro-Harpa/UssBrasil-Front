import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'dnmazlvs6',
      api_key: configService.get<string>('CLOUDINARY_API_KEY') || '582526864977524',
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET') || 'q13s0A5IaYecoX4-uVlUYf3v0aA',
      secure: true,
    });
  },
  inject: [ConfigService],
};