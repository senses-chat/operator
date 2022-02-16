import { Module } from '@nestjs/common';
import { StorageModule } from '@senses-chat/operator-database';

import { EventSourcingModule } from '../event-sourcing';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { RouteSagas } from './sagas';
import { QueryHandlers } from './queries';
import { SessionRepository } from './repositories';
import { RouteService } from './route.service';

@Module({
  imports: [EventSourcingModule, StorageModule.register()],
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
