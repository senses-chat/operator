import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, RedisModule } from 'server/modules';
import { DockerModule } from 'server/docker';

import { RasaServer, RasaHelperServer } from './models';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { RasaSagas } from './sagas';
import { RasaService } from './rasa.service';

@Module({
  imports: [CqrsModule, ConfigModule, DockerModule, RedisModule, TypeOrmModule.forFeature([RasaServer, RasaHelperServer])],
  providers: [RasaService, RasaSagas, ...CommandHandlers, ...EventHandlers],
})
export class RasaModule {}
