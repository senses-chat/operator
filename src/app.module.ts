import { Module } from '@nestjs/common';

import { TypeOrmModule } from './modules';
import { HealthModule } from './health';
import { RouteModule } from './route';
import { WechatModule } from './wechat';
import { RasaModule } from './rasa';

@Module({
  imports: [TypeOrmModule, HealthModule, RouteModule, WechatModule, RasaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
