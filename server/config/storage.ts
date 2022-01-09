import { registerAs } from '@nestjs/config';
import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';

export default registerAs('storage', () => ({
  useRedis: process.env.STORAGE_USE_REDIS === 'true',
  sessionExpiration: Number(process.env.STORAGE_SESSION_EXPIRATION || 3600),
  redis: {
    closeClient: true,
    commonOptions: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || 'chatOperator',
    },
    config: [
      {
        namespace: 'event-store',
        db: Number(process.env.REDIS_EVENT_STORE_DB || 0),
      },
      {
        namespace: 'wxkf',
        db: Number(process.env.REDIS_WXKF_DB || 1),
      },
      {
        namespace: 'wechat',
        db: Number(process.env.REDIS_WECHAT_DB || 2),
      },
      {
        namespace: 'session',
        db: Number(process.env.REDIS_SESSION_DB || 3),
      },
    ],
  } as RedisModuleOptions,
}));
