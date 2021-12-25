import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { RedisModule } from 'server/modules';
import { PrismaModule } from 'server/prisma';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { RouteSagas } from './sagas';
import { SessionRepository } from './repositories';
import { RouteService } from './route.service';

@Module({
  imports: [CqrsModule, RedisModule, PrismaModule],
  providers: [RouteService, SessionRepository, ...CommandHandlers, ...EventHandlers, ...RouteSagas],
})
export class RouteModule {}
