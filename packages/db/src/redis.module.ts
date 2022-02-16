import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import storageConfig from './config';

export const Module: DynamicModule = RedisModule.forRootAsync({
  imports: [ConfigModule.forFeature(storageConfig)],
  useFactory: (configService: ConfigService) =>
    configService.get('storage.redis'),
  inject: [ConfigService],
});
