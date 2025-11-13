import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'uss-brasil',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
            { format: 'webp' }
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        },
      ).end(file.buffer);
    });
  }

  async uploadImageFromPath(
    imagePath: string,
    folder: string = 'uss-brasil',
    publicId?: string
  ): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(imagePath, {
        folder: folder,
        public_id: publicId,
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
          { format: 'webp' }
        ],
        overwrite: true,
      });
      return result;
    } catch (error: any) {
      throw new Error(`Falha no upload da imagem: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'uss-brasil',
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  async optimizeImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toBuffer();
  }

  getOptimizedUrl(publicId: string, width?: number, height?: number): string {
    const transformation = [];
    
    if (width && height) {
      transformation.push(`w_${width},h_${height},c_fill`);
    } else if (width) {
      transformation.push(`w_${width},c_scale`);
    }
    
    transformation.push('f_auto', 'q_auto');
    
    return cloudinary.url(publicId, {
      transformation: transformation.join(','),
      secure: true,
    });
  }

  async uploadProductImages(
    productName: string,
    imagePaths: string[]
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (const imagePath of imagePaths) {
      try {
        const fileName = path.basename(imagePath, path.extname(imagePath));
        const publicId = `products/${productName.toLowerCase().replace(/\s+/g, '-')}/${fileName}`;
        
        const result = await this.uploadImageFromPath(
          imagePath,
          'uss-brasil/products',
          publicId
        );
        
        uploadedUrls.push(result.secure_url);
      } catch (error) {
        console.error(`Erro ao fazer upload de ${imagePath}:`, error);
      }
    }
    
    return uploadedUrls;
  }

  async uploadBrandLogo(
    brandName: string,
    imagePath: string
  ): Promise<string> {
    try {
      const publicId = `brands/${brandName.toLowerCase().replace(/\s+/g, '-')}/logo`;
      
      const result = await this.uploadImageFromPath(
        imagePath,
        'uss-brasil/brands',
        publicId
      );
      
      return result.secure_url;
    } catch (error) {
      console.error(`Erro ao fazer upload do logo da marca ${brandName}:`, error);
      throw error;
    }
  }

  async uploadCategoryImage(
    categoryName: string,
    imagePath: string
  ): Promise<string> {
    try {
      const publicId = `categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}/image`;
      
      const result = await this.uploadImageFromPath(
        imagePath,
        'uss-brasil/categories',
        publicId
      );
      
      return result.secure_url;
    } catch (error) {
      console.error(`Erro ao fazer upload da imagem da categoria ${categoryName}:`, error);
      throw error;
    }
  }
}