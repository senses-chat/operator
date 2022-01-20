import { IEventWithMetadata } from 'server/common';

export interface IEventStorage<
  EventBase extends IEventWithMetadata = IEventWithMetadata,
> {
  get defaultInitialVersion(): string | number;

  getByType(aggregateType: string): Promise<
    Array<{
      aggregateId: string;
      count: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  >;

  // publish events to the event store and return the latest version
  publishEvent(
    aggregateType: string,
    aggregateId: string,
    event: EventBase,
  ): Promise<string | number>;

  getAggregateEventHistory<T extends EventBase>(
    aggregateType: string,
    aggregateId: string,
  ): Promise<{ history: T[]; latestVersion: string | number }>;
}
