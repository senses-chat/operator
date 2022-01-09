import { IEvent } from '@nestjs/cqrs';

export interface IEventStorage<EventBase extends IEvent = IEvent> {
  get defaultInitialVersion(): string | number;

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
