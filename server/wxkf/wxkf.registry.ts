import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import LRUCache from 'lru-cache';

import {
  MinioService,
  PrismaService,
  KeyValueStorageBase,
  WXKF_KV_STORAGE,
} from 'server/modules/storage';
import { WxkfCredentials } from '.';

import { WxkfService, wxkfServiceFactory } from './wxkf.service';

@Injectable()
export class WxkfServiceRegistry {
  public readonly defaultCorpId: string;
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
    this.defaultService = wxkfServiceFactory(config, minio, prisma, kvStorage);
    this.services = new LRUCache({
      max: 100,
      maxAge: 1000 * 60 * 60 * 48,
      updateAgeOnGet: true,
    });
  }

  public getService(corpId?: string): WxkfService | undefined {
    if (corpId === this.defaultCorpId || !corpId) {
      return this.defaultService;
    }

    return this.services.get(corpId);
  }

  public registerService<T extends WxkfService>(
    credentials: WxkfCredentials,
    factory: (minio: MinioService, prisma: PrismaService, kvStorage: KeyValueStorageBase) => T,
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
}
