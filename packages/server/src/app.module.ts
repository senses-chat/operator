import { Module } from '@nestjs/common';
import { RouteModule } from '@senses-chat/operator-events';
import { RasaModule } from '@senses-chat/operator-rasa';

import { ConfigModule } from './modules';
import { WechatModule } from './wechat';
import { WxkfModule } from './wxkf';
import { ApiModule } from './api';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule,
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
