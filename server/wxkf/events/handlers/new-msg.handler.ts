import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { NewWxkfMessageEvent } from '../new-msg.event';

@EventsHandler(NewWxkfMessageEvent)
export class NewWxkfMessageEventHandler implements IEventHandler<NewWxkfMessageEvent> {
  private readonly logger = new Logger(NewWxkfMessageEventHandler.name);

  public async handle(event: NewWxkfMessageEvent): Promise<void> {
    this.logger.verbose(`new wxkf message event: ${JSON.stringify(event)}`);
  }
}
