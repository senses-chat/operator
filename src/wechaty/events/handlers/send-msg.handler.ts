import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendWechatyMessageEvent } from '../send-msg.event';

@EventsHandler(SendWechatyMessageEvent)
export class SendWechatyMessageEventHandler implements IEventHandler<SendWechatyMessageEvent> {
  private readonly logger = new Logger(SendWechatyMessageEventHandler.name);

  public async handle(event: SendWechatyMessageEvent): Promise<void> {
    this.logger.verbose(`send wechat message event: ${JSON.stringify(event)}`);
  }
}
