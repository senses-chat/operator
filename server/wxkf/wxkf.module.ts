import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { EventStoreModule } from 'server/event-store';
import { ConfigModule, StorageModule } from 'server/modules';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { QueryHandlers } from './queries';
import { WxkfSagas } from './sagas';
import { WxkfController } from './wxkf.controller';
import { WxkfService } from './wxkf.service';

@Module({
  imports: [CqrsModule, EventStoreModule, ConfigModule, StorageModule.register()],
  controllers: [WxkfController],
  providers: [WxkfService, WxkfSagas, ...CommandHandlers, ...EventHandlers, ...QueryHandlers],
  exports: [WxkfService],
})
export class WxkfModule {}
