import {
  Injectable,
  Logger,
  Type,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { from, lastValueFrom, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
// import ArrayKeyedMap from 'array-keyed-map';

import {
  IEventWithMetadata,
  AggregateRootWithId,
  AggregateMetadata,
} from 'src/common';
import { EVENT_STORAGE, IEventStorage } from 'src/modules/storage';

import { AggregateStore } from './aggregate.decorator';

@Injectable()
export class EventStoreService<
  EventBase extends IEventWithMetadata = IEventWithMetadata,
  AggregateBase extends AggregateRootWithId<EventBase> = AggregateRootWithId<EventBase>,
> implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(EventStoreService.name);
  private subject$: Subject<EventBase>;
  // private aggregates: ArrayKeyedMap<[string, string], AggregateBase>;

  constructor(
    private readonly eventBus: EventBus<EventBase>,
    @Inject(forwardRef(() => EVENT_STORAGE))
    private readonly eventStorage: IEventStorage<EventBase>,
  ) {
    // this.aggregates = new ArrayKeyedMap();
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

  async listAggregates(aggregateType: string): Promise<AggregateMetadata[]> {
    const aggregations = await this.eventStorage.getByType(aggregateType);
    return aggregations.map((aggregate) => ({
      aggregateType,
      ...aggregate,
    }));
  }

  async getAggregate<T extends AggregateBase>(
    aggregateType: string,
    aggregateId: string,
    aggregateArgs?: any,
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const clazz = AggregateStore.get(aggregateType) as Type<T>;
    const aggregate = new clazz(aggregateArgs || aggregateId);

    const eventBus = this.eventBus;

    const publishEventToEventStorage = async (
      event: EventBase,
    ): Promise<string | number> =>
      this.eventStorage.publishEvent(aggregateType, aggregateId, event);

    // merge aggregate context
    aggregate.publish = (event: EventBase) => {
      publishEventToEventStorage(event).then((version) => {
        aggregate.version = version;
      });
      eventBus.publish(event);
    };

    aggregate.publishAll = (events: EventBase[]) => {
      lastValueFrom(
        from(events).pipe(
          concatMap((event) => from(publishEventToEventStorage(event))),
        ),
      ).then((version) => {
        aggregate.version = version;
      });
      eventBus.publishAll(events);
    };

    const { history, latestVersion } =
      await this.eventStorage.getAggregateEventHistory<EventBase>(
        aggregateType,
        aggregateId,
      );
    aggregate.loadFromHistory(history);
    aggregate.version = latestVersion;

    return aggregate;
  }
}
