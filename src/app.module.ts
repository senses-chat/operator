import { Module } from '@nestjs/common';

import { ConfigModule, TypeOrmModule } from './modules';
import { HealthModule } from './health';
import { RouteModule } from './route';
import { WechatModule } from './wechat';
import { RasaModule } from './rasa';
import { AppController } from './app.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule, HealthModule, RouteModule, WechatModule, RasaModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
