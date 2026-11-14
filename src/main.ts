import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Nosso middleware de proteção contra multiplas requisições por exemplo
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // O CORS habilita o .env em nossa aplicação e aqui estamos configurando ele e disponibilizando o que precisamos
  app.enableCors({
    origin: (origin: any, callback: any) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-type',
      'Autorization',
      'X-Requested-with',
      'Accept',
      'Origin',
      'Acess-Control-Request-Method',
      'Acess-Control-Request-Headers',
    ],
    credentials: true,
    maxAge: 86400,
  });

  // Aqui validamos automaticamente o que foi enviado como strings e etc
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Aqui estamos configurando o nosso swagger responsavel pela documentação da aplicação
  const config = new DocumentBuilder()
    .setTitle('Marketplace API Gateway')
    .setDescription('api gateway for market place microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3005;
  await app.listen(port);

  console.log(`API Gateway running on port ${port}`);
  console.log(`Swagger documentation: <http://localhost>:${port}/api`);
}
await bootstrap();
