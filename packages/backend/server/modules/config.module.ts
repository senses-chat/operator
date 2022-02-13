import { ConfigModule } from '@nestjs/config';

import minioConfig from 'server/config/minio';
import rasaConfig from 'server/config/rasa';
import storageConfig from 'server/config/storage';
import serverConfig from 'server/config/server';
import wxkfConfig from 'server/config/wxkf';
import wx3pConfig from 'server/config/wx3p';

const ENV = process.env.NODE_ENV;

export const Module = ConfigModule.forRoot({
  // mimic behaviors from nextjs
  envFilePath: [`.env.${ENV}.local`, `.env.${ENV}`, `.env.local`, '.env'],
  load: [
    minioConfig,
    rasaConfig,
    storageConfig,
    serverConfig,
    wxkfConfig,
    wx3pConfig,
  ],
});
