import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { RouteType } from '@prisma/client';

import { SessionDefinition } from 'server/route';

import { ISessionStorage } from './session-storage.interface';

export class RedisSessionStorage implements ISessionStorage {
  private logger = new Logger(RedisSessionStorage.name);
  private sessionExpirationSeconds: number;
  private redisClient: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.sessionExpirationSeconds = this.configService.get<number>(
      'storage.sessionExpiration',
    );
    this.redisClient = this.redisService.getClient('session');
  }

  // TODO: implement if necessary
  getSessionDefinitionById(id: string): Promise<SessionDefinition> {
    throw new Error('Method not implemented.');
  }

  async getSessionDefinition(
    type: RouteType,
    namespaces: string[],
  ): Promise<SessionDefinition | undefined> {
    const key = this.getSessionKey(type, namespaces);
    const sessionDefinitionJson: string = await this.redisClient.get(key);

    if (!sessionDefinitionJson) {
      return undefined;
    }

    try {
      return JSON.parse(sessionDefinitionJson);
    } catch (error) {
      this.logger.error(error);
      return undefined;
    }
  }

  async storeSessionDefinition(definition: SessionDefinition): Promise<void> {
    const srcKey = this.getSessionKey(
      definition.source.type,
      definition.source.namespaces,
    );
    const destKey = this.getSessionKey(
      definition.destination.type,
      definition.destination.namespaces,
    );

    const pipeline = this.redisClient.pipeline();

    // expire session in 1 hour
    pipeline.set(
      srcKey,
      JSON.stringify(Object.assign({}, definition, { isDestination: false })),
      'ex',
      this.sessionExpirationSeconds,
    );
    pipeline.set(
      destKey,
      JSON.stringify(Object.assign({}, definition, { isDestination: true })),
      'ex',
      this.sessionExpirationSeconds,
    );

    await pipeline.exec();
  }

  private getSessionKey(type: RouteType, namespaces: string[]): string {
    return `session:${type}:${namespaces.join(':')}`;
  }
}
