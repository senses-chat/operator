import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { of, Observable, Subscriber } from 'rxjs';
import * as Ops from 'rxjs/operators';

import { ChatRoute, RouteMessage, RouteMessageType, TextMessageContent, MessageContent, MessageContentType } from 'src/route';
import { RasaWebhookPayload, RasaResponsePayload } from './models';
import { Rasa } from './rasa.instance';

export class RasaChatRoute implements ChatRoute {
  private readonly logger = new Logger(RasaChatRoute.name);

  constructor(private readonly rasa: Rasa) {}

  start(): void {
    // doesn't need to do anything
    this.logger.debug('rasa chat route started');
  }

  getRouteMessageObservable(): Observable<RouteMessage> {
    return this.rasa.responseObservable().pipe(
      Ops.concatMap((message: RasaResponsePayload) => {
        const content: any = { ...message, type: MessageContentType.Text };
        delete (content as any).recipient_id;

        if (content.buttons) {
          content.type = MessageContentType.TextWithButtons;
        }

        if (content.image) {
          content.type = MessageContentType.Image;
        }

        const payload: RouteMessage = plainToClass(RouteMessage, {
          type: RouteMessageType.Rasa,
          routeName: this.rasa.rasaServer.name,
          username: message.recipient_id,
          content,
        });

        console.log(payload);
        // this.logger.debug(payload);

        return of(payload);
      }),
    );
  }

  routeMessageSubscriber(): Subscriber<RouteMessage> {
    return Subscriber.create<RouteMessage>((message: RouteMessage) =>
      this.rasa.messageSubject.next({
        sender: message.username,
        // TODO: message types
        message: (message.content as TextMessageContent).text,
      } as RasaWebhookPayload),
    );
  }
}
