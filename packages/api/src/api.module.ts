import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@senses-chat/operator-database';
import { EventSourcingModule } from '@senses-chat/operator-events';
import { WxkfModule } from '@senses-chat/operator-wxkf';
import { RasaModule } from '@senses-chat/operator-rasa';

import apiConfig from './config';
import { WxkfApiController } from './wxkf.controller';
import { HistoryController } from './history.controller';
import { BotConfigApiController } from './bot-config.controller';
import { HomeApiController } from './home.controller';

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    WxkfModule,
    RasaModule,
    PrismaModule,
    ConfigModule.forFeature(apiConfig),
  ],
  controllers: [WxkfApiController, HistoryController, BotConfigApiController, HomeApiController],
})
export class ApiModule {}
