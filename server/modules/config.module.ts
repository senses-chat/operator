import { ConfigModule } from '@nestjs/config';

import dockerConfig from 'server/config/docker';
import minioConfig from 'server/config/minio';
import rasaConfig from 'server/config/rasa';
import redisConfig from 'server/config/redis';
import serverConfig from 'server/config/server';
import wecomConfig from 'server/config/wecom';
import wx3pConfig from 'server/config/wx3p';

const ENV = process.env.NODE_ENV;

export const Module = ConfigModule.forRoot({
  // mimic behaviors from nextjs
  envFilePath: [
    `.env.${ENV}.local`,
    `.env.${ENV}`,
    `.env.local`,
    '.env',
  ],
  load: [
    dockerConfig,
    minioConfig,
    rasaConfig,
    redisConfig,
    serverConfig,
    wecomConfig,
    wx3pConfig,
  ],
});
