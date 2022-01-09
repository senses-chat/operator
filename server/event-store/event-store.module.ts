import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigModule, StorageModule } from 'server/modules';

import { EventStoreService } from './event-store.service';

@Module({
  imports: [CqrsModule, ConfigModule, StorageModule.register()],
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class EventStoreModule {}
