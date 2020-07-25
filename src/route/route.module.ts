import { Module } from '@nestjs/common';

import { WechatModule } from 'src/wechat';
import { RasaModule } from 'src/rasa';

import { RouteService } from './route.service';

@Module({
  imports: [WechatModule, RasaModule],
  providers: [RouteService],
  exports: [],
})
export class RouteModule {}
