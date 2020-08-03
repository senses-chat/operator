import { IEvent } from '@nestjs/cqrs';
import { RouteMessage, SessionDefinition } from '../models';

export class NewSessionMessageEvent implements IEvent {
  constructor(public readonly message: RouteMessage, public readonly session: SessionDefinition) {}

  public isMessageFromSource(): boolean {
    if (this.session.isDestination) {
      return false;
    }

    if (this.message.type !== this.session.source.type) {
      return false;
    }

    for (let i = 0; i < this.message.namespaces.length; i++) {
      if (this.message.namespaces[i] !== this.session.source.namespaces[i]) {
        return false;
      }
    }

    return true;
  }

  public isMessageFromDestination(): boolean {
    if (!this.session.isDestination) {
      return false;
    }

    if (this.message.type !== this.session.destination.type) {
      return false;
    }

    for (let i = 0; i < this.message.namespaces.length; i++) {
      if (this.message.namespaces[i] !== this.session.destination.namespaces[i]) {
        return false;
      }
    }

    return true;
  }
}
