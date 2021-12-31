import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, EMPTY, of } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { plainToInstance, instanceToPlain } from 'class-transformer';

import { RouteMessage, NewRouteMessageCommand, NewSessionMessageEvent, RouteType, MessageContentType } from 'server/route';
import {
  WecomEnterSessionEvent,
  WecomIncomingEventMessage,
  WecomIncomingEventType,
  WecomIncomingMessageType,
  WecomIncomingTextMessage,
} from '../models';
import { SendWecomMessageCommand } from '../commands';
import { NewWecomMessageEvent } from '../events';

@Injectable()
export class WecomSagas {
  private static logger = new Logger(WecomSagas.name);

  @Saga()
  public newMessageSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewWecomMessageEvent),
      concatMap((event: NewWecomMessageEvent) => {
        let routeMessage: RouteMessage;

        if (event.msgtype === WecomIncomingMessageType.Event) {
          const wecomMessage = event as WecomIncomingEventMessage;
          if (wecomMessage.event.event_type === WecomIncomingEventType.EnterSession) {
            const messageEvent = wecomMessage.event as WecomEnterSessionEvent;
            // fake /greet
            // TODO: make this into a configuration somehow
            routeMessage = plainToInstance(RouteMessage, {
              type: RouteType.Wecom,
              namespaces: [wecomMessage.open_kfid, wecomMessage.external_userid, messageEvent.welcome_code],
              content: {
                type: MessageContentType.Text,
                text: '/greet',
                metadata: {
                  scene: messageEvent.scene,
                  scene_param: messageEvent.scene_param,
                },
              },
            });
          }
        }

        if (event.msgtype === WecomIncomingMessageType.Text) {
          const wecomMessage = event as WecomIncomingTextMessage;
          routeMessage = plainToInstance(RouteMessage, {
            type: RouteType.Wecom,
            namespaces: [wecomMessage.open_kfid, wecomMessage.external_userid],
            content: {
              type: MessageContentType.Text,
              text: wecomMessage.text.content,
            },
          });
        }

        WecomSagas.logger.debug(JSON.stringify(instanceToPlain(routeMessage)));

        if (!routeMessage) {
          return EMPTY;
        }

        return of(new NewRouteMessageCommand(routeMessage));
      }),
    );
  }

  @Saga()
  public routeMessageToWecomSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromSource()),
      filter((event: NewSessionMessageEvent) => event.session.destination.type === RouteType.Wecom),
      concatMap(WecomSagas.convertRouteMessageToWecomMessage.bind(null, true)),
    );
  }

  @Saga()
  public routeMessageFromWecomSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromDestination()),
      filter((event: NewSessionMessageEvent) => event.session.source.type === RouteType.Wecom),
      concatMap(WecomSagas.convertRouteMessageToWecomMessage.bind(null, false)),
    );
  }

  private static convertRouteMessageToWecomMessage(toDestination: boolean, event: NewSessionMessageEvent): Observable<SendWecomMessageCommand> {
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
      plainToInstance(SendWecomMessageCommand, {
        message: {
          ...instanceToPlain(event.message),
          type,
          namespaces,
        },
      }),
    );
  }
}
