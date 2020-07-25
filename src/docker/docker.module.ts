import { Module } from '@nestjs/common';

import { ConfigModule } from 'src/modules';
import { DockerService } from './docker.service';
import { DockerController } from './docker.controller';

@Module({
  imports: [ConfigModule],
  providers: [DockerService],
  exports: [DockerService],
  controllers: [DockerController],
})
export class DockerModule {}
