import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import LRUCache from 'lru-cache';
import {
  MinioService,
  PrismaService,
  KeyValueStorageBase,
  WECHAT_KV_STORAGE,
} from '@senses-chat/operator-database';

import { WechatCredentials } from './models';
import { WechatService } from './wechat.service';

@Injectable()
export class WechatServiceRegistry {
  private readonly services: LRUCache<string, WechatService>;

  constructor(
    private readonly config: ConfigService,
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
    @Inject(WECHAT_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {
    this.services = new LRUCache({
      max: 100,
      maxAge: 1000 * 60 * 60 * 48,
      updateAgeOnGet: true,
    });
  }

  public async getService(namespace: string): Promise<WechatService | undefined> {
    const service = this.services.get(namespace);

    if (!service) {
      const credentials = await this.getWechatCredentials(namespace);

      if (!credentials) {
        throw new Error(`Wechat app ${namespace} not found`);
      }

      const newService = new WechatService(
        credentials,
        this.config.get<string>('wechat.assetsBucket'),
        this.minio,
        this.kvStorage,
      );

      this.services.set(namespace, newService);
      return newService;
    }

    return service;
  }

  private async getWechatCredentials(name: string): Promise<WechatCredentials | undefined> {
    const wechatApp = await this.prisma.wechatApp.findFirst({
      where: {
        name,
      },
    });

    if (!wechatApp) {
      return undefined;
    }

    return {
      appId: wechatApp.appId,
      secret: wechatApp.appSecret,
      token: wechatApp.token,
      aesKey: wechatApp.aesKey,
    } as WechatCredentials;
  }
}
