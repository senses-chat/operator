import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

import { KeyValueStorageBase } from './kv-storage.base';

export class RedisKeyValueStorage extends KeyValueStorageBase {
  private redisClient: Redis;

  constructor(private readonly redisService: RedisService, namespace?: string) {
    super(namespace);
    this.redisClient = this.redisService.getClient(namespace);
  }

  set namespace(value: string) {
    this._namespace = value;
    this.redisClient = this.redisService.getClient(value);
  }

  async get(key: string): Promise<string | undefined> {
    const result = await this.redisClient.get(key);

    if (!result) {
      return undefined;
    }

    return result;
  }

  async set(key: string, value: string, expires?: number): Promise<void> {
    if (expires) {
      await this.redisClient.set(key as unknown as string, value as unknown as string, 'ex', expires);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clear(): Promise<void> {
    await this.redisClient.flushdb();
  }
}
