import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@senses-chat/operator-database';
import { EventSourcingModule } from '@senses-chat/operator-events';

import { WxkfModule } from 'src/wxkf';

import { WxkfApiController } from './wxkf-api.controller';
import { HistoryController } from './history.controller';
import { BotConfigApiController } from './bot-config.controller';

@Module({
  imports: [CqrsModule, EventSourcingModule, WxkfModule, PrismaModule],
  controllers: [WxkfApiController, HistoryController, BotConfigApiController],
})
export class ApiModule {}
