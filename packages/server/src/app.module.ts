import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigModule } from './modules';
import { HealthModule } from './health';
import { RouteModule } from './route';
import { WechatModule } from './wechat';
import { WxkfModule } from './wxkf';
import { RasaModule } from './rasa';
import { ApiModule } from './api';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    HealthModule,
    RouteModule,
    WechatModule,
    WxkfModule,
    RasaModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
