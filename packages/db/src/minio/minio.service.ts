import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService extends Client {
  constructor(configService: ConfigService) {
    super(configService.get('minio'));
  }
}
