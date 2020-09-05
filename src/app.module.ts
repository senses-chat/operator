import { Module } from '@nestjs/common';

import { TypeOrmModule } from './modules';
import { HealthModule } from './health';
import { RouteModule } from './route';
import { WechatModule } from './wechat';
import { RasaModule } from './rasa';
import { WechatyModule } from './wechaty';

@Module({
  imports: [TypeOrmModule, HealthModule, RouteModule, WechatModule, RasaModule, WechatyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
