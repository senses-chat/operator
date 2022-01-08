import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, EMPTY, of } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

import {
  RouteMessage,
  NewRouteMessageCommand,
  MessageContentType,
  NewSessionMessageEvent,
  RouteType,
  TextMessageContent,
  FileMessageContent,
} from 'server/route';
import { NewRasaMessageEvent } from '../events';
import { SendRasaMessageCommand } from '../commands';

const DELIMITER = ':';

@Injectable()
export class RasaSagas {
  private static logger = new Logger(RasaSagas.name);

  @Saga()
  public routeRasaMessageSaga(
    events$: Observable<IEvent>,
  ): Observable<ICommand> {
    return events$.pipe(
      ofType(NewRasaMessageEvent),
      concatMap((event: NewRasaMessageEvent) => {
        const content: any = { ...event, type: MessageContentType.Text };

        content.metadata = content.custom;
        delete content.recipient_id;
        delete content.namespace;
        delete content.custom;

        if (content.buttons) {
          content.type = MessageContentType.TextWithButtons;
        }

        if (content.image) {
          content.type = MessageContentType.Image;
        }

        const routeMessage = plainToInstance(RouteMessage, {
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
  public routeMessageToRasaSaga(
    events$: Observable<IEvent>,
  ): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromSource()),
      filter(
        (event: NewSessionMessageEvent) =>
          event.session.destination.type === RouteType.Rasa,
      ),
      concatMap(RasaSagas.convertRouteMessageToRasaMessage.bind(null, true)),
    );
  }

  @Saga()
  public routeMessageFromRasaSaga(
    events$: Observable<IEvent>,
  ): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) =>
        event.isMessageFromDestination(),
      ),
      filter(
        (event: NewSessionMessageEvent) =>
          event.session.source.type === RouteType.Rasa,
      ),
      concatMap(RasaSagas.convertRouteMessageToRasaMessage.bind(null, false)),
    );
  }

  private static convertRouteMessageToRasaMessage(
    toDestination: boolean,
    event: NewSessionMessageEvent,
  ): Observable<SendRasaMessageCommand> {
    let namespaces: string[];

    if (toDestination) {
      namespaces = event.session.destination.namespaces;
    } else {
      namespaces = event.session.source.namespaces;
    }

    let message = '';

    const content = event.message.content;

    if (content.type === MessageContentType.Text) {
      const text = (content as TextMessageContent).text;
      message += text;
      if (text.startsWith('/') && content.metadata) {
        message += JSON.stringify(content.metadata);
      }
    }

    if (content.type === MessageContentType.File) {
      message = `/file_uploaded{"file_url":"${
        (content as FileMessageContent).file_url
      }"}`;
    }

    return of(
      plainToInstance(SendRasaMessageCommand, {
        namespace: namespaces[0],
        sender: namespaces.slice(1).join(DELIMITER),
        message,
      }),
    );
  }
}
