import { DynamicModule } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const Module: DynamicModule = RedisModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => configService.get('redis.clients'),
  inject: [ConfigService],
});
