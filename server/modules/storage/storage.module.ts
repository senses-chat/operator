import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';

import { Module as ConfigModule } from '../config.module';
import { MinioModule } from './minio';
import { PrismaModule, PrismaService } from './prisma';
import { Module as RedisModule } from './redis.module';
import {
  EVENT_STORAGE,
  RedisEventStorage,
  PrismaEventStorage,
} from './event-storage';
import {
  SESSION_STORAGE,
  RedisSessionStorage,
  PrismaSessionStorage,
} from './session-storage';
import {
  KV_STORAGE,
  PrismaKeyValueStorage,
  RedisKeyValueStorage,
} from './kv-storage';

/**
 * This storage module encapsulates all storage backends used by chat-operator.
 */
@Module({})
export class StorageModule {
  public static register(): DynamicModule {
    const modules: any[] = [ConfigModule, MinioModule, PrismaModule];

    const useRedis = process.env.STORAGE_USE_REDIS === 'true';

    if (useRedis) {
      modules.push(RedisModule);
    }

    const providers = [
      {
        provide: EVENT_STORAGE,
        inject: useRedis ? [RedisService] : [PrismaService],
        useFactory: useRedis
          ? (redisService: RedisService) => new RedisEventStorage(redisService)
          : (prismaService: PrismaService) =>
              new PrismaEventStorage(prismaService),
      },
      {
        provide: SESSION_STORAGE,
        inject: useRedis
          ? [ConfigService, RedisService]
          : [ConfigService, PrismaService],
        useFactory: useRedis
          ? (configService: ConfigService, redisService: RedisService) =>
              new RedisSessionStorage(configService, redisService)
          : (configService: ConfigService, prismaService: PrismaService) =>
              new PrismaSessionStorage(configService, prismaService),
      },
      {
        provide: KV_STORAGE,
        inject: useRedis ? [RedisService] : [PrismaService],
        useFactory: useRedis
          ? (redisService: RedisService) =>
              new RedisKeyValueStorage(redisService)
          : (prismaService: PrismaService) =>
              new PrismaKeyValueStorage(prismaService),
      },
    ];

    return {
      module: StorageModule,
      imports: modules,
      providers,
      exports: modules.concat(providers),
    };
  }
}
