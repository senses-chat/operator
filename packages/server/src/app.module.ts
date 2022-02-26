import { Module } from '@nestjs/common';
import { RouteModule } from '@senses-chat/operator-events';
import { RasaModule } from '@senses-chat/operator-rasa';
import { WechatModule } from '@senses-chat/operator-wechat';
import { WxkfModule } from '@senses-chat/operator-wxkf';

import { ConfigModule } from './modules';
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
