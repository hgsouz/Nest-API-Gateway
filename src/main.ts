import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Nosso middleware de proteção contra multiplas requisições por exemplo
  app.use(helmet());

  // O CORS habilita o .env em nossa aplicação e aqui estamos configurando ele e disponibilizando o que precisamos
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-type', 'Autorization'],
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
