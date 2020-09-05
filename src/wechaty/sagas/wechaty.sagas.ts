import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, EMPTY, of } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { plainToClass, classToPlain } from 'class-transformer';
import { MessageType } from 'wechaty-puppet';

import { RouteMessage, RouteType, NewRouteMessageCommand, NewSessionMessageEvent } from 'src/route';
import { NewWechatyMessageEvent } from '../events';
import { SendWechatyMessageCommand } from '../commands';

@Injectable()
export class WechatySagas {
  private static logger = new Logger(WechatySagas.name);

  @Saga()
  public newMessageSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewWechatyMessageEvent),
      concatMap((event: NewWechatyMessageEvent) => {
        let routeMessage: RouteMessage;

        console.log(event.message);

        if (event.message.payload.type === MessageType.Text) {
          routeMessage = plainToClass(RouteMessage, {
            type: RouteType.Wechaty,
            // TODO: room id
            namespaces: [event.namespace, `${event.message.payload.fromId}`],
            content: {
              type: 'text',
              text: event.message.payload.text,
            },
          });
        }

        WechatySagas.logger.debug(routeMessage);

        if (!routeMessage) {
          return EMPTY;
        }

        return of(new NewRouteMessageCommand(routeMessage));
      }),
    );
  }

  @Saga()
  public routeMessageToWechatySaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromSource()),
      filter((event: NewSessionMessageEvent) => event.session.destination.type === RouteType.Wechaty),
      concatMap(WechatySagas.convertRouteMessageToWechatyMessage.bind(null, true)),
    );
  }

  @Saga()
  public routeMessageFromWechatySaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromDestination()),
      filter((event: NewSessionMessageEvent) => event.session.source.type === RouteType.Wechaty),
      concatMap(WechatySagas.convertRouteMessageToWechatyMessage.bind(null, false)),
    );
  }

  private static convertRouteMessageToWechatyMessage(toDestination: boolean, event: NewSessionMessageEvent): Observable<SendWechatyMessageCommand> {
    let type: RouteType;
    let namespaces: string[];

    if (toDestination) {
      type = event.session.destination.type;
      namespaces = event.session.destination.namespaces;
    } else {
      type = event.session.source.type;
      namespaces = event.session.source.namespaces;
    }

    return of(
      plainToClass(SendWechatyMessageCommand, {
        message: {
          ...classToPlain(event.message),
          type,
          namespaces,
        },
      }),
    );
  }
}
