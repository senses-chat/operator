import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { EventStoreModule } from 'server/event-store';
import { ConfigModule, StorageModule } from 'server/modules';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { QueryHandlers } from './queries';
import { WxkfSagas } from './sagas';
import { WxkfController } from './wxkf.controller';
import { WxkfServiceRegistry } from './wxkf.registry';

@Module({
  imports: [
    CqrsModule,
    EventStoreModule,
    ConfigModule,
    StorageModule.register(),
  ],
  controllers: [WxkfController],
  providers: [
    WxkfServiceRegistry,
    WxkfSagas,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
  exports: [WxkfServiceRegistry],
})
export class WxkfModule {}
