import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { filter, concatMap } from 'rxjs/operators';

import { plainToInstance } from 'src/utils/transformer';

import { NewSessionMessageEvent } from '../events';
import {
  RouteType,
  MessageContentType,
  TextMessageContent,
  RouteMessage,
} from '../models';
import { NewRouteMessageCommand } from '../commands';

@Injectable()
export class DingDongSagas {
  private static logger = new Logger(DingDongSagas.name);

  @Saga()
  public replyDingdong(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromSource()),
      filter((event: NewSessionMessageEvent) => {
        const destination = event.session.destination;
        return (
          destination.type === RouteType.Saga &&
          destination.namespaces[0] === 'ding-dong'
        );
      }),
      filter(
        (event: NewSessionMessageEvent) =>
          event.message.content.type === MessageContentType.Text &&
          (event.message.content as TextMessageContent).text.indexOf('#ding') >
            -1,
      ),
      concatMap((event: NewSessionMessageEvent) => {
        return of(
          new NewRouteMessageCommand(
            plainToInstance(RouteMessage, {
              type: event.session.destination.type,
              namespaces: event.session.destination.namespaces,
              content: {
                type: MessageContentType.Text,
                text: 'dong',
              },
            }),
          ),
        );
      }),
    );
  }
}
