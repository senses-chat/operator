import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { Transport } from '@nestjs/common/enums/transport.enum';
import {
  TerminusEndpoint,
  TerminusOptionsFactory,
  DNSHealthIndicator,
  MicroserviceHealthIndicator,
  TerminusModuleOptions,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from 'nestjs-config';

@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory, OnApplicationShutdown {
  private readonly logger = new Logger('GracefulShutdownHook');

  constructor(
    private readonly configService: ConfigService,
    private readonly dns: DNSHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      url: '/health',
      healthIndicators: [
        async () => this.dns.pingCheck('docker', `${this.configService.get('docker.proxyEndpoint')}/_ping`),
        async () =>
          this.microservice.pingCheck('redis', {
            transport: Transport.REDIS,
            options: {
              url: `redis://:${this.configService.get('redis.password')}@${this.configService.get('redis.host')}:${this.configService.get(
                'redis.port',
              )}`,
            },
          }),
        async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
        async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
      ],
    };
    return {
      logger: null,
      endpoints: [healthEndpoint],
    };
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.logger.log(`running a graceful shutdown hook for ${this.configService.get('server.gracefulShutdownTimeout')}ms`);
    return new Promise((resolve) =>
      setTimeout(() => {
        this.logger.log('shutting down server once all shutdown hooks are finished');
        resolve();
      }, this.configService.get('server.gracefulShutdownTimeout')),
    );
  }
}
