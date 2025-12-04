import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { StripeModule } from './stripe/stripe.module';
import { CouponsModule } from './coupons/coupons.module';
import { EmailModule } from './email/email.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { VariationsModule } from './variations/variations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10, // Aumentado de 3 para 10
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50, // Aumentado de 20 para 50
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 300, // Aumentado de 100 para 300
      },
    ]),
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    BrandsModule,
    CloudinaryModule,
    StripeModule,
    CouponsModule,
    AnalyticsModule,
    SuppliersModule,
    VariationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}