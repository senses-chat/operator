import { Module } from '@nestjs/common';

import { ConfigModule } from 'server/modules';
import { MinioService } from './minio.service';

@Module({
  imports: [ConfigModule],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
