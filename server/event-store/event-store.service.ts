import { Injectable, Logger, Type, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IEvent, EventBus, IEventPublisher, IMessageSource } from '@nestjs/cqrs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Redis } from 'ioredis';
import { RedisService } from 'nestjs-redis';
import { from, lastValueFrom, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
// import ArrayKeyedMap from 'array-keyed-map';

import { AggregateRootWithId } from './aggregate-root-id';
import { AggregateStore } from './aggregate.decorator';
import { EventMetadataStore } from './event.decorator';

const PREFIX = 'events';
const DELIMITER = ':';

@Injectable()
export class EventStoreService<EventBase extends IEvent = IEvent, AggregateBase extends AggregateRootWithId<EventBase> = AggregateRootWithId<EventBase>>
  implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(EventStoreService.name);
  private redisClient: Redis;
  private subject$: Subject<EventBase>;
  // private aggregates: ArrayKeyedMap<[string, string], AggregateBase>;

  constructor(
    private readonly eventBus: EventBus<EventBase>,
    private readonly redisService: RedisService,
  ) {
    // this.aggregates = new ArrayKeyedMap();
    this.redisClient = this.redisService.getClient('event-store');
  }

  async onModuleInit(): Promise<void> {
    // TODO: this is better if we have LRU, so it doesn't overwhelm the heap memory

    // for (const name of AggregateStore.keys()) {
    //   const keyPrefix = `${PREFIX}${DELIMITER}${name}${DELIMITER}*`;
    //   this.logger.debug(`finding streams that starts with ${keyPrefix}`);
    //   const keys = await this.redisClient.keys(keyPrefix);
    //   for (const key of keys) {
    //     const [, aggregateType, aggregateId] = key.split(DELIMITER);
    //     this.logger.debug(`hydrating aggregate ${aggregateType}${DELIMITER}${aggregateId}`);
    //     const aggregate = await this.hydrateAggregate(aggregateType, aggregateId);
    //     this.aggregates.set([aggregateType, aggregateId], aggregate);
    //   }
    // }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.debug('disconnecting service from event bus');
    this.subject$.complete();
  }

  async getAggregate<T extends AggregateBase>(aggregateType: string, aggregateId: string, aggregateArgs?: any): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const clazz = AggregateStore.get(aggregateType) as Type<T>;
    const aggregate = new clazz(aggregateArgs || aggregateId);

    const key = `${PREFIX}${DELIMITER}${aggregateType}${DELIMITER}${aggregateId}`;

    const eventBus = this.eventBus;
    const publishEventToRedis = async (event: EventBase): Promise<string> => {
      const type = event.constructor.name;
      const data = JSON.stringify(instanceToPlain(event));
      this.logger.debug(`saving ${type} event ${data} to ${key}`);

      const version = await this.redisClient.xadd(key, [
        '*',
        'type', type,
        'data', data,
      ]);

      return version;
    };

    // merge aggregate context
    aggregate.publish = (event: EventBase) => {
      publishEventToRedis(event).then((version) => {
        aggregate.version = version;
      });
      eventBus.publish(event);
    };

    aggregate.publishAll = (events: EventBase[]) => {
      lastValueFrom(from(events).pipe(
        concatMap((event) => from(publishEventToRedis(event))),
      )).then((version) => {
        aggregate.version = version;
      });
      eventBus.publishAll(events);
    };

    const redisMessages = await this.redisClient.xrange(key, '-', '+');
    if (redisMessages.length > 0) {
      const latestVersion = redisMessages.slice(-1)[0][0];
      const history = redisMessages.map(message => this.convertRedisMessageToEvent(message));
      aggregate.loadFromHistory(history);
      aggregate.version = latestVersion;
    } else {
      aggregate.version = '0';
    }

    return aggregate;
  }

  private convertRedisMessageToEvent<T extends EventBase>(message: [string, string[]]): T {
    const [, object] = message;
    const [, eventType, , eventData] = object;
    const data = JSON.parse(eventData);
    const clazz = EventMetadataStore.get(eventType) as Type<T>;
    const event = plainToInstance(clazz, data);
    return event;
  }
}
