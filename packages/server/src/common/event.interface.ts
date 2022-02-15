import { IEvent } from '@nestjs/cqrs';

export interface EventMetadata {
  timestamp?: Date;
  version?: string | number;
  [key: string]: any;
}

export interface IEventWithMetadata extends IEvent {
  metadata?: EventMetadata;
}
