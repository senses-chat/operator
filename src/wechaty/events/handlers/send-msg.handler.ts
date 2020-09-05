import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { WechatyService } from '../../wechaty.service';
import { SendWechatyMessageEvent } from '../send-msg.event';
import { MessageContentType, TextMessageContent } from 'src/route';
import { Room } from 'wechaty';

@EventsHandler(SendWechatyMessageEvent)
export class SendWechatyMessageEventHandler implements IEventHandler<SendWechatyMessageEvent> {
  private readonly logger = new Logger(SendWechatyMessageEventHandler.name);

  constructor(private readonly wechatyService: WechatyService) {}

  public async handle(event: SendWechatyMessageEvent): Promise<void> {
    this.logger.verbose(`send wechaty message event: ${JSON.stringify(event)}`);

    const [botName, userId, roomId] = event.message.namespaces;
    const { wechaty } = this.wechatyService.instances[botName];
    const user = wechaty.Contact.load(userId);

    let room: Room;
    if (roomId) {
      room = wechaty.Room.load(roomId);
    }

    switch (event.message.content.type) {
      case MessageContentType.Text:
        await (room || user).say((event.message.content as TextMessageContent).text);
        return;
      default:
        throw new Error(`message content type ${event.message.content.type} not supported`);
    }
  }
}
