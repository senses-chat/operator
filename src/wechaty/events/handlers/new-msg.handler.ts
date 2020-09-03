import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { NewWechatyMessageEvent } from '../new-msg.event';

@EventsHandler(NewWechatyMessageEvent)
export class NewWechatyMessageEventHandler implements IEventHandler<NewWechatyMessageEvent> {
  private readonly logger = new Logger(NewWechatyMessageEventHandler.name);

  public async handle(event: NewWechatyMessageEvent): Promise<void> {
    this.logger.verbose(`new wechaty message event: ${JSON.stringify(event)}`);
  }
}
