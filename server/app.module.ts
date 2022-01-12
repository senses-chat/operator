import { Module } from '@nestjs/common';

import { ConfigModule } from './modules';
import { HealthModule } from './health';
import { RouteModule } from './route';
import { WechatModule } from './wechat';
import { WxkfModule } from './wxkf';
import { RasaModule } from './rasa';
import { ViewModule } from './view';
import { ApiModule } from './api';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    RouteModule,
    WechatModule,
    WxkfModule,
    RasaModule,
    ViewModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
