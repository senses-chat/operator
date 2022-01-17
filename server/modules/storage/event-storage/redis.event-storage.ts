import { Logger, Type } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Redis } from 'ioredis';

import { EventMetadataStore } from 'server/event-store/event.decorator';

import { IEventStorage } from './event-storage.interface';

const PREFIX = 'events';
const DELIMITER = ':';

export class RedisEventStorage<EventBase extends IEvent = IEvent>
  implements IEventStorage<EventBase>
{
  private logger = new Logger(RedisEventStorage.name);
  private redisClient: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redisClient = this.redisService.getClient('event-store');
  }
  get defaultInitialVersion(): string | number {
    return '0';
  }

  getByType(aggregateType: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  async publishEvent(
    aggregateType: string,
    aggregateId: string,
    event: EventBase,
  ): Promise<string | number> {
    const key = this.getEventStorageKey(aggregateType, aggregateId);

    const type = event.constructor.name;
    const data = JSON.stringify(instanceToPlain(event));

    this.logger.debug(`saving ${type} event ${data} to ${key}`);

    const version = await this.redisClient.xadd(key, [
      '*',
      'type',
      type,
      'data',
      data,
    ]);

    return version;
  }

  async getAggregateEventHistory<T extends EventBase>(
    aggregateType: string,
    aggregateId: string,
  ): Promise<{ history: T[]; latestVersion: string | number }> {
    const key = this.getEventStorageKey(aggregateType, aggregateId);
    const redisMessages = await this.redisClient.xrange(key, '-', '+');

    if (redisMessages.length > 0) {
      const latestVersion = redisMessages.slice(-1)[0][0];
      const history = redisMessages.map((message) =>
        this.convertRedisMessageToEvent<T>(message),
      );
      return { history, latestVersion };
    } else {
      return { history: [], latestVersion: this.defaultInitialVersion };
    }
  }

  private convertRedisMessageToEvent<T extends EventBase>(
    message: [string, string[]],
  ): T {
    const [, object] = message;
    const [, eventType, , eventData] = object;
    const data = JSON.parse(eventData);
    const clazz = EventMetadataStore.get(eventType) as Type<T>;
    const event = plainToInstance(clazz, data);
    return event;
  }

  private getEventStorageKey(
    aggregateType: string,
    aggregateId: string,
  ): string {
    return `${PREFIX}${DELIMITER}${aggregateType}${DELIMITER}${aggregateId}`;
  }
}
