import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  private client: Client;

  constructor(private readonly configService: ConfigService) {}

  public get instance(): Client {
    if (!this.client) {
      this.client = new Client(this.configService.get('minio'));
    }

    return this.client;
  }
}
