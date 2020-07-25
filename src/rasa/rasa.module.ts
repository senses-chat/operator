import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, RedisModule } from 'src/modules';
import { DockerModule } from 'src/docker';

import { RasaController } from './rasa.controller';
import { RasaService } from './rasa.service';
import { RasaEntities } from './rasa.entity';

@Module({
  imports: [ConfigModule, DockerModule, RedisModule, TypeOrmModule.forFeature(RasaEntities)],
  controllers: [RasaController],
  providers: [RasaService],
  exports: [RasaService],
})
export class RasaModule {}
