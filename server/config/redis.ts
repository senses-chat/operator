import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || 'chatOperator',

  clients: [
    {
      name: 'event-store',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_EVENT_STORE_DB || 0),
      password: process.env.REDIS_PASSWORD || 'chatOperator',
    },
    {
      name: 'wechat',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_WECHAT_DB || 1),
      password: process.env.REDIS_PASSWORD || 'chatOperator',
    },
    {
      name: 'wecom',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_WECOM_DB || 2),
      password: process.env.REDIS_PASSWORD || 'chatOperator',
    },
    {
      name: 'session',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_SESSION_DB || 3),
      password: process.env.REDIS_PASSWORD || 'chatOperator',
    },
  ],
}));
