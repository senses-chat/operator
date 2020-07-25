import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheckService,
  DNSHealthIndicator,
  MicroserviceHealthIndicator,
  MemoryHealthIndicator,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ConfigService } from 'nestjs-config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly dns: DNSHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  public async healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
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
    ]);
  }
}
