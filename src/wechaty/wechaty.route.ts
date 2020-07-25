import { Logger } from '@nestjs/common';
import { from, of, fromEvent, EMPTY, Observable, Subscriber } from 'rxjs';
import * as Ops from 'rxjs/operators';
import { Message, Room } from 'wechaty';
import { MessageType } from 'wechaty-puppet';
import { plainToClass } from 'class-transformer';

import { WechatyService } from 'src/wechaty';
import { ChatRoute, RouteMessage, RouteMessageType, TextMessageContent } from 'src/route';

interface RecipientInfo {
  roomId: string;
  contactId: string;
}

const DELIMITER = '::';

export class WechatyChatRoute implements ChatRoute {
  private readonly logger = new Logger(WechatyChatRoute.name);

  constructor(private readonly wechatyService: WechatyService) {}

  start(): void {
    const bot = this.wechatyService.instance;
    bot.start();
  }

  getRouteMessageObservable(): Observable<RouteMessage> {
    const bot = this.wechatyService.instance;

    return fromEvent(bot, 'message').pipe(
      Ops.concatMap((message: Message) => {
        this.logger.debug(`message.room() - ${message.room()}`);
        return from(Promise.all([message, message.mentionSelf()]));
      }),
      Ops.concatMap(([message, mentionSelf]: [Message, boolean]) => {
        this.logger.debug(`mentionSelf - ${mentionSelf}`);

        if (message.type() !== MessageType.Text) {
          return EMPTY;
        }

        if (message.room() && !mentionSelf) {
          this.logger.debug('room message did not mention bot');
          return EMPTY;
        }

        const payload: RouteMessage = plainToClass(RouteMessage, {
          type: RouteMessageType.Wechaty,
          // TODO: multiple bots
          routeName: '',
          username: this.getUsernameFromMessage(message),
          content: {
            type: 'text',
            text: message.text(),
          },
        });

        this.logger.debug(payload);

        return of(payload);
      }),
    );
  }

  routeMessageSubscriber(): Subscriber<RouteMessage> {
    const bot = this.wechatyService.instance;

    return Subscriber.create<RouteMessage>((message: RouteMessage) => {
      const recipientInfo = this.getRecipientInfoFromRouteMessage(message);

      let room: Room;
      if (recipientInfo.roomId) {
        room = bot.Room.load(recipientInfo.roomId);
      }
      const contact = bot.Contact.load(recipientInfo.contactId);

      if (room) {
        room.say((message.content as TextMessageContent).text, contact);
      } else {
        contact.say((message.content as TextMessageContent).text);
      }
    });
  }

  private getUsernameFromMessage(message: Message) {
    return `${message.room() ? message.room().id : ''}${DELIMITER}${message.from() ? message.from().id : ''}`;
  }

  private getRecipientInfoFromRouteMessage(payload: RouteMessage): RecipientInfo {
    const [roomId, contactId] = payload.username.split(DELIMITER);

    return {
      roomId,
      contactId,
    };
  }
}
