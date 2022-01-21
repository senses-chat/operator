import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, EMPTY, of, from } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';

import {
  RouteMessage,
  NewRouteMessageCommand,
  NewSessionMessageEvent,
  RouteType,
  MessageContentType,
} from 'server/route';
import {
  WxkfEnterSessionEvent,
  WxkfIncomingEventMessage,
  WxkfIncomingEventType,
  WxkfIncomingFileMessage,
  WxkfIncomingMessageType,
  WxkfIncomingTextMessage,
} from 'server/utils/wx-sdk';
import { plainToInstance, instanceToPlain } from 'server/utils/transformer';

import { SendWxkfMessageCommand } from '../commands';
import { NewWxkfMessageEvent } from '../events';
import { WxkfServiceRegistry } from '../wxkf.registry';

@Injectable()
export class WxkfSagas {
  private static logger = new Logger(WxkfSagas.name);

  constructor(private readonly wxkfServiceRegistry: WxkfServiceRegistry) {}

  @Saga()
  public newMessageSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewWxkfMessageEvent),
      concatMap((event: NewWxkfMessageEvent) => {
        if (event.msgtype === WxkfIncomingMessageType.File) {
          const wxkfMessage = event as WxkfIncomingFileMessage;
          return of(wxkfMessage).pipe(
            concatMap((message: WxkfIncomingFileMessage) =>
              from(
                this.wxkfServiceRegistry
                  .getService(event.corpid)
                  .downloadMedia(message.file.media_id),
              ),
            ),
            concatMap((file_url) =>
              of(
                plainToInstance(RouteMessage, {
                  type: RouteType.Wxkf,
                  namespaces: [
                    event.corpid,
                    wxkfMessage.open_kfid,
                    wxkfMessage.external_userid,
                  ],
                  content: {
                    type: MessageContentType.File,
                    file_url,
                  },
                }),
              ),
            ),
            tap((routeMessage) =>
              WxkfSagas.logger.debug(JSON.stringify(routeMessage)),
            ),
            map(
              (routeMessage: RouteMessage) =>
                new NewRouteMessageCommand(routeMessage),
            ),
          );
        }

        let routeMessage: RouteMessage;

        if (event.msgtype === WxkfIncomingMessageType.Event) {
          const wxkfMessage = event as WxkfIncomingEventMessage;
          if (
            wxkfMessage.event.event_type === WxkfIncomingEventType.EnterSession
          ) {
            const messageEvent = wxkfMessage.event as WxkfEnterSessionEvent;
            // fake /greet
            // TODO: make this into a configuration somehow
            routeMessage = plainToInstance(RouteMessage, {
              type: RouteType.Wxkf,
              namespaces: [
                event.corpid,
                messageEvent.open_kfid,
                messageEvent.external_userid,
              ],
              content: {
                type: MessageContentType.Text,
                text: '/greet',
                metadata: {
                  welcome_code: messageEvent.welcome_code,
                  scene: messageEvent.scene,
                  scene_param: messageEvent.scene_param,
                },
              },
            });
          }
        }

        if (event.msgtype === WxkfIncomingMessageType.Text) {
          const wxkfMessage = event as WxkfIncomingTextMessage;
          routeMessage = plainToInstance(RouteMessage, {
            type: RouteType.Wxkf,
            namespaces: [
              event.corpid,
              wxkfMessage.open_kfid,
              wxkfMessage.external_userid,
            ],
            content: {
              type: MessageContentType.Text,
              text: wxkfMessage.text.content,
            },
          });
        }

        WxkfSagas.logger.debug(JSON.stringify(instanceToPlain(routeMessage)));

        if (!routeMessage) {
          return EMPTY;
        }

        return of(new NewRouteMessageCommand(routeMessage));
      }),
    );
  }

  @Saga()
  public routeMessageToWxkfSaga(
    events$: Observable<IEvent>,
  ): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromSource()),
      filter(
        (event: NewSessionMessageEvent) =>
          event.session.destination.type === RouteType.Wxkf,
      ),
      concatMap(WxkfSagas.convertRouteMessageToWxkfMessage.bind(null, true)),
    );
  }

  @Saga()
  public routeMessageFromWxkfSaga(
    events$: Observable<IEvent>,
  ): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) =>
        event.isMessageFromDestination(),
      ),
      filter(
        (event: NewSessionMessageEvent) =>
          event.session.source.type === RouteType.Wxkf,
      ),
      concatMap(WxkfSagas.convertRouteMessageToWxkfMessage.bind(null, false)),
    );
  }

  private static convertRouteMessageToWxkfMessage(
    toDestination: boolean,
    event: NewSessionMessageEvent,
  ): Observable<SendWxkfMessageCommand> {
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
      plainToInstance(SendWxkfMessageCommand, {
        message: {
          ...instanceToPlain(event.message),
          type,
          namespaces,
        },
      }),
    );
  }
}
