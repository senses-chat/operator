import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, RedisModule } from 'src/modules';
import { DockerModule } from 'src/docker';

import { RasaController } from './rasa.controller';
import { RasaService } from './rasa.service';
import { RasaServer, RasaHelperServer } from './models';

@Module({
  imports: [CqrsModule, ConfigModule, DockerModule, RedisModule, TypeOrmModule.forFeature([RasaServer, RasaHelperServer])],
  controllers: [RasaController],
  providers: [RasaService],
  exports: [RasaService],
})
export class RasaModule {}
