import { AggregateRoot, IEvent } from '@nestjs/cqrs';

export class AggregateRootWithId<EventBase extends IEvent = IEvent> extends AggregateRoot<EventBase> {
  protected _id: string;
  protected _version: string;

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

  get version(): string {
    return this._version;
  }

  set version(version: string) {
    this._version = version;
  }
}
