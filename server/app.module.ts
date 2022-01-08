import { Module } from '@nestjs/common';

import { ConfigModule } from './modules';
import { PrismaModule } from './prisma';
import { HealthModule } from './health';
import { RouteModule } from './route';
import { WechatModule } from './wechat';
import { WxkfModule } from './wxkf';
import { RasaModule } from './rasa';
import { ViewModule } from './view';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    HealthModule,
    RouteModule,
    WechatModule,
    WxkfModule,
    RasaModule,
    ViewModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
