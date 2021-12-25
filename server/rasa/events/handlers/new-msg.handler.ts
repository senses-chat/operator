import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { NewRasaMessageEvent } from '../new-msg.event';

@EventsHandler(NewRasaMessageEvent)
export class NewRasaMessageEventHandler implements IEventHandler<NewRasaMessageEvent> {
  private readonly logger = new Logger(NewRasaMessageEventHandler.name);

  public async handle(event: NewRasaMessageEvent): Promise<void> {
    this.logger.verbose(`new rasa message event: ${JSON.stringify(event)}`);
  }
}
