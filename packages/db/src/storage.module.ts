import { DynamicModule, Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';

import storageConfig from './config';
import { MinioModule } from './minio';
import { PrismaModule, PrismaService } from './prisma';
import { Module as RedisModule } from './redis.module';
import {
  EVENT_STORAGE,
  RedisEventStorage,
  PrismaEventStorage,
} from './event-storage';
import { SESSION_STORAGE, PrismaSessionStorage } from './session-storage';
import {
  PING_TIME_KV_STORAGE,
  WECHAT_KV_STORAGE,
  WXKF_KV_STORAGE,
  PrismaKeyValueStorage,
  RedisKeyValueStorage,
} from './kv-storage';

/**
 * This storage module encapsulates all storage backends used by chat-operator.
 */
@Module({})
export class StorageModule {
  private static logger = new Logger(StorageModule.name);

  public static register(): DynamicModule {
    const modules: any[] = [ConfigModule.forFeature(storageConfig), MinioModule, PrismaModule];

    const useRedis = process.env.STORAGE_USE_REDIS === 'true';

    if (useRedis) {
      StorageModule.logger.debug('Using Redis for storage');
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
        // session storage is prisma only
        provide: SESSION_STORAGE,
        inject: [ConfigService, PrismaService],
        useFactory: (
          configService: ConfigService,
          prismaService: PrismaService,
        ) => new PrismaSessionStorage(configService, prismaService),
      },
      {
        provide: PING_TIME_KV_STORAGE,
        inject: useRedis ? [RedisService] : [PrismaService],
        useFactory: useRedis
          ? (redisService: RedisService) =>
              new RedisKeyValueStorage(redisService, 'ping')
          : (prismaService: PrismaService) =>
              new PrismaKeyValueStorage(prismaService, 'ping'),
      },
      {
        provide: WECHAT_KV_STORAGE,
        inject: useRedis ? [RedisService] : [PrismaService],
        useFactory: useRedis
          ? (redisService: RedisService) =>
              new RedisKeyValueStorage(redisService, 'wechat')
          : (prismaService: PrismaService) =>
              new PrismaKeyValueStorage(prismaService, 'wechat'),
      },
      {
        provide: WXKF_KV_STORAGE,
        inject: useRedis ? [RedisService] : [PrismaService],
        useFactory: useRedis
          ? (redisService: RedisService) =>
              new RedisKeyValueStorage(redisService, 'wxkf')
          : (prismaService: PrismaService) =>
              new PrismaKeyValueStorage(prismaService, 'wxkf'),
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
