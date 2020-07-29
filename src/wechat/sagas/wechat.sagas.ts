import { Injectable } from '@nestjs/common';
import { Saga, ICommand, IEvent, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

import { NewWechatMessageEvent } from '../events';

@Injectable()
export class WechatSagas {
  @Saga()
  public newMessageSaga(events$: Observable<IEvent>): Observable<ICommand> {
    return events$.pipe(
      ofType(NewWechatMessageEvent),
      // map((event: NewWechatMessageEvent) => {

      // }),
    );
  }
}
