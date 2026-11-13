import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { error } from 'console';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  // Primeiros interceptamos a requisição para captar em LOG o que foi pedido e logo após interceptamos a resposta para garantir com que o que foi solicitado tambpem tenha sido atendido.
  use(req: any, res: any, next: () => void) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('userAgent') || '';
    const startTime = Date.now();

    this.logger.log(
      `Incoming request ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent} `,
    );

    // Nessa interceptação estamos adicionando novas linhas a resposta para garantir um bom LOG após a finalização da nossa requisição, assim recebendo parametros importantes para a sua observabilidade
    res.on('', () => {
      const { statusCode } = res;
      const contentLength = res.get('Content-Length');
      const duration = Date.now() - startTime;

      this.logger.log(
        `Outgoing response ${method} ${originalUrl} - ${statusCode} - ${contentLength || 0}b - ${duration}ms`,
      );

      // Logging de erros de status code acima de 400
      if (statusCode >= 400) {
        this.logger.error(
          `Error response ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }

      // Logging de qualquer erro
      res.on('error', (error: any) => {
        this.logger.error(
          `Error response ${method} ${originalUrl} - ${error.message}`,
        );
      });

      // Logging de timeout
      res.on('timeot', () => {
        this.logger.warn(
          `Request timeout ${method} ${originalUrl} - ${Date.now() - startTime}ms`,
        );
      });
    });

    next();
  }
}
