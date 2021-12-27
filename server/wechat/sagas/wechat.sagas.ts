import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, EMPTY, of } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { plainToClass, instanceToPlain } from 'class-transformer';

import { RouteMessage, NewRouteMessageCommand, NewSessionMessageEvent, RouteType } from 'server/route';
import { SendWechatMessageCommand } from '../commands';
import { NewWechatMessageEvent } from '../events';

@Injectable()
export class WechatSagas {
  private static logger = new Logger(WechatSagas.name);

  @Saga()
  public newMessageSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewWechatMessageEvent),
      concatMap((event: NewWechatMessageEvent) => {
        let routeMessage: RouteMessage;

        if (event.MsgType === 'miniprogrampage' || event.MsgType === 'event') {
          // fake /greet
          // TODO: make this into a configuration somehow
          routeMessage = plainToClass(RouteMessage, {
            type: RouteType.WechatApp,
            namespaces: [event.appNamespace, event.FromUserName],
            content: {
              type: 'text',
              text: '/greet',
            },
          });
        }

        if (event.MsgType === 'text' && event.Content) {
          routeMessage = plainToClass(RouteMessage, {
            type: RouteType.WechatApp,
            namespaces: [event.appNamespace, event.FromUserName],
            content: {
              type: 'text',
              text: event.Content,
            },
          });
        }

        WechatSagas.logger.debug(routeMessage);

        if (!routeMessage) {
          return EMPTY;
        }

        return of(new NewRouteMessageCommand(routeMessage));
      }),
    );
  }

  @Saga()
  public routeMessageToWechatSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromSource()),
      filter((event: NewSessionMessageEvent) => event.session.destination.type === RouteType.WechatApp),
      concatMap(WechatSagas.convertRouteMessageToWechatMessage.bind(null, true)),
    );
  }

  @Saga()
  public routeMessageFromWechatSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromDestination()),
      filter((event: NewSessionMessageEvent) => event.session.source.type === RouteType.WechatApp),
      concatMap(WechatSagas.convertRouteMessageToWechatMessage.bind(null, false)),
    );
  }

  private static convertRouteMessageToWechatMessage(toDestination: boolean, event: NewSessionMessageEvent): Observable<SendWechatMessageCommand> {
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
      plainToClass(SendWechatMessageCommand, {
        message: {
          ...instanceToPlain(event.message),
          type,
          namespaces,
        },
      }),
    );
  }
}
