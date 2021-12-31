import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { NewWecomMessageEvent } from '../new-msg.event';

@EventsHandler(NewWecomMessageEvent)
export class NewWecomMessageEventHandler implements IEventHandler<NewWecomMessageEvent> {
  private readonly logger = new Logger(NewWecomMessageEventHandler.name);

  public async handle(event: NewWecomMessageEvent): Promise<void> {
    this.logger.verbose(`new wecom message event: ${JSON.stringify(event)}`);
  }
}
