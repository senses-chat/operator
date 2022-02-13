import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheckService,
  // HttpHealthIndicator,
  MicroserviceHealthIndicator,
  MemoryHealthIndicator,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    // private readonly http: HttpHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  public async healthCheck(): Promise<HealthCheckResult> {
    const checks = [
      // async () => this.http.pingCheck('docker', `${this.configService.get('docker.proxyEndpoint')}/_ping`),
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
    ];

    if (this.configService.get<boolean>('storage.useRedis')) {
      checks.push(async () =>
        this.microservice.pingCheck('redis', {
          transport: Transport.REDIS,
          options: {
            url: `redis://:${this.configService.get(
              'storage.redis.commonOptions.password',
            )}@${this.configService.get(
              'storage.redis.commonOptions.host',
            )}:${this.configService.get('storage.redis.commonOptions.port')}`,
          },
        }),
      );
    }

    return this.health.check(checks);
  }
}
