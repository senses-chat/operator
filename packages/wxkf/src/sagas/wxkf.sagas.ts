import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, EMPTY, of, from } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';

import { plainToInstance, instanceToPlain } from '@senses-chat/operator-common';
import { RouteType } from '@senses-chat/operator-database';
import {
  RouteMessage,
  NewRouteMessageCommand,
  NewSessionMessageEvent,
  MessageContentType,
} from '@senses-chat/operator-events';
import {
  WxkfEnterSessionEvent,
  WxkfIncomingEventMessage,
  WxkfIncomingEventType,
  WxkfIncomingFileMessage,
  WxkfIncomingImageMessage,
  WxkfIncomingMessageOrigin,
  WxkfIncomingMessageType,
  WxkfIncomingTextMessage,
  WxkfSessionStatusChangeEvent,
} from '@senses-chat/wx-sdk';

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
        if (event.origin === WxkfIncomingMessageOrigin.FromServicer) {
          // do not process incoming message from servicer
          return EMPTY;
        }

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

        if (event.msgtype === WxkfIncomingMessageType.Image) {
          const wxkfMessage = event as WxkfIncomingImageMessage;
          return of(wxkfMessage).pipe(
            concatMap((message: WxkfIncomingImageMessage) =>
              from(
                this.wxkfServiceRegistry
                  .getService(event.corpid)
                  .downloadMedia(message.image.media_id),
              ),
            ),
            concatMap((image_url) =>
              of(
                plainToInstance(RouteMessage, {
                  type: RouteType.Wxkf,
                  namespaces: [
                    event.corpid,
                    wxkfMessage.open_kfid,
                    wxkfMessage.external_userid,
                  ],
                  content: {
                    type: MessageContentType.Image,
                    image_url,
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
                  msg_code: messageEvent.welcome_code,
                  scene: messageEvent.scene,
                  scene_param: messageEvent.scene_param,
                  external_userid: messageEvent.external_userid,
                },
              },
            });
          }

          if (
            wxkfMessage.event.event_type ===
            WxkfIncomingEventType.SessionStatusChange
          ) {
            const messageEvent =
              wxkfMessage.event as WxkfSessionStatusChangeEvent;
            if (messageEvent.change_type === 3) {
              // change_type 3 is agent session end
              // fake /bye
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
                  text: '/bye',
                  metadata: {
                    msg_code: messageEvent.msg_code,
                  },
                },
              });
            }
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
              text: wxkfMessage.text.menu_id || wxkfMessage.text.content,
              metadata: {
                menuText: wxkfMessage.text.content,
                menuId: wxkfMessage.text.menu_id,
              },
            },
          });
        }

        WxkfSagas.logger.debug(JSON.stringify(instanceToPlain(routeMessage)));

        if (!routeMessage) {
          return EMPTY;
        }

        return from(
          this.wxkfServiceRegistry
            .getService(event.corpid)
            .getServiceState(
              event.open_kfid ||
                (event as WxkfIncomingEventMessage).event.open_kfid,
              event.external_userid ||
                (event as WxkfIncomingEventMessage).event.external_userid,
            ),
        ).pipe(
          concatMap((response) => {
            WxkfSagas.logger.debug(JSON.stringify(response));
            if (response.service_state === 0 || response.service_state === 1 || routeMessage.content.metadata?.msg_code) {
              return of(new NewRouteMessageCommand(routeMessage));
            }

            return EMPTY;
          }),
        );
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
