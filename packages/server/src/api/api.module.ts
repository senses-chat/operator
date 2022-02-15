import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { WxkfModule } from 'src/wxkf';
import { PrismaModule } from 'src/modules/storage/prisma';

import { WxkfApiController } from './wxkf-api.controller';
import { HistoryController } from './history.controller';
import { BotConfigApiController } from './bot-config.controller';

@Module({
  imports: [CqrsModule, WxkfModule, PrismaModule],
  controllers: [WxkfApiController, HistoryController, BotConfigApiController],
})
export class ApiModule {}
