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
  private static logger = new Logger(RasaSagas.name);

  @Saga()
  public routeRasaMessageSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewRasaMessageEvent),
      concatMap((event: NewRasaMessageEvent) => {
        const content: any = { ...event, type: MessageContentType.Text };
        delete (content as any).recipient_id;
        delete (content as any).namespace;

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

        RasaSagas.logger.debug(routeMessage);

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
      concatMap(RasaSagas.convertRouteMessageToRasaMessage.bind(null, true)),
    );
  }

  @Saga()
  public routeMessageFromRasaSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromDestination()),
      filter((event: NewSessionMessageEvent) => event.session.source.type === RouteType.Rasa),
      concatMap(RasaSagas.convertRouteMessageToRasaMessage.bind(null, false)),
    );
  }

  private static convertRouteMessageToRasaMessage(toDestination: boolean, event: NewSessionMessageEvent): Observable<SendRasaMessageCommand> {
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
