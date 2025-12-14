import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonLogger } from './common/logger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const winstonLogger = new WinstonLogger();
  winstonLogger.setContext('Bootstrap');
  
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Necessário para processar webhooks do Stripe
    logger: winstonLogger,
  });

  // Configuração global de validação
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Configuração CORS - Restritivo em produção
  const allowedOrigins = isProduction 
    ? [
        process.env.FRONTEND_URL || 'https://ussbrasil.com.br',
        'https://ussbrasil.pages.dev', // Cloudflare Pages
        'https://ussbrasil.netlify.app',
        'https://ussbrasil.vercel.app',
      ]
    : true; // Permite qualquer origem em desenvolvimento

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Health Check endpoint (importante para Render)
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    });
  });

  // Configuração Swagger (desabilitar em produção se necessário)
  if (!isProduction || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('USS Brasil E-commerce API')
      .setDescription('API completa para e-commerce USS Brasil')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(isProduction ? 'https://ussbrasil-back.onrender.com' : 'http://localhost:3001')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('📚 Swagger habilitado em /api/docs');
  }

  // Graceful shutdown para Render
  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  const host = '0.0.0.0'; // Importante para Render
  
  await app.listen(port, host);
  
  logger.log(`🚀 USS Brasil API rodando na porta ${port}`);
  logger.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`💚 Health check disponível em /health`);
  
  if (!isProduction) {
    logger.log(`📚 Documentação disponível em http://localhost:${port}/api/docs`);
  }
}

bootstrap();