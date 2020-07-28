import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WechatModule } from 'src/wechat';
import { RasaModule } from 'src/rasa';

import { RouteService } from './route.service';
import { Route } from './models';

@Module({
  imports: [CqrsModule, WechatModule, RasaModule, TypeOrmModule.forFeature([Route])],
  providers: [RouteService],
  exports: [],
})
export class RouteModule {}
