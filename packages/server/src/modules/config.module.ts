import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import serverConfig from 'src/config/server';
import wxkfConfig from 'src/config/wxkf';
import wx3pConfig from 'src/config/wx3p';

const ENV = process.env.NODE_ENV;

export const Module: DynamicModule = ConfigModule.forRoot({
  // mimic behaviors from nextjs
  envFilePath: [`.env.${ENV}.local`, `.env.${ENV}`, `.env.local`, '.env'],
  load: [
    serverConfig,
    wxkfConfig,
    wx3pConfig,
  ],
});
