import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, EMPTY, of } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

import { RouteMessage, NewRouteMessageCommand, MessageContentType, NewSessionMessageEvent, RouteType, TextMessageContent } from 'src/route';
import { NewRasaMessageEvent } from '../events';
import { SendRasaMessageCommand } from '../commands';

const DELIMITER = ':';

@Injectable()
export class RasaSagas {
  private readonly logger = new Logger(RasaSagas.name);

  @Saga()
  public routeRasaMessageSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewRasaMessageEvent),
      concatMap((event: NewRasaMessageEvent) => {
        const content: any = { ...event, type: MessageContentType.Text };
        delete (content as any).recipient_id;

        if (content.buttons) {
          content.type = MessageContentType.TextWithButtons;
        }

        if (content.image) {
          content.type = MessageContentType.Image;
        }

        const routeMessage = plainToClass(RouteMessage, {
          type: RouteType.Rasa,
          namespaces: [event.namespace, ...event.recipient_id.split(DELIMITER)],
          content,
        });

        this.logger.debug(routeMessage);

        if (!routeMessage) {
          return EMPTY;
        }

        return of(new NewRouteMessageCommand(routeMessage));
      }),
    );
  }

  @Saga()
  public routeMessageToRasaSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromSource()),
      filter((event: NewSessionMessageEvent) => event.session.destination.type === RouteType.Rasa),
      concatMap(this.convertRouteMessageToRasaMessage.bind(this, true)),
    );
  }

  @Saga()
  public routeMessageFromRasaSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromDestination()),
      filter((event: NewSessionMessageEvent) => event.session.source.type === RouteType.Rasa),
      concatMap(this.convertRouteMessageToRasaMessage.bind(this, false)),
    );
  }

  private convertRouteMessageToRasaMessage(toDestination: boolean, event: NewSessionMessageEvent): Observable<SendRasaMessageCommand> {
    let namespaces: string[];

    if (toDestination) {
      namespaces = event.session.destination.namespaces;
    } else {
      namespaces = event.session.source.namespaces;
    }

    return of(
      plainToClass(SendRasaMessageCommand, {
        namespace: namespaces[0],
        sender: namespaces.slice(1).join(DELIMITER),
        // TODO: message types
        message: (event.message.content as TextMessageContent).text,
      }),
    );
  }
}
