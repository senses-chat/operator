import { AggregateRoot } from '@nestjs/cqrs';

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
  isDestination?: boolean;
}

export class Session extends AggregateRoot {
  constructor(public readonly definition: SessionDefinition) {
    super();
  }

  public newRouteMessage(command: NewRouteMessageCommand): void {
    this.apply(new NewSessionMessageEvent(command.message, this.definition));
  }
}
