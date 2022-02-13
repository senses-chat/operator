import { AggregateRoot } from '@nestjs/cqrs';
import { Exclude, Expose } from 'class-transformer';

import { IEventWithMetadata } from './event.interface';

export class AggregateRootWithId<
  EventBase extends IEventWithMetadata = IEventWithMetadata,
> extends AggregateRoot<EventBase> {
  protected _id: string;
  protected _version: string | number;

  constructor(id: string) {
    super();
    this._id = id;
  }

  @Expose({ name: 'id' })
  get id(): string {
    return this._id;
  }

  set id(id: string) {
    this._id = id;
  }

  @Expose({ name: 'version' })
  get version(): string | number {
    return this._version;
  }

  set version(version: string | number) {
    this._version = version;
  }

  // excluding these methods from serialization
  // since class-transformer will run them

  @Exclude()
  publish(event: EventBase) {
    // pass
  }

  @Exclude()
  publishAll(events: EventBase[]) {
    // pass
  }
}
