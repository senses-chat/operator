import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { SendRasaMessageEvent } from '../send-msg.event';

@EventsHandler(SendRasaMessageEvent)
export class SendRasaMessageEventHandler implements IEventHandler<SendRasaMessageEvent> {
  private readonly logger = new Logger(SendRasaMessageEventHandler.name);

  public async handle(event: SendRasaMessageEvent): Promise<void> {
    this.logger.verbose(`send rasa message event: ${JSON.stringify(event)}`);
  }
}
