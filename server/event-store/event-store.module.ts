import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigModule, RedisModule } from 'server/modules';

import { EventStoreService } from './event-store.service';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    RedisModule,
  ],
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class EventStoreModule {}
