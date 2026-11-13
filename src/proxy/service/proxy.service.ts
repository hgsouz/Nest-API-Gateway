import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { serviceConfig } from '../../config/gateway.config.js';
import { error } from 'console';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  // Inserção de um novo metódo (seguindo os caminhos de Java)
  async proxyRequest(
    serviceName: keyof typeof serviceConfig,
    method: string,
    path: string,
    data?: any,
    headers?: any,
    userInfo?: any,
  ) {
    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;

    // Aqui estamos fazendo um atributo (LOG) para não nos perdermos durante o processo de criação
    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    try {
      const enhancedHeaders = {
        ...headers,
        x_user_id: userInfo?.userId,
        x_user_email: userInfo?.email,
        x_user_role: userInfo?.role,
      };

      // Dependência
      const response = await firstValueFrom(
        this.httpService.request({
          method: method.toLowerCase() as any,
          url,
          data,
          headers: enhancedHeaders,
          timeout: service.timeout,
        }),
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Error proxying ${method} request to ${serviceName}: ${url}`,
      );
      throw error;
    }
  }

  async getServiceHealth(serviceName: keyof typeof serviceConfig) {
    try {
      const service = serviceConfig[serviceName];
      const response = await firstValueFrom(
        this.httpService.get(`${service.url}/health`, { timeout: 3000 }),
      );

      return { status: 'healthy', data: response.data };
    } catch (error: any) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
