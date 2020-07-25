import { DynamicModule } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from 'nestjs-config';

import { Module as ConfigModule } from './config.module';

export const Module: DynamicModule = RedisModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => configService.get('redis.clients'),
  inject: [ConfigService],
});
