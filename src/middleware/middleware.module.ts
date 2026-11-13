import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggingMiddleware } from './logging/logging.middleware.js';

@Module({
  imports: [
    // Aqui estamos propondo um rate limit para evitar ataques de multiplos acessos simultanêos
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  providers: [LoggingMiddleware],
})
export class MiddlewareModule {}
