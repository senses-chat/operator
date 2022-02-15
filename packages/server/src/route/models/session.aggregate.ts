import { Logger } from '@nestjs/common';
import { AggregateRootWithId } from 'src/common';
import { Aggregate } from 'src/event-store';

import { RouteType } from './route.dto';
import { NewRouteMessageCommand } from '../commands';
import { NewSessionMessageEvent } from '../events';

export interface SessionDefinitionComponent {
  type: RouteType;
  namespaces: string[];
}

export interface SessionDefinition {
  id: string;
  source: SessionDefinitionComponent;
  destination: SessionDefinitionComponent;
  createdAt?: Date;
  updatedAt?: Date;
  isDestination?: boolean;
}

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
