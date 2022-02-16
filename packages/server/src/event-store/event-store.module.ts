import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StorageModule } from '@senses-chat/operator-database';

import { EventStoreService } from './event-store.service';

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => StorageModule.register()),
  ],
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class EventStoreModule {}
