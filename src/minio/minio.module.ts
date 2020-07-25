import { Module } from '@nestjs/common';

import { ConfigModule } from 'src/modules';
import { MinioService } from './minio.service';

@Module({
  imports: [ConfigModule],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
