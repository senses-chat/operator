import { AggregateRoot, IEvent } from '@nestjs/cqrs';

export class AggregateRootWithId<EventBase extends IEvent = IEvent> extends AggregateRoot<EventBase> {
  protected _id: string;
  protected _version: string | number;

  constructor(id: string) {
    super();
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  set id(id: string) {
    this._id = id;
  }

  get version(): string | number {
    return this._version;
  }

  set version(version: string | number) {
    this._version = version;
  }
}
