import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, EMPTY, of } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { plainToClass, classToPlain } from 'class-transformer';
import { MessageType } from 'wechaty-puppet';

import { RouteMessage, RouteType, NewRouteMessageCommand } from 'src/route';
import { NewWechatyMessageEvent } from '../events';

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
}
