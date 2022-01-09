import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StorageModule } from 'server/modules';
import { EventStoreModule } from 'server/event-store';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { RouteSagas } from './sagas';
import { SessionRepository } from './repositories';
import { RouteService } from './route.service';

@Module({
  imports: [CqrsModule, EventStoreModule, StorageModule.register()],
  providers: [RouteService, SessionRepository, ...CommandHandlers, ...EventHandlers, ...RouteSagas],
})
export class RouteModule {}
