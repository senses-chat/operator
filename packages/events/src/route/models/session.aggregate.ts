import { Logger } from '@nestjs/common';
import { AggregateRootWithId, Aggregate } from '@senses-chat/operator-common';
import { SessionDefinition } from '@senses-chat/operator-database';

import { NewRouteMessageCommand } from '../commands';
import { NewSessionMessageEvent } from '../events';

@Aggregate()
export class Session extends AggregateRootWithId {
  private _logger = new Logger(Session.name);
  public messages: Array<NewSessionMessageEvent> = [];

  constructor(public readonly definition: SessionDefinition) {
    super(definition.id);
  }

  public newRouteMessage(command: NewRouteMessageCommand): void {
    this.apply(new NewSessionMessageEvent(command.message, this.definition));
  }

  onNewSessionMessageEvent(event: NewSessionMessageEvent): void {
    // this._logger.verbose(`onNewSessionMessageEvent: ${JSON.stringify(event)}`);
    this.messages.push(event);
  }
}
