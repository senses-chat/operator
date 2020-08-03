import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule } from 'src/modules';

import { Route } from './models';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { SessionRepository } from './repositories';
import { RouteService } from './route.service';

@Module({
  imports: [CqrsModule, RedisModule, TypeOrmModule.forFeature([Route])],
  providers: [RouteService, SessionRepository, ...CommandHandlers, ...EventHandlers],
})
export class RouteModule {}
