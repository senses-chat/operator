import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { WxkfModule } from 'server/wxkf';

import { WxkfApiController } from './wxkf-api.controller';
import { HistoryController } from './history.controller';

@Module({
  imports: [CqrsModule, WxkfModule],
  controllers: [WxkfApiController, HistoryController],
})
export class ApiModule {}
