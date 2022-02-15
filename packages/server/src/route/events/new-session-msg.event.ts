import { Expose } from 'class-transformer';

import { EventMetadata, IEventWithMetadata } from 'src/common';
import { Event } from 'src/event-store';

import { RouteMessage, SessionDefinition } from '../models';

@Event()
export class NewSessionMessageEvent implements IEventWithMetadata {
  @Expose({ name: 'session' })
  private readonly _session: SessionDefinition;

  constructor(
    public readonly message: RouteMessage,
    session: SessionDefinition,
    public readonly metadata?: EventMetadata,
  ) {
    this._session = session;
  }

  public get session(): SessionDefinition {
    return this._session;
  }

  public isMessageFromSource(): boolean {
    if (this._session.isDestination) {
      return false;
    }

    if (this.message.type !== this._session.source.type) {
      return false;
    }

    for (let i = 0; i < this.message.namespaces.length; i++) {
      if (this.message.namespaces[i] !== this._session.source.namespaces[i]) {
        return false;
      }
    }

    return true;
  }

  @Expose({ name: 'isDestination' })
  public isMessageFromDestination(): boolean {
    if (!this._session || !this._session.isDestination) {
      return false;
    }

    if (this.message.type !== this._session.destination.type) {
      return false;
    }

    for (let i = 0; i < this.message.namespaces.length; i++) {
      if (
        this.message.namespaces[i] !== this._session.destination.namespaces[i]
      ) {
        return false;
      }
    }

    return true;
  }
}
