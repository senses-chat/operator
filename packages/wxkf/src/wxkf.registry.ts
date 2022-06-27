import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import LRUCache from 'lru-cache';

import {
  MinioService,
  PrismaService,
  KeyValueStorageBase,
  WXKF_KV_STORAGE,
} from '@senses-chat/operator-database';

import { WxkfCredentials } from './models';
import { WxkfService, wxkfServiceFactory } from './wxkf.service';

@Injectable()
export class WxkfServiceRegistry {
  public readonly defaultCorpId: string;
  private readonly defaultCredentials: WxkfCredentials;
  private defaultService: WxkfService;
  private readonly services: LRUCache<string, WxkfService>;

  constructor(
    private readonly config: ConfigService,
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
    @Inject(WXKF_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {
    this.defaultCorpId = config.get<string>('wxkf.credentials.corpId');
    this.defaultCredentials = config.get<WxkfCredentials>('wxkf.credentials');
    this.defaultService = wxkfServiceFactory(this.defaultCredentials, config, minio, prisma, kvStorage);
    this.services = new LRUCache({
      max: 100,
      maxAge: 1000 * 60 * 60 * 48,
      updateAgeOnGet: true,
    });
  }

  public async getService(corpId?: string): Promise<WxkfService | undefined> {
    if (corpId === this.defaultCorpId || !corpId) {
      return this.defaultService;
    }

    const service = this.services.get(corpId);

    if (!service) {
      const credentials = await this.getWxkfCredentials(corpId);

      if (!credentials) {
        throw new Error(`Wecom app ${corpId} not found`);
      }

      const newService = wxkfServiceFactory(
        credentials,
        this.config,
        this.minio,
        this.prisma,
        this.kvStorage,
      );

      this.services.set(corpId, newService);
      return newService;
    }

    return service;
  }

  public registerService<T extends WxkfService>(
    credentials: WxkfCredentials,
    factory: (
      minio: MinioService,
      prisma: PrismaService,
      kvStorage: KeyValueStorageBase,
    ) => T,
  ): T {
    const service = factory(this.minio, this.prisma, this.kvStorage);

    // override default service if corpid's match
    if (credentials.corpId === this.defaultCorpId) {
      this.defaultService = service;
    } else {
      this.services.set(credentials.corpId, service);
    }

    return service;
  }

  private async getWxkfCredentials(corpId: string): Promise<WxkfCredentials | undefined> {
    const wecomApp = await this.prisma.wecomApp.findFirst({
      where: {
        corpId,
      },
    });

    if (!wecomApp) {
      return undefined;
    }

    return {
      corpId: wecomApp.corpId,
      secret: wecomApp.corpSecret,
      token: wecomApp.token,
      aesKey: wecomApp.aesKey,
    } as WxkfCredentials;
  }
}
