import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StorageModule } from 'src/modules';
import { EventStoreModule } from 'src/event-store';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { RouteSagas } from './sagas';
import { QueryHandlers } from './queries';
import { SessionRepository } from './repositories';
import { RouteService } from './route.service';

@Module({
  imports: [CqrsModule, EventStoreModule, StorageModule.register()],
  providers: [
    RouteService,
    SessionRepository,
    ...CommandHandlers,
    ...EventHandlers,
    ...RouteSagas,
    ...QueryHandlers,
  ],
})
export class RouteModule {}
