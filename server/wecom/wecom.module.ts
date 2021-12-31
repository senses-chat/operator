import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { EventStoreModule } from 'server/event-store';
import { ConfigModule, RedisModule } from 'server/modules';
import { MinioModule } from 'server/minio';
import { PrismaModule } from 'server/prisma';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WecomSagas } from './sagas';
import { WecomController } from './wecom.controller';
import { WecomService } from './wecom.service';

@Module({
  imports: [CqrsModule, EventStoreModule, ConfigModule, RedisModule, MinioModule, PrismaModule],
  controllers: [WecomController],
  providers: [WecomService, WecomSagas, ...CommandHandlers, ...EventHandlers],
})
export class WecomModule {}
