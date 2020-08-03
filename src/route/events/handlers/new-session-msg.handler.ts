import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { NewSessionMessageEvent } from '../new-session-msg.event';
import { Logger } from '@nestjs/common';

@EventsHandler(NewSessionMessageEvent)
export class NewSessionMessageEventHandler implements IEventHandler<NewSessionMessageEvent> {
  private readonly logger = new Logger(NewSessionMessageEventHandler.name);

  public async handle(event: NewSessionMessageEvent): Promise<void> {
    this.logger.verbose(`new session message event: ${JSON.stringify(event)}`);
  }
}
