import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import { Module as ConfigModule } from './config.module';

export const Module: DynamicModule = RedisModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => configService.get('redis'),
  inject: [ConfigService],
});
