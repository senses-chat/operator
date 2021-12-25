import { Module } from '@nestjs/common';

import { ConfigModule, TypeOrmModule } from './modules';
import { HealthModule } from './health';
import { RouteModule } from './route';
import { WechatModule } from './wechat';
import { RasaModule } from './rasa';
import { AppController } from './app.controller';
import { ViewModule } from './view/view.module';

@Module({
  imports: [ConfigModule, TypeOrmModule, HealthModule, RouteModule, WechatModule, RasaModule, ViewModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
