import { Injectable } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { filter, concatMap } from 'rxjs/operators';

import { NewSessionMessageEvent } from '../events';
import { RouteType, MessageContentType, TextMessageContent, RouteMessage } from '../models';
import { plainToClass } from 'class-transformer';
import { NewRouteMessageCommand } from '../commands';

@Injectable()
export class DingDongSagas {
  @Saga()
  public replyDingdong(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewSessionMessageEvent),
      filter((event: NewSessionMessageEvent) => event.isMessageFromSource()),
      filter((event: NewSessionMessageEvent) => {
        const destination = event.session.destination;
        return destination.type === RouteType.Saga && destination.namespaces[0] === 'ding-dong';
      }),
      filter(
        (event: NewSessionMessageEvent) =>
          event.message.content.type === MessageContentType.Text && (event.message.content as TextMessageContent).text === '#ding',
      ),
      concatMap((event: NewSessionMessageEvent) => {
        return of(
          new NewRouteMessageCommand(
            plainToClass(RouteMessage, {
              type: event.session.source.type,
              namespaces: event.session.source.namespaces,
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
