import { Module } from '@nestjs/common';

import { HealthModule } from './health';
import { RasaModule } from './rasa';
import { WechatModule } from './wechat';
import { TypeOrmModule } from './modules';

@Module({
  imports: [HealthModule, RasaModule, WechatModule, TypeOrmModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
