import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@senses-chat/operator-database';
import { EventSourcingModule } from '@senses-chat/operator-events';
import { WxkfModule } from '@senses-chat/operator-wxkf';

import apiConfig from './config';
import { WxkfApiController } from './wxkf-api.controller';
import { HistoryController } from './history.controller';
import { BotConfigApiController } from './bot-config.controller';

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    WxkfModule,
    PrismaModule,
    ConfigModule.forFeature(apiConfig),
  ],
  controllers: [WxkfApiController, HistoryController, BotConfigApiController],
})
export class ApiModule {}
