import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule } from 'src/modules';

import { RouteService } from './route.service';
import { Route } from './models';
import { SessionRepository } from './repositories';

@Module({
  imports: [CqrsModule, RedisModule, TypeOrmModule.forFeature([Route])],
  providers: [RouteService, SessionRepository],
  exports: [SessionRepository],
})
export class RouteModule {}
