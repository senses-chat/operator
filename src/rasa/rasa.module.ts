import { Module } from '@nestjs/common';

import { ConfigModule, RedisModule } from 'src/modules';
import { DockerModule } from 'src/docker';

import { RasaController } from './rasa.controller';
import { RasaService } from './rasa.service';

@Module({
  imports: [ConfigModule, DockerModule, RedisModule],
  controllers: [RasaController],
  providers: [RasaService],
  exports: [RasaService],
})
export class RasaModule {}
