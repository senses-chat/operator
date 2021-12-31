import { Aggregate, AggregateRootWithId } from 'server/event-store';

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

@Aggregate()
export class Session extends AggregateRootWithId {
  constructor(public readonly definition: SessionDefinition) {
    super(definition.id);
  }

  public newRouteMessage(command: NewRouteMessageCommand): void {
    this.apply(new NewSessionMessageEvent(command.message, this.definition));
  }
}
