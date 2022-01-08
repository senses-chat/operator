import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { EventStoreModule } from 'server/event-store';
import { ConfigModule, RedisModule } from 'server/modules';
import { MinioModule } from 'server/minio';
import { PrismaModule } from 'server/prisma';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WxkfSagas } from './sagas';
import { WxkfController } from './wxkf.controller';
import { WxkfService } from './wxkf.service';

@Module({
  imports: [CqrsModule, EventStoreModule, ConfigModule, RedisModule, MinioModule, PrismaModule],
  controllers: [WxkfController],
  providers: [WxkfService, WxkfSagas, ...CommandHandlers, ...EventHandlers],
})
export class WxkfModule {}
