import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import minioConfig from './config';
import { MinioService } from './minio.service';

@Module({
  imports: [ConfigModule.forFeature(minioConfig)],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
